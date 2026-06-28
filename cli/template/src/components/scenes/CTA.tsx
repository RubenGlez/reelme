import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { CTAScene as CTABrief, ProjectMeta } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { Stage } from "../primitives/Stage";
import { Terminal } from "../primitives/Terminal";
import { Loop } from "../primitives/Loop";

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
  const isGif = platform?.output.codec === "gif";

  const logoProgress = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const titleProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 16 : 0), fps, config: theme.motion });
  const cmdProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 32 : 16), fps, config: theme.motion });
  const urlProgress = spring({ frame: frame + SNAP_OFFSET - (project.logo ? 48 : 31), fps, config: theme.motion });

  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);
  const titleY = interpolate(titleProgress, [0, 1], [24, 0]);
  const cmdOpacity = interpolate(cmdProgress, [0, 1], [0, 1]);
  const cmdY = interpolate(cmdProgress, [0, 1], [18, 0]);
  const urlFade = interpolate(urlProgress, [0, 1], [0, 0.65]);

  const isAnnouncement = project.mode === "announcement";
  const displayName = isAnnouncement && project.version
    ? `${project.name} ${project.version}`
    : project.name;

  // When the command starts typing inside the terminal: a beat after the title
  // settles, so the eye lands on the headline first.
  const termStart = project.logo ? 26 : 16;

  return (
    // Stay on the film's continuous atmosphere stage instead of flooding the
    // frame with a flat brand field — the end-card belongs to the same shot as
    // the rest of the reel. Stage's transparent root lets the Atmosphere show.
    <Stage theme={theme} gap={40} caption={scene.caption} captionStart={60} bottomInset={bottomInset}>
      {project.logo && (
        // A barely-there breathe keeps the end-card's hero alive while it holds,
        // after the entrance spring has settled. Off for gif (defeats compression).
        <Loop property="scale" amplitude={0.012} period={4} disabled={isGif}>
          <div
            style={{
              opacity: interpolate(logoProgress, [0, 1], [0, 1]),
              scale: String(interpolate(logoProgress, [0, 1], [0.85, 1])),
              background: "#ffffff",
              borderRadius: 20,
              padding: 16,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
            }}
          >
            <Img
              src={staticFile(project.logo)}
              style={{ height: 80, width: "auto", objectFit: "contain", display: "block" }}
            />
          </div>
        </Loop>
      )}

      <div
        style={{
          opacity: titleOpacity,
          translate: `0 ${titleY}px`,
          fontFamily: theme.fontSans,
          fontSize: 60 * scale,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        {isAnnouncement ? "" : "Get started with "}
        <span style={{ color: theme.accent, fontWeight: 800 }}>{displayName}</span>
        {isAnnouncement ? " is here." : ""}
      </div>

      {/* The install command in the film's own terminal, typed out — consistent
          with the reel's other terminal scenes instead of a web-style pill. */}
      <div style={{ opacity: cmdOpacity, translate: `0 ${cmdY}px` }}>
        <Terminal lines={[{ text: scene.installCommand }]} theme={theme} startFrame={termStart} />
      </div>

      {scene.repoUrl && (
        <div
          style={{
            opacity: urlFade,
            fontFamily: theme.fontMono,
            fontSize: 20,
            color: theme.textMuted,
          }}
        >
          {scene.repoUrl}
        </div>
      )}

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
    </Stage>
  );
};
