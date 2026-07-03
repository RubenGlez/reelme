#!/usr/bin/env node
// reelme — thin CLI owning the mechanics (ADR 0003): scaffold in a global
// cache, render per-platform variants, open Studio, clean up. The agent
// skill owns the intelligence and writes reelme.json; this CLI never asks
// questions.

import { ensureScaffold, cleanCache, readBrief, runShell, fail } from "./cache.mjs";
import { render, stageInputs } from "./render.mjs";

const USAGE = `reelme — launch videos for your repo, rendered locally

Usage: npx reelme <command>

Commands:
  render       Render every platform in reelme.json to ./reelme-out/
  studio       Open Remotion Studio against the cached project (preview/tweak)
  validate     Check reelme.json (schema, platforms, scenes) without rendering
  clean        Remove this project's reelme cache
  clean --all  Remove every project's cache (~/.reelme/cache)

The brief (reelme.json) lives at your repo root — create it with the
/reelme agent skill: npx skills add RubenGlez/reelme
`;

// Studio runs the same staging pipeline as render (minus the render loop) so a
// preview shows exactly what render() would produce — assets, audio, and logo
// all staged, and a missing brief reported cleanly (F1).
function studio(repoRoot) {
  const brief = readBrief(repoRoot);
  const cacheDir = ensureScaffold(repoRoot);
  stageInputs(repoRoot, cacheDir, brief);
  console.log("reelme: opening Remotion Studio (Ctrl+C to stop)…");
  const result = runShell("pnpm", ["exec", "remotion", "studio"], cacheDir);
  if (result.error) fail(`failed to open Studio: ${result.error.message}`);
}

const command = process.argv[2];
const repoRoot = process.cwd();

switch (command) {
  case "render":
    render(repoRoot);
    break;
  case "studio":
    studio(repoRoot);
    break;
  case "validate":
    // readBrief validates schema, platforms, and every scene, exiting non-zero
    // with named errors on failure. A cheap pre-render check for the skill.
    readBrief(repoRoot);
    console.log("reelme: reelme.json is valid.");
    break;
  case "clean":
    cleanCache(repoRoot, process.argv.includes("--all"));
    break;
  case "--help":
  case "-h":
  case "help":
  case undefined:
    console.log(USAGE);
    break;
  default:
    console.error(`reelme: unknown command "${command}"\n`);
    console.log(USAGE);
    process.exit(1);
}
