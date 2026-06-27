import React from "react";
import { Theme } from "../../theme";
import { RevealText } from "./RevealText";

interface LabelProps {
  text: string;
  theme: Theme;
  startFrame?: number;
  size?: "sm" | "md" | "lg" | "xl";
  align?: "left" | "center" | "right";
  muted?: boolean;
  emphasis?: string;
}

// Floors from the video-layout rules at 1080-wide: labels >=32, supporting >=44,
// headline >=84. Each step meets or clears its floor so text stays readable at
// viewing distance.
const sizeMap = { sm: 32, md: 44, lg: 60, xl: 88 };

export const Label: React.FC<LabelProps> = ({
  text,
  theme,
  startFrame = 0,
  size = "md",
  align = "center",
  muted = false,
  emphasis,
}) => {
  const big = size === "xl" || size === "lg";
  return (
    <RevealText
      text={text}
      theme={theme}
      startFrame={startFrame}
      fontSize={sizeMap[size]}
      fontWeight={big ? 700 : 500}
      color={muted ? theme.textMuted : theme.text}
      align={align}
      emphasis={emphasis}
      stagger={big ? 3 : 1.5}
      letterSpacing={size === "xl" ? "-0.03em" : "-0.01em"}
      lineHeight={big ? 1.1 : 1.25}
      glow={big && !muted}
    />
  );
};
