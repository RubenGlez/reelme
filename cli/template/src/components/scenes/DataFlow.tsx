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

const NODE_W = 200;
const NODE_H = 64;

export const DataFlow: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const nodeCount = scene.nodes.length;
  const spacing = Math.min(320, (width - 240) / nodeCount);
  const startX = (width - spacing * (nodeCount - 1) - NODE_W) / 2;
  const centerY = height / 2 - NODE_H / 2;

  const positions: Record<string, { x: number; y: number }> = {};
  scene.nodes.forEach((node, i) => {
    positions[node.id] = { x: startX + i * spacing, y: centerY };
  });

  const NODE_SETTLE = 18;
  const ARROW_DRAW = 22;
  const STEP = NODE_SETTLE + ARROW_DRAW; // 40 frames per pair

  const nodeStartFrame = (i: number) => i * STEP;
  const arrowStartFrame = (i: number) => i * STEP + NODE_SETTLE;

  // Caption appears after the last node settles
  const captionStart = (nodeCount - 1) * STEP + NODE_SETTLE + 20;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* SVG layer for arrows */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {scene.edges.map((edge, i) => {
          const from = positions[edge.from];
          const to = positions[edge.to];
          if (!from || !to) return null;
          return (
            <Arrow
              key={i}
              x1={from.x + NODE_W}
              y1={from.y + NODE_H / 2}
              x2={to.x}
              y2={to.y + NODE_H / 2}
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
              border: `1.5px solid ${theme.border}`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.fontSans,
              fontSize: 18,
              fontWeight: 600,
              color: theme.text,
              opacity,
              transform: `scale(${scale})`,
              boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
            }}
          >
            {node.label}
          </div>
        );
      })}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
