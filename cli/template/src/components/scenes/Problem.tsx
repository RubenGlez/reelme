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

const SNAP_OFFSET = 8;

export const Problem: React.FC<Props> = ({ scene, theme, project }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isAnnouncement = project.mode === "announcement" && project.version;
  const isHero = !!scene.hero;

  const accentBarProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const accentBarWidth = interpolate(accentBarProgress, [0, 1], [0, isHero ? 120 : 80]);

  const badgeProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [12, 0]);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isHero ? "0 80px" : "0 120px",
        gap: isHero ? 40 : 32,
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
            height: isHero ? 6 : 4,
            background: theme.accent,
            borderRadius: 3,
          }}
        />
      )}

      {isHero ? (
        <div
          style={{
            fontFamily: theme.fontSans,
            fontSize: 104,
            fontWeight: 800,
            color: theme.text,
            textAlign: "center",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            opacity: interpolate(
              spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion }),
              [0, 1], [0, 1]
            ),
            transform: `translateY(${interpolate(
              spring({ frame: frame + SNAP_OFFSET - 4, fps, config: theme.motion }),
              [0, 1], [24, 0]
            )}px)`,
          }}
        >
          {scene.headline}
        </div>
      ) : (
        <>
          <Label text={scene.headline} theme={theme} size="xl" startFrame={4} />
          {scene.subtext && (
            <Label text={scene.subtext} theme={theme} size="md" muted startFrame={16} />
          )}
        </>
      )}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={40} />}
    </AbsoluteFill>
  );
};
