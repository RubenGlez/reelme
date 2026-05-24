import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { ProblemScene as ProblemBrief } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";

interface Props {
  scene: ProblemBrief;
  theme: Theme;
}

export const Problem: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentBarProgress = spring({ frame, fps, config: { damping: 22, stiffness: 100 } });
  const accentBarWidth = interpolate(accentBarProgress, [0, 1], [0, 80]);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        gap: 32,
      }}
    >
      <div
        style={{
          width: accentBarWidth,
          height: 4,
          background: theme.accent,
          borderRadius: 2,
          marginBottom: 8,
        }}
      />
      <Label text={scene.headline} theme={theme} size="xl" startFrame={4} />
      {scene.subtext && (
        <Label text={scene.subtext} theme={theme} size="md" muted startFrame={16} />
      )}
    </AbsoluteFill>
  );
};
