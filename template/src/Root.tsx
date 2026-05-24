import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { Brief, Scene } from "./brief";
import { buildTheme } from "./theme";
import { Problem } from "./components/scenes/Problem";
import { CodeReveal } from "./components/scenes/CodeReveal";
import { TerminalScene } from "./components/scenes/TerminalScene";
import { DataFlow } from "./components/scenes/DataFlow";
import { CTA } from "./components/scenes/CTA";

const SCENE_DURATION_MAP: Record<Scene["type"], number> = {
  problem: 90,
  "code-reveal": 120,
  terminal: 120,
  "data-flow": 100,
  cta: 90,
};

function sceneDuration(scene: Scene): number {
  return SCENE_DURATION_MAP[scene.type];
}

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
          <SceneRenderer scene={scene} theme={theme} projectName={brief.project.name} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface SceneRendererProps {
  scene: Scene;
  theme: ReturnType<typeof buildTheme>;
  projectName: string;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, theme, projectName }) => {
  switch (scene.type) {
    case "problem":
      return <Problem scene={scene} theme={theme} />;
    case "code-reveal":
      return <CodeReveal scene={scene} theme={theme} />;
    case "terminal":
      return <TerminalScene scene={scene} theme={theme} />;
    case "data-flow":
      return <DataFlow scene={scene} theme={theme} />;
    case "cta":
      return <CTA scene={scene} theme={theme} projectName={projectName} />;
    default:
      return null;
  }
};

export function calcTotalDuration(brief: Brief): number {
  return brief.scenes.reduce((sum, scene) => sum + sceneDuration(scene), 0);
}
