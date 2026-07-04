import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { CustomSceneProps } from "../custom-scenes";
import { Stage } from "../components/primitives/Stage";

/**
 * reelme's differentiating moment, drawn instead of told: one brief card on
 * the left, three platform frames (16:9, 1:1, 9:16) fanning out of it on the
 * right. Bespoke scene for the reelme gallery brief (skill-authored pattern).
 */
const PlatformFanout: React.FC<CustomSceneProps> = ({ theme, platform, bottomInset }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const s = portrait ? width / 1080 : width / 1920;

  const briefP = spring({ frame, fps, config: theme.motion });
  const cardW = 380 * s * (portrait ? 0.9 : 1);

  const targets = [
    { label: "16:9", w: 300, h: 169, delay: 14 },
    { label: "1:1", w: 220, h: 220, delay: 22 },
    { label: "9:16", w: 132, h: 234, delay: 30 },
  ];

  return (
    <Stage
      theme={theme}
      direction={portrait ? "column" : "row"}
      gap={portrait ? 70 : 110}
      caption="One brief in. Three aspect ratios out."
      captionStart={70}
      bottomInset={bottomInset}
    >
      {/* The brief: a single JSON card, the film's hero object. */}
      <div
        style={{
          width: cardW,
          flexShrink: 0,
          background: theme.surface,
          border: `1.5px solid ${theme.accent}`,
          borderRadius: 18,
          padding: `${28 * s}px ${32 * s}px`,
          fontFamily: theme.fontMono,
          fontSize: 30 * s,
          lineHeight: 1.75,
          color: theme.text,
          opacity: interpolate(briefP, [0, 1], [0, 1]),
          scale: String(interpolate(briefP, [0, 1], [0.92, 1])),
          boxShadow: `0 30px 90px -18px ${theme.accent}59, 0 24px 60px rgba(0,0,0,0.5)`,
        }}
      >
        <div style={{ color: theme.textMuted }}>{"// reelme.json"}</div>
        <div>{"{"}</div>
        <div style={{ paddingLeft: 26 * s }}>
          <span style={{ color: theme.accent }}>"name"</span>: "my-tool",
        </div>
        <div style={{ paddingLeft: 26 * s }}>
          <span style={{ color: theme.accent }}>"cuts"</span>: {"{ … }"}
        </div>
        <div>{"}"}</div>
      </div>

      {/* The fan-out: three platform frames land one after another. */}
      <div
        style={{
          display: "flex",
          flexDirection: portrait ? "row" : "column",
          alignItems: portrait ? "flex-end" : "flex-start",
          gap: 34 * s,
        }}
      >
        {targets.map((t) => {
          const p = spring({ frame: frame - t.delay, fps, config: theme.motion });
          return (
            <div
              key={t.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24 * s,
                opacity: interpolate(p, [0, 1], [0, 1]),
                translate: portrait
                  ? `0 ${interpolate(p, [0, 1], [26, 0])}px`
                  : `${interpolate(p, [0, 1], [-38, 0])}px 0`,
              }}
            >
              <div
                style={{
                  width: t.w * 1.35 * s,
                  height: t.h * 1.35 * s,
                  borderRadius: 12,
                  border: `2px solid ${theme.border}`,
                  background: `linear-gradient(135deg, ${theme.accent}33 0%, ${theme.accent2}22 100%)`,
                  boxShadow: `0 18px 60px -14px ${theme.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "34%",
                    height: 0,
                    paddingBottom: "34%",
                    borderRadius: "50%",
                    background: `${theme.accent}cc`,
                    position: "relative",
                  }}
                >
                  {/* Play glyph: the frame is a video, not a box. */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.textInverse,
                      fontFamily: theme.fontSans,
                      fontSize: t.w * 0.19 * s,
                      fontWeight: 800,
                    }}
                  >
                    ▶
                  </div>
                </div>
              </div>
              {!portrait && (
                <span
                  style={{
                    fontFamily: theme.fontMono,
                    fontSize: 32 * s,
                    fontWeight: 700,
                    color: theme.textMuted,
                  }}
                >
                  {t.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

export default PlatformFanout;
