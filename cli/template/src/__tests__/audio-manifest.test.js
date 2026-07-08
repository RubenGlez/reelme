import { readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const audioDir = join(dirname(fileURLToPath(import.meta.url)), "../../../assets/audio");
const manifest = JSON.parse(readFileSync(join(audioDir, "manifest.json"), "utf8"));

describe("audio manifest", () => {
  it("ships two curated tracks per tone", () => {
    expect(manifest).toHaveLength(6);
  });

  it("has complete provenance and package-safe files", () => {
    for (const entry of manifest) {
      expect(entry.file).toMatch(/^[a-z0-9-]+\.mp3$/);
      expect(entry.title).toBeTruthy();
      expect(entry.artist).toBeTruthy();
      expect(entry.source).toMatch(/^https:\/\//);
      expect(["CC0", "CC-BY"]).toContain(entry.license);
      expect(entry.tones.length).toBeGreaterThan(0);
      // Beat quantization needs a real tempo for every track (cache.mjs
      // injects it into the staged brief at render time).
      expect(entry.bpm).toBeGreaterThanOrEqual(60);
      expect(entry.bpm).toBeLessThanOrEqual(200);
      expect(existsSync(join(audioDir, entry.file))).toBe(true);
      expect(statSync(join(audioDir, entry.file)).size).toBeLessThanOrEqual(2 * 1024 * 1024);
      if (entry.license !== "CC0") {
        expect(entry.attribution).toBeTruthy();
      }
    }
  });

  it("covers every tone with at least two tracks", () => {
    for (const tone of ["professional", "playful", "technical"]) {
      const count = manifest.filter((entry) => entry.tones.includes(tone)).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });
});
