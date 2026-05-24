import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { CTAScene as CTABrief } from "../../brief";
import { Theme } from "../../theme";

interface Props {
  scene: CTABrief;
  theme: Theme;
  projectName: string;
}

export const CTA: React.FC<Props> = ({ scene, theme, projectName }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 19, stiffness: 90 } });
  const cmdProgress = spring({ frame: frame - 16, fps, config: { damping: 19, stiffness: 90 } });
  const urlProgress = spring({ frame: frame - 31, fps, config: { damping: 19, stiffness: 90 } });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [24, 0]);
  const cmdOpacity = interpolate(cmdProgress, [0, 1], [0, 1]);
  const cmdScale = interpolate(cmdProgress, [0, 1], [0.92, 1]);
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "0 120px",
      }}
    >
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: theme.fontSans,
          fontSize: 56,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        Get started with{" "}
        <span style={{ color: theme.accent }}>{projectName}</span>
      </div>

      <div
        style={{
          opacity: cmdOpacity,
          transform: `scale(${cmdScale})`,
          background: theme.surface,
          border: `1.5px solid ${theme.border}`,
          borderRadius: 12,
          padding: "18px 40px",
          fontFamily: theme.fontMono,
          fontSize: 28,
          color: theme.text,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <span style={{ color: theme.accent }}>$</span>
        {scene.installCommand}
      </div>

      {scene.repoUrl && (
        <div
          style={{
            opacity: urlOpacity,
            fontFamily: theme.fontMono,
            fontSize: 20,
            color: theme.textMuted,
          }}
        >
          {scene.repoUrl}
        </div>
      )}
    </AbsoluteFill>
  );
};
