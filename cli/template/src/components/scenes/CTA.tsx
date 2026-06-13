import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { CTAScene as CTABrief, ProjectMeta } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: CTABrief;
  theme: Theme;
  project: ProjectMeta;
  platform?: PlatformPreset;
  bottomInset?: number;
}

const SNAP_OFFSET = 8;

export const CTA: React.FC<Props> = ({ scene, theme, project, platform, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = platform ? typeScale(platform) : 1.0;

  const logoProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const titleProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 16 : 0), fps, config: theme.motion });
  const cmdProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 32 : 16), fps, config: theme.motion });
  const urlProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 48 : 31), fps, config: theme.motion });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [24, 0]);
  const cmdOpacity = interpolate(cmdProgress, [0, 1], [0, 1]);
  const cmdScale = interpolate(cmdProgress, [0, 1], [0.92, 1]);
  const urlFade = interpolate(urlProgress, [0, 1], [0, 0.7]);

  const isAnnouncement = project.mode === "announcement";
  const displayName = isAnnouncement && project.version
    ? `${project.name} ${project.version}`
    : project.name;

  return (
    <AbsoluteFill
      style={{
        background: theme.accent,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "0 120px",
      }}
    >
      {project.logo && (
        <div
          style={{
            opacity: interpolate(logoProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(logoProgress, [0, 1], [0.85, 1])})`,
            background: "#ffffff",
            borderRadius: 20,
            padding: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          <Img
            src={staticFile(project.logo)}
            style={{ height: 80, width: "auto", objectFit: "contain", display: "block" }}
          />
        </div>
      )}

      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontFamily: theme.fontSans,
          fontSize: 56 * scale,
          fontWeight: 700,
          color: theme.textInverse,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        {isAnnouncement ? "" : "Get started with "}
        <span style={{ color: theme.textInverse, fontWeight: 800 }}>{displayName}</span>
        {isAnnouncement ? " is here." : ""}
      </div>

      <div
        style={{
          opacity: cmdOpacity,
          transform: `scale(${cmdScale})`,
          background: theme.bg,
          border: `1.5px solid rgba(0,0,0,0.12)`,
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
            opacity: urlFade,
            fontFamily: theme.fontMono,
            fontSize: 20,
            color: theme.textInverse,
          }}
        >
          {scene.repoUrl}
        </div>
      )}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={60} bottomInset={bottomInset} />}

      {project.watermark !== false && (
        <div
          style={{
            position: "absolute",
            bottom: 40 + bottomInset,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: theme.fontMono,
            fontSize: 18,
            color: theme.textMuted,
          }}
        >
          made with reelme
        </div>
      )}
    </AbsoluteFill>
  );
};
