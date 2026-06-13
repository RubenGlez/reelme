import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FeatureListScene as FeatureListBrief } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";
import { Icon } from "../primitives/Icon";

interface Props {
  scene: FeatureListBrief;
  theme: Theme;
  platform?: PlatformPreset;
  bottomInset?: number;
}

const HEADLINE_FRAMES = 20;
const FRAMES_PER_ITEM = 25;

export const FeatureList: React.FC<Props> = ({ scene, theme, platform, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = platform ? typeScale(platform) : 1.0;

  const captionStart = HEADLINE_FRAMES + scene.items.length * FRAMES_PER_ITEM + 20;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 200px",
      }}
    >
      {scene.headline && (
        <div style={{ marginBottom: 48 }}>
          <Label text={scene.headline} theme={theme} size="lg" startFrame={0} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        {scene.items.map((item, i) => {
          const text = typeof item === "string" ? item : item.text;
          const icon = typeof item === "string" ? undefined : item.icon;

          const itemStart = HEADLINE_FRAMES + i * FRAMES_PER_ITEM;
          const progress = spring({ frame: frame - itemStart, fps, config: theme.motion });
          const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
          const translateX = interpolate(Math.max(0, progress), [0, 1], [-24, 0]);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity,
                transform: `translateX(${translateX}px)`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: theme.accentMuted,
                  border: `1.5px solid ${theme.accent}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {icon ? (
                  <Icon name={icon} size={18} color={theme.accent} />
                ) : (
                  <span
                    style={{
                      fontFamily: theme.fontMono,
                      fontSize: 14,
                      fontWeight: 700,
                      color: theme.accent,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontFamily: theme.fontSans,
                  fontSize: 28 * scale,
                  fontWeight: 500,
                  color: theme.text,
                  lineHeight: 1.4,
                  letterSpacing: "-0.01em",
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
