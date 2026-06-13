import chroma from "chroma-js";
import { resolveSansFont, resolveMonoFont } from "./fonts";

export interface MotionProfile {
  damping: number;
  stiffness: number;
  mass: number;
}

export interface Theme {
  bg: string;
  surface: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  fontMono: string;
  fontSans: string;
  motion: MotionProfile;
}

const MOTION_PROFILES: Record<string, MotionProfile> = {
  professional: { damping: 22, stiffness: 100, mass: 1.0 },
  playful:      { damping: 11, stiffness: 130, mass: 0.7 },
  technical:    { damping: 30, stiffness: 140, mass: 1.2 },
};

const TONE_FONTS: Record<string, { sans: string; mono: string }> = {
  professional: { sans: "Inter",        mono: "JetBrains Mono" },
  playful:      { sans: "Nunito",        mono: "JetBrains Mono" },
  technical:    { sans: "IBM Plex Sans", mono: "Space Mono" },
};

export function buildTheme(
  primaryHex: string,
  font?: string,
  monoFont?: string,
  tone?: string,
  bgStyle?: "deep" | "branded" | "light",
): Theme {
  const accent = chroma(primaryHex);
  const isLightBg = bgStyle === "light";

  let bg: string;
  let surface: string;
  let text: string;
  let textMuted: string;
  let textInverse: string;
  let border: string;

  if (isLightBg) {
    bg = chroma.mix(accent, "#fafafa", 0.9, "lab").hex();
    surface = chroma.mix(accent, "#efefef", 0.85, "lab").hex();
    border = chroma.mix(accent, "#000000", 0.12, "lab").hex();
    text = "#111118";
    textMuted = "#555566";
    textInverse = "#f0f0f6";
  } else {
    const mixRatio = bgStyle === "branded" ? 0.76 : 0.92;
    bg = chroma.mix(accent, "#0f0f13", mixRatio, "lab").hex();
    surface = chroma.mix(accent, "#1a1a24", mixRatio - 0.04, "lab").hex();
    border = chroma.mix(accent, "#ffffff", 0.1, "lab").hex();
    text = "#f0f0f6";
    textMuted = "#888899";
    textInverse = "#111118";
  }

  const accentMuted = accent.alpha(0.18).css();
  const toneKey = tone ?? "professional";
  const motion = MOTION_PROFILES[toneKey] ?? MOTION_PROFILES.professional;
  const toneFont = TONE_FONTS[toneKey] ?? TONE_FONTS.professional;

  return {
    bg,
    surface,
    accent: accent.hex(),
    accentMuted,
    text,
    textMuted,
    textInverse,
    border,
    fontMono: resolveMonoFont(monoFont ?? toneFont.mono),
    fontSans: resolveSansFont(font ?? toneFont.sans),
    motion,
  };
}
