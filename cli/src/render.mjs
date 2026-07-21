// The render command: one output file per selected platform, plus a teaser
// variant per social platform when the brief has a teaser cut. Outputs land
// in <repo>/reelme-out/; the heavy Remotion project stays in the cache.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve, relative, isAbsolute } from "node:path";
import { spawnSync } from "node:child_process";
import { AUDIO_DIR, ensureScaffold, loadPlatforms, readBrief, runShell, fail } from "./cache.mjs";

// Reject asset paths that escape their base dir. A reelme.json is authored by an
// agent and gets committed/shared, so a `../../…` src/logo would otherwise copy
// (or read) files outside the cache at render time (F11). Guards both the repo
// source and the cache destination.
function safeJoin(baseDir, relPath, label) {
  if (typeof relPath !== "string" || relPath.length === 0 || isAbsolute(relPath)) {
    fail(`${label} "${relPath}" must be a repo-relative path.`);
  }
  const dest = resolve(baseDir, relPath);
  const rel = relative(baseDir, dest);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    fail(`${label} "${relPath}" escapes the project directory — refusing to copy.`);
  }
  return dest;
}

// Lossy gif pass. Remotion's native gif is already well quantized, but a
// gifsicle --lossy run roughly halves it again with text left crisp. Our
// atmosphere gradients band under palette/colour reduction, so we keep the full
// palette and only apply --lossy. gifsicle is read from PATH: the npm package
// that used to vendor the binary is unmaintained and pulled an unpatchable
// critical advisory (decompress GHSA-mp2f-45pm-3cg9) into every install.
// Best-effort: a missing gifsicle is non-fatal.
function optimizeGif(file) {
  const res = spawnSync("gifsicle", ["-b", "-O3", "--lossy=60", file], { stdio: "ignore" });
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
  const result = runShell("pnpm", args, cacheDir);
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
  // Resolve every path through the traversal guard before touching the disk.
  const resolved = assets.map((asset) => ({
    asset,
    source: safeJoin(repoRoot, asset, "asset"),
    dest: safeJoin(publicDir, asset, "asset"),
  }));
  const missing = resolved.filter(({ source }) => !existsSync(source));
  if (missing.length > 0) {
    fail(`missing asset file(s):\n${missing.map(({ source }) => `  ${source}`).join("\n")}`);
  }
  for (const { source, dest } of resolved) {
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(source, dest);
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

  // Cut SFX ride along whenever music is enabled (Root.tsx plays them under
  // scene transitions; audio: false disables both together).
  const sfxDir = join(AUDIO_DIR, "sfx");
  if (existsSync(sfxDir)) {
    cpSync(sfxDir, join(audioDir, "sfx"), { recursive: true });
  }
}

function copyLogo(repoRoot, cacheDir, brief) {
  const logo = brief.project?.logo;
  if (!logo) return;
  const source = safeJoin(repoRoot, logo, "project.logo");
  if (!existsSync(source)) {
    fail(`project.logo file not found: ${source}`);
  }
  const publicDir = join(cacheDir, "public");
  const dest = safeJoin(publicDir, logo, "project.logo");
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(source, dest);
}

// Stage every render input into the cache. Shared by render() and studio() so
// Studio previews exactly what render() produces (F1) instead of showing 404s
// for missing assets/audio/logo.
export function stageInputs(repoRoot, cacheDir, brief) {
  copyAssets(repoRoot, cacheDir, brief);
  copyAudioTrack(cacheDir, brief);
  copyLogo(repoRoot, cacheDir, brief);
}

export function render(repoRoot) {
  const brief = readBrief(repoRoot);
  const platforms = loadPlatforms();
  const cacheDir = ensureScaffold(repoRoot);
  const outDir = join(repoRoot, "reelme-out");
  mkdirSync(outDir, { recursive: true });

  stageInputs(repoRoot, cacheDir, brief);

  const verticalFallback = brief.project.platforms.filter(
    (id) => platforms[id].cut === "vertical" && !brief.cuts.vertical?.length
  );
  if (verticalFallback.length > 0) {
    console.warn(
      `reelme: warning — no cuts.vertical in reelme.json; ${verticalFallback.join(", ")} will re-render ` +
        `the main cut at 9:16. Dense wide scenes may cramp — author a vertical cut for better results.`
    );
  }

  for (const id of brief.project.platforms) {
    const preset = platforms[id];
    const outFile = basename(preset.output.file);
    renderComposition(cacheDir, `Reel-${id}`, outFile, preset.output.codec);
    copyOut(cacheDir, outFile, outDir);
  }

  const hasTeaser = Array.isArray(brief.cuts.teaser) && brief.cuts.teaser.length > 0;
  if (hasTeaser) {
    const socialIds = brief.project.platforms.filter(
      (id) => platforms[id].output.codec !== "gif"
    );
    for (const id of socialIds) {
      const outFile = `${id}-teaser.mp4`;
      renderComposition(cacheDir, `Reel-${id}-teaser`, outFile, "h264");
      copyOut(cacheDir, outFile, outDir);
    }
  }

  console.log(`reelme: done — outputs in ${outDir}`);
}

// Copy a finished render to reelme-out/, then drop the cache copy so out/ doesn't
// accumulate every render forever (F16). The deliverable already lives in the repo.
function copyOut(cacheDir, outFile, outDir) {
  const cached = join(cacheDir, "out", outFile);
  cpSync(cached, join(outDir, outFile));
  rmSync(cached, { force: true });
}
