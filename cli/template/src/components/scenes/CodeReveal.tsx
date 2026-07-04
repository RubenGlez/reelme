import React from "react";
import { AbsoluteFill } from "remotion";
import { CodeRevealScene as CodeRevealBrief } from "../../brief";
import { Theme } from "../../theme";
import { CodeBlock } from "../primitives/CodeBlock";
import { Caption } from "../primitives/Caption";
import { CODE_FRAMES_PER_LINE, CODE_START, codeRevealCaptionStart } from "../../timing";

interface Props {
  scene: CodeRevealBrief;
  theme: Theme;
  bottomInset?: number;
}

export const CodeReveal: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  // Timing is shared with the duration oracle so the scene lasts long enough for
  // every line to reveal and the caption to appear (see timing.ts).
  const captionStart = codeRevealCaptionStart(scene);

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
      <CodeBlock
        code={scene.code}
        language={scene.language}
        highlightLine={scene.highlightLine}
        theme={theme}
        startFrame={CODE_START}
        framesPerLine={CODE_FRAMES_PER_LINE}
      />
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
