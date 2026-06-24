import React from "react";
import { AbsoluteFill } from "remotion";
import { BenchmarkScene as BenchmarkBrief } from "../../brief";
import { Theme } from "../../theme";
import { benchmarkFractions } from "../../benchmark";
import { Bar } from "../primitives/Bar";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: BenchmarkBrief;
  theme: Theme;
  bottomInset?: number;
}

const HEADLINE_FRAMES = 20;
const FRAMES_PER_BAR = 18;

export const Benchmark: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const fractions = benchmarkFractions(
    scene.bars.map((b) => b.value),
    scene.lowerIsBetter
  );
  const captionStart = HEADLINE_FRAMES + scene.bars.length * FRAMES_PER_BAR + 30;

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 120px",
        gap: 40,
      }}
    >
      {scene.headline && (
        <Label text={scene.headline} theme={theme} size="lg" startFrame={0} />
      )}

      {scene.metric && (
        <div
          style={{
            fontFamily: theme.fontSans,
            fontSize: 24,
            color: theme.textMuted,
            marginTop: -16,
            letterSpacing: "0.02em",
          }}
        >
          {scene.metric}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          width: "100%",
          maxWidth: 1200,
        }}
      >
        {scene.bars.map((bar, i) => (
          <Bar
            key={i}
            label={bar.label}
            valueText={bar.display ?? String(bar.value)}
            fraction={fractions[i]}
            hero={bar.hero}
            theme={theme}
            startFrame={HEADLINE_FRAMES + i * FRAMES_PER_BAR}
          />
        ))}
      </div>

      {scene.caption && (
        <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />
      )}
    </AbsoluteFill>
  );
};
