#!/usr/bin/env node
// reelme — thin CLI owning the mechanics (ADR 0003): scaffold in a global
// cache, render per-platform variants, open Studio, clean up. The agent
// skill owns the intelligence and writes reelme.json; this CLI never asks
// questions.

import { spawnSync } from "node:child_process";
import { ensureScaffold, cleanCache, fail } from "./cache.mjs";
import { render } from "./render.mjs";

const USAGE = `reelme — launch videos for your repo, rendered locally

Usage: npx reelme <command>

Commands:
  render   Render every platform in reelme.json to ./reelme-out/
  studio   Open Remotion Studio against the cached project (preview/tweak)
  clean    Remove the reelme cache (~/.reelme/cache)

The brief (reelme.json) lives at your repo root — create it with the
/reelme agent skill: npx skills add RubenGlez/reelme
`;

function studio(repoRoot) {
  const cacheDir = ensureScaffold(repoRoot);
  console.log("reelme: opening Remotion Studio (Ctrl+C to stop)…");
  const result = spawnSync("pnpm", ["exec", "remotion", "studio"], {
    cwd: cacheDir,
    stdio: "inherit",
  });
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
  case "clean":
    cleanCache();
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
