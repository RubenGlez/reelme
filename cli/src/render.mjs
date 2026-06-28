// The render command: one output file per selected platform, plus a teaser
// variant per social platform when the brief has a teaser cut. Outputs land
// in <repo>/reelme-out/; the heavy Remotion project stays in the cache.

import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { AUDIO_DIR, ensureScaffold, loadPlatforms, readBrief, fail } from "./cache.mjs";

const require = createRequire(import.meta.url);

// Resolve the gifsicle binary: prefer the optionalDependency's bundled build,
// fall back to a system install on PATH. Returns null when neither is present.
function gifsicleBin() {
  try {
    const mod = require("gifsicle");
    // The package exports the binary path; under Node's require-ESM it arrives
    // as a namespace ({ default: path }) rather than a bare string.
    const p = typeof mod === "string" ? mod : mod?.default;
    if (typeof p === "string" && existsSync(p)) return p;
  } catch {
    // optionalDependency not installed — fall through to a PATH lookup.
  }
  return "gifsicle";
}

// Lossy gif pass. Remotion's native gif is already well quantized, but a
// gifsicle --lossy run roughly halves it again with text left crisp. Our
// atmosphere gradients band under palette/colour reduction, so we keep the full
// palette and only apply --lossy. Best-effort: a missing gifsicle is non-fatal.
function optimizeGif(file) {
  const res = spawnSync(gifsicleBin(), ["-b", "-O3", "--lossy=60", file], { stdio: "ignore" });
  if (res.error || res.status !== 0) {
    console.warn("reelme: note — gif left unoptimized (install gifsicle for ~50% smaller files).");
  }
}

function renderComposition(cacheDir, compositionId, outFile, codec) {
  const args = ["exec", "remotion", "render", compositionId, join("out", outFile)];
  // Render gifs at 0.6 scale (e.g. 1920x1080 -> 1152x648): a README gif needs no
  // more, and fewer pixels roughly halves the file size. Layout and timing are
  // unchanged — --scale downscales the output, not the composition coordinates.
  if (codec === "gif") {
    args.push("--codec=gif", "--scale=0.6");
  } else {
    // Remotion's default h264 bitrate is far higher than a social upload needs;
    // crf 20 is visually lossless and cuts the file to roughly a third.
    args.push("--crf=20");
  }
  console.log(`reelme: rendering ${compositionId} → reelme-out/${outFile}`);
  const result = spawnSync("pnpm", args, { cwd: cacheDir, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    fail(`render failed for platform composition "${compositionId}".`);
  }
  if (codec === "gif") optimizeGif(join(cacheDir, "out", outFile));
}

function collectAssets(brief) {
  const assets = [];
  const cuts = [brief.cuts.main, brief.cuts.vertical, brief.cuts.teaser].filter(Boolean);
  for (const cut of cuts) {
    for (const scene of cut) {
      if (scene.type === "clip" && scene.src) assets.push(scene.src);
      if (scene.type === "mobile" && scene.screenshot) assets.push(scene.screenshot);
      if (scene.type === "browser" && scene.image) assets.push(scene.image);
    }
  }
  return [...new Set(assets)];
}

function copyAssets(repoRoot, cacheDir, brief) {
  const assets = collectAssets(brief);
  if (assets.length === 0) return;
  const publicDir = join(cacheDir, "public");
  mkdirSync(publicDir, { recursive: true });
  const missing = assets.filter((a) => !existsSync(join(repoRoot, a)));
  if (missing.length > 0) {
    fail(`missing asset file(s):\n${missing.map((a) => `  ${join(repoRoot, a)}`).join("\n")}`);
  }
  for (const asset of assets) {
    const dest = join(publicDir, asset);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(repoRoot, asset), dest);
  }
}

function loadAudioManifest() {
  const manifestPath = join(AUDIO_DIR, "manifest.json");
  if (!existsSync(manifestPath)) {
    fail(`audio manifest is missing from the package: ${manifestPath}`);
  }
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!Array.isArray(manifest)) throw new Error("manifest must be an array");
    return manifest;
  } catch (e) {
    fail(`audio manifest is invalid: ${e.message}`);
  }
}

function copyAudioTrack(cacheDir, brief) {
  const audio = brief.project?.audio;
  if (!audio) return;

  const track = audio.track;
  if (typeof track !== "string" || track.length === 0 || basename(track) !== track) {
    fail(`project.audio.track must be a filename from the bundled audio manifest.`);
  }

  const manifest = loadAudioManifest();
  const validTracks = manifest.map((entry) => entry.file).filter(Boolean);
  const entry = manifest.find((item) => item.file === track);
  if (!entry) {
    fail(
      `unknown audio track "${track}". Valid tracks: ${validTracks.join(", ")}.`
    );
  }

  const source = join(AUDIO_DIR, track);
  if (!existsSync(source)) {
    fail(`bundled audio track "${track}" is missing from ${AUDIO_DIR}.`);
  }

  const audioDir = join(cacheDir, "public", "audio");
  mkdirSync(audioDir, { recursive: true });
  cpSync(source, join(audioDir, track));
}

function copyLogo(repoRoot, cacheDir, brief) {
  const logo = brief.project?.logo;
  if (!logo) return;
  const source = join(repoRoot, logo);
  if (!existsSync(source)) {
    fail(`project.logo file not found: ${source}`);
  }
  const publicDir = join(cacheDir, "public");
  const dest = join(publicDir, logo);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(source, dest);
}

export function render(repoRoot) {
  const brief = readBrief(repoRoot);
  const platforms = loadPlatforms();
  const cacheDir = ensureScaffold(repoRoot);
  const outDir = join(repoRoot, "reelme-out");
  mkdirSync(outDir, { recursive: true });

  copyAssets(repoRoot, cacheDir, brief);
  copyAudioTrack(cacheDir, brief);
  copyLogo(repoRoot, cacheDir, brief);

  const verticalFallback = brief.project.platforms.filter(
    (id) => platforms[id].cut === "vertical" && !brief.cuts.vertical?.length
  );
  if (verticalFallback.length > 0) {
    console.warn(
      `reelme: warning — no cuts.vertical in reelme.json; ${verticalFallback.join(", ")} will render ` +
        `the main cut letterboxed into 9:16. Author a vertical cut for better results.`
    );
  }

  for (const id of brief.project.platforms) {
    const preset = platforms[id];
    const outFile = basename(preset.output.file);
    renderComposition(cacheDir, `Reel-${id}`, outFile, preset.output.codec);
    cpSync(join(cacheDir, "out", outFile), join(outDir, outFile));
  }

  const hasTeaser = Array.isArray(brief.cuts.teaser) && brief.cuts.teaser.length > 0;
  if (hasTeaser) {
    const socialIds = brief.project.platforms.filter(
      (id) => platforms[id].output.codec !== "gif"
    );
    for (const id of socialIds) {
      const outFile = `${id}-teaser.mp4`;
      renderComposition(cacheDir, `Reel-${id}-teaser`, outFile, "h264");
      cpSync(join(cacheDir, "out", outFile), join(outDir, outFile));
    }
  }

  console.log(`reelme: done — outputs in ${outDir}`);
}
