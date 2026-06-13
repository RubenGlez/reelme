import { describe, it, expect } from "vitest";
import { PLATFORMS, cutForPlatform, PlatformId, PlatformPreset } from "../platforms";

const ALL_IDS: PlatformId[] = [
  "x",
  "linkedin",
  "youtube",
  "tiktok",
  "instagram-reel",
  "instagram-story",
  "instagram-feed",
  "github-readme",
];

describe("PLATFORMS", () => {
  it("has a complete preset for every PlatformId", () => {
    for (const id of ALL_IDS) {
      const preset: PlatformPreset = PLATFORMS[id];
      expect(preset).toBeDefined();
      expect(preset.id).toBe(id);
      expect(preset.label.length).toBeGreaterThan(0);
      expect(["main", "vertical"]).toContain(preset.cut);
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
      expect(preset.fps).toBe(30);
      expect(["h264", "gif"]).toContain(preset.output.codec);
      expect(preset.output.file.startsWith("reelme-out/")).toBe(true);
    }
    expect(Object.keys(PLATFORMS)).toHaveLength(ALL_IDS.length);
  });

  it("maps vertical platforms to 1080x1920 with a safeArea", () => {
    for (const id of ["tiktok", "instagram-reel", "instagram-story"] as PlatformId[]) {
      const preset = PLATFORMS[id];
      expect(preset.cut).toBe("vertical");
      expect(preset.width).toBe(1080);
      expect(preset.height).toBe(1920);
      expect(preset.safeArea).toBeDefined();
      expect(preset.safeArea!.top).toBeGreaterThan(0);
      expect(preset.safeArea!.bottom).toBeGreaterThan(0);
    }
  });

  it("maps main 16:9 platforms to 1920x1080", () => {
    for (const id of ["x", "linkedin", "youtube", "github-readme"] as PlatformId[]) {
      const preset = PLATFORMS[id];
      expect(preset.cut).toBe("main");
      expect(preset.width).toBe(1920);
      expect(preset.height).toBe(1080);
    }
  });

  it("maps instagram-feed to 1080x1080", () => {
    expect(PLATFORMS["instagram-feed"].width).toBe(1080);
    expect(PLATFORMS["instagram-feed"].height).toBe(1080);
    expect(PLATFORMS["instagram-feed"].cut).toBe("main");
  });

  it("gives github-readme a gif output and everything else h264", () => {
    for (const id of ALL_IDS) {
      const expected = id === "github-readme" ? "gif" : "h264";
      expect(PLATFORMS[id].output.codec).toBe(expected);
    }
    expect(PLATFORMS["github-readme"].output.file.endsWith(".gif")).toBe(true);
  });

  it("cutForPlatform mirrors the preset table", () => {
    for (const id of ALL_IDS) {
      expect(cutForPlatform(id)).toBe(PLATFORMS[id].cut);
    }
  });
});
