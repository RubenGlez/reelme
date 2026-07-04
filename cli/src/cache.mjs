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
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const CACHE_ROOT = join(homedir(), ".reelme", "cache");

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const TEMPLATE_DIR = join(PKG_ROOT, "template");
export const AUDIO_DIR = join(PKG_ROOT, "assets", "audio");

const CLI_VERSION = JSON.parse(
  readFileSync(join(PKG_ROOT, "package.json"), "utf8")
).version;

// Cache-invalidation key. The per-render `src/` re-sync keeps scene code fresh,
// but dependencies and pnpm config only reach an existing cache on a full
// rebuild — so the marker hashes those files, not just the CLI version (F8).
// A bumped Remotion version or workspace change now forces a reinstall.
function templateFingerprint() {
  const hash = createHash("sha256").update(CLI_VERSION);
  for (const file of ["package.json", "pnpm-workspace.yaml"]) {
    const path = join(TEMPLATE_DIR, file);
    if (existsSync(path)) hash.update(readFileSync(path));
  }
  return hash.digest("hex").slice(0, 16);
}

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

// Per-scene contract, mirroring the TypeScript union in template/src/brief.ts.
// The CLI runs first and owns the error UX, so it validates exhaustively here
// (F4/F13/F24): a typo'd scene type or a missing required prop is caught with a
// named error instead of a cryptic NaN duration or crash minutes into Remotion.
const SCENE_REQUIRED = {
  problem: ["headline"],
  "code-reveal": ["language", "code"],
  terminal: ["commands"],
  "data-flow": ["nodes", "edges"],
  cta: ["installCommand", "repoUrl"],
  browser: ["url"],
  split: ["before", "after"],
  "feature-list": ["items"],
  "stat-callout": ["stats"],
  "file-tree": ["entries"],
  mobile: [],
  "os-window": ["items"],
  hotkey: ["keys"],
  hook: ["text"],
  clip: ["src", "frame"],
  benchmark: ["bars"],
  custom: ["component", "durationInFrames"],
};
const ARRAY_FIELDS = new Set([
  "commands", "nodes", "edges", "items", "stats", "entries", "keys", "bars",
]);
const CLIP_EXTS = ["mp4", "mov", "gif"];
const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp"];

function extOf(p) {
  const dot = p.lastIndexOf(".");
  return dot === -1 ? "" : p.slice(dot + 1).toLowerCase();
}

function validateScene(scene, where, errors) {
  if (!scene || typeof scene !== "object") {
    errors.push(`${where}: scene must be an object.`);
    return;
  }
  const spec = SCENE_REQUIRED[scene.type];
  if (!spec) {
    errors.push(
      `${where}: unknown scene type "${scene.type ?? "(none)"}". Valid types: ${Object.keys(SCENE_REQUIRED).join(", ")}.`
    );
    return;
  }
  for (const field of spec) {
    if (scene[field] === undefined || scene[field] === null) {
      errors.push(`${where} (${scene.type}): missing required field "${field}".`);
    } else if (ARRAY_FIELDS.has(field) && !Array.isArray(scene[field])) {
      errors.push(`${where} (${scene.type}): "${field}" must be an array.`);
    }
  }
  // Asset extension checks — the direct-CLI path has no skill to pre-validate.
  const assetChecks = [
    ["clip", "src", CLIP_EXTS],
    ["mobile", "screenshot", IMAGE_EXTS],
    ["browser", "image", IMAGE_EXTS],
    ["custom", "component", ["tsx"]],
  ];
  for (const [type, field, exts] of assetChecks) {
    if (scene.type === type && typeof scene[field] === "string" && !exts.includes(extOf(scene[field]))) {
      errors.push(
        `${where} (${type}): "${field}" must be one of ${exts.join(", ")} (got "${scene[field]}").`
      );
    }
  }
}

// Empty cut arrays are normalized to absent so a `"vertical": []` behaves like a
// missing vertical cut everywhere (F3): the CLI and the template agree on the
// main-cut fallback instead of building a zero-duration composition.
function normalizeCuts(brief) {
  for (const key of ["vertical", "teaser"]) {
    if (Array.isArray(brief.cuts?.[key]) && brief.cuts[key].length === 0) {
      delete brief.cuts[key];
    }
  }
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
  normalizeCuts(brief);

  const errors = [];
  for (const key of ["main", "vertical", "teaser"]) {
    const cut = brief.cuts[key];
    if (!Array.isArray(cut)) continue;
    cut.forEach((scene, i) => validateScene(scene, `cuts.${key}[${i}]`, errors));
  }
  if (errors.length > 0) {
    fail(`reelme.json has ${errors.length} scene problem(s):\n${errors.map((e) => `  ${e}`).join("\n")}`);
  }
  return brief;
}

export function projectCacheDir(repoRoot) {
  const hash = createHash("sha256").update(repoRoot).digest("hex").slice(0, 12);
  return join(CACHE_ROOT, hash);
}

// spawnSync with the pnpm/npx shims resolved on every OS. On Windows those
// shims are `.cmd` files, which Node's spawnSync can only launch via a shell
// (and since CVE-2024-27980 that is the only sanctioned route). Elsewhere we
// avoid the shell so arguments never go through word-splitting.
export function runShell(command, args, cwd) {
  return spawnSync(command, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
}

function run(command, args, cwd) {
  const result = runShell(command, args, cwd);
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
  const fingerprint = templateFingerprint();

  // A cache with a package.json but a missing or mismatched marker is stale — a
  // missing marker is treated as stale, not fresh (F8), so half-built or
  // pre-marker caches always rebuild.
  const cacheExists = existsSync(join(cacheDir, "package.json"));
  const markerValue = existsSync(versionMarker)
    ? readFileSync(versionMarker, "utf8").trim()
    : null;
  if (cacheExists && markerValue !== fingerprint) {
    console.log(
      `reelme: template changed (CLI ${CLI_VERSION}) — rebuilding the cache scaffold.`
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
    writeFileSync(versionMarker, `${fingerprint}\n`);
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

  // The user's brief always wins over the template sample. On the way in, the
  // chosen track's BPM is injected from the audio manifest so the template can
  // quantize scene cuts to the beat — the manifest stays the single source of
  // truth and briefs never hand-write bpm.
  cpSync(join(repoRoot, "reelme.json"), join(cacheDir, "src", "brief.json"));
  try {
    const briefPath = join(cacheDir, "src", "brief.json");
    const staged = JSON.parse(readFileSync(briefPath, "utf8"));
    const track = staged?.project?.audio?.track;
    if (track) {
      const manifest = JSON.parse(readFileSync(join(AUDIO_DIR, "manifest.json"), "utf8"));
      const entry = Array.isArray(manifest) ? manifest.find((e) => e.file === track) : undefined;
      if (entry && typeof entry.bpm === "number") {
        staged.project.audio.bpm = entry.bpm;
        writeFileSync(briefPath, JSON.stringify(staged, null, 2) + "\n");
      }
    }
  } catch {
    // Malformed briefs/manifests are reported by validation, not here.
  }

  stageCustomScenes(repoRoot, cacheDir);

  if (!existsSync(join(cacheDir, "node_modules"))) {
    console.log("reelme: installing render dependencies (first run only)…");
    // esbuild's build script is pre-approved in template/pnpm-workspace.yaml
    // (allowBuilds), so `pnpm install` runs it without a blanket approval of
    // every dependency's scripts (F15) — the supply-chain gate stays closed.
    run("pnpm", ["install"], cacheDir);
  }

  return cacheDir;
}

/**
 * Stage skill-authored bespoke scenes and regenerate the import registry the
 * template's SceneRenderer resolves against. The template's default
 * custom-scenes.ts (synced a moment earlier) exports an empty registry, so
 * briefs without custom scenes keep exactly the stock behavior. Remotion
 * bundles statically, so a generated barrel of real imports is the only way a
 * brief-referenced path can become a renderable component.
 */
function stageCustomScenes(repoRoot, cacheDir) {
  let components = [];
  try {
    const staged = JSON.parse(readFileSync(join(cacheDir, "src", "brief.json"), "utf8"));
    for (const cut of Object.values(staged?.cuts ?? {})) {
      if (!Array.isArray(cut)) continue;
      for (const scene of cut) {
        if (scene?.type === "custom" && typeof scene.component === "string") {
          components.push(scene.component);
        }
      }
    }
  } catch {
    return; // malformed briefs are reported by validation
  }
  components = [...new Set(components)];
  if (components.length === 0) return;

  const customDir = join(cacheDir, "src", "custom");
  mkdirSync(customDir, { recursive: true });

  const imports = [];
  const entries = [];
  components.forEach((rel, i) => {
    // Containment: the component must live inside the repo.
    const source = resolve(repoRoot, rel);
    const contained = relative(repoRoot, source);
    if (isAbsolute(rel) || contained.startsWith("..") || isAbsolute(contained)) {
      fail(`custom scene component must be a repo-relative path (got "${rel}").`);
    }
    if (!existsSync(source)) {
      fail(`custom scene component not found: ${rel}`);
    }
    cpSync(source, join(customDir, `scene-${i}.tsx`));
    imports.push(`import Custom${i} from "./custom/scene-${i}";`);
    entries.push(`  ${JSON.stringify(rel)}: Custom${i},`);
  });

  const generated = `// GENERATED by the reelme CLI at stage time — do not edit.
import type { ComponentType } from "react";
import { Theme } from "./theme";
import { ProjectMeta } from "./brief";
import { PlatformPreset } from "./platforms";
${imports.join("\n")}

export interface CustomSceneProps {
  theme: Theme;
  project: ProjectMeta;
  platform: PlatformPreset;
  bottomInset: number;
  caption?: string;
}

export const CUSTOM_SCENES: Record<string, ComponentType<CustomSceneProps>> = {
${entries.join("\n")}
};
`;
  writeFileSync(join(cacheDir, "src", "custom-scenes.ts"), generated);
}

// Removes the current project's cache by default; pass `all` to wipe every
// project's cache (F16). A moved/renamed repo hashes to a new dir, so `--all`
// is the way to reclaim orphaned caches.
export function cleanCache(repoRoot, all = false) {
  if (all) {
    if (!existsSync(CACHE_ROOT)) {
      console.log("reelme: cache is already empty.");
      return;
    }
    rmSync(CACHE_ROOT, { recursive: true, force: true });
    console.log(`reelme: removed all project caches (${CACHE_ROOT})`);
    return;
  }
  const cacheDir = projectCacheDir(repoRoot);
  if (!existsSync(cacheDir)) {
    console.log("reelme: no cache for this project. Use `reelme clean --all` to wipe every project's cache.");
    return;
  }
  rmSync(cacheDir, { recursive: true, force: true });
  console.log(`reelme: removed this project's cache (${cacheDir})`);
}
