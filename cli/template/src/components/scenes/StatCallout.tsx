import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { StatCalloutScene as StatCalloutBrief } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: StatCalloutBrief;
  theme: Theme;
  bottomInset?: number;
}

const HEADLINE_FRAMES = 20;
const FRAMES_PER_STAT = 35;
const SNAP_OFFSET = 8;

export const StatCallout: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  if (scene.layout === "hero") {
    return <HeroStat scene={scene} theme={theme} bottomInset={bottomInset} width={width} frame={frame} fps={fps} />;
  }

  const captionStart = HEADLINE_FRAMES + scene.stats.length * FRAMES_PER_STAT + 20;

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
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
            frame: frame - statStart + SNAP_OFFSET,
            fps,
            config: theme.motion,
          });
          const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
          const scale = interpolate(Math.max(0, progress), [0, 1], [0.4, 1]);

          const labelStart = statStart + 12;
          const labelProgress = spring({
            frame: frame - labelStart + SNAP_OFFSET,
            fps,
            config: theme.motion,
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

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};

/** One dominant number filling the frame; supporting stats sit small below. */
const HeroStat: React.FC<{
  scene: StatCalloutBrief;
  theme: Theme;
  bottomInset: number;
  width: number;
  frame: number;
  fps: number;
}> = ({ scene, theme, bottomInset, width, frame, fps }) => {
  const [hero, ...rest] = scene.stats;
  const p = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const valueScale = interpolate(p, [0, 1], [0.6, 1]);
  const valueOpacity = interpolate(p, [0, 1], [0, 1]);
  const labelP = spring({ frame: frame - 10 + SNAP_OFFSET, fps, config: theme.motion });

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 0 0 140px",
      }}
    >
      {scene.headline && (
        <div style={{ marginBottom: 8 }}>
          <Label text={scene.headline} theme={theme} size="md" align="left" startFrame={0} muted />
        </div>
      )}
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: width * 0.2,
          fontWeight: 800,
          color: theme.accent,
          lineHeight: 0.92,
          letterSpacing: "-0.05em",
          opacity: valueOpacity,
          transform: `scale(${valueScale})`,
          transformOrigin: "left center",
        }}
      >
        {hero?.value}
      </div>
      {hero?.label && (
        <div
          style={{
            marginTop: 18,
            fontFamily: theme.fontSans,
            fontSize: 34,
            fontWeight: 600,
            color: theme.text,
            maxWidth: width * 0.6,
            opacity: interpolate(labelP, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(labelP, [0, 1], [16, 0])}px)`,
          }}
        >
          {hero?.label}
        </div>
      )}
      {rest.length > 0 && (
        <div style={{ display: "flex", gap: 56, marginTop: 48 }}>
          {rest.map((s, i) => {
            const rp = spring({ frame: frame - 24 - i * 8 + SNAP_OFFSET, fps, config: theme.motion });
            return (
              <div key={i} style={{ opacity: interpolate(rp, [0, 1], [0, 1]) }}>
                <div style={{ fontFamily: theme.fontSans, fontSize: 44, fontWeight: 800, color: theme.text, letterSpacing: "-0.03em" }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: theme.fontSans, fontSize: 18, fontWeight: 500, color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
