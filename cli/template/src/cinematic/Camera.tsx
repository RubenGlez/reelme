import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { CinematicLook } from "./look";

interface Props {
  look: CinematicLook;
  durationInFrames: number;
  /** Per-scene seed so consecutive scenes don't move identically. */
  seed: number;
  /** Disables the move (gif output): a moving frame defeats gif compression. */
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * A virtual camera over a scene's content. Movement is pure zoom — in, out, or a
 * gentle breathe — anchored to the center so the composition never slides
 * sideways. Amplitudes are small so the frame breathes without softening text.
 */
export const Camera: React.FC<Props> = ({ look, durationInFrames, seed, disabled, children }) => {
  const frame = useCurrentFrame();
  if (disabled) return <AbsoluteFill>{children}</AbsoluteFill>;

  const p = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const k = look.cameraIntensity;

  let scale = 1;
  switch (look.camera) {
    case "push":
      scale = interpolate(p, [0, 1], [1.0, 1 + 0.05 * k]); // slow zoom in
      break;
    case "drift":
      scale = interpolate(p, [0, 1], [1.0, 1 + 0.03 * k]); // gentle zoom in
      break;
    case "pan":
      scale = interpolate(p, [0, 1], [1 + 0.05 * k, 1.0]); // slow zoom out
      break;
    case "float":
      scale = 1 + (0.02 + 0.015 * Math.sin(frame / 42 + seed)) * k; // subtle breathe
      break;
    case "still":
    default:
      break;
  }

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "center center", willChange: "transform" }}>
      {children}
    </AbsoluteFill>
  );
};
