import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { HookScene as HookBrief } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";

interface Props {
  scene: HookBrief;
  theme: Theme;
  platform: PlatformPreset;
}

export const Hook: React.FC<Props> = ({ scene, theme, platform }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const progress = spring({ frame, fps, config: theme.motion });
  const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
  const translateY = interpolate(Math.max(0, progress), [0, 1], [32, 0]);

  const baseFontSize = width * 0.1;
  const fontSize = baseFontSize * typeScale(platform);

  const renderText = () => {
    if (!scene.accent) {
      return <span>{scene.text}</span>;
    }
    const idx = scene.text.indexOf(scene.accent);
    if (idx === -1) return <span>{scene.text}</span>;
    return (
      <>
        {scene.text.slice(0, idx)}
        <span style={{ color: theme.accent }}>{scene.accent}</span>
        {scene.text.slice(idx + scene.accent.length)}
      </>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div
        style={{
          fontFamily: theme.fontSans,
          fontSize,
          fontWeight: 800,
          color: theme.text,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          textAlign: "center",
          maxHeight: `${fontSize * 1.1 * 3}px`,
          overflow: "hidden",
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {renderText()}
      </div>
    </AbsoluteFill>
  );
};
