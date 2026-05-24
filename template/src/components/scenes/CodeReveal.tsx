import React from "react";
import { AbsoluteFill } from "remotion";
import { CodeRevealScene as CodeRevealBrief } from "../../brief";
import { Theme } from "../../theme";
import { CodeBlock } from "../primitives/CodeBlock";

interface Props {
  scene: CodeRevealBrief;
  theme: Theme;
}

export const CodeReveal: React.FC<Props> = ({ scene, theme }) => {
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
        <CodeBlock
          code={scene.code}
          language={scene.language}
          highlightLine={scene.highlightLine}
          caption={scene.caption}
          theme={theme}
          startFrame={8}
          framesPerLine={5}
        />
      </div>
    </AbsoluteFill>
  );
};
