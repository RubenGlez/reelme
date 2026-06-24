// Cache and scaffold management. The Remotion project never lives in the
// user's repo: it is scaffolded from the bundled template into
// ~/.reelme/cache/<project-hash>/ and reused across renders.

import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const CACHE_ROOT = join(homedir(), ".reelme", "cache");

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATE_DIR = join(PKG_ROOT, "template");
export const AUDIO_DIR = join(PKG_ROOT, "assets", "audio");

const CLI_VERSION = JSON.parse(
  readFileSync(join(PKG_ROOT, "package.json"), "utf8")
).version;

// Not copied into the cache scaffold (mirrors the old SKILL.md rsync excludes).
const SCAFFOLD_EXCLUDES = new Set([
  "node_modules",
  "out",
  "__tests__",
  ".gitignore",
  "eslint.config.mjs",
  "vitest.config.ts",
  "logo.png", // template sample; users provide their own logo
]);

export function fail(message) {
  console.error(`reelme: ${message}`);
  process.exit(1);
}

export function loadPlatforms() {
  return JSON.parse(
    readFileSync(join(TEMPLATE_DIR, "src", "platforms.json"), "utf8")
  );
}

export function readBrief(repoRoot) {
  const briefPath = join(repoRoot, "reelme.json");
  if (!existsSync(briefPath)) {
    fail(
      `no reelme.json found in ${repoRoot}. Run the /reelme skill to create one.`
    );
  }
  let brief;
  try {
    brief = JSON.parse(readFileSync(briefPath, "utf8"));
  } catch (e) {
    fail(`reelme.json is not valid JSON: ${e.message}`);
  }
  if (brief.schemaVersion !== 2) {
    fail(
      `reelme.json has schemaVersion ${brief.schemaVersion ?? "(none)"}; this CLI requires schemaVersion 2. ` +
        `Briefs with a top-level "scenes" array or a "format" field are v1 — re-run the /reelme skill to migrate.`
    );
  }
  const platforms = loadPlatforms();
  const ids = brief.project?.platforms;
  if (!Array.isArray(ids) || ids.length === 0) {
    fail(
      `project.platforms is missing or empty. Pick at least one of: ${Object.keys(platforms).join(", ")}.`
    );
  }
  const unknown = ids.filter((id) => !platforms[id]);
  if (unknown.length > 0) {
    fail(
      `unknown platform(s): ${unknown.join(", ")}. Valid platforms: ${Object.keys(platforms).join(", ")}.`
    );
  }
  if (!Array.isArray(brief.cuts?.main) || brief.cuts.main.length === 0) {
    fail(`cuts.main is missing or empty — the main cut is required.`);
  }
  return brief;
}

export function projectCacheDir(repoRoot) {
  const hash = createHash("sha256").update(repoRoot).digest("hex").slice(0, 12);
  return join(CACHE_ROOT, hash);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.error) fail(`failed to run ${command}: ${result.error.message}`);
  if (result.status !== 0) {
    fail(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

// Scaffolds (or reuses) the cache project and syncs the user's brief into it.
// Returns the cache directory. Re-renders never reinstall; a CLI version bump
// rebuilds the scaffold so template fixes reach every user on next render.
export function ensureScaffold(repoRoot) {
  const cacheDir = projectCacheDir(repoRoot);
  const versionMarker = join(cacheDir, ".reelme-template-version");

  const stale =
    existsSync(versionMarker) &&
    readFileSync(versionMarker, "utf8").trim() !== CLI_VERSION;
  if (stale) {
    console.log(
      `reelme: template updated (CLI ${CLI_VERSION}) — rebuilding the cache scaffold.`
    );
    rmSync(cacheDir, { recursive: true, force: true });
  }

  if (!existsSync(join(cacheDir, "package.json"))) {
    console.log(`reelme: scaffolding Remotion project in ${cacheDir}`);
    mkdirSync(cacheDir, { recursive: true });
    cpSync(TEMPLATE_DIR, cacheDir, {
      recursive: true,
      filter: (src) => !SCAFFOLD_EXCLUDES.has(basename(src)),
    });
    writeFileSync(versionMarker, `${CLI_VERSION}\n`);
  }

  // Re-sync the template source on every render. The version marker only fires
  // on a CLI bump, so without this a render reuses whatever scene code the cache
  // was scaffolded with — local template edits (and the gallery render eval)
  // would silently test stale code. This is a cheap dir copy; node_modules stays
  // gated below so we don't reinstall. (Deleted template files aren't pruned from
  // the cache — a CLI bump or `reelme clean` does a full rebuild.)
  cpSync(join(TEMPLATE_DIR, "src"), join(cacheDir, "src"), {
    recursive: true,
    filter: (src) => !SCAFFOLD_EXCLUDES.has(basename(src)),
  });

  // The user's brief always wins over the template sample.
  cpSync(join(repoRoot, "reelme.json"), join(cacheDir, "src", "brief.json"));

  if (!existsSync(join(cacheDir, "node_modules"))) {
    console.log("reelme: installing render dependencies (first run only)…");
    run("pnpm", ["install"], cacheDir);
    // esbuild needs its post-install script; pnpm-workspace.yaml persists the approval.
    run("pnpm", ["approve-builds", "--all"], cacheDir);
  }

  return cacheDir;
}

export function cleanCache() {
  if (!existsSync(CACHE_ROOT)) {
    console.log("reelme: cache is already empty.");
    return;
  }
  rmSync(CACHE_ROOT, { recursive: true, force: true });
  console.log(`reelme: removed ${CACHE_ROOT}`);
}
