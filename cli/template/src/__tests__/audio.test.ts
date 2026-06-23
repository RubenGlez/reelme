import { describe, expect, it } from "vitest";
import { audioVolume } from "../audio";

describe("audioVolume", () => {
  it("uses the default low background volume", () => {
    expect(audioVolume(0, 120)).toBe(0.25);
  });

  it("clamps the base volume to [0, 1]", () => {
    expect(audioVolume(0, 120, -0.5)).toBe(0);
    expect(audioVolume(0, 120, 2)).toBe(1);
  });

  it("keeps volume constant until the final 45 frames", () => {
    expect(audioVolume(74, 120, 0.4)).toBe(0.4);
    expect(audioVolume(75, 120, 0.4)).toBe(0.4);
  });

  it("fades linearly to zero at the composition end", () => {
    expect(audioVolume(97.5, 120, 0.4)).toBeCloseTo(0.2);
    expect(audioVolume(120, 120, 0.4)).toBe(0);
  });

  it("handles short compositions by fading from the start", () => {
    expect(audioVolume(15, 30, 0.5)).toBeCloseTo(0.25);
    expect(audioVolume(30, 30, 0.5)).toBe(0);
  });
});
