import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

type LoopProperty = "scale" | "translateX" | "translateY" | "rotate";

interface Props {
  /** Which transform channel oscillates. */
  property?: LoopProperty;
  /**
   * Peak deviation from rest: px for translate, degrees for rotate, and a
   * scale delta for scale (0.02 = breathes between 0.98 and 1.02).
   */
  amplitude?: number;
  /** Seconds for one full cycle. */
  period?: number;
  /** 0..1 phase offset so several looped elements don't move in lockstep. */
  phase?: number;
  /**
   * Skip the motion (gif output): a perpetually moving element changes every
   * frame and defeats gif compression, same reasoning as the Camera.
   */
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Applies a subtle, continuous, seamless oscillation to a held element — the
 * declarative "loop" channel the entrance springs don't cover. Motion is a sine
 * driven by useCurrentFrame, so it loops without a seam and renders
 * deterministically. Keep amplitudes small: this is meant to read as "alive",
 * not as a bounce.
 */
export const Loop: React.FC<Props> = ({
  property = "translateY",
  amplitude = 6,
  period = 3.5,
  phase = 0,
  disabled,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (disabled) return <>{children}</>;

  const v = Math.sin((frame / (period * fps) + phase) * Math.PI * 2) * amplitude;

  let style: React.CSSProperties;
  switch (property) {
    case "scale":
      style = { scale: String(1 + v) };
      break;
    case "translateX":
      style = { translate: `${v}px 0` };
      break;
    case "rotate":
      style = { rotate: `${v}deg` };
      break;
    case "translateY":
    default:
      style = { translate: `0 ${v}px` };
      break;
  }

  return <div style={{ ...style, willChange: "transform" }}>{children}</div>;
};
