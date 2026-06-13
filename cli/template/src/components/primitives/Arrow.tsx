import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Theme } from "../../theme";

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
  theme: Theme;
  startFrame?: number;
}

const ARROW_HEAD_SIZE = 10;

export const Arrow: React.FC<ArrowProps> = ({ x1, y1, x2, y2, label, theme, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({ frame: elapsed, fps, config: theme.motion });

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angleRad = Math.atan2(dy, dx);
  const angleDeg = (angleRad * 180) / Math.PI;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  // Shorten the line so it doesn't peek out behind the arrowhead
  const x2short = x2 - Math.cos(angleRad) * ARROW_HEAD_SIZE;
  const y2short = y2 - Math.sin(angleRad) * ARROW_HEAD_SIZE;

  const dashOffset = interpolate(progress, [0, 1], [len, 0]);

  // Arrowhead appears only in the last 15% of the draw animation
  const headOpacity = interpolate(progress, [0.85, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g>
      {/* Animated line, shortened so arrowhead sits cleanly at the tip */}
      <line
        x1={x1}
        y1={y1}
        x2={x2short}
        y2={y2short}
        stroke={theme.accent}
        strokeWidth={2.5}
        strokeDasharray={len}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
      />

      {/* Arrowhead — a triangle rendered at (x2, y2), rotated to face the direction of travel */}
      <polygon
        points={`0,0 ${-ARROW_HEAD_SIZE},${-ARROW_HEAD_SIZE / 2} ${-ARROW_HEAD_SIZE},${ARROW_HEAD_SIZE / 2}`}
        fill={theme.accent}
        transform={`translate(${x2}, ${y2}) rotate(${angleDeg})`}
        opacity={headOpacity}
      />

      {/* Edge label — appears in the second half of the draw */}
      {label && progress > 0.5 && (
        <text
          x={midX}
          y={midY - 10}
          fill={theme.textMuted}
          fontSize={15}
          textAnchor="middle"
          fontFamily={theme.fontSans}
          opacity={interpolate(progress, [0.5, 1], [0, 1])}
        >
          {label}
        </text>
      )}
    </g>
  );
};
