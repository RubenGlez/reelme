import React from "react";
import { AbsoluteFill } from "remotion";
import { CodeRevealScene as CodeRevealBrief } from "../../brief";
import { Theme } from "../../theme";
import { CodeBlock } from "../primitives/CodeBlock";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: CodeRevealBrief;
  theme: Theme;
  bottomInset?: number;
}

export const CodeReveal: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const lines = scene.code.split("\n");
  // Caption appears after all lines are revealed: startFrame=14, framesPerLine=9, plus 20-frame buffer
  const captionStart = 14 + lines.length * 9 + 20;

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
      <div style={{ width: "100%" }}>
        <CodeBlock
          code={scene.code}
          language={scene.language}
          highlightLine={scene.highlightLine}
          theme={theme}
          startFrame={14}
          framesPerLine={9}
        />
      </div>
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
