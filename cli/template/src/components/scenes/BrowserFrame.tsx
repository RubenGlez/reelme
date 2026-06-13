import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { BrowserScene as BrowserBrief } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: BrowserBrief;
  theme: Theme;
}

export const BrowserFrame: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowProgress = spring({ frame, fps, config: theme.motion });
  const windowOpacity = interpolate(windowProgress, [0, 1], [0, 1]);
  const windowScale = interpolate(windowProgress, [0, 1], [0.92, 1]);

  // URL types character-by-character starting at frame 20
  const urlChars = Math.max(0, Math.floor((frame - 20) / 2));
  const displayUrl = scene.url.replace(/^https?:\/\//, "");
  const visibleUrl = displayUrl.slice(0, urlChars);
  const isCursorVisible = urlChars < displayUrl.length && Math.floor(frame / 10) % 2 === 0;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 120px",
      }}
    >
      <div
        style={{
          width: "100%",
          opacity: windowOpacity,
          transform: `scale(${windowScale})`,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Chrome bar */}
        <div
          style={{
            background: theme.surface,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          {(["#ff5f56", "#ffbd2e", "#27c93f"] as const).map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <div
            style={{
              flex: 1,
              marginLeft: 16,
              background: theme.bg,
              borderRadius: 6,
              padding: "6px 16px",
              fontFamily: theme.fontMono,
              fontSize: 15,
              color: theme.textMuted,
              border: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: theme.textMuted, marginRight: 4, opacity: 0.5 }}>https://</span>
            <span style={{ color: theme.text }}>{visibleUrl}</span>
            {isCursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: "1em",
                  background: theme.accent,
                  verticalAlign: "text-bottom",
                  marginLeft: 1,
                }}
              />
            )}
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            background: "#0d1117",
            height: 500,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {scene.image ? (
            <Img
              src={staticFile(scene.image)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            // Wireframe placeholder
            <div style={{ width: "100%", height: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Nav */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 80, height: 28, background: theme.surface, borderRadius: 6, border: `1px solid ${theme.border}` }} />
                <div style={{ flex: 1 }} />
                {[60, 60, 80].map((w, i) => (
                  <div key={i} style={{ width: w, height: 28, background: theme.surface, borderRadius: 6, border: `1px solid ${theme.border}` }} />
                ))}
                <div style={{ width: 100, height: 28, background: theme.accentMuted, borderRadius: 6, border: `1px solid ${theme.accent}` }} />
              </div>
              {/* Hero */}
              <div style={{ flex: 2, background: theme.surface, borderRadius: 8, border: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
                <div style={{ width: 200, height: 24, background: theme.border, borderRadius: 4 }} />
              </div>
              {/* Cards */}
              <div style={{ flex: 1, display: "flex", gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ flex: 1, background: theme.surface, borderRadius: 8, border: `1px solid ${theme.border}` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={60} />}
    </AbsoluteFill>
  );
};
