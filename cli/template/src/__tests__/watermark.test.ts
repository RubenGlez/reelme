import { describe, it, expect } from "vitest";

function showWatermark(watermark: boolean | undefined): boolean {
  return watermark !== false;
}

describe("watermark resolution", () => {
  it("is on by default when undefined", () => {
    expect(showWatermark(undefined)).toBe(true);
  });

  it("is off when explicitly false", () => {
    expect(showWatermark(false)).toBe(false);
  });

  it("is on when explicitly true", () => {
    expect(showWatermark(true)).toBe(true);
  });
});
