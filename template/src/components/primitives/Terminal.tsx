import React from "react";
import { useCurrentFrame } from "remotion";
import { Theme } from "../../theme";

interface TerminalLine {
  text: string;
  isOutput?: boolean;
}

interface TerminalProps {
  lines: TerminalLine[];
  theme: Theme;
  startFrame?: number;
  framesPerLine?: number;
  framesPerChar?: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  lines,
  theme,
  startFrame = 0,
  framesPerLine = 23,
  framesPerChar = 2.0,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  const visibleLines: Array<{ text: string; isOutput: boolean; partialText: string }> = [];

  let cursor = 0;
  for (const line of lines) {
    const lineStart = cursor;
    const isOutput = line.isOutput ?? false;

    if (isOutput) {
      if (elapsed >= lineStart) {
        visibleLines.push({ text: line.text, isOutput: true, partialText: line.text });
      }
      cursor += framesPerLine;
    } else {
      if (elapsed >= lineStart) {
        const charsRevealed = Math.floor((elapsed - lineStart) / framesPerChar);
        visibleLines.push({
          text: line.text,
          isOutput: false,
          partialText: line.text.slice(0, charsRevealed),
        });
      }
      cursor += line.text.length * framesPerChar + framesPerLine;
    }
  }

  return (
    <div
      style={{
        background: "#0d1117",
        borderRadius: 10,
        overflow: "hidden",
        fontFamily: theme.fontMono,
        fontSize: 22,
        boxShadow: "0 8px 48px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          background: "#21262d",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {(["#ff5f56", "#ffbd2e", "#27c93f"] as const).map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 8, color: "#8b949e", fontSize: 13 }}>terminal</span>
      </div>

      <div style={{ padding: "20px 24px", minHeight: 120 }}>
        {visibleLines.map((line, i) => {
          const isTyping =
            !line.isOutput &&
            i === visibleLines.length - 1 &&
            line.partialText.length < line.text.length;
          return (
            <div
              key={i}
              style={{ color: line.isOutput ? "#8b949e" : "#e6edf3", marginBottom: 6, lineHeight: 1.6, whiteSpace: "pre" }}
            >
              {!line.isOutput && <span style={{ color: theme.accent, marginRight: 8 }}>$</span>}
              {line.partialText}
              {isTyping && (
                <span
                  style={{
                    display: "inline-block",
                    width: 10,
                    height: "1em",
                    background: theme.accent,
                    verticalAlign: "text-bottom",
                    opacity: Math.floor(elapsed / 15) % 2 === 0 ? 1 : 0,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
