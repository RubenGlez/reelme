import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SplitScene as SplitBrief } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: SplitBrief;
  theme: Theme;
}

export const SplitComparison: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftProgress = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const rightProgress = spring({ frame: frame - 12, fps, config: { damping: 20, stiffness: 80 } });
  const dividerProgress = spring({ frame: frame - 6, fps, config: { damping: 24, stiffness: 120 } });

  const leftOpacity = interpolate(Math.max(0, leftProgress), [0, 1], [0, 1]);
  const leftX = interpolate(Math.max(0, leftProgress), [0, 1], [-60, 0]);
  const rightOpacity = interpolate(Math.max(0, rightProgress), [0, 1], [0, 1]);
  const rightX = interpolate(Math.max(0, rightProgress), [0, 1], [60, 0]);
  const dividerOpacity = interpolate(Math.max(0, dividerProgress), [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 80px",
      }}
    >
      <div style={{ display: "flex", width: "100%", height: "100%", maxHeight: 700, alignItems: "stretch", gap: 0 }}>
        {/* Before panel */}
        <div
          style={{
            flex: 1,
            opacity: leftOpacity,
            transform: `translateX(${leftX}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: theme.fontSans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.textMuted,
            }}
          >
            {scene.before.label}
          </div>
          <div
            style={{
              flex: 1,
              background: theme.surface,
              border: `1.5px solid ${theme.border}`,
              borderRadius: 10,
              padding: "24px 28px",
              fontFamily: theme.fontMono,
              fontSize: 18,
              color: theme.textMuted,
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              overflow: "hidden",
            }}
          >
            {scene.before.content}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 2,
            alignSelf: "stretch",
            background: theme.border,
            margin: "36px 32px 0",
            opacity: dividerOpacity,
          }}
        />

        {/* After panel */}
        <div
          style={{
            flex: 1,
            opacity: rightOpacity,
            transform: `translateX(${rightX}px)`,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: theme.fontSans,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: theme.accent,
            }}
          >
            {scene.after.label}
          </div>
          <div
            style={{
              flex: 1,
              background: theme.surface,
              border: `1.5px solid ${theme.accent}55`,
              borderRadius: 10,
              padding: "24px 28px",
              fontFamily: theme.fontMono,
              fontSize: 18,
              color: theme.text,
              whiteSpace: "pre-wrap",
              lineHeight: 1.7,
              overflow: "hidden",
            }}
          >
            {scene.after.content}
          </div>
        </div>
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} />}
    </AbsoluteFill>
  );
};
