// Art-direction presets ("looks"). A look is the production design of a reel:
// how the atmosphere is lit, how the camera moves, how cuts are edited, and how
// the frame is graded. Two briefs with different looks should read as the work
// of two different studios, not the same template with a new accent color.
//
// Looks are pure data; colors come from the resolved Theme at render time.

export type LookId = "keynote" | "noir" | "arcade" | "blueprint" | "editorial";

export type TransitionStyle = "cut" | "fade" | "dip" | "whip" | "rise" | "punch" | "zoom";

export type CameraMove = "push" | "drift" | "pan" | "float" | "still";

export type AtmosphereOverlay = "none" | "grid" | "scanlines" | "dust";

export interface Grade {
  /** Tint color layered over the whole frame. */
  color: string;
  blend: "multiply" | "screen" | "overlay" | "soft-light";
  alpha: number;
}

export interface CinematicLook {
  id: LookId;
  /** Radial accent-light intensity behind the content (0..1). */
  glow: number;
  /** Whether a second, cooler light source is added for depth. */
  twoTone: boolean;
  /** Vignette darkness at the edges (0..1). */
  vignette: number;
  /** Film-grain opacity on the final frame (0..1); skipped for gif output. */
  grain: number;
  overlay: AtmosphereOverlay;
  /** Base camera move applied to every scene's content. */
  camera: CameraMove;
  /** Camera amplitude multiplier (1 = default). */
  cameraIntensity: number;
  grade: Grade;
  /** Default cut style; the rhythm picker varies around it. */
  transition: TransitionStyle;
  /** Editing energy: higher tightens enter timings and favors hard cuts. */
  energy: number;
}

const LOOKS: Record<LookId, Omit<CinematicLook, "id">> = {
  // Clean keynote stage — soft key light, gentle push, long dissolves.
  keynote: {
    glow: 0.5, twoTone: false, vignette: 0.35, grain: 0.04, overlay: "none",
    camera: "push", cameraIntensity: 1, grade: { color: "#ffffff", blend: "soft-light", alpha: 0.05 },
    transition: "fade", energy: 0.4,
  },
  // Low-key cinema — deep vignette, cool grade, slow drift, dips to black.
  noir: {
    glow: 0.42, twoTone: true, vignette: 0.62, grain: 0.09, overlay: "dust",
    camera: "drift", cameraIntensity: 1.1, grade: { color: "#2a3550", blend: "multiply", alpha: 0.22 },
    transition: "dip", energy: 0.35,
  },
  // Saturated arcade — dual lights, scanlines, snappy whips and zooms.
  arcade: {
    glow: 0.72, twoTone: true, vignette: 0.3, grain: 0.05, overlay: "scanlines",
    camera: "float", cameraIntensity: 1.25, grade: { color: "#ff3da6", blend: "screen", alpha: 0.06 },
    transition: "whip", energy: 0.85,
  },
  // Engineering blueprint — cool tint, faint grid, measured pans, mixed cuts.
  blueprint: {
    glow: 0.45, twoTone: false, vignette: 0.42, grain: 0.06, overlay: "grid",
    camera: "pan", cameraIntensity: 1, grade: { color: "#1e3a5f", blend: "soft-light", alpha: 0.12 },
    transition: "cut", energy: 0.6,
  },
  // Premium brand film — warm grade, big soft vignette, very slow elegant push.
  editorial: {
    glow: 0.55, twoTone: false, vignette: 0.5, grain: 0.07, overlay: "none",
    camera: "push", cameraIntensity: 0.7, grade: { color: "#ffb27a", blend: "overlay", alpha: 0.08 },
    transition: "fade", energy: 0.3,
  },
};

const TONE_DEFAULT: Record<string, LookId> = {
  professional: "keynote",
  playful: "arcade",
  technical: "blueprint",
};

export function resolveLook(look: string | undefined, tone: string | undefined): CinematicLook {
  const id = (look && look in LOOKS ? look : TONE_DEFAULT[tone ?? "professional"] ?? "keynote") as LookId;
  return { id, ...LOOKS[id] };
}

export const LOOK_IDS = Object.keys(LOOKS) as LookId[];
