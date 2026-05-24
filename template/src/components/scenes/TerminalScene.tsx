import React from "react";
import { AbsoluteFill } from "remotion";
import { TerminalScene as TerminalBrief } from "../../brief";
import { Theme } from "../../theme";
import { Terminal } from "../primitives/Terminal";

interface Props {
  scene: TerminalBrief;
  theme: Theme;
}

export const TerminalScene: React.FC<Props> = ({ scene, theme }) => {
  const lines = scene.commands.flatMap((cmd) => [
    { text: cmd.input, isOutput: false },
    { text: cmd.output, isOutput: true },
  ]);

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
    </AbsoluteFill>
  );
};
