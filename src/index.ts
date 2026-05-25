#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import pc from "picocolors";
import pkg from "../package.json";

const TEMPLATE_DIR = path.join(__dirname, "../template");

const STARTER_BRIEF = {
  project: {
    name: "my-project",
    tagline: "One sentence describing what your project does.",
    problem: "The pain point your project solves.",
    installCommand: "npm install my-project",
    repoUrl: "github.com/you/my-project",
    primaryColor: "#6366f1",
    tone: "professional",
    mode: "intro",
    logo: "",
  },
  scenes: [
    {
      type: "problem",
      headline: "Your headline here.",
      subtext: "Supporting context in one sentence.",
      caption: "Your takeaway in 5–10 words.",
    },
    {
      type: "feature-list",
      headline: "What makes it worth using.",
      items: ["First key feature", "Second key feature", "Third key feature"],
      caption: "",
    },
    {
      type: "cta",
      installCommand: "npm install my-project",
      repoUrl: "github.com/you/my-project",
      caption: "",
    },
  ],
};

const program = new Command();

program
  .name("reelme")
  .description("Generate animated explainer videos for any open-source project")
  .version(pkg.version);

program
  .command("init")
  .description("Create a starter brief.json in the current directory")
  .action(cmdInit);

program
  .command("render", { isDefault: true })
  .description("Scaffold the Remotion project and render the video")
  .option("--brief <path>", "path to brief.json", "brief.json")
  .option("--out <dir>", "output directory for the Remotion project", "video")
  .action(cmdRender);

program.parse();

function cmdInit() {
  const dest = path.join(process.cwd(), "brief.json");
  if (fs.existsSync(dest)) {
    fatal("brief.json already exists. Edit it directly, or delete it and re-run init.");
  }
  fs.writeFileSync(dest, JSON.stringify(STARTER_BRIEF, null, 2) + "\n");
  console.log(pc.green("✔") + " Created brief.json");
  console.log("  Fill in your project details, then run: " + pc.cyan("npx reelme render"));
}

function cmdRender(opts: { brief: string; out: string }) {
  const briefPath = path.resolve(process.cwd(), opts.brief);
  const outDir = path.resolve(process.cwd(), opts.out);

  if (!fs.existsSync(briefPath)) {
    fatal(
      `brief.json not found at ${pc.yellow(opts.brief)}\n` +
        `  Run ${pc.cyan("npx reelme init")} to create one, or use ${pc.cyan("/reelme")} in Claude Code for the full AI-powered flow.`
    );
  }

  // Scaffold template if not already present
  if (!fs.existsSync(path.join(outDir, "package.json"))) {
    console.log(pc.dim("Scaffolding → " + path.relative(process.cwd(), outDir) + "/"));
    fse.copySync(TEMPLATE_DIR, outDir, {
      filter: (src: string) => {
        const rel = path.relative(TEMPLATE_DIR, src);
        return (
          !rel.startsWith("src" + path.sep + "__tests__") &&
          !rel.startsWith("node_modules") &&
          !rel.startsWith("out") &&
          rel !== "eslint.config.mjs" &&
          rel !== "vitest.config.ts"
        );
      },
    });
  }

  // Always sync brief.json so re-runs pick up edits
  fse.ensureDirSync(path.join(outDir, "src"));
  fse.copySync(briefPath, path.join(outDir, "src", "brief.json"), { overwrite: true });

  // Install deps if not already done
  if (!fs.existsSync(path.join(outDir, "node_modules"))) {
    console.log(pc.dim("Installing dependencies..."));
    run("pnpm install", outDir);
    run("pnpm approve-builds --all", outDir);
  }

  console.log(pc.dim("Rendering..."));
  run("pnpm render", outDir);

  const mp4 = path.relative(process.cwd(), path.join(outDir, "out", "video.mp4"));
  const gif = path.relative(process.cwd(), path.join(outDir, "out", "video.gif"));
  console.log("\n" + pc.green("✔") + " Done!");
  console.log("  MP4 → " + pc.cyan(mp4));
  console.log("  GIF → " + pc.cyan(gif));
}

function run(cmd: string, cwd: string) {
  execSync(cmd, { cwd, stdio: "inherit" });
}

function fatal(msg: string): never {
  console.error(pc.red("error:") + " " + msg);
  process.exit(1);
}
