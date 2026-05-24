import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Brief, ProjectMeta, Scene } from "./brief";
import { buildTheme } from "./theme";
import { sceneDuration } from "./duration";
import { Problem } from "./components/scenes/Problem";
import { CodeReveal } from "./components/scenes/CodeReveal";
import { TerminalScene } from "./components/scenes/TerminalScene";
import { DataFlow } from "./components/scenes/DataFlow";
import { CTA } from "./components/scenes/CTA";
import { BrowserFrame } from "./components/scenes/BrowserFrame";
import { SplitComparison } from "./components/scenes/SplitComparison";
import { FeatureList } from "./components/scenes/FeatureList";

interface ReelProps {
  brief: Brief;
}

export const Reel: React.FC<ReelProps> = ({ brief }) => {
  const theme = buildTheme(brief.project.primaryColor || "#6366f1");

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
          <SceneRenderer scene={scene} theme={theme} project={brief.project} />
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
    default:
      return null;
  }
};

export { calcTotalDuration } from "./duration";
