import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Brief, ProjectMeta, Scene } from "./brief";
import { buildTheme } from "./theme";
import { sceneDuration } from "./duration";
import "./fonts";
import { Problem } from "./components/scenes/Problem";
import { CodeReveal } from "./components/scenes/CodeReveal";
import { TerminalScene } from "./components/scenes/TerminalScene";
import { DataFlow } from "./components/scenes/DataFlow";
import { CTA } from "./components/scenes/CTA";
import { BrowserFrame } from "./components/scenes/BrowserFrame";
import { SplitComparison } from "./components/scenes/SplitComparison";
import { FeatureList } from "./components/scenes/FeatureList";
import { StatCallout } from "./components/scenes/StatCallout";
import { FileTree } from "./components/scenes/FileTree";
import { MobileScreen } from "./components/scenes/MobileScreen";
import { OSWindow } from "./components/scenes/OSWindowScene";
import { Hotkey } from "./components/scenes/HotkeyScene";

const FADE_IN = 12;
const FADE_OUT = 15;

const FadeEnvelope: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE_IN, durationInFrames - FADE_OUT, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

interface ReelProps {
  brief: Brief;
}

export const Reel: React.FC<ReelProps> = ({ brief }) => {
  const theme = buildTheme(brief.project.primaryColor || "#6366f1", brief.project.font, brief.project.monoFont);

  let cursor = 0;
  const sequenced = brief.scenes.map((scene) => {
    const from = cursor;
    const duration = sceneDuration(scene);
    cursor += duration;
    return { scene, from, duration };
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {sequenced.map(({ scene, from, duration }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <FadeEnvelope durationInFrames={duration}>
            <SceneRenderer scene={scene} theme={theme} project={brief.project} />
          </FadeEnvelope>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface SceneRendererProps {
  scene: Scene;
  theme: ReturnType<typeof buildTheme>;
  project: ProjectMeta;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, theme, project }) => {
  switch (scene.type) {
    case "problem":
      return <Problem scene={scene} theme={theme} project={project} />;
    case "code-reveal":
      return <CodeReveal scene={scene} theme={theme} />;
    case "terminal":
      return <TerminalScene scene={scene} theme={theme} />;
    case "data-flow":
      return <DataFlow scene={scene} theme={theme} />;
    case "cta":
      return <CTA scene={scene} theme={theme} project={project} />;
    case "browser":
      return <BrowserFrame scene={scene} theme={theme} />;
    case "split":
      return <SplitComparison scene={scene} theme={theme} />;
    case "feature-list":
      return <FeatureList scene={scene} theme={theme} />;
    case "stat-callout":
      return <StatCallout scene={scene} theme={theme} />;
    case "file-tree":
      return <FileTree scene={scene} theme={theme} />;
    case "mobile":
      return <MobileScreen scene={scene} theme={theme} />;
    case "os-window":
      return <OSWindow scene={scene} theme={theme} />;
    case "hotkey":
      return <Hotkey scene={scene} theme={theme} />;
    default:
      return null;
  }
};

export { calcTotalDuration } from "./duration";
