import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { Brief, ProjectMeta, Scene } from "./brief";
import { PlatformPreset } from "./platforms";
import { buildTheme } from "./theme";
import { sceneDuration } from "./duration";
import { audioVolume } from "./audio";
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
import { Hook } from "./components/scenes/Hook";
import { Clip } from "./components/scenes/Clip";

const FADE_IN = 12;
const FADE_OUT = 15;

const TransitionEnvelope: React.FC<{
  durationInFrames: number;
  transition: "fade" | "slide" | "zoom";
  children: React.ReactNode;
}> = ({ durationInFrames, transition, children }) => {
  const frame = useCurrentFrame();
  const keys = [0, FADE_IN, durationInFrames - FADE_OUT, durationInFrames];
  const opts = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

  const opacity = interpolate(frame, keys, [0, 1, 1, 0], opts);

  if (transition === "slide") {
    const translateY = interpolate(frame, keys, [30, 0, 0, -30], opts);
    return <AbsoluteFill style={{ opacity, transform: `translateY(${translateY}px)` }}>{children}</AbsoluteFill>;
  }

  if (transition === "zoom") {
    const scale = interpolate(frame, keys, [0.95, 1, 1, 1.04], opts);
    return <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
  }

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

interface ReelProps {
  brief: Brief;
  /** The platform preset of the composition being rendered. */
  platform: PlatformPreset;
  /** When "teaser", sequence cuts.teaser instead of the platform-resolved cut. */
  cut?: "teaser";
}

export const Reel: React.FC<ReelProps> = ({ brief, platform, cut }) => {
  const { durationInFrames } = useVideoConfig();
  const theme = buildTheme(brief.project.primaryColor || "#6366f1", brief.project.font, brief.project.monoFont, brief.project.tone, brief.project.bgStyle);
  const shouldRenderAudio = platform.output.codec !== "gif" && Boolean(brief.project.audio);

  // Cut selection: teaser when requested, otherwise the cut named by the
  // platform preset, falling back to main when vertical is absent.
  const scenes: Scene[] =
    cut === "teaser"
      ? brief.cuts.teaser ?? []
      : platform.cut === "vertical"
        ? brief.cuts.vertical ?? brief.cuts.main
        : brief.cuts.main;

  let cursor = 0;
  const sequenced = scenes.map((scene) => {
    const from = cursor;
    const duration = sceneDuration(scene);
    cursor += duration;
    return { scene, from, duration };
  });

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {shouldRenderAudio && brief.project.audio ? (
        <Audio
          src={staticFile(`audio/${brief.project.audio.track}`)}
          loop
          volume={(frame) => audioVolume(frame, durationInFrames, brief.project.audio ? brief.project.audio.volume : undefined)}
        />
      ) : null}
      {sequenced.map(({ scene, from, duration }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <TransitionEnvelope durationInFrames={duration} transition={brief.project.transition ?? "fade"}>
            <SceneRenderer scene={scene} theme={theme} project={brief.project} platform={platform} />
          </TransitionEnvelope>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

interface SceneRendererProps {
  scene: Scene;
  theme: ReturnType<typeof buildTheme>;
  project: ProjectMeta;
  platform: PlatformPreset;
}

const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, theme, project, platform }) => {
  const bottomInset = platform.safeArea?.bottom ?? 0;
  switch (scene.type) {
    case "problem":
      return <Problem scene={scene} theme={theme} project={project} platform={platform} bottomInset={bottomInset} />;
    case "code-reveal":
      return <CodeReveal scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "terminal":
      return <TerminalScene scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "data-flow":
      return <DataFlow scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "cta":
      return <CTA scene={scene} theme={theme} project={project} platform={platform} bottomInset={bottomInset} />;
    case "browser":
      return <BrowserFrame scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "split":
      return <SplitComparison scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "feature-list":
      return <FeatureList scene={scene} theme={theme} platform={platform} bottomInset={bottomInset} />;
    case "stat-callout":
      return <StatCallout scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "file-tree":
      return <FileTree scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "mobile":
      return <MobileScreen scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "os-window":
      return <OSWindow scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "hotkey":
      return <Hotkey scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "hook":
      return <Hook scene={scene} theme={theme} platform={platform} />;
    case "clip":
      return <Clip scene={scene} theme={theme} />;
    default:
      return null;
  }
};
