#!/usr/bin/env node
// Gallery render eval. The briefs under gallery/<name>/reelme.json double as a
// regression suite: re-render them with the LOCAL CLI after any change to the
// CLI, the Remotion template, or the brief schema to confirm nothing broke.
//
// Usage:
//   node scripts/eval-gallery.mjs            # render every gallery brief
//   node scripts/eval-gallery.mjs ripgrep    # render only the named brief(s)
//
// Smoke eval: a brief "passes" when the CLI renders all its platforms with
// exit 0. Remotion output isn't bit-deterministic, so we assert successful
// renders rather than diffing pixels; the committed GIFs are the visual
// reference for manual review. Outputs land in each brief's reelme-out/
// (gitignored). Exits non-zero if any brief fails.
import { readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const galleryDir = join(root, "gallery");
const cli = join(root, "cli", "src", "cli.mjs");

const only = process.argv.slice(2);
const briefs = readdirSync(galleryDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && existsSync(join(galleryDir, e.name, "reelme.json")))
  .map((e) => e.name)
  .filter((name) => only.length === 0 || only.includes(name));

if (briefs.length === 0) {
  console.error("No matching gallery briefs found.");
  process.exit(1);
}

// A hung Chrome download or a stuck render should fail loudly, not look like a
// slow success. Cap each brief; a timeout counts as a failure.
const RENDER_TIMEOUT_MS = 15 * 60 * 1000;

let failed = 0;
for (const name of briefs) {
  const cwd = join(galleryDir, name);

  // Deterministic pre-pass: validate the brief (schema, platforms, scene types,
  // required fields, asset extensions) before spending minutes on a render. This
  // catches the mechanical class of regressions without waiting for Remotion.
  const check = spawnSync("node", [cli, "validate"], { cwd, encoding: "utf8" });
  if (check.status !== 0) {
    failed++;
    console.log(`▶ ${name} … INVALID`);
    console.log((check.stderr || check.stdout || "").trim().replace(/^/gm, "    "));
    continue;
  }

  console.log(`▶ ${name} … rendering`);
  // Stream Remotion's own progress live (stdio: inherit) so a multi-minute
  // render shows movement instead of going dark until PASS/FAIL.
  const res = spawnSync("node", [cli, "render"], {
    cwd,
    stdio: "inherit",
    timeout: RENDER_TIMEOUT_MS,
  });
  if (res.status === 0) {
    console.log(`  ${name}: PASS`);
  } else {
    failed++;
    const why = res.error?.code === "ETIMEDOUT" ? `TIMEOUT after ${RENDER_TIMEOUT_MS / 60000}m` : `exit ${res.status}`;
    console.log(`  ${name}: FAIL (${why})`);
  }
}

console.log(`\n${briefs.length - failed}/${briefs.length} gallery briefs passed.`);
process.exit(failed ? 1 : 0);
