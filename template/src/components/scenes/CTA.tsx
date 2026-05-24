import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { CTAScene as CTABrief, ProjectMeta } from "../../brief";
import { Theme } from "../../theme";

interface Props {
  scene: CTABrief;
  theme: Theme;
  project: ProjectMeta;
}

export const CTA: React.FC<Props> = ({ scene, theme, project }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoProgress = spring({ frame, fps, config: { damping: 19, stiffness: 90 } });
  const titleProgress = spring({ frame: frame - (project.logo ? 16 : 0), fps, config: { damping: 19, stiffness: 90 } });
  const cmdProgress = spring({ frame: frame - (project.logo ? 32 : 16), fps, config: { damping: 19, stiffness: 90 } });
  const urlProgress = spring({ frame: frame - (project.logo ? 48 : 31), fps, config: { damping: 19, stiffness: 90 } });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [24, 0]);
  const cmdOpacity = interpolate(cmdProgress, [0, 1], [0, 1]);
  const cmdScale = interpolate(cmdProgress, [0, 1], [0.92, 1]);
  const urlOpacity = interpolate(urlProgress, [0, 1], [0, 1]);

  const isAnnouncement = project.mode === "announcement";
  const displayName = isAnnouncement && project.version
    ? `${project.name} ${project.version}`
    : project.name;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "0 120px",
      }}
    >
      {project.logo && (
        <div style={{ opacity: interpolate(logoProgress, [0, 1], [0, 1]), transform: `scale(${interpolate(logoProgress, [0, 1], [0.85, 1])})` }}>
          <Img
            src={staticFile(project.logo)}
            style={{ height: 72, width: "auto", objectFit: "contain" }}
          />
        </div>
      )}

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
        {isAnnouncement ? "" : "Get started with "}
        <span style={{ color: theme.accent }}>{displayName}</span>
        {isAnnouncement ? " is here." : ""}
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
