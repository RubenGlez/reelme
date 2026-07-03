import React from "react";
import { AbsoluteFill } from "remotion";
import { TerminalScene as TerminalBrief } from "../../brief";
import { Theme } from "../../theme";
import { Terminal } from "../primitives/Terminal";
import { Caption } from "../primitives/Caption";
import { TERMINAL_FRAMES_PER_CHAR, TERMINAL_FRAMES_PER_LINE, TERMINAL_START, terminalCaptionStart, terminalLines } from "../../timing";

interface Props {
  scene: TerminalBrief;
  theme: Theme;
  bottomInset?: number;
}

export const TerminalScene: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const lines = terminalLines(scene);
  // Timing is shared with the duration oracle so the scene is always long
  // enough for the caption to appear (see timing.ts).
  const captionStart = terminalCaptionStart(scene);

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 100px",
      }}
    >
      <Terminal
        lines={lines}
        theme={theme}
        startFrame={TERMINAL_START}
        framesPerLine={TERMINAL_FRAMES_PER_LINE}
        framesPerChar={TERMINAL_FRAMES_PER_CHAR}
      />
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
