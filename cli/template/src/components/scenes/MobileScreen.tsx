import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { MobileScene as MobileBrief } from "../../brief";
import { Theme } from "../../theme";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: MobileBrief;
  theme: Theme;
  bottomInset?: number;
}

const PHONE_W = 340;
const PHONE_H = 720;
const NOTCH_H = 30;
const RADIUS = 40;

export const MobileScreen: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: theme.motion });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const scale = interpolate(progress, [0, 1], [0.88, 1]);

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: PHONE_W,
          height: PHONE_H,
          borderRadius: RADIUS,
          border: `3px solid ${theme.border}`,
          background: theme.surface,
          boxShadow: `0 40px 100px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.05)`,
          position: "relative",
          overflow: "hidden",
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: NOTCH_H,
            background: theme.surface,
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            zIndex: 10,
          }}
        />

        {/* Screen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: theme.bg,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Status bar */}
          <div
            style={{
              height: NOTCH_H + 2,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 4,
              fontFamily: theme.fontSans,
              fontSize: 11,
              fontWeight: 600,
              color: theme.textMuted,
            }}
          >
            <span>9:41</span>
            <span>●●●</span>
          </div>

          {/* App header */}
          {scene.title && (
            <div
              style={{
                height: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderBottom: `1px solid ${theme.border}`,
                fontFamily: theme.fontSans,
                fontSize: 16,
                fontWeight: 600,
                color: theme.text,
                flexShrink: 0,
              }}
            >
              {scene.title}
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
            {scene.screenshot ? (
              <Img
                src={staticFile(scene.screenshot)}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Search bar */}
                <div
                  style={{
                    height: 34,
                    background: theme.surface,
                    borderRadius: 8,
                    border: `1px solid ${theme.border}`,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 12,
                    paddingRight: 12,
                    fontFamily: theme.fontSans,
                    fontSize: 12,
                    color: theme.textMuted,
                  }}
                >
                  Search...
                </div>
                {/* List items */}
                {[72, 56, 60, 54, 58].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 58,
                      background: theme.surface,
                      borderRadius: 10,
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      paddingLeft: 10,
                      paddingRight: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: theme.accentMuted,
                        border: `1.5px solid ${theme.accent}`,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ height: 11, background: theme.border, borderRadius: 4, width: `${58 + i * 8}%` }} />
                      <div style={{ height: 9, background: theme.border, borderRadius: 4, width: `${38 + i * 6}%`, opacity: 0.6 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div
            style={{
              height: 52,
              borderTop: `1px solid ${theme.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flexShrink: 0,
            }}
          >
            {["⌂", "⊞", "♡", "◉"].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: i === 0 ? theme.accent : theme.textMuted,
                }}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
