import { describe, it, expect } from "vitest";
import { buildTheme } from "../theme";

describe("buildTheme", () => {
  it("returns all required keys including motion", () => {
    const theme = buildTheme("#6366f1");
    const keys = ["bg", "surface", "accent", "accentMuted", "text", "textMuted", "textInverse", "border", "fontMono", "fontSans", "motion"];
    for (const key of keys) {
      expect(theme).toHaveProperty(key);
    }
  });

  it("sets accent to the input color", () => {
    const theme = buildTheme("#6366f1");
    expect(theme.accent.toLowerCase()).toBe("#6366f1");
  });

  it("defaults to dark theme regardless of accent luminance", () => {
    const dark = buildTheme("#6366f1"); // indigo, low luminance
    const bright = buildTheme("#fbbf24"); // amber, high luminance
    expect(dark.text).toBe("#f0f0f6");
    expect(bright.text).toBe("#f0f0f6"); // dark by default
  });

  it("produces a light theme when bgStyle is 'light'", () => {
    const theme = buildTheme("#fbbf24", undefined, undefined, undefined, "light");
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

  describe("tone → motion profile", () => {
    it("professional has moderate damping", () => {
      const theme = buildTheme("#6366f1", undefined, undefined, "professional");
      expect(theme.motion.damping).toBe(22);
      expect(theme.motion.stiffness).toBe(100);
    });

    it("playful has low damping (bouncy)", () => {
      const theme = buildTheme("#6366f1", undefined, undefined, "playful");
      expect(theme.motion.damping).toBe(11);
      expect(theme.motion.stiffness).toBe(130);
    });

    it("technical has high damping (tight)", () => {
      const theme = buildTheme("#6366f1", undefined, undefined, "technical");
      expect(theme.motion.damping).toBe(30);
      expect(theme.motion.stiffness).toBe(140);
    });

    it("defaults to professional when tone is omitted", () => {
      const theme = buildTheme("#6366f1");
      expect(theme.motion.damping).toBe(22);
    });
  });

  describe("bgStyle → background darkness", () => {
    it("deep produces dark text (near-black bg)", () => {
      const theme = buildTheme("#6366f1", undefined, undefined, undefined, "deep");
      expect(theme.text).toBe("#f0f0f6");
    });

    it("branded produces a more tinted bg than deep", () => {
      const deep = buildTheme("#6366f1", undefined, undefined, undefined, "deep");
      const branded = buildTheme("#6366f1", undefined, undefined, undefined, "branded");
      // branded bg should be lighter (more accent mixed in) than deep
      expect(branded.bg).not.toBe(deep.bg);
    });

    it("light produces light text colors", () => {
      const theme = buildTheme("#6366f1", undefined, undefined, undefined, "light");
      expect(theme.text).toBe("#111118");
      expect(theme.textMuted).toBe("#555566");
    });
  });
});
