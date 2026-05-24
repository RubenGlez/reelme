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

export const Arrow: React.FC<ArrowProps> = ({ x1, y1, x2, y2, label, theme, startFrame = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;

  const progress = spring({ frame: elapsed, fps, config: { damping: 20, stiffness: 80 } });
  const dashOffset = interpolate(progress, [0, 1], [200, 0]);

  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <g>
      <defs>
        <marker id={`arrow-${x1}-${y1}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={theme.accent} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={theme.accent}
        strokeWidth={2.5}
        strokeDasharray={len}
        strokeDashoffset={dashOffset * (len / 200)}
        markerEnd={`url(#arrow-${x1}-${y1})`}
        strokeLinecap="round"
      />
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
