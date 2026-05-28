import { describe, it, expect } from "vitest";
import { sceneDuration, calcTotalDuration, SCENE_DURATION_MAP } from "../duration";
import { Brief, Scene } from "../brief";

describe("sceneDuration", () => {
  it("returns fixed durations for non-dynamic scene types", () => {
    const types = Object.keys(SCENE_DURATION_MAP) as Scene["type"][];
    const dynamicTypes: Scene["type"][] = ["feature-list", "stat-callout", "file-tree", "os-window", "hotkey"];
    for (const type of types) {
      if (dynamicTypes.includes(type)) continue;
      const scene = { type } as Scene;
      expect(sceneDuration(scene)).toBe(SCENE_DURATION_MAP[type]);
    }
  });

  it("computes feature-list duration from item count", () => {
    expect(sceneDuration({ type: "feature-list", items: [] })).toBe(80);
    expect(sceneDuration({ type: "feature-list", items: ["a"] })).toBe(105);
    expect(sceneDuration({ type: "feature-list", items: ["a", "b", "c"] })).toBe(155);
  });

  it("computes hotkey duration from key count", () => {
    expect(sceneDuration({ type: "hotkey", keys: ["⌘"] })).toBe(110);
    expect(sceneDuration({ type: "hotkey", keys: ["⌘", "⇧", "Space"] })).toBe(150);
  });

  it("computes os-window duration from items and search query", () => {
    expect(sceneDuration({ type: "os-window", items: [] })).toBe(80);
    expect(sceneDuration({ type: "os-window", items: [{ label: "A" }, { label: "B" }] })).toBe(120);
    expect(sceneDuration({ type: "os-window", searchQuery: "test", items: [{ label: "A" }] })).toBe(20 + (4 * 3 + 10) + 20 + 60);
  });
});

describe("calcTotalDuration", () => {
  it("returns 0 for empty scenes", () => {
    const brief: Brief = {
      project: {
        name: "test",
        tagline: "",
        problem: "",
        installCommand: "",
        repoUrl: "",
        primaryColor: "#000000",
        tone: "professional",
      },
      scenes: [],
    };
    expect(calcTotalDuration(brief)).toBe(0);
  });

  it("sums durations of all scenes", () => {
    const brief: Brief = {
      project: {
        name: "test",
        tagline: "",
        problem: "",
        installCommand: "",
        repoUrl: "",
        primaryColor: "#000000",
        tone: "professional",
      },
      scenes: [
        { type: "problem", headline: "test" },
        { type: "cta", installCommand: "npx x", repoUrl: "github.com/x" },
      ],
    };
    expect(calcTotalDuration(brief)).toBe(120 + 120);
  });

  it("handles feature-list scenes with dynamic duration", () => {
    const brief: Brief = {
      project: {
        name: "test",
        tagline: "",
        problem: "",
        installCommand: "",
        repoUrl: "",
        primaryColor: "#000000",
        tone: "professional",
      },
      scenes: [
        { type: "feature-list", items: ["a", "b"] },
      ],
    };
    expect(calcTotalDuration(brief)).toBe(20 + 2 * 25 + 60);
  });
});
