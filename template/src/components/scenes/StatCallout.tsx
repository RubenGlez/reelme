import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { StatCalloutScene as StatCalloutBrief } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: StatCalloutBrief;
  theme: Theme;
}

const HEADLINE_FRAMES = 20;
const FRAMES_PER_STAT = 35;

export const StatCallout: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionStart = HEADLINE_FRAMES + scene.stats.length * FRAMES_PER_STAT + 20;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        gap: 64,
      }}
    >
      {scene.headline && (
        <Label text={scene.headline} theme={theme} size="lg" startFrame={0} />
      )}

      <div
        style={{
          display: "flex",
          gap: 80,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {scene.stats.map((stat, i) => {
          const statStart = HEADLINE_FRAMES + i * FRAMES_PER_STAT;
          const progress = spring({
            frame: frame - statStart,
            fps,
            config: { damping: 11, stiffness: 100, mass: 0.8 },
          });
          const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
          const scale = interpolate(Math.max(0, progress), [0, 1], [0.4, 1]);

          const labelStart = statStart + 12;
          const labelProgress = spring({
            frame: frame - labelStart,
            fps,
            config: { damping: 20, stiffness: 90 },
          });
          const labelOpacity = interpolate(Math.max(0, labelProgress), [0, 1], [0, 1]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                opacity,
                transform: `scale(${scale})`,
              }}
            >
              <div
                style={{
                  fontFamily: theme.fontSans,
                  fontSize: 96,
                  fontWeight: 800,
                  color: theme.accent,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: theme.fontSans,
                  fontSize: 22,
                  fontWeight: 500,
                  color: theme.textMuted,
                  opacity: labelOpacity,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} />}
    </AbsoluteFill>
  );
};
