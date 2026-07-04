import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
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

// The arrival window: how long the camera keeps settling after the cut before
// coming to a complete rest, as a fraction of the scene (capped in frames).
const SETTLE_FRACTION = 0.55;
const SETTLE_MAX_FRAMES = 90;

/**
 * A virtual camera over a scene's content. Each shot ARRIVES with a slow zoom
 * that eases to a complete rest, then holds perfectly still. A zoom that runs
 * for the whole scene re-rasterizes crisp text at a new sub-pixel scale every
 * frame, which reads as a constant vibration on bold type — so all movement is
 * front-loaded into the arrival while the eye is still adjusting to the cut,
 * and the hold (where the viewer actually reads) stays rock solid. Zoom only,
 * anchored to center, so the composition never slides sideways.
 */
export const Camera: React.FC<Props> = ({ look, durationInFrames, seed, disabled, children }) => {
  const frame = useCurrentFrame();
  if (disabled) return <AbsoluteFill>{children}</AbsoluteFill>;
  void seed;

  const settleFrames = Math.min(Math.round(durationInFrames * SETTLE_FRACTION), SETTLE_MAX_FRAMES);
  const p = interpolate(frame, [0, settleFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const k = look.cameraIntensity;

  let scale = 1;
  switch (look.camera) {
    case "push":
      scale = interpolate(p, [0, 1], [1 - 0.045 * k, 1.0]); // slow zoom in to rest
      break;
    case "drift":
      scale = interpolate(p, [0, 1], [1 - 0.03 * k, 1.0]); // gentle zoom in to rest
      break;
    case "pan":
      scale = interpolate(p, [0, 1], [1 + 0.03 * k, 1.0]); // slow zoom out to rest
      break;
    case "float":
      scale = interpolate(p, [0, 1], [1 - 0.02 * k, 1.0]); // soft zoom in to rest
      break;
    case "still":
    default:
      break;
  }

  return (
    <AbsoluteFill style={{ scale: String(scale), transformOrigin: "center center", willChange: "scale" }}>
      {children}
    </AbsoluteFill>
  );
};
