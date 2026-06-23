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

let failed = 0;
for (const name of briefs) {
  process.stdout.write(`▶ ${name} … `);
  const res = spawnSync("node", [cli, "render"], {
    cwd: join(galleryDir, name),
    encoding: "utf8",
  });
  if (res.status === 0) {
    console.log("PASS");
  } else {
    failed++;
    console.log("FAIL");
    const out = (res.stderr || res.stdout || "").trim().split("\n").slice(-6).join("\n");
    console.log(out.replace(/^/gm, "    "));
  }
}

console.log(`\n${briefs.length - failed}/${briefs.length} gallery briefs rendered.`);
process.exit(failed ? 1 : 0);
