import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { StatCalloutScene as StatCalloutBrief } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";
import { Stage } from "../primitives/Stage";

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
    <Stage theme={theme} gap={64} caption={scene.caption} captionStart={captionStart} bottomInset={bottomInset}>
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

    </Stage>
  );
};

/**
 * One dominant number, kept in balance. With supporting stats they fill the
 * opposite side as a substantial column (divided by a thin rule) so the frame
 * carries weight on both sides instead of stranding the number against an empty
 * void. Alone, the number is centered and composed so it never sits in a corner.
 */
const HeroStat: React.FC<{
  scene: StatCalloutBrief;
  theme: Theme;
  bottomInset: number;
  width: number;
  frame: number;
  fps: number;
}> = ({ scene, theme, bottomInset, width, frame, fps }) => {
  const [hero, ...rest] = scene.stats;
  const hasSecondary = rest.length > 0;
  const p = spring({ frame: frame + SNAP_OFFSET, fps, config: theme.motion });
  const valueScale = interpolate(p, [0, 1], [0.6, 1]);
  const valueOpacity = interpolate(p, [0, 1], [0, 1]);
  const labelP = spring({ frame: frame - 10 + SNAP_OFFSET, fps, config: theme.motion });
  const dividerP = spring({ frame: frame - 18 + SNAP_OFFSET, fps, config: theme.motion });

  return (
    <Stage
      theme={theme}
      direction="row"
      justify={hasSecondary ? "space-between" : "center"}
      gap={90}
      padding="0 130px"
      caption={scene.caption}
      captionStart={50}
      bottomInset={bottomInset}
    >
      {/* Primary: the dominant number and its label. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: hasSecondary ? "flex-start" : "center",
          maxWidth: hasSecondary ? width * 0.5 : width * 0.78,
        }}
      >
        {scene.headline && (
          <div style={{ marginBottom: 10 }}>
            <Label
              text={scene.headline}
              theme={theme}
              size="md"
              align={hasSecondary ? "left" : "center"}
              startFrame={0}
              muted
            />
          </div>
        )}
        <div
          style={{
            fontFamily: theme.fontSans,
            fontSize: hasSecondary ? width * 0.16 : width * 0.2,
            fontWeight: 800,
            color: theme.accent,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            opacity: valueOpacity,
            transform: `scale(${valueScale})`,
            transformOrigin: hasSecondary ? "left center" : "center",
          }}
        >
          {hero?.value}
        </div>
        {hero?.label && (
          <div
            style={{
              marginTop: 20,
              fontFamily: theme.fontSans,
              fontSize: 40,
              fontWeight: 600,
              lineHeight: 1.2,
              color: theme.text,
              textAlign: hasSecondary ? "left" : "center",
              maxWidth: hasSecondary ? width * 0.46 : width * 0.66,
              opacity: interpolate(labelP, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(labelP, [0, 1], [16, 0])}px)`,
            }}
          >
            {hero?.label}
          </div>
        )}
      </div>

      {/* Secondary mass: supporting stats fill the opposite side as substantial
          blocks, balancing the hero number instead of leaving a void. */}
      {hasSecondary && (
        <div style={{ display: "flex", alignItems: "stretch", gap: 44 }}>
          <div
            style={{
              width: 2,
              alignSelf: "stretch",
              background: theme.border,
              opacity: interpolate(dividerP, [0, 1], [0, 0.7]),
              transform: `scaleY(${interpolate(dividerP, [0, 1], [0, 1])})`,
              transformOrigin: "top",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {rest.map((s, i) => {
              const rp = spring({ frame: frame - 22 - i * 8 + SNAP_OFFSET, fps, config: theme.motion });
              return (
                <div
                  key={i}
                  style={{
                    opacity: interpolate(rp, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(rp, [0, 1], [24, 0])}px)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: theme.fontSans,
                      fontSize: 68,
                      fontWeight: 800,
                      color: theme.text,
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: theme.fontSans,
                      fontSize: 30,
                      fontWeight: 500,
                      color: theme.textMuted,
                      maxWidth: width * 0.28,
                      lineHeight: 1.25,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </Stage>
  );
};
