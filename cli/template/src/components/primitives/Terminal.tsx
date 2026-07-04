import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
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
  const { width: frameWidth } = useVideoConfig();
  const elapsed = frame - startFrame;
  // Type scales with the frame so the window commands wide canvases instead of
  // floating small in big margins (22px mono on a 1920 frame reads as a
  // thumbnail). ch-based sizing below inherits this automatically.
  const fontSize = Math.max(24, Math.round(frameWidth * 0.0155));

  // Size the window to its widest physical line so a short command doesn't sit
  // in a huge empty box. Width is fixed from the full text (not the partial
  // reveal) so it never reflows while typing. Inputs reserve room for "$ ".
  const maxChars = lines.reduce((max, line) => {
    const prefix = line.isOutput ? 0 : 2;
    const widest = line.text.split("\n").reduce((m, l) => Math.max(m, l.length), 0);
    return Math.max(max, widest + prefix);
  }, 0);
  const cols = Math.min(Math.max(maxChars, 18), 78);
  // Height is reserved for every line up front so the window arrives at its
  // final size and only the text inside it reveals — a box that inflates line
  // by line reads as broken chrome, not as typing (gallery feedback).
  const totalRows = lines.reduce((n, line) => n + line.text.split("\n").length, 0);

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
        borderRadius: 12,
        overflow: "hidden",
        fontFamily: theme.fontMono,
        fontSize,
        // Contact shadow + a brand-light halo: the window casts onto the stage
        // and the stage's light appears to come FROM it, so the content sits
        // in the film instead of floating over it.
        boxShadow: `0 30px 90px -18px ${theme.accent}59, 0 24px 60px rgba(0,0,0,0.55)`,
        outline: "1px solid rgba(255,255,255,0.09)",
        // A definite length (no percentages): inside a shrink-wrapped flex
        // parent a % width resolves against the parent's content size — i.e.
        // the partially typed text — which made the window grow as it typed.
        width: `calc(${cols}ch + 48px)`,
        maxWidth: "100%",
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

      <div style={{ padding: "20px 24px", minHeight: Math.max(120, totalRows * fontSize * 1.6 + 6 * totalRows + 40) }}>
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
                    width: Math.round(fontSize * 0.45),
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
