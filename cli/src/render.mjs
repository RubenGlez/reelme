// The render command: one output file per selected platform, plus a teaser
// variant per social platform when the brief has a teaser cut. Outputs land
// in <repo>/reelme-out/; the heavy Remotion project stays in the cache.

import { cpSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";
import { ensureScaffold, loadPlatforms, readBrief, fail } from "./cache.mjs";

function renderComposition(cacheDir, compositionId, outFile, codec) {
  const args = ["exec", "remotion", "render", compositionId, join("out", outFile)];
  if (codec === "gif") args.push("--codec=gif");
  console.log(`reelme: rendering ${compositionId} → reelme-out/${outFile}`);
  const result = spawnSync("pnpm", args, { cwd: cacheDir, stdio: "inherit" });
  if (result.error || result.status !== 0) {
    fail(`render failed for platform composition "${compositionId}".`);
  }
}

export function render(repoRoot) {
  const brief = readBrief(repoRoot);
  const platforms = loadPlatforms();
  const cacheDir = ensureScaffold(repoRoot);
  const outDir = join(repoRoot, "reelme-out");
  mkdirSync(outDir, { recursive: true });

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
