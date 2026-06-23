import { describe, expect, it } from "vitest";
import { benchmarkFractions } from "../benchmark";

describe("benchmarkFractions", () => {
  it("higher-is-better: longest bar for the largest value", () => {
    expect(benchmarkFractions([10, 5, 2.5])).toEqual([1, 0.5, 0.25]);
  });

  it("lower-is-better: longest bar for the smallest value", () => {
    const f = benchmarkFractions([0.3, 1.2, 2.1], true);
    expect(f[0]).toBe(1);
    expect(f[1]).toBeCloseTo(0.25);
    expect(f[2]).toBeCloseTo(0.142857);
  });

  it("ignores non-positive and invalid values", () => {
    expect(benchmarkFractions([0, 5, 10])).toEqual([0, 0.5, 1]);
    expect(benchmarkFractions([NaN, 4])).toEqual([0, 1]);
  });

  it("returns zeros when nothing is comparable", () => {
    expect(benchmarkFractions([0, 0])).toEqual([0, 0]);
    expect(benchmarkFractions([0, 0], true)).toEqual([0, 0]);
  });
});
