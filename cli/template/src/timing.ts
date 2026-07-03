// Shared reveal timing for the two content-length-driven scenes. The duration
// oracle (duration.ts) and the components used to each re-implement this math,
// so they drifted: a long terminal or code block overran its fixed scene length
// and its caption never rendered (F7). Both now import from here, so the scene
// is always long enough for its own content plus its caption.

import { CodeRevealScene, TerminalScene } from "./brief";

export const TERMINAL_START = 8;
export const TERMINAL_FRAMES_PER_LINE = 23;
export const TERMINAL_FRAMES_PER_CHAR = 2.0;

export const CODE_START = 14;
export const CODE_FRAMES_PER_LINE = 9;

// Frames after the caption's start for it to spring in and be read before the
// scene's tail fade begins.
export const CAPTION_HOLD = 40;

export function terminalLines(scene: TerminalScene): Array<{ text: string; isOutput: boolean }> {
  return scene.commands.flatMap((cmd) => [
    { text: cmd.input, isOutput: false },
    { text: cmd.output, isOutput: true },
  ]);
}

// Frames until the last character of the last command has typed out.
export function terminalContentFrames(scene: TerminalScene): number {
  return terminalLines(scene).reduce(
    (acc, line) =>
      acc +
      (line.isOutput
        ? TERMINAL_FRAMES_PER_LINE
        : line.text.length * TERMINAL_FRAMES_PER_CHAR + TERMINAL_FRAMES_PER_LINE),
    0
  );
}

export function terminalCaptionStart(scene: TerminalScene): number {
  return TERMINAL_START + terminalContentFrames(scene) + 20;
}

export function codeLineCount(scene: CodeRevealScene): number {
  return scene.code.split("\n").length;
}

export function codeRevealCaptionStart(scene: CodeRevealScene): number {
  return CODE_START + codeLineCount(scene) * CODE_FRAMES_PER_LINE + 20;
}
