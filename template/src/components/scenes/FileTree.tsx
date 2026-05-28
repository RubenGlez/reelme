import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { FileTreeScene as FileTreeBrief } from "../../brief";
import { Theme } from "../../theme";
import { Label } from "../primitives/Label";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: FileTreeBrief;
  theme: Theme;
}

const HEADLINE_FRAMES = 20;
const FRAMES_PER_ENTRY = 20;
const INDENT = 28;

function getDepth(path: string): number {
  const clean = path.endsWith("/") ? path.slice(0, -1) : path;
  const segments = clean.split("/").filter(Boolean);
  return Math.max(0, segments.length - 1);
}

function getName(path: string): string {
  const clean = path.endsWith("/") ? path.slice(0, -1) : path;
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

const FolderIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M1 4.5C1 3.67 1.67 3 2.5 3H7L9 5h6.5c.83 0 1.5.67 1.5 1.5v7c0 .83-.67 1.5-1.5 1.5h-13C1.67 15 1 14.33 1 13.5v-9z"
      fill={color}
      opacity={0.9}
    />
  </svg>
);

const FileIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="15" height="18" viewBox="0 0 15 18" fill="none">
    <path d="M2 1h8l4 4v12a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M9 1v5h5" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const FileTree: React.FC<Props> = ({ scene, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const captionStart = HEADLINE_FRAMES + scene.entries.length * FRAMES_PER_ENTRY + 20;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 240px",
      }}
    >
      {scene.headline && (
        <div style={{ marginBottom: 48, alignSelf: "flex-start" }}>
          <Label text={scene.headline} theme={theme} size="lg" startFrame={0} align="left" />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        {scene.entries.map((entry, i) => {
          const entryStart = HEADLINE_FRAMES + i * FRAMES_PER_ENTRY;
          const progress = spring({
            frame: frame - entryStart,
            fps,
            config: theme.motion,
          });
          const opacity = interpolate(Math.max(0, progress), [0, 1], [0, 1]);
          const translateX = interpolate(Math.max(0, progress), [0, 1], [-20, 0]);

          const depth = getDepth(entry.path);
          const name = getName(entry.path);
          const isDir = entry.type === "dir" || entry.path.endsWith("/");
          const isHighlighted = !!entry.highlight;
          const textColor = isHighlighted ? theme.accent : isDir ? theme.text : theme.textMuted;
          const iconColor = isHighlighted ? theme.accent : isDir ? theme.accent : theme.textMuted;

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity,
                transform: `translateX(${translateX}px)`,
                paddingTop: isHighlighted ? 6 : 4,
                paddingBottom: isHighlighted ? 6 : 4,
                paddingLeft: depth * INDENT + 8,
                paddingRight: 12,
                background: isHighlighted ? theme.accentMuted : "transparent",
                borderRadius: isHighlighted ? 6 : 0,
                border: isHighlighted ? `1px solid ${theme.accent}` : "1px solid transparent",
              }}
            >
              {isDir ? <FolderIcon color={iconColor} /> : <FileIcon color={iconColor} />}
              <span
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 22,
                  fontWeight: isDir ? 600 : 400,
                  color: textColor,
                  letterSpacing: "-0.01em",
                }}
              >
                {name}{isDir ? "/" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} />}
    </AbsoluteFill>
  );
};
