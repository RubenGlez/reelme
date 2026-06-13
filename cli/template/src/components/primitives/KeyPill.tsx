import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Theme } from "../../theme";

interface KeyPillProps {
  label: string;
  theme: Theme;
  startFrame?: number;
}

export const KeyPill: React.FC<KeyPillProps> = ({ label, theme, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({ frame: elapsed, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
  const scale = interpolate(progress, [0, 1], [0.65, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 22px",
        borderRadius: 10,
        background: theme.surface,
        border: `1.5px solid ${theme.border}`,
        boxShadow: `0 4px 0 ${theme.border}`,
        fontFamily: theme.fontSans,
        fontSize: 30,
        fontWeight: 600,
        color: theme.text,
        minWidth: 60,
        letterSpacing: "-0.01em",
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      {label}
    </div>
  );
};
