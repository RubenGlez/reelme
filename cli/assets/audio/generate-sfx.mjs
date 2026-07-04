// Procedural SFX generator — FALLBACK ONLY. The shipped cues in sfx/ are
// curated ElevenLabs sound effects (see sfx/SOURCES.md); this script exists so
// the cues can be regenerated from nothing if those files are ever removed.
// It REFUSES to overwrite existing files unless run with --force.
//
//   whoosh.mp3 — air sweep for fast lateral cuts (whip/wipe/flip)
//   pop.mp3    — soft low knock for settle cuts (zoom/punch/rise/fade)
//   rise.mp3   — swell into the end card (CTA), peak at 0.6s
//
//   node cli/assets/audio/generate-sfx.mjs --force   (requires ffmpeg on PATH)
import { writeFileSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const TWO_PI = Math.PI * 2;

// Deterministic noise so regeneration is reproducible.
function makeNoise() {
  let seed = 0x9e3779b9;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return (seed / 0xffffffff) * 2 - 1;
  };
}

// One-pole band-ish filter state per render call.
function renderWhoosh(t, dur, noise, state) {
  // Noise through a swept low-pass: dark → bright → gone. Reads as air, not tape hiss.
  const p = t / dur;
  const cutoff = 400 + 5200 * Math.sin(Math.PI * p) ** 2;
  const alpha = Math.min(1, cutoff / (SAMPLE_RATE / 2 / Math.PI));
  state.lp += alpha * (noise() - state.lp);
  const body = state.lp - state.lp2;
  state.lp2 += 0.02 * (state.lp - state.lp2); // high-pass against rumble
  const envelope = Math.sin(Math.PI * p) ** 1.6;
  return body * envelope * 2.2;
}

function renderPop(t, dur) {
  // A soft knock: quickly decaying low sine with a faint click transient.
  const knock = Math.sin(TWO_PI * 130 * t * (1 - t * 1.6)) * Math.exp(-t * 42);
  const click = Math.sin(TWO_PI * 1900 * t) * Math.exp(-t * 300) * 0.25;
  return (knock + click) * 0.9;
}

function renderRise(t, dur, noise, state) {
  // Swell: filtered noise + a fifth dyad crescendo that stops just before the
  // peak — the visual landing supplies the actual accent.
  const p = t / dur;
  const cutoff = 250 + 2600 * p * p;
  const alpha = Math.min(1, cutoff / (SAMPLE_RATE / 2 / Math.PI));
  state.lp += alpha * (noise() - state.lp);
  const air = state.lp * 0.7;
  const dyad = (Math.sin(TWO_PI * 220 * t) + Math.sin(TWO_PI * 330 * t) * 0.6) * 0.18;
  const envelope = p * p * (p < 0.92 ? 1 : (1 - p) / 0.08);
  return (air + dyad) * envelope * 1.4;
}

const SFX = [
  { file: "whoosh.mp3", dur: 0.42, render: renderWhoosh },
  { file: "pop.mp3", dur: 0.18, render: renderPop },
  { file: "rise.mp3", dur: 0.85, render: renderRise },
];

function writeWav(path, sfx) {
  const frames = Math.round(SAMPLE_RATE * sfx.dur);
  const dataSize = frames * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  const noise = makeNoise();
  const state = { lp: 0, lp2: 0 };
  for (let i = 0; i < frames; i += 1) {
    const t = i / SAMPLE_RATE;
    const s = Math.max(-0.98, Math.min(0.98, sfx.render(t, sfx.dur, noise, state)));
    buffer.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  writeFileSync(path, buffer);
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "sfx");
spawnSync("mkdir", ["-p", outDir]);

const force = process.argv.includes("--force");
const existing = SFX.filter((s) => existsSync(join(outDir, s.file)));
if (existing.length > 0 && !force) {
  console.error(
    `refusing to overwrite curated SFX (${existing.map((s) => s.file).join(", ")}). ` +
      `These are hand-picked ElevenLabs cues (sfx/SOURCES.md); rerun with --force to replace them with the procedural fallback.`
  );
  process.exit(1);
}

for (const sfx of SFX) {
  const wavPath = join(outDir, sfx.file.replace(".mp3", ".wav"));
  const mp3Path = join(outDir, sfx.file);
  writeWav(wavPath, sfx);
  const result = spawnSync(
    "ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error", "-i", wavPath, "-af", "loudnorm=I=-23:TP=-2", "-codec:a", "libmp3lame", "-b:a", "96k", mp3Path],
    { stdio: "inherit" }
  );
  if (result.error || result.status !== 0) {
    rmSync(wavPath, { force: true });
    rmSync(mp3Path, { force: true });
    process.exitCode = result.status || 1;
    break;
  }
  rmSync(wavPath, { force: true });
  console.log(`wrote ${mp3Path}`);
}
