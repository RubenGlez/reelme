import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, interpolate } from "remotion";
import { Brief, ProjectMeta, Scene } from "./brief";
import { PlatformPreset } from "./platforms";
import { buildTheme } from "./theme";
import { sceneDuration } from "./duration";
import { audioVolume } from "./audio";
import { resolveLook } from "./cinematic/look";
import { Atmosphere, Grain } from "./cinematic/Atmosphere";
import { Camera } from "./cinematic/Camera";
import { Enter, transitionFor } from "./cinematic/transitions";
import { SoundDesign, ctaDuckFrame } from "./cinematic/SoundDesign";
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
import { Benchmark } from "./components/scenes/Benchmark";

// Bed ducking around the CTA: the music dips under the riser and sub-drop so
// the call-to-action arrives in cleared space, then recovers.
function bedDuck(frame: number, ctaFrame: number | null, fps: number): number {
  if (ctaFrame === null) return 1;
  return interpolate(
    frame,
    [ctaFrame - Math.round(fps * 1.4), ctaFrame - Math.round(fps * 0.3), ctaFrame + Math.round(fps * 1.2)],
    [1, 0.4, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

interface ReelProps {
  brief: Brief;
  /** The platform preset of the composition being rendered. */
  platform: PlatformPreset;
  /** When "teaser", sequence cuts.teaser instead of the platform-resolved cut. */
  cut?: "teaser";
}

export const Reel: React.FC<ReelProps> = ({ brief, platform, cut }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const theme = buildTheme(brief.project.primaryColor || "#6366f1", brief.project.font, brief.project.monoFont, brief.project.tone, brief.project.bgStyle);
  const look = resolveLook(brief.project.look, brief.project.tone);
  const isGif = platform.output.codec === "gif";
  const shouldRenderAudio = !isGif && Boolean(brief.project.audio);

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

  const ctaFrame = ctaDuckFrame(sequenced);

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Atmosphere theme={theme} look={look} quality={isGif ? "lite" : "full"} />

      {shouldRenderAudio && brief.project.audio ? (
        <Audio
          src={staticFile(`audio/${brief.project.audio.track}`)}
          loop
          volume={(frame) =>
            audioVolume(frame, durationInFrames, brief.project.audio ? brief.project.audio.volume : undefined) *
            bedDuck(frame, ctaFrame, fps)
          }
        />
      ) : null}
      {shouldRenderAudio && <SoundDesign sequenced={sequenced} fps={fps} look={look} />}

      {sequenced.map(({ scene, from, duration }, i) => (
        <Sequence key={i} from={from} durationInFrames={duration}>
          <Enter style={transitionFor(look, i, sequenced.length)} look={look} fromBlack={i === 0} seed={i}>
            <Camera look={look} durationInFrames={duration} seed={i} disabled={isGif}>
              <SceneRenderer scene={scene} theme={theme} project={brief.project} platform={platform} />
            </Camera>
          </Enter>
        </Sequence>
      ))}

      {!isGif && <Grain look={look} />}
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
  const lite = platform.output.codec === "gif";
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
      return <CTA scene={scene} theme={theme} project={project} platform={platform} bottomInset={bottomInset} lite={lite} />;
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
    case "benchmark":
      return <Benchmark scene={scene} theme={theme} bottomInset={bottomInset} />;
    default:
      return null;
  }
};
