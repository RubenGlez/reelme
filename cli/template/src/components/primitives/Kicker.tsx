import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Theme } from "../../theme";

interface KickerProps {
  text: string;
  theme: Theme;
  startFrame?: number;
  align?: "left" | "center";
}

/** A small eyebrow label above a headline: an accent tick + uppercase mono tag. */
export const Kicker: React.FC<KickerProps> = ({ text, theme, startFrame = 0, align = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - startFrame, fps, config: theme.motion });
  const opacity = interpolate(Math.max(0, p), [0, 1], [0, 1]);
  const lineW = interpolate(Math.max(0, p), [0, 1], [0, 40]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        justifyContent: align === "center" ? "center" : "flex-start",
        marginBottom: 22,
        opacity,
      }}
    >
      <div style={{ width: lineW, height: 3, background: theme.accent, borderRadius: 2 }} />
      <span
        style={{
          fontFamily: theme.fontMono,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: theme.accent,
        }}
      >
        {text}
      </span>
    </div>
  );
};
