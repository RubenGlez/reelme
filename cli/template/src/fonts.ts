import { loadFont as loadInter, fontFamily as inter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk, fontFamily as spaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadDMSans, fontFamily as dmSans } from "@remotion/google-fonts/DMSans";
import { loadFont as loadSyne, fontFamily as syne } from "@remotion/google-fonts/Syne";
import { loadFont as loadPlusJakartaSans, fontFamily as plusJakartaSans } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadNunito, fontFamily as nunito } from "@remotion/google-fonts/Nunito";
import { loadFont as loadIBMPlexSans, fontFamily as ibmPlexSans } from "@remotion/google-fonts/IBMPlexSans";
import { loadFont as loadJetBrainsMono, fontFamily as jetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSpaceMono, fontFamily as spaceMono } from "@remotion/google-fonts/SpaceMono";

loadInter();
loadSpaceGrotesk();
loadDMSans();
loadSyne();
loadPlusJakartaSans();
loadNunito();
loadIBMPlexSans();
loadJetBrainsMono();
loadSpaceMono();

export const SANS_FONTS: Record<string, string> = {
  inter,
  "space-grotesk": spaceGrotesk,
  "dm-sans": dmSans,
  syne,
  "plus-jakarta-sans": plusJakartaSans,
  nunito,
  "ibm-plex-sans": ibmPlexSans,
};

export const MONO_FONTS: Record<string, string> = {
  "jetbrains-mono": jetBrainsMono,
  "space-mono": spaceMono,
};

export const DEFAULT_SANS = inter;
export const DEFAULT_MONO = jetBrainsMono;

export function resolveSansFont(name?: string): string {
  if (!name) return DEFAULT_SANS;
  const key = name.toLowerCase().replace(/\s+/g, "-");
  return SANS_FONTS[key] ?? DEFAULT_SANS;
}

export function resolveMonoFont(name?: string): string {
  if (!name) return DEFAULT_MONO;
  const key = name.toLowerCase().replace(/\s+/g, "-");
  return MONO_FONTS[key] ?? DEFAULT_MONO;
}
