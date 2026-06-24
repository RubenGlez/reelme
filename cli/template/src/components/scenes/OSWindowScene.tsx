import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { OSWindowScene as OSWindowBrief } from "../../brief";
import { Theme } from "../../theme";
import { Icon } from "../primitives/Icon";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: OSWindowBrief;
  theme: Theme;
  bottomInset?: number;
}

const WINDOW_WIDTH = 600;
const SEARCH_TYPE_START = 18;
const FRAMES_PER_CHAR = 3;
const ITEMS_START_OFFSET = 10;
const FRAMES_PER_ITEM = 20;

const TRAFFIC_LIGHTS = ["#ff5f57", "#ffbd2e", "#28c941"] as const;

export const OSWindow: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowProgress = spring({ frame, fps, config: theme.motion });
  const windowScale = interpolate(windowProgress, [0, 1], [0.88, 1]);
  const windowOpacity = interpolate(windowProgress, [0, 1], [0, 1]);

  const query = scene.searchQuery ?? "";
  const charsVisible = Math.max(0, Math.floor((frame - SEARCH_TYPE_START) / FRAMES_PER_CHAR));
  const typedText = query.slice(0, charsVisible);

  const itemsStart = query
    ? SEARCH_TYPE_START + query.length * FRAMES_PER_CHAR + ITEMS_START_OFFSET
    : 20;
  const captionStart = itemsStart + (scene.items?.length ?? 0) * FRAMES_PER_ITEM + 20;

  return (
    <AbsoluteFill
      style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div
        style={{
          width: WINDOW_WIDTH,
          borderRadius: 14,
          overflow: "hidden",
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          boxShadow: "0 40px 100px rgba(0,0,0,0.45), 0 0 0 0.5px rgba(255,255,255,0.05)",
          transform: `scale(${windowScale})`,
          opacity: windowOpacity,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: `1px solid ${theme.border}`,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            {TRAFFIC_LIGHTS.map((color, i) => (
              <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: color }} />
            ))}
          </div>
          {scene.title && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: theme.fontSans,
                fontSize: 13,
                fontWeight: 500,
                color: theme.textMuted,
                letterSpacing: "0.01em",
              }}
            >
              {scene.title}
            </div>
          )}
        </div>

        {/* Search bar */}
        {scene.searchQuery !== undefined && (
          <div style={{ padding: "10px 12px", borderBottom: `1px solid ${theme.border}` }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: theme.bg,
                borderRadius: 8,
                padding: "8px 12px",
                border: `1px solid ${theme.border}`,
              }}
            >
              <Icon name="search" size={15} color={theme.textMuted} />
              <span style={{ fontFamily: theme.fontSans, fontSize: 14, color: typedText ? theme.text : theme.textMuted }}>
                {typedText || "Search…"}
              </span>
            </div>
          </div>
        )}

        {/* Item list */}
        <div style={{ padding: "6px 0" }}>
          {(scene.items ?? []).map((item, i) => {
            const itemStart = itemsStart + i * FRAMES_PER_ITEM;
            const p = spring({ frame: frame - itemStart, fps, config: theme.motion });
            const opacity = interpolate(Math.max(0, p), [0, 1], [0, 1]);
            const tx = interpolate(Math.max(0, p), [0, 1], [-14, 0]);

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 14px",
                  background: item.highlighted ? theme.accentMuted : "transparent",
                  opacity,
                  transform: `translateX(${tx}px)`,
                }}
              >
                {item.icon && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: theme.accentMuted,
                      border: `1px solid ${theme.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={item.icon} size={15} color={theme.accent} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: theme.fontMono, fontSize: 13, fontWeight: 500, color: theme.text }}>
                    {item.label}
                  </div>
                  {item.value && (
                    <div style={{ fontFamily: theme.fontMono, fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                      {item.value}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
