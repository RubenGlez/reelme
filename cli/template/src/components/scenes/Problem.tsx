import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { ProblemScene as ProblemBrief, ProjectMeta } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";
import { RevealText } from "../primitives/RevealText";
import { Kicker } from "../primitives/Kicker";

interface Props {
  scene: ProblemBrief;
  theme: Theme;
  project: ProjectMeta;
  platform?: PlatformPreset;
  bottomInset?: number;
}

const SNAP_OFFSET = 8;

export const Problem: React.FC<Props> = ({ scene, theme, project, platform, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = platform ? typeScale(platform) : 1.0;

  const isAnnouncement = project.mode === "announcement" && project.version;
  const isHero = !!scene.hero;
  const left = scene.align === "left";

  const accentBarProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const accentBarWidth = interpolate(accentBarProgress, [0, 1], [0, isHero ? 120 : 80]);

  const badgeProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const badgeOpacity = interpolate(badgeProgress, [0, 1], [0, 1]);
  const badgeY = interpolate(badgeProgress, [0, 1], [12, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: left ? "flex-start" : "center",
        justifyContent: "center",
        padding: left ? "0 0 0 140px" : isHero ? "0 80px" : "0 120px",
        gap: isHero ? 40 : 32,
      }}
    >
      {scene.kicker ? (
        <Kicker text={scene.kicker} theme={theme} startFrame={0} align={left ? "left" : "center"} />
      ) : isAnnouncement ? (
        <div
          style={{
            opacity: badgeOpacity,
            translate: `0 ${badgeY}px`,
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
        <RevealText
          text={scene.headline}
          theme={theme}
          fontSize={104 * scale}
          fontWeight={800}
          align={left ? "left" : "center"}
          stagger={3.5}
          letterSpacing="-0.03em"
          lineHeight={1.04}
          maxWidth={left ? 1300 : 1500}
        />
      ) : (
        <>
          <Label text={scene.headline} theme={theme} size="xl" align={left ? "left" : "center"} startFrame={4} />
          {scene.subtext && (
            <Label text={scene.subtext} theme={theme} size="md" muted align={left ? "left" : "center"} startFrame={16} />
          )}
        </>
      )}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={40} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
