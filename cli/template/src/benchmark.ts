// Pure bar-length logic for the benchmark scene, extracted so it can be unit
// tested. Returns a fraction in (0, 1] per value; the winner is always 1.0 so
// it reads as the longest bar regardless of metric direction.
export function benchmarkFractions(
  values: number[],
  lowerIsBetter = false
): number[] {
  const safe = values.map((v) => (Number.isFinite(v) && v > 0 ? v : 0));

  if (lowerIsBetter) {
    const positives = safe.filter((v) => v > 0);
    const min = positives.length ? Math.min(...positives) : 0;
    return safe.map((v) => (v > 0 && min > 0 ? min / v : 0));
  }

  const max = Math.max(...safe, 0);
  return safe.map((v) => (max > 0 ? v / max : 0));
}
