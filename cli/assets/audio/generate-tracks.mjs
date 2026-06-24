#!/usr/bin/env node

import { rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const DURATION = 32;
const TWO_PI = Math.PI * 2;

const TRACKS = [
  {
    id: "calm-keys",
    file: "calm-keys.mp3",
    bpm: 92,
    key: 57,
    scale: [0, 2, 4, 7, 9],
    chords: [[0, 4, 7, 11], [9, 0, 4, 7], [5, 9, 0, 4], [7, 11, 2, 5]],
    melody: [0, 2, 4, 7, 4, 2, 0, 9],
    mood: "soft",
  },
  {
    id: "steady-launch",
    file: "steady-launch.mp3",
    bpm: 104,
    key: 50,
    scale: [0, 2, 5, 7, 9],
    chords: [[0, 5, 9], [7, 0, 5], [9, 2, 5], [5, 9, 0]],
    melody: [0, 5, 7, 9, 7, 5, 2, 0],
    mood: "drive",
  },
  {
    id: "clean-horizon",
    file: "clean-horizon.mp3",
    bpm: 88,
    key: 55,
    scale: [0, 2, 4, 7, 11],
    chords: [[0, 4, 7], [4, 7, 11], [9, 0, 4], [7, 11, 2]],
    melody: [7, 4, 2, 0, 2, 4, 7, 11],
    mood: "soft",
  },
  {
    id: "bright-sparks",
    file: "bright-sparks.mp3",
    bpm: 118,
    key: 60,
    scale: [0, 2, 4, 7, 9],
    chords: [[0, 4, 7], [5, 9, 0], [7, 11, 2], [4, 7, 11]],
    melody: [0, 4, 7, 9, 7, 4, 2, 4],
    mood: "bounce",
  },
  {
    id: "pixel-bounce",
    file: "pixel-bounce.mp3",
    bpm: 126,
    key: 58,
    scale: [0, 3, 5, 7, 10],
    chords: [[0, 3, 7], [10, 3, 5], [5, 8, 0], [7, 10, 2]],
    melody: [0, 3, 7, 10, 7, 3, 5, 7],
    mood: "chip",
  },
  {
    id: "sunny-loop",
    file: "sunny-loop.mp3",
    bpm: 112,
    key: 62,
    scale: [0, 2, 4, 7, 9],
    chords: [[0, 4, 7], [9, 0, 4], [5, 9, 0], [7, 11, 2]],
    melody: [4, 7, 9, 12, 9, 7, 4, 2],
    mood: "bounce",
  },
  {
    id: "circuit-pulse",
    file: "circuit-pulse.mp3",
    bpm: 124,
    key: 45,
    scale: [0, 2, 3, 7, 10],
    chords: [[0, 3, 7], [7, 10, 2], [3, 7, 10], [10, 2, 5]],
    melody: [0, 7, 3, 10, 2, 7, 3, 0],
    mood: "pulse",
  },
  {
    id: "vector-grid",
    file: "vector-grid.mp3",
    bpm: 116,
    key: 48,
    scale: [0, 2, 5, 7, 10],
    chords: [[0, 5, 10], [7, 0, 5], [10, 2, 7], [5, 10, 0]],
    melody: [0, 2, 5, 7, 10, 7, 5, 2],
    mood: "pulse",
  },
  {
    id: "midnight-protocol",
    file: "midnight-protocol.mp3",
    bpm: 98,
    key: 47,
    scale: [0, 2, 3, 7, 9],
    chords: [[0, 3, 7], [9, 0, 3], [7, 10, 2], [3, 7, 9]],
    melody: [0, 3, 7, 9, 7, 3, 2, 0],
    mood: "drive",
  },
];

function midiToFreq(note) {
  return 440 * 2 ** ((note - 69) / 12);
}

function triangle(phase) {
  return (2 / Math.PI) * Math.asin(Math.sin(phase));
}

function env(position, attack, release) {
  if (position < attack) return position / attack;
  return Math.exp(-(position - attack) * release);
}

function renderSample(track, t, i) {
  const beat = 60 / track.bpm;
  const bar = beat * 4;
  const chord = track.chords[Math.floor(t / (bar * 2)) % track.chords.length];
  const chordPos = (t % (bar * 2)) / (bar * 2);
  const noteStep = Math.floor(t / (beat / 2)) % track.melody.length;
  const notePos = (t % (beat / 2)) / (beat / 2);
  const root = track.key;

  let sample = 0;

  for (let c = 0; c < chord.length; c += 1) {
    const freq = midiToFreq(root + chord[c]);
    const wobble = 1 + Math.sin(TWO_PI * t * 0.08 + c) * 0.002;
    const amp = track.mood === "soft" ? 0.055 : 0.04;
    sample += Math.sin(TWO_PI * freq * wobble * t) * amp * env(chordPos, 0.08, 1.2);
    sample += triangle(TWO_PI * freq * 2 * t) * amp * 0.18;
  }

  // Sustained sub-bass that swells once per chord — a smooth harmonic floor
  // rather than a per-beat thump. The old per-beat kick/hat read as a disturbing
  // pulse under narration, so these beds are now ambient, not percussive.
  const bassRoot = root - 24 + chord[0];
  sample += Math.sin(TWO_PI * midiToFreq(bassRoot) * t) * 0.11 * env(chordPos, 0.06, 0.9);

  const melodyNote = root + 12 + track.melody[noteStep];
  const leadWave = track.mood === "chip"
    ? Math.sign(Math.sin(TWO_PI * midiToFreq(melodyNote) * t))
    : triangle(TWO_PI * midiToFreq(melodyNote) * t);
  sample += leadWave * 0.06 * env(notePos, 0.03, track.mood === "soft" ? 4 : 7);

  return Math.max(-0.98, Math.min(0.98, sample));
}

function writeWav(path, track) {
  const frames = SAMPLE_RATE * DURATION;
  const dataSize = frames * 2 * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28);
  buffer.writeUInt16LE(4, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < frames; i += 1) {
    const t = i / SAMPLE_RATE;
    const left = renderSample(track, t, i);
    const right = renderSample(track, t + 0.006, i + 17);
    buffer.writeInt16LE(Math.round(left * 32767), 44 + i * 4);
    buffer.writeInt16LE(Math.round(right * 32767), 44 + i * 4 + 2);
  }

  writeFileSync(path, buffer);
}

const outDir = dirname(fileURLToPath(import.meta.url));

for (const track of TRACKS) {
  const wavPath = join(outDir, `${track.id}.wav`);
  const mp3Path = join(outDir, track.file);
  writeWav(wavPath, track);
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      wavPath,
      "-af",
      "loudnorm=I=-21:LRA=10:TP=-1.5",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "96k",
      mp3Path,
    ],
    { stdio: "inherit" }
  );
  rmSync(wavPath, { force: true });
  if (result.error || result.status !== 0) {
    process.exitCode = result.status || 1;
    break;
  }
  console.log(`wrote ${mp3Path}`);
}
