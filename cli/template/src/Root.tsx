import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { Brief, ProjectMeta, Scene } from "./brief";
import { PlatformPreset } from "./platforms";
import { buildTheme } from "./theme";
import { sceneDurationsOnGrid } from "./duration";
import { audioVolume } from "./audio";
import { resolveLook, TransitionStyle } from "./cinematic/look";
import { Atmosphere, Grain } from "./cinematic/Atmosphere";
import { Camera } from "./cinematic/Camera";
import { Enter, transitionFor } from "./cinematic/transitions";
import "./fonts";
import { CUSTOM_SCENES } from "./custom-scenes";
import { Caption } from "./components/primitives/Caption";
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

interface ReelProps {
  brief: Brief;
  /** The platform preset of the composition being rendered. */
  platform: PlatformPreset;
  /** When "teaser", sequence cuts.teaser instead of the platform-resolved cut. */
  cut?: "teaser";
}

export const Reel: React.FC<ReelProps> = ({ brief, platform, cut }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const look = resolveLook(brief.project.look, brief.project.tone);
  // The look owns motion personality: override the tone-derived default so every
  // scene's springs (which read theme.motion) inherit the look's physics.
  const theme = {
    ...buildTheme(brief.project.primaryColor || "#6366f1", brief.project.font, brief.project.monoFont, brief.project.tone, brief.project.bgStyle, brief.project.secondaryColor),
    motion: look.motion,
  };
  const isGif = platform.output.codec === "gif";
  const shouldRenderAudio = !isGif && Boolean(brief.project.audio);
  const bpm = brief.project.audio ? brief.project.audio.bpm : undefined;

  // Cut selection: teaser when requested, otherwise the cut named by the
  // platform preset, falling back to main when vertical is absent.
  const scenes: Scene[] =
    cut === "teaser"
      ? brief.cuts.teaser ?? []
      : platform.cut === "vertical"
        ? (brief.cuts.vertical?.length ? brief.cuts.vertical : brief.cuts.main)
        : brief.cuts.main;

  // Cut timing on the music's beat grid (falls back to natural durations when
  // no track/bpm) — the same grid index.ts used for the composition length.
  const durations = sceneDurationsOnGrid(scenes, fps, bpm);
  let cursor = 0;
  const sequenced = scenes.map((scene, i) => {
    const from = cursor;
    const duration = durations[i];
    cursor += duration;
    return { scene, from, duration };
  });

  // Keep scene content out of the platform's top UI overlay zone (F10). The
  // Atmosphere still fills the whole frame; only the content band starts below
  // safeArea.top. The bottom is left at the frame edge because captions manage
  // their own bottom inset, so this never double-counts.
  const topInset = platform.safeArea?.top ?? 0;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Atmosphere theme={theme} look={look} quality={isGif ? "lite" : "full"} />

      {shouldRenderAudio && brief.project.audio ? (
        <Audio
          src={staticFile(`audio/${brief.project.audio.track}`)}
          loop
          volume={(frame) =>
            audioVolume(frame, durationInFrames, brief.project.audio ? brief.project.audio.volume : undefined)
          }
        />
      ) : null}

      <div style={{ position: "absolute", top: topInset, left: 0, right: 0, bottom: 0 }}>
        {sequenced.map(({ scene, from, duration }, i) => (
          <Sequence key={i} from={from} durationInFrames={duration} premountFor={fps}>
            <Enter style={transitionFor(look, i, sequenced.length)} look={look} fromBlack={i === 0} seed={i}>
              <Camera look={look} durationInFrames={duration} seed={i} disabled={isGif}>
                <SceneRenderer scene={scene} theme={theme} project={brief.project} platform={platform} />
              </Camera>
            </Enter>
          </Sequence>
        ))}
      </div>

      {/* Cut SFX: a subtle cue under each transition makes the edit tactile.
          The end-card gets a rise that starts BEFORE its cut so the swell
          lands on the arrival, not after it. */}
      {shouldRenderAudio &&
        sequenced.map(({ from }, i) => {
          if (i === 0) return null;
          const isLast = i === sequenced.length - 1;
          const style = transitionFor(look, i, sequenced.length);
          const sfx = isLast ? null : cutSfx(style);
          if (isLast) {
            return (
              <Sequence key={`sfx-${i}`} from={Math.max(0, from - 18)} durationInFrames={40}>
                <Audio src={staticFile("audio/sfx/rise.mp3")} volume={0.5} />
              </Sequence>
            );
          }
          if (!sfx) return null;
          return (
            <Sequence key={`sfx-${i}`} from={from} durationInFrames={20}>
              <Audio src={staticFile(`audio/sfx/${sfx.file}`)} volume={sfx.volume} />
            </Sequence>
          );
        })}

      {!isGif && <Grain look={look} />}
    </AbsoluteFill>
  );
};

/**
 * Which cue a transition earns. Fast lateral cuts get air (whoosh); settle
 * cuts get a soft knock; hard cuts stay silent — silence is also a cue.
 */
function cutSfx(style: TransitionStyle): { file: string; volume: number } | null {
  switch (style) {
    case "whip":
    case "wipe":
    case "flip":
      return { file: "whoosh.mp3", volume: 0.4 };
    case "punch":
    case "zoom":
      return { file: "pop.mp3", volume: 0.45 };
    case "rise":
    case "fade":
    case "dip":
      return { file: "pop.mp3", volume: 0.25 };
    default:
      return null;
  }
}

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
      return <BrowserFrame scene={scene} theme={theme} platform={platform} bottomInset={bottomInset} />;
    case "split":
      return <SplitComparison scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "feature-list":
      return <FeatureList scene={scene} theme={theme} platform={platform} bottomInset={bottomInset} />;
    case "stat-callout":
      return <StatCallout scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "file-tree":
      return <FileTree scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "mobile":
      return <MobileScreen scene={scene} theme={theme} platform={platform} bottomInset={bottomInset} />;
    case "os-window":
      return <OSWindow scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "hotkey":
      return <Hotkey scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "hook":
      return <Hook scene={scene} theme={theme} platform={platform} />;
    case "clip":
      return <Clip scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "benchmark":
      return <Benchmark scene={scene} theme={theme} bottomInset={bottomInset} />;
    case "custom": {
      const Custom = CUSTOM_SCENES[scene.component];
      if (!Custom) {
        // The CLI stages and registers referenced components; reaching this
        // means a direct-render path skipped staging. Fail soft on one scene
        // rather than killing the whole reel.
        console.warn(`reelme: custom scene component not registered: ${scene.component}`);
        return null;
      }
      return (
        <>
          <Custom theme={theme} project={project} platform={platform} bottomInset={bottomInset} caption={scene.caption} />
          {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={40} bottomInset={bottomInset} />}
        </>
      );
    }
    default:
      return null;
  }
};
