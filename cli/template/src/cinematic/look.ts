// Art-direction presets ("looks"). A look is the production design of a reel:
// how the atmosphere is lit, how the camera moves, how cuts are edited, and how
// the frame is graded. Two briefs with different looks should read as the work
// of two different studios, not the same template with a new accent color.
//
// Looks are pure data; colors come from the resolved Theme at render time.

import { MotionProfile } from "../theme";

export type LookId = "keynote" | "noir" | "arcade" | "blueprint" | "editorial";

export type TransitionStyle = "cut" | "fade" | "dip" | "whip" | "rise" | "punch" | "zoom" | "wipe" | "flip";

export type CameraMove = "push" | "drift" | "pan" | "float" | "still";

export type AtmosphereOverlay = "none" | "grid" | "scanlines" | "dust";

/**
 * The backdrop SYSTEM a look is staged on. This is the look's silhouette: two
 * looks with different backdrops read as different films even before grading.
 * The old single recipe (dark field + drifting radial orbs) was the template's
 * fingerprint — every reel shared it, and an orb in empty space reads as a
 * smudge, not a light. Each system covers the frame with intent instead:
 *
 * - mesh:      full-bleed multi-hue gradient field (accent + accent2), slow drift
 * - spotlight: one elliptical light pool aimed where the content sits
 * - sweep:     saturated full-frame diagonal gradient between the brand hues
 * - grid:      structural engineering grid — the graphic IS the backdrop
 * - field:     rich near-solid editorial color field with a soft top wash
 */
export type BackdropSystem = "mesh" | "spotlight" | "sweep" | "grid" | "field";

export interface Grade {
  /** Tint color layered over the whole frame. */
  color: string;
  blend: "multiply" | "screen" | "overlay" | "soft-light";
  alpha: number;
}

export interface CinematicLook {
  id: LookId;
  /** Which backdrop system stages the whole reel. */
  backdrop: BackdropSystem;
  /** Backdrop light/color intensity (0..1). */
  glow: number;
  /** Whether a second, cooler light source is added for depth. */
  twoTone: boolean;
  /** Vignette darkness at the edges (0..1). */
  vignette: number;
  /** Film-grain opacity on the final frame (0..1); skipped for gif output. */
  grain: number;
  overlay: AtmosphereOverlay;
  /** Arrival move for every scene's content: a zoom that eases to a rest. */
  camera: CameraMove;
  /** Camera amplitude multiplier (1 = default). */
  cameraIntensity: number;
  grade: Grade;
  /** Editing energy: higher tightens enter timings and favors hard cuts. */
  energy: number;
  /**
   * Spring physics for in-scene element animation. Motion is part of the
   * production design: a look should *move* differently, not just look
   * different. The Reel feeds this into the theme so every scene's springs
   * inherit the look's personality (smooth, snappy, weighty, ...).
   */
  motion: MotionProfile;
}

const LOOKS: Record<LookId, Omit<CinematicLook, "id">> = {
  // Clean keynote stage — soft key light, gentle push, long dissolves.
  // Motion: settled, no bounce — elements arrive and hold.
  keynote: {
    backdrop: "mesh",
    glow: 0.5, twoTone: false, vignette: 0.35, grain: 0.04, overlay: "none",
    camera: "push", cameraIntensity: 1, grade: { color: "#ffffff", blend: "soft-light", alpha: 0.05 },
    energy: 0.4,
    motion: { damping: 22, stiffness: 100, mass: 1.0 },
  },
  // Low-key cinema — deep vignette, cool grade, slow drift, dips to black.
  // Motion: heavy and deliberate — weighty mass, slow to settle.
  noir: {
    backdrop: "spotlight",
    glow: 0.42, twoTone: true, vignette: 0.62, grain: 0.09, overlay: "dust",
    camera: "drift", cameraIntensity: 1.1, grade: { color: "#2a3550", blend: "multiply", alpha: 0.22 },
    energy: 0.35,
    motion: { damping: 28, stiffness: 78, mass: 1.4 },
  },
  // Saturated arcade — dual lights, scanlines, snappy whips and zooms.
  // Motion: snappy but settled — light mass, high stiffness, near-critical
  // damping. Energy comes from speed, not from overshoot: a bouncing element
  // reads as a toy, not a cut (gallery feedback).
  arcade: {
    backdrop: "sweep",
    glow: 0.72, twoTone: true, vignette: 0.3, grain: 0.05, overlay: "scanlines",
    camera: "float", cameraIntensity: 1.25, grade: { color: "#ff3da6", blend: "screen", alpha: 0.06 },
    energy: 0.85,
    motion: { damping: 20, stiffness: 155, mass: 0.7 },
  },
  // Engineering blueprint — cool tint, faint grid, measured pans, mixed cuts.
  // Motion: stiff and precise — quick, minimal bounce, machined.
  blueprint: {
    backdrop: "grid",
    glow: 0.45, twoTone: false, vignette: 0.42, grain: 0.06, overlay: "grid",
    camera: "pan", cameraIntensity: 1, grade: { color: "#1e3a5f", blend: "soft-light", alpha: 0.12 },
    energy: 0.6,
    motion: { damping: 30, stiffness: 150, mass: 1.1 },
  },
  // Premium brand film — warm grade, big soft vignette, very slow elegant push.
  // Motion: the smoothest — elegant glide, no perceptible bounce.
  editorial: {
    backdrop: "field",
    glow: 0.55, twoTone: false, vignette: 0.5, grain: 0.07, overlay: "none",
    camera: "push", cameraIntensity: 0.7, grade: { color: "#ffb27a", blend: "overlay", alpha: 0.08 },
    energy: 0.3,
    motion: { damping: 26, stiffness: 88, mass: 1.15 },
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
