import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { Theme } from "../../theme";

interface Props {
  label: string;
  valueText: string;
  /** Target fill width as a fraction of the track (0..1). */
  fraction: number;
  hero?: boolean;
  theme: Theme;
  startFrame: number;
}

export const Bar: React.FC<Props> = ({ label, valueText, fraction, hero, theme, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - startFrame,
    fps,
    config: theme.motion,
  });
  const width = interpolate(Math.max(0, progress), [0, 1], [0, Math.max(0, Math.min(1, fraction))], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const valueOpacity = interpolate(frame - startFrame, [10, 22], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <div
        style={{
          width: 300,
          textAlign: "right",
          flexShrink: 0,
          fontFamily: theme.fontSans,
          fontSize: 30,
          fontWeight: hero ? 700 : 500,
          color: hero ? theme.text : theme.textMuted,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          flex: 1,
          height: 56,
          background: theme.surface,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: `${width * 100}%`,
            height: "100%",
            background: hero ? theme.accent : theme.border,
            borderRadius: 12,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            opacity: valueOpacity,
            marginLeft: 18,
            whiteSpace: "nowrap",
            fontFamily: theme.fontMono,
            fontSize: 30,
            fontWeight: 700,
            color: hero ? theme.accent : theme.textMuted,
          }}
        >
          {valueText}
        </div>
      </div>
    </div>
  );
};
