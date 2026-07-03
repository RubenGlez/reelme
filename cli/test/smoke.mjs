#!/usr/bin/env node
// CLI smoke test. The CLI (cli/src/*.mjs) is untyped and unlinted, so this
// exercises its brief validation end-to-end via `reelme validate` — no pnpm
// install, no Remotion, just the parse/validate path that render() runs first.
// Exits non-zero if any case misbehaves.

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "cli.mjs");

const validScene = { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" };
const base = {
  schemaVersion: 2,
  project: { name: "X", platforms: ["x"], tone: "professional", primaryColor: "#6366f1" },
  cuts: { main: [validScene] },
};

let failures = 0;

// Runs `reelme <command>` in a fresh temp dir seeded with `brief` (or no brief
// when brief is null), and asserts the exit code and an output substring.
function check(name, { brief, args = ["validate"], code, contains }) {
  const dir = mkdtempSync(join(tmpdir(), "reelme-smoke-"));
  try {
    if (brief !== null) writeFileSync(join(dir, "reelme.json"), JSON.stringify(brief));
    const res = spawnSync("node", [CLI, ...args], { cwd: dir, encoding: "utf8" });
    const out = `${res.stdout}${res.stderr}`;
    const okCode = res.status === code;
    const okText = contains === undefined || out.includes(contains);
    if (okCode && okText) {
      console.log(`  ✓ ${name}`);
    } else {
      failures++;
      console.log(`  ✗ ${name}: exit=${res.status} (want ${code})${okText ? "" : `, missing "${contains}"`}`);
      console.log(out.trim().split("\n").map((l) => `      ${l}`).join("\n"));
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log("reelme CLI smoke:");

check("no args prints usage", { brief: null, args: [], code: 0, contains: "Usage:" });
check("valid brief passes", { brief: base, code: 0, contains: "is valid" });
check("missing brief fails", { brief: null, code: 1, contains: "no reelme.json found" });
check("unknown platform fails", {
  brief: { ...base, project: { ...base.project, platforms: ["myspace"] } },
  code: 1,
  contains: "unknown platform",
});
check("unknown scene type fails", {
  brief: { ...base, cuts: { main: [{ type: "stat_callout", stats: [] }] } },
  code: 1,
  contains: "unknown scene type",
});
check("missing required scene field fails", {
  brief: { ...base, cuts: { main: [{ type: "feature-list" }] } },
  code: 1,
  contains: 'missing required field "items"',
});
check("bad asset extension fails", {
  brief: { ...base, cuts: { main: [{ type: "clip", src: "demo.webm", frame: "none" }, validScene] } },
  code: 1,
  contains: "must be one of mp4, mov, gif",
});
check("empty vertical array is treated as absent", {
  brief: { ...base, cuts: { main: [validScene], vertical: [] } },
  code: 0,
  contains: "is valid",
});

if (failures > 0) {
  console.log(`\n${failures} smoke check(s) failed.`);
  process.exit(1);
}
console.log("\nAll CLI smoke checks passed.");
