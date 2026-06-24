import { describe, it, expect } from "vitest";
import { resolveLook, LOOK_IDS } from "../cinematic/look";

describe("resolveLook", () => {
  it("defaults look from tone", () => {
    expect(resolveLook(undefined, "professional").id).toBe("keynote");
    expect(resolveLook(undefined, "playful").id).toBe("arcade");
    expect(resolveLook(undefined, "technical").id).toBe("blueprint");
  });

  it("defaults to keynote when tone is missing or unknown", () => {
    expect(resolveLook(undefined, undefined).id).toBe("keynote");
    expect(resolveLook(undefined, "nonsense").id).toBe("keynote");
  });

  it("honors an explicit look over the tone default", () => {
    expect(resolveLook("noir", "professional").id).toBe("noir");
    expect(resolveLook("editorial", "technical").id).toBe("editorial");
  });

  it("ignores an unknown look and falls back to the tone default", () => {
    expect(resolveLook("cinemascope", "playful").id).toBe("arcade");
  });

  it("returns a complete, well-formed look for every preset", () => {
    for (const id of LOOK_IDS) {
      const look = resolveLook(id, undefined);
      expect(look.id).toBe(id);
      expect(look.glow).toBeGreaterThanOrEqual(0);
      expect(look.grain).toBeGreaterThanOrEqual(0);
      expect(look.energy).toBeGreaterThanOrEqual(0);
      expect(look.energy).toBeLessThanOrEqual(1);
      expect(look.grade.alpha).toBeGreaterThanOrEqual(0);
      expect(look.grade.alpha).toBeLessThanOrEqual(1);
    }
  });
});
