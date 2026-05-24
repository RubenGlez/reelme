import chroma from "chroma-js";

export interface Theme {
  bg: string;
  surface: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  // Typography
  fontMono: string;
  fontSans: string;
}

export function buildTheme(primaryHex: string): Theme {
  const accent = chroma(primaryHex);
  const isDark = accent.luminance() < 0.4;

  const bg = chroma.mix(accent, isDark ? "#0f0f13" : "#f8f8fc", 0.92, "lab").hex();
  const surface = chroma.mix(accent, isDark ? "#1a1a24" : "#ececf4", 0.88, "lab").hex();
  const border = chroma.mix(accent, isDark ? "#ffffff" : "#000000", 0.1, "lab").hex();
  const accentMuted = accent.alpha(0.18).css();

  const text = isDark ? "#f0f0f6" : "#111118";
  const textMuted = isDark ? "#888899" : "#666677";
  const textInverse = isDark ? "#111118" : "#f0f0f6";

  return {
    bg,
    surface,
    accent: accent.hex(),
    accentMuted,
    text,
    textMuted,
    textInverse,
    border,
    fontMono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSans: "'Inter', 'DM Sans', system-ui, sans-serif",
  };
}
