import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Gif } from "@remotion/gif";
import { ClipScene } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: ClipScene;
  theme: Theme;
  bottomInset?: number;
}

const isGif = (src: string) => src.endsWith(".gif");

const MediaElement: React.FC<{ scene: ClipScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  if (isGif(scene.src)) {
    return (
      <Gif
        src={staticFile(scene.src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        fit="cover"
      />
    );
  }
  // Stop the source at the requested trim point so the scene's tail doesn't
  // keep playing past what the brief asked for (F23) — but HOLD the last frame
  // through the tail instead of cutting to nothing: an endAt alone left the
  // clip's chrome standing empty for the scene's final second (gallery
  // feedback: "ends in a rounded square without content").
  const video = (
    <OffthreadVideo
      src={staticFile(scene.src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      muted
      startFrom={scene.startFrom}
      endAt={scene.durationInFrames !== undefined ? (scene.startFrom ?? 0) + scene.durationInFrames : undefined}
    />
  );
  if (scene.durationInFrames !== undefined && frame >= scene.durationInFrames) {
    return <Freeze frame={scene.durationInFrames - 1}>{video}</Freeze>;
  }
  return video;
};

const BrowserChrome: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 30px 90px -18px ${theme.accent}59, 0 24px 80px rgba(0,0,0,0.6)`,
      borderRadius: 12,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        background: theme.surface,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderBottom: `1px solid ${theme.border}`,
        flexShrink: 0,
      }}
    >
      {(["#ff5f56", "#ffbd2e", "#27c93f"] as const).map((c) => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
      ))}
    </div>
    <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>{children}</div>
  </div>
);

// A phone is a phone: the chrome keeps a device aspect ratio and lets the
// frame's leftover space stay empty, instead of stretching into an arbitrary
// rounded rectangle the size of whatever platform frame it lands on. The
// definite axis follows the frame: height-bound on landscape, width-bound on
// portrait (aspect-ratio fills in the other).
const MobileChrome: React.FC<{ children: React.ReactNode; theme: Theme; portrait: boolean }> = ({ children, theme, portrait }) => (
  <div
    style={{
      ...(portrait ? { width: "100%" } : { height: "100%" }),
      aspectRatio: "9 / 19",
      borderRadius: 40,
      border: `3px solid ${theme.border}`,
      overflow: "hidden",
      boxShadow: `0 30px 100px -20px ${theme.accent}59, 0 40px 100px rgba(0,0,0,0.55)`,
      position: "relative",
    }}
  >
    {children}
  </div>
);

export const Clip: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const renderMedia = () => <MediaElement scene={scene} />;

  if (scene.frame === "browser") {
    return (
      <AbsoluteFill
        style={{
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 120px",
        }}
      >
        <BrowserChrome theme={theme}>{renderMedia()}</BrowserChrome>
        {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={30} bottomInset={bottomInset} />}
      </AbsoluteFill>
    );
  }

  if (scene.frame === "mobile") {
    return (
      <AbsoluteFill
        style={{
          background: "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: portrait ? "120px 280px" : "60px 200px",
        }}
      >
        <MobileChrome theme={theme} portrait={portrait}>{renderMedia()}</MobileChrome>
        {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={30} bottomInset={bottomInset} />}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ background: "transparent", borderRadius: 12, overflow: "hidden" }}>
      {renderMedia()}
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={30} />}
    </AbsoluteFill>
  );
};
