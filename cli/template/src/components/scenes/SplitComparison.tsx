import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { SplitScene as SplitBrief } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: SplitBrief;
  theme: Theme;
  bottomInset?: number;
}

export const SplitComparison: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftProgress = spring({ frame, fps, config: theme.motion });
  const rightProgress = spring({ frame: frame - 12, fps, config: theme.motion });
  const dividerProgress = spring({ frame: frame - 6, fps, config: theme.motion });

  const leftOpacity = interpolate(Math.max(0, leftProgress), [0, 1], [0, 1]);
  const leftX = interpolate(Math.max(0, leftProgress), [0, 1], [-60, 0]);
  const rightOpacity = interpolate(Math.max(0, rightProgress), [0, 1], [0, 1]);
  const rightX = interpolate(Math.max(0, rightProgress), [0, 1], [60, 0]);
  const dividerOpacity = interpolate(Math.max(0, dividerProgress), [0, 1], [0, 1]);

  const Panel: React.FC<{
    label: string;
    content: string;
    accent: boolean;
    opacity: number;
    x: number;
  }> = ({ label, content, accent, opacity, x }) => (
    <div
      style={{
        flex: 1,
        opacity,
        translate: `${x}px 0`,
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: accent ? theme.accent : theme.textMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          minHeight: 240,
          background: theme.surface,
          border: `1.5px solid ${accent ? `${theme.accent}66` : theme.border}`,
          borderRadius: 14,
          padding: "44px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: theme.fontSans,
          fontSize: 32,
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
          color: accent ? theme.text : theme.textMuted,
          boxShadow: accent ? `0 18px 50px ${theme.accent}22` : "0 14px 40px rgba(0,0,0,0.3)",
        }}
      >
        {content}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 100px",
      }}
    >
      <div style={{ display: "flex", width: "100%", maxWidth: 1500, alignItems: "stretch", gap: 0 }}>
        <Panel label={scene.before.label} content={scene.before.content} accent={false} opacity={leftOpacity} x={leftX} />
        <div
          style={{
            width: 2,
            alignSelf: "center",
            height: 200,
            background: theme.border,
            margin: "44px 36px 0",
            opacity: dividerOpacity,
          }}
        />
        <Panel label={scene.after.label} content={scene.after.content} accent opacity={rightOpacity} x={rightX} />
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
