import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Theme } from "../../theme";

interface LabelProps {
  text: string;
  theme: Theme;
  startFrame?: number;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  muted?: boolean;
}

const sizeMap = { sm: 22, md: 32, lg: 48, xl: 72 };

export const Label: React.FC<LabelProps> = ({
  text,
  theme,
  startFrame = 0,
  size = "md",
  align = "center",
  muted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({ frame: elapsed, fps, config: { damping: 19, stiffness: 90, mass: 0.9 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: theme.fontSans,
        fontSize: sizeMap[size],
        fontWeight: size === "xl" || size === "lg" ? 700 : 500,
        color: muted ? theme.textMuted : theme.text,
        textAlign: align,
        lineHeight: 1.25,
        letterSpacing: size === "xl" ? "-0.02em" : "-0.01em",
      }}
    >
      {text}
    </div>
  );
};
