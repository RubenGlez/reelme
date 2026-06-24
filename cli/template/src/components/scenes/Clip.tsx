import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { Gif } from "@remotion/gif";
import { ClipScene } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: ClipScene;
  theme: Theme;
}

const isGif = (src: string) => src.endsWith(".gif");

const MediaElement: React.FC<{ scene: ClipScene }> = ({ scene }) => {
  if (isGif(scene.src)) {
    return (
      <Gif
        src={staticFile(scene.src)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        fit="cover"
      />
    );
  }
  return (
    <OffthreadVideo
      src={staticFile(scene.src)}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      muted
      startFrom={scene.startFrom}
    />
  );
};

const BrowserChrome: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
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

const MobileChrome: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      borderRadius: 40,
      border: `3px solid ${theme.border}`,
      overflow: "hidden",
      boxShadow: "0 40px 100px rgba(0,0,0,0.55)",
      position: "relative",
    }}
  >
    {children}
  </div>
);

export const Clip: React.FC<Props> = ({ scene, theme }) => {
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
        {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={30} />}
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
          padding: "40px 200px",
        }}
      >
        <MobileChrome theme={theme}>{renderMedia()}</MobileChrome>
        {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={30} />}
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
