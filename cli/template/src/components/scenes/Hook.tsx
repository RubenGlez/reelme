import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { HookScene as HookBrief } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset, typeScale } from "../../platforms";
import { RevealText } from "../primitives/RevealText";

interface Props {
  scene: HookBrief;
  theme: Theme;
  platform: PlatformPreset;
}

export const Hook: React.FC<Props> = ({ scene, theme, platform }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const fontSize = width * 0.1 * typeScale(platform);
  // The whole block eases out of a slight over-scale so the words don't just
  // appear — they land. A touch of continuous drift keeps the hold alive.
  const settle = spring({ frame, fps, config: { damping: 26, stiffness: 90, mass: 1 } });
  const scale = interpolate(settle, [0, 1], [1.06, 1]);
  const drift = Math.sin(frame / 40) * 0.4;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 80px",
      }}
    >
      <div style={{ transform: `scale(${scale}) translateY(${drift}px)`, willChange: "transform" }}>
        <RevealText
          text={scene.text}
          theme={theme}
          fontSize={fontSize}
          fontWeight={800}
          emphasis={scene.accent}
          align="center"
          stagger={3.5}
          letterSpacing="-0.04em"
          lineHeight={1.04}
          maxWidth={width * 0.84}
        />
      </div>
    </AbsoluteFill>
  );
};
