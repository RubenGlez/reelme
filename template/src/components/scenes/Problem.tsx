import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { ProblemScene as ProblemBrief, ProjectMeta } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: ProblemBrief;
  theme: Theme;
  project: ProjectMeta;
}

export const Problem: React.FC<Props> = ({ scene, theme, project }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const accentBarProgress = spring({ frame, fps, config: { damping: 22, stiffness: 100 } });
  const accentBarWidth = interpolate(accentBarProgress, [0, 1], [0, 80]);

  const badgeProgress = spring({ frame, fps, config: { damping: 19, stiffness: 90 } });
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [12, 0]);

  const isAnnouncement = project.mode === "announcement" && project.version;

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
      {isAnnouncement ? (
        <div
          style={{
            opacity: badgeOpacity,
            transform: `translateY(${badgeY}px)`,
            background: theme.accentMuted,
            border: `1.5px solid ${theme.accent}`,
            borderRadius: 999,
            padding: "6px 20px",
            fontFamily: theme.fontMono,
            fontSize: 18,
            fontWeight: 600,
            color: theme.accent,
            letterSpacing: "0.02em",
          }}
        >
          {project.name} {project.version}
        </div>
      ) : (
        <div
          style={{
            width: accentBarWidth,
            height: 4,
            background: theme.accent,
            borderRadius: 2,
          }}
        />
      )}

      <Label text={scene.headline} theme={theme} size="xl" startFrame={4} />
      {scene.subtext && (
        <Label text={scene.subtext} theme={theme} size="md" muted startFrame={16} />
      )}
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={40} />}
    </AbsoluteFill>
  );
};
