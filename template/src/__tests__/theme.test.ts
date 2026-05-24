import { describe, it, expect } from "vitest";
import { buildTheme } from "../theme";

describe("buildTheme", () => {
  it("returns all required keys", () => {
    const theme = buildTheme("#6366f1");
    const keys = ["bg", "surface", "accent", "accentMuted", "text", "textMuted", "textInverse", "border", "fontMono", "fontSans"];
    for (const key of keys) {
      expect(theme).toHaveProperty(key);
    }
  });

  it("sets accent to the input color", () => {
    const theme = buildTheme("#6366f1");
    expect(theme.accent.toLowerCase()).toBe("#6366f1");
  });

  it("produces a dark theme for low-luminance colors", () => {
    const theme = buildTheme("#6366f1"); // indigo, luminance ~0.18
    expect(theme.text).toBe("#f0f0f6");
  });

  it("produces a light theme for high-luminance colors", () => {
    const theme = buildTheme("#fbbf24"); // amber, luminance ~0.52
    expect(theme.text).toBe("#111118");
  });

  it("accentMuted is a valid CSS color string", () => {
    const theme = buildTheme("#6366f1");
    expect(theme.accentMuted).toMatch(/^rgba?\(/);
  });

  it("does not throw for edge-case colors", () => {
    expect(() => buildTheme("#ffffff")).not.toThrow();
    expect(() => buildTheme("#000000")).not.toThrow();
  });
});
