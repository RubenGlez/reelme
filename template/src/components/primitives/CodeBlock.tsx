import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { Theme } from "../../theme";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLine?: number;
  caption?: string;
  theme: Theme;
  startFrame?: number;
  framesPerLine?: number;
}

function tokenize(line: string, _lang: string): Array<{ text: string; color: string }> {
  // Minimal tokenizer — keywords, strings, comments, numbers
  const segments: Array<{ text: string; color: string }> = [];
  const keywords = /\b(import|export|from|const|let|var|function|return|async|await|if|else|for|while|class|new|this|true|false|null|undefined|type|interface|extends|implements|of|in|default)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b\d+\.?\d*\b/g;

  // We'll do a simple pass: mark regions with their type
  const marks: Array<{ start: number; end: number; color: string }> = [];

  for (const re of [
    { re: comments, color: "#8b949e" },
    { re: strings, color: "#a5d6ff" },
    { re: keywords, color: "#ff7b72" },
    { re: numbers, color: "#79c0ff" },
  ]) {
    let m: RegExpExecArray | null;
    re.re.lastIndex = 0;
    while ((m = re.re.exec(line)) !== null) {
      // Only add if no overlap
      const start = m.index;
      const end = m.index + m[0].length;
      const overlap = marks.some((mk) => mk.start < end && mk.end > start);
      if (!overlap) marks.push({ start, end, color: re.color });
    }
  }

  marks.sort((a, b) => a.start - b.start);

  let pos = 0;
  for (const mk of marks) {
    if (pos < mk.start) segments.push({ text: line.slice(pos, mk.start), color: "#e6edf3" });
    segments.push({ text: line.slice(mk.start, mk.end), color: mk.color });
    pos = mk.end;
  }
  if (pos < line.length) segments.push({ text: line.slice(pos), color: "#e6edf3" });

  return segments.length > 0 ? segments : [{ text: line, color: "#e6edf3" }];
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "ts",
  highlightLine,
  caption,
  theme,
  startFrame = 0,
  framesPerLine = 9,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elapsed = frame - startFrame;
  const lines = code.split("\n");
  const visibleCount = Math.max(0, Math.min(lines.length, Math.floor(elapsed / framesPerLine) + 1));

  return (
    <div style={{ fontFamily: theme.fontMono, fontSize: 20, lineHeight: 1.7 }}>
      <div
        style={{
          background: "#0d1117",
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            background: "#161b22",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid #21262d",
          }}
        >
          {(["#ff5f56", "#ffbd2e", "#27c93f"] as const).map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
          <span style={{ marginLeft: 8, color: "#8b949e", fontSize: 13 }}>
            {language === "ts" ? "index.ts" : language === "py" ? "main.py" : language === "rs" ? "main.rs" : `code.${language}`}
          </span>
        </div>

        {/* Code lines */}
        <div style={{ padding: "20px 0" }}>
          {lines.slice(0, visibleCount).map((line, i) => {
            const lineNum = i + 1;
            const isHighlight = highlightLine !== undefined && lineNum === highlightLine;
            const highlightOpacity =
              highlightLine !== undefined && visibleCount >= highlightLine
                ? interpolate(
                    spring({ frame: elapsed - highlightLine * framesPerLine, fps, config: { damping: 20 } }),
                    [0, 1],
                    [0, 1]
                  )
                : 0;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  padding: "0 24px",
                  background: isHighlight
                    ? `rgba(${hexToRgb(theme.accent)}, ${0.15 * highlightOpacity})`
                    : "transparent",
                  borderLeft: isHighlight
                    ? `3px solid rgba(${hexToRgb(theme.accent)}, ${highlightOpacity})`
                    : "3px solid transparent",
                }}
              >
                <span
                  style={{
                    color: "#484f58",
                    minWidth: 32,
                    userSelect: "none",
                    fontSize: 16,
                    paddingTop: 1,
                  }}
                >
                  {lineNum}
                </span>
                <span style={{ whiteSpace: "pre" }}>
                  {tokenize(line, language).map((seg, j) => (
                    <span key={j} style={{ color: seg.color }}>
                      {seg.text}
                    </span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {caption && visibleCount >= lines.length && (
        <div
          style={{
            marginTop: 16,
            textAlign: "center",
            color: theme.textMuted,
            fontSize: 18,
            fontFamily: theme.fontSans,
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
