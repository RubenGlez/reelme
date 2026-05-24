import React from "react";
import { AbsoluteFill } from "remotion";
import { TerminalScene as TerminalBrief } from "../../brief";
import { Theme } from "../../theme";
import { Terminal } from "../primitives/Terminal";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: TerminalBrief;
  theme: Theme;
}

export const TerminalScene: React.FC<Props> = ({ scene, theme }) => {
  const lines = scene.commands.flatMap((cmd) => [
    { text: cmd.input, isOutput: false },
    { text: cmd.output, isOutput: true },
  ]);

  // Mirror Terminal's timing: startFrame=8, framesPerLine=23, framesPerChar=2.0
  const terminalDuration = lines.reduce((acc, line) => {
    return acc + (line.isOutput ? 23 : line.text.length * 2.0 + 23);
  }, 0);
  const captionStart = 8 + terminalDuration + 20;

  return (
    <AbsoluteFill
      style={{
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 100px",
      }}
    >
      <div style={{ width: "100%" }}>
        <Terminal lines={lines} theme={theme} startFrame={8} />
      </div>
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} />}
    </AbsoluteFill>
  );
};
