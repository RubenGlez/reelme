#!/usr/bin/env node
// Procedural sound-design SFX, generated the same way as the music beds: pure
// synthesis written to WAV, encoded to mp3 with ffmpeg. CC0, no external
// sourcing. Outputs land in ../../template/public/sfx/ so they scaffold with
// the Remotion project and are reachable via staticFile("sfx/<name>.mp3").
//
//   node cli/assets/sfx/generate-sfx.mjs

import { rmSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const TWO_PI = Math.PI * 2;

function noise() {
  return Math.random() * 2 - 1;
}
function clamp(s) {
  return Math.max(-0.98, Math.min(0.98, s));
}
// One-pole low-pass to take the harshness off white noise.
function makeLowpass(cutoff) {
  const a = Math.exp((-TWO_PI * cutoff) / SAMPLE_RATE);
  let z = 0;
  return (x) => (z = x * (1 - a) + z * a);
}

// SFX are deliberately understated — sound design should be felt, not announced.
// Soft attacks, low-passed air, gentle amplitudes; nothing clicky or punchy.
const SFX = {
  // Soft air sweep for whip/zoom cuts.
  whoosh(dur = 0.5) {
    const lp = makeLowpass(1100);
    return (t) => {
      const env = Math.sin((t / dur) * Math.PI) ** 1.8; // smooth swell, soft edges
      const sweep = lp(noise()) * (0.5 + 0.5 * (t / dur));
      return clamp(sweep * env * 0.22);
    };
  },
  // Gentle soft tick for cuts and data reveals — a muted "tock", not a click.
  tick(dur = 0.09) {
    const lp = makeLowpass(2400);
    return (t) => {
      const env = Math.exp(-t * 55); // softer decay than a hard click
      const body = Math.sin(TWO_PI * 900 * t) * 0.5 + lp(noise()) * 0.12;
      return clamp(body * env * 0.4);
    };
  },
  // Soft low swell for punch cuts — rounded, not a thump.
  impact(dur = 0.38) {
    const lp = makeLowpass(900);
    return (t) => {
      const air = lp(noise()) * Math.exp(-t * 22) * 0.15;
      const freq = 100 - 50 * Math.min(1, t * 5);
      const body = Math.sin(TWO_PI * freq * t) * Math.exp(-t * 8);
      return clamp((body * 0.5 + air) * 0.32);
    };
  },
  // Quiet tension build into the CTA.
  riser(dur = 1.4) {
    const lp = makeLowpass(2200);
    return (t) => {
      const p = t / dur;
      const env = p ** 1.6; // slow crescendo
      const air = lp(noise()) * 0.55;
      const tone = Math.sin(TWO_PI * (200 + 700 * p * p) * t) * 0.2;
      return clamp((air + tone) * env * 0.42);
    };
  },
  // Soft sub swell landing on the CTA — a felt low note, not a boom.
  subDrop(dur = 0.8) {
    return (t) => {
      const freq = 110 * Math.exp(-t * 3) + 40;
      const env = Math.min(1, t * 18) * Math.exp(-t * 2.6); // soft attack
      const body = Math.sin(TWO_PI * freq * t);
      const sub = Math.sin(TWO_PI * (freq / 2) * t) * 0.35;
      return clamp((body + sub) * env * 0.4);
    };
  },
};

const FILES = [
  { name: "whoosh", dur: 0.5, fn: SFX.whoosh(0.5) },
  { name: "tick", dur: 0.1, fn: SFX.tick(0.09) },
  { name: "impact", dur: 0.42, fn: SFX.impact(0.38) },
  { name: "riser", dur: 1.45, fn: SFX.riser(1.4) },
  { name: "sub-drop", dur: 0.85, fn: SFX.subDrop(0.8) },
];

function writeWav(path, dur, fn) {
  const frames = Math.round(SAMPLE_RATE * dur);
  const dataSize = frames * 2 * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < frames; i += 1) {
    const t = i / SAMPLE_RATE;
    const s = Math.round(fn(t) * 32767);
    buf.writeInt16LE(s, 44 + i * 4);
    buf.writeInt16LE(s, 44 + i * 4 + 2);
  }
  writeFileSync(path, buf);
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "..", "template", "public", "sfx");
mkdirSync(outDir, { recursive: true });

for (const { name, dur, fn } of FILES) {
  const wav = join(outDir, `${name}.wav`);
  const mp3 = join(outDir, `${name}.mp3`);
  writeWav(wav, dur, fn);
  const res = spawnSync("ffmpeg", ["-y", "-i", wav, "-codec:a", "libmp3lame", "-b:a", "128k", mp3], {
    stdio: "ignore",
  });
  rmSync(wav, { force: true });
  if (res.status !== 0) {
    console.error(`ffmpeg failed for ${name}`);
    process.exit(1);
  }
  console.log(`sfx: wrote ${name}.mp3`);
}
