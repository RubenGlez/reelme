import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Theme } from "../../theme";

interface CaptionProps {
  text: string;
  theme: Theme;
  startFrame?: number;
}

export const Caption: React.FC<CaptionProps> = ({ text, theme, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({ frame: elapsed, fps, config: theme.motion });
  const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
  const translateY = interpolate(Math.max(0, progress), [0, 1], [12, 0]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 72,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          borderRadius: 999,
          padding: "10px 28px",
          fontFamily: theme.fontSans,
          fontSize: 22,
          fontWeight: 500,
          color: theme.text,
          letterSpacing: "-0.01em",
          maxWidth: 900,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
};
