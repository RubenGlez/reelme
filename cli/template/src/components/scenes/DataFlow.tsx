import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { DataFlowScene as DataFlowBrief } from "../../brief";
import { Theme } from "../../theme";
import { Arrow } from "../primitives/Arrow";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: DataFlowBrief;
  theme: Theme;
  bottomInset?: number;
}

export const DataFlow: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const nodeCount = scene.nodes.length;
  const portrait = height > width;

  // Nodes are substantial cards scaled to the frame and spread across the
  // content band — a chain of thumbnail chips in a vast void reads as a
  // wireframe, not a shot (craft rubric: supporting graphics carry weight).
  // On portrait frames the pipeline runs top-to-bottom instead.
  const NODE_W = portrait ? Math.round(width * 0.52) : Math.round(Math.min(width * 0.19, (width - 280 - 60 * (nodeCount - 1)) / nodeCount));
  const NODE_H = Math.round(NODE_W * 0.34);
  const nodeFont = Math.round(NODE_W * 0.088);

  const positions: Record<string, { x: number; y: number }> = {};
  if (portrait) {
    const gap = Math.min(150, (height * 0.62 - nodeCount * NODE_H) / Math.max(1, nodeCount - 1) + NODE_H);
    const totalH = NODE_H + (nodeCount - 1) * gap;
    const startY = (height - totalH) / 2 - 40;
    scene.nodes.forEach((node, i) => {
      positions[node.id] = { x: (width - NODE_W) / 2, y: startY + i * gap };
    });
  } else {
    const inset = 140;
    const spacing = nodeCount > 1 ? (width - 2 * inset - NODE_W) / (nodeCount - 1) : 0;
    const centerY = height / 2 - NODE_H / 2;
    scene.nodes.forEach((node, i) => {
      positions[node.id] = { x: inset + i * spacing, y: centerY };
    });
  }

  const NODE_SETTLE = 18;
  const ARROW_DRAW = 22;
  const STEP = NODE_SETTLE + ARROW_DRAW; // 40 frames per pair

  const nodeStartFrame = (i: number) => i * STEP;
  const arrowStartFrame = (i: number) => i * STEP + NODE_SETTLE;

  // Caption appears after the last node settles
  const captionStart = (nodeCount - 1) * STEP + NODE_SETTLE + 20;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {/* SVG layer for arrows */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {scene.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          return (
            <Arrow
              key={i}
              x1={portrait ? from.x + NODE_W / 2 : from.x + NODE_W}
              y1={portrait ? from.y + NODE_H : from.y + NODE_H / 2}
              x2={portrait ? to.x + NODE_W / 2 : to.x}
              y2={portrait ? to.y : to.y + NODE_H / 2}
              label={edge.label}
              theme={theme}
              startFrame={arrowStartFrame(i)}
            />
          );
        })}
      </svg>

      {/* Node boxes */}
      {scene.nodes.map((node, i) => {
        const pos = positions[node.id];
        const progress = spring({ frame: frame - nodeStartFrame(i), fps, config: theme.motion });
        const opacity = interpolate(progress, [0, 1], [0, 1]);
        const scale = interpolate(progress, [0, 1], [0.85, 1]);

        const isLast = i === scene.nodes.length - 1;
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: NODE_W,
              height: NODE_H,
              background: theme.surface,
              border: `1.5px solid ${isLast ? theme.accent : theme.border}`,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: Math.round(nodeFont * 0.55),
              fontFamily: theme.fontSans,
              fontSize: nodeFont,
              fontWeight: 650,
              color: theme.text,
              opacity,
              scale: String(scale),
              boxShadow: `0 24px 70px -16px ${theme.accent}4d, 0 12px 40px rgba(0,0,0,0.4)`,
            }}
          >
            {/* Step badge: gives each node graphic weight beyond its label. */}
            <span
              style={{
                fontFamily: theme.fontMono,
                fontSize: Math.round(nodeFont * 0.78),
                fontWeight: 700,
                color: isLast ? theme.accent : theme.textMuted,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {node.label}
          </div>
        );
      })}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
