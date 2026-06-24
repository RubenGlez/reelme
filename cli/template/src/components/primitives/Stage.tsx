import React from "react";
import { AbsoluteFill } from "remotion";
import { Theme } from "../../theme";
import { Caption } from "./Caption";

// Standard horizontal safe inset for scene content — keeps text off the frame
// edges (the video-layout rules want key content ~120px in on a 1080–1920 frame).
export const STAGE_INSET = 120;

interface StageProps {
  theme: Theme;
  /** Stacking direction of the content. */
  direction?: "row" | "column";
  justify?: React.CSSProperties["justifyContent"];
  align?: React.CSSProperties["alignItems"];
  gap?: number;
  /** Horizontal padding; defaults to the standard safe inset on both sides. */
  padding?: React.CSSProperties["padding"];
  /** Optional caption rendered as the film's bottom pill. */
  caption?: string;
  captionStart?: number;
  bottomInset?: number;
  children: React.ReactNode;
}

/**
 * The shared scene root. Every scene is shot on the one continuous Atmosphere, so
 * the root is ALWAYS transparent — never paint an opaque full-frame fill here or
 * the stage behind it disappears and the reel stops reading as one film. Content
 * is centered by default so leftover space stays symmetric (composed negative
 * space) instead of being dumped against one edge as a void. For a hero + aside
 * composition use `direction="row"` with `justify="space-between"`.
 */
export const Stage: React.FC<StageProps> = ({
  theme,
  direction = "column",
  justify = "center",
  align = "center",
  gap,
  padding,
  caption,
  captionStart = 50,
  bottomInset = 0,
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        gap,
        padding: padding ?? `0 ${STAGE_INSET}px`,
      }}
    >
      {children}
      {caption && <Caption text={caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
