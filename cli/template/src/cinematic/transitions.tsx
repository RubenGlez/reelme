import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { CinematicLook, TransitionStyle } from "./look";

// Per-look cut rhythm. The picker cycles these across scenes so the edit has a
// pattern instead of one uniform crossfade everywhere. Scene 0 always opens
// from black; the final scene lands on a punch so the CTA arrives, not drifts.
const RHYTHM: Record<string, TransitionStyle[]> = {
  keynote: ["fade", "rise", "fade", "rise"],
  noir: ["dip", "fade", "dip", "rise"],
  // No flip: a hinged swing reads as a gimmick next to the rest of the edit
  // (gallery feedback) — arcade's energy now comes from fast zooms and whips.
  arcade: ["zoom", "whip", "zoom", "fade"],
  blueprint: ["cut", "wipe", "cut", "whip"],
  editorial: ["fade", "wipe", "rise", "fade"],
};

export function transitionFor(look: CinematicLook, index: number, total: number): TransitionStyle {
  if (index === 0) return "fade"; // open from black
  if (index === total - 1) return look.energy > 0.7 ? "punch" : "rise";
  const seq = RHYTHM[look.id] ?? RHYTHM.keynote;
  return seq[index % seq.length];
}

interface EnterProps {
  style: TransitionStyle;
  look: CinematicLook;
  /** True only for the first scene: reveal from a real black frame. */
  fromBlack: boolean;
  seed: number;
  children: React.ReactNode;
}

/**
 * Applies a scene's entrance. Scenes are sequenced back-to-back with no exit
 * fade, so a "cut" is a true hard cut and the others are how the shot arrives.
 * The continuous Atmosphere behind keeps even hard cuts feeling connected.
 */
export const Enter: React.FC<EnterProps> = ({ style, look, fromBlack, seed, children }) => {
  const frame = useCurrentFrame();
  // Faster entrances for higher-energy looks.
  const win = Math.round(interpolate(look.energy, [0, 1], [18, 8]));
  const dir = seed % 2 === 0 ? 1 : -1;
  const ease = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
  const p = interpolate(frame, [0, win], [0, 1], { ...ease, easing: Easing.out(Easing.cubic) });

  let opacity = 1;
  let scale: string | undefined;
  let translate: string | undefined;
  let filter: string | undefined;
  let transform: string | undefined;
  let clipPath: string | undefined;

  switch (style) {
    case "cut":
      break;
    case "fade":
      opacity = interpolate(frame, [0, fromBlack ? win + 6 : win], [0, 1], ease);
      break;
    case "rise":
      opacity = p;
      translate = `0 ${interpolate(p, [0, 1], [44, 0])}px`;
      break;
    case "whip":
      opacity = interpolate(frame, [0, win * 0.7], [0, 1], ease);
      translate = `${interpolate(p, [0, 1], [90 * dir, 0])}px 0`;
      filter = `blur(${interpolate(p, [0, 1], [14, 0])}px)`;
      break;
    case "punch":
      opacity = interpolate(frame, [0, win * 0.6], [0, 1], ease);
      scale = String(interpolate(p, [0, 1], [1.07, 1]));
      break;
    case "zoom":
      opacity = p;
      scale = String(interpolate(p, [0, 1], [0.9, 1]));
      break;
    case "dip":
      // Content snaps in; a black veil over the top lifts away → dip-to-black.
      opacity = interpolate(frame, [0, win * 0.5], [0, 1], ease);
      break;
    case "wipe": {
      // A hard edge sweeps across, revealing the shot. Direction alternates by
      // seed so consecutive wipes don't all travel the same way.
      opacity = interpolate(frame, [0, win * 0.3], [0, 1], ease);
      const remain = interpolate(p, [0, 1], [100, 0]);
      clipPath = dir > 0 ? `inset(0 ${remain}% 0 0)` : `inset(0 0 0 ${remain}%)`;
      break;
    }
    case "flip":
      // Shot swings in on a vertical hinge — a single playful rotation.
      opacity = interpolate(frame, [0, win * 0.5], [0, 1], ease);
      transform = `perspective(1400px) rotateY(${interpolate(p, [0, 1], [62 * dir, 0])}deg)`;
      break;
  }

  const dipVeil = style === "dip" && (
    <AbsoluteFill
      style={{ background: "#000", opacity: interpolate(frame, [0, win], [1, 0], ease), pointerEvents: "none" }}
    />
  );

  return (
    <>
      <AbsoluteFill
        style={{ opacity, scale, translate, filter, transform, clipPath, willChange: "scale, translate, opacity, transform, clip-path" }}
      >
        {children}
      </AbsoluteFill>
      {dipVeil}
    </>
  );
};
