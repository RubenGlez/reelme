import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FeatureListScene as FeatureListBrief } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { Label } from "../primitives/Label";
import { Stage } from "../primitives/Stage";
import { Icon, hasIcon } from "../primitives/Icon";

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

  const items = scene.items ?? [];
  const captionStart = HEADLINE_FRAMES + items.length * FRAMES_PER_ITEM + 20;
  const left = scene.align === "left";

  return (
    <Stage theme={theme} caption={scene.caption} captionStart={captionStart} bottomInset={bottomInset}>
      {/* The list is a single block, centered in the frame. Even a short
          left-aligned list then sits in symmetric margins (composed negative
          space) instead of being anchored against one edge with a void opposite.
          Items left-align within the block for a clean reading column. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {scene.headline && (
          <div style={{ marginBottom: 52, alignSelf: left ? "flex-start" : "center" }}>
            <Label text={scene.headline} theme={theme} size="lg" align={left ? "left" : "center"} startFrame={0} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {items.map((item, i) => {
            const text = typeof item === "string" ? item : item.text;
            const icon = typeof item === "string" ? undefined : item.icon;
            const showIcon = icon !== undefined && hasIcon(icon);

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
                  gap: 26,
                  opacity,
                  translate: `${translateX}px 0`,
                }}
              >
                {/* A bold accent marker carries the weight — no faint bordered
                    chip (a web-UI badge pattern that reads as filler on screen). */}
                <div
                  style={{
                    width: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {showIcon ? (
                    <Icon name={icon} size={34} color={theme.accent} />
                  ) : (
                    <span
                      style={{
                        fontFamily: theme.fontSans,
                        fontSize: 30,
                        fontWeight: 800,
                        color: theme.accent,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: theme.fontSans,
                    fontSize: 40 * scale,
                    fontWeight: 600,
                    color: theme.text,
                    lineHeight: 1.3,
                    letterSpacing: "-0.015em",
                  }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </Stage>
  );
};
