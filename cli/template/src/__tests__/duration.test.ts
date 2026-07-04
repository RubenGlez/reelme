import { describe, it, expect } from "vitest";
import { sceneDuration, sceneDurationsOnGrid, calcTotalDuration, SCENE_DURATION_MAP, SCENE_TAIL, TEASER_MAX_FRAMES } from "../duration";
import { CAPTION_HOLD, codeRevealCaptionStart, terminalCaptionStart } from "../timing";
import { Cuts, Scene } from "../brief";

describe("sceneDuration", () => {
  it("returns fixed durations for non-dynamic scene types", () => {
    const types = Object.keys(SCENE_DURATION_MAP) as Scene["type"][];
    // hook bypasses SCENE_TAIL; dynamic types compute duration from content length
    const dynamicTypes: Scene["type"][] = ["terminal", "code-reveal", "feature-list", "stat-callout", "file-tree", "os-window", "hotkey", "hook", "clip", "benchmark"];
    for (const type of types) {
      if (dynamicTypes.includes(type)) continue;
      const scene = { type } as Scene;
      expect(sceneDuration(scene)).toBe(SCENE_DURATION_MAP[type] + SCENE_TAIL);
    }
  });

  it("computes terminal duration from typed content, with room for the caption (F7)", () => {
    const noCaption: Scene = { type: "terminal", commands: [{ input: "abc", output: "done" }] };
    // (3*2 + 23) + 23 = 52 typed; captionStart = 8 + 52 + 20 = 80
    expect(terminalCaptionStart(noCaption)).toBe(80);
    expect(sceneDuration(noCaption)).toBe(80 + SCENE_TAIL);
    const withCaption: Scene = { ...noCaption, caption: "One command." };
    expect(sceneDuration(withCaption)).toBe(80 + CAPTION_HOLD + SCENE_TAIL);
  });

  it("computes code-reveal duration from line count, with room for the caption (F7)", () => {
    const noCaption: Scene = { type: "code-reveal", language: "ts", code: "a\nb\nc" };
    // captionStart = 14 + 3*9 + 20 = 61
    expect(codeRevealCaptionStart(noCaption)).toBe(61);
    expect(sceneDuration(noCaption)).toBe(61 + SCENE_TAIL);
    const withCaption: Scene = { ...noCaption, caption: "Type-safe." };
    expect(sceneDuration(withCaption)).toBe(61 + CAPTION_HOLD + SCENE_TAIL);
  });

  it("keeps captionStart within the scene for every captioned scene type (F7)", () => {
    // A caption must have time to appear before the scene ends. The previously
    // fixed terminal/code-reveal durations could push captionStart past the end.
    const scenes: Scene[] = [
      {
        type: "terminal",
        commands: [
          { input: "npx create-sprout-app my-app", output: "Creating project..." },
          { input: "cd my-app && pnpm dev", output: "Local: http://localhost:3000" },
        ],
        caption: "One command. Production stack. Under 60 seconds.",
      },
      {
        type: "code-reveal",
        language: "ts",
        code: Array.from({ length: 18 }, (_, i) => `const line${i} = ${i};`).join("\n"),
        caption: "End-to-end type safety.",
      },
    ];
    for (const scene of scenes) {
      let start: number;
      if (scene.type === "terminal") start = terminalCaptionStart(scene);
      else if (scene.type === "code-reveal") start = codeRevealCaptionStart(scene);
      else continue;
      expect(start).toBeLessThan(sceneDuration(scene));
      expect(start + CAPTION_HOLD).toBeLessThanOrEqual(sceneDuration(scene));
    }
  });

  it("hook duration scales with word count so long hooks stay readable", () => {
    // 2 words → below the floor; the floor guarantees even a terse hook lands.
    expect(sceneDuration({ type: "hook", text: "Stop scrolling." })).toBe(70);
    // 8 words → 40 + 8*8 = 104 (~3.5s at 30fps to reveal and read).
    expect(sceneDuration({ type: "hook", text: "Turn a JSON brief into a launch video." })).toBe(104);
    // A rambling hook is capped: it's a hook, not a scene.
    const long: Scene = { type: "hook", text: Array.from({ length: 30 }, () => "word").join(" ") };
    expect(sceneDuration(long)).toBe(120);
  });

  it("hook duration stays within 2.3–4s at 30fps and below the smallest non-hook total", () => {
    const texts = ["Hook.", "Search the Linux kernel in 0.08s.", Array.from({ length: 30 }, () => "w").join(" ")];
    for (const text of texts) {
      const duration = sceneDuration({ type: "hook", text });
      expect(duration).toBeGreaterThanOrEqual(70);  // ~2.3s at 30fps
      expect(duration).toBeLessThanOrEqual(120);    // 4s at 30fps
      // smallest non-hook total is hotkey (1 key) = 110 + SCENE_TAIL
      expect(duration).toBeLessThan(110 + SCENE_TAIL);
    }
  });

  it("uses default clip duration when durationInFrames is not set", () => {
    expect(sceneDuration({ type: "clip", src: "demo.mp4", frame: "none" })).toBe(150 + SCENE_TAIL);
  });

  it("uses durationInFrames for clip when provided", () => {
    expect(sceneDuration({ type: "clip", src: "demo.mp4", frame: "browser", durationInFrames: 60 })).toBe(60 + SCENE_TAIL);
  });

  it("computes feature-list duration from item count", () => {
    expect(sceneDuration({ type: "feature-list", items: [] })).toBe(80 + SCENE_TAIL);
    expect(sceneDuration({ type: "feature-list", items: ["a"] })).toBe(105 + SCENE_TAIL);
    expect(sceneDuration({ type: "feature-list", items: ["a", "b", "c"] })).toBe(155 + SCENE_TAIL);
  });

  it("computes hotkey duration from key count", () => {
    expect(sceneDuration({ type: "hotkey", keys: ["⌘"] })).toBe(110 + SCENE_TAIL);
    expect(sceneDuration({ type: "hotkey", keys: ["⌘", "⇧", "Space"] })).toBe(150 + SCENE_TAIL);
  });

  it("computes benchmark duration from bar count", () => {
    expect(sceneDuration({ type: "benchmark", bars: [] })).toBe(80 + SCENE_TAIL);
    expect(
      sceneDuration({
        type: "benchmark",
        bars: [
          { label: "a", value: 1 },
          { label: "b", value: 2 },
        ],
      })
    ).toBe(20 + 2 * 30 + 60 + SCENE_TAIL);
  });

  it("computes os-window duration from items and search query", () => {
    expect(sceneDuration({ type: "os-window", items: [] })).toBe(80 + SCENE_TAIL);
    expect(sceneDuration({ type: "os-window", items: [{ label: "A" }, { label: "B" }] })).toBe(120 + SCENE_TAIL);
    expect(sceneDuration({ type: "os-window", searchQuery: "test", items: [{ label: "A" }] })).toBe(20 + (4 * 3 + 10) + 20 + 60 + SCENE_TAIL);
  });
});

describe("sceneDurationsOnGrid", () => {
  const scenes: Scene[] = [
    { type: "hook", text: "Fast." },
    { type: "feature-list", items: ["a", "b"] },
    { type: "cta", installCommand: "npm i x", repoUrl: "github.com/x/x" },
  ];

  it("passes natural durations through when no bpm is given", () => {
    expect(sceneDurationsOnGrid(scenes, 30)).toEqual(scenes.map(sceneDuration));
  });

  it("lands every cumulative cut on a beat and never shortens a scene", () => {
    for (const bpm of [88, 92, 104, 126]) {
      const beat = (60 / bpm) * 30;
      const grid = sceneDurationsOnGrid(scenes, 30, bpm);
      let cursor = 0;
      grid.forEach((duration, i) => {
        expect(duration).toBeGreaterThanOrEqual(sceneDuration(scenes[i]) - 0.001);
        cursor += duration;
        // Each cut sits on the nearest frame to a whole-beat boundary.
        const beats = cursor / beat;
        expect(Math.abs(beats - Math.round(beats)) * beat).toBeLessThanOrEqual(0.5);
      });
    }
  });

  it("matches calcTotalDuration's quantized total", () => {
    const grid = sceneDurationsOnGrid(scenes, 30, 126);
    expect(calcTotalDuration(scenes, 30, 126)).toBe(grid.reduce((a, b) => a + b, 0));
  });
});

describe("calcTotalDuration", () => {
  it("returns 0 for an empty scene list", () => {
    expect(calcTotalDuration([])).toBe(0);
  });

  it("sums durations of all scenes in a cut", () => {
    const scenes: Scene[] = [
      { type: "problem", headline: "test" },
      { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" },
    ];
    expect(calcTotalDuration(scenes)).toBe((120 + SCENE_TAIL) + (120 + SCENE_TAIL));
  });

  it("handles feature-list scenes with dynamic duration", () => {
    const scenes: Scene[] = [{ type: "feature-list", items: ["a", "b"] }];
    expect(calcTotalDuration(scenes)).toBe(20 + 2 * 25 + 60 + SCENE_TAIL);
  });

  it("computes each cut independently", () => {
    const cuts: Cuts = {
      main: [
        { type: "problem", headline: "h" },
        { type: "terminal", commands: [{ input: "a", output: "b" }] },
        { type: "feature-list", items: ["a", "b", "c"] },
        { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" },
      ],
      vertical: [
        { type: "problem", headline: "h", hero: true },
        { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" },
      ],
      teaser: [
        { type: "problem", headline: "h", hero: true },
        { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" },
      ],
    };
    const main = calcTotalDuration(cuts.main);
    const vertical = calcTotalDuration(cuts.vertical!);
    const teaser = calcTotalDuration(cuts.teaser!);
    expect(main).toBeGreaterThan(vertical);
    expect(vertical).toBe((120 + SCENE_TAIL) + (120 + SCENE_TAIL));
    expect(teaser).toBe(vertical);
  });

  it("keeps a representative teaser cut within TEASER_MAX_FRAMES", () => {
    const teaser: Scene[] = [
      { type: "problem", headline: "Apex 2.0 is here.", hero: true },
      { type: "cta", installCommand: "npm install apex-gql@2", repoUrl: "github.com/apexgql/apex" },
    ];
    expect(calcTotalDuration(teaser)).toBeLessThanOrEqual(TEASER_MAX_FRAMES);
  });
});
