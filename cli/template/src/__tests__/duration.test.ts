import { describe, it, expect } from "vitest";
import { sceneDuration, calcTotalDuration, SCENE_DURATION_MAP, SCENE_TAIL, TEASER_MAX_FRAMES } from "../duration";
import { Cuts, Scene } from "../brief";

describe("sceneDuration", () => {
  it("returns fixed durations for non-dynamic scene types", () => {
    const types = Object.keys(SCENE_DURATION_MAP) as Scene["type"][];
    // hook bypasses SCENE_TAIL; dynamic types compute duration from content length
    const dynamicTypes: Scene["type"][] = ["feature-list", "stat-callout", "file-tree", "os-window", "hotkey", "hook", "clip", "benchmark"];
    for (const type of types) {
      if (dynamicTypes.includes(type)) continue;
      const scene = { type } as Scene;
      expect(sceneDuration(scene)).toBe(SCENE_DURATION_MAP[type] + SCENE_TAIL);
    }
  });

  it("hook scene is exactly 50 frames with no tail", () => {
    const hook: Scene = { type: "hook", text: "Stop scrolling." };
    expect(sceneDuration(hook)).toBe(50);
  });

  it("hook duration is within 1.5–2s at 30fps and below the smallest non-hook total", () => {
    const hook: Scene = { type: "hook", text: "Hook." };
    const duration = sceneDuration(hook);
    expect(duration).toBeGreaterThanOrEqual(45); // 1.5s at 30fps
    expect(duration).toBeLessThanOrEqual(60);    // 2s at 30fps
    // smallest non-hook total is hotkey (1 key) = 110 + SCENE_TAIL
    expect(duration).toBeLessThan(110 + SCENE_TAIL);
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
