import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from "remotion";
import { Theme } from "../../theme";

interface RevealTextProps {
  text: string;
  theme: Theme;
  fontSize: number;
  startFrame?: number;
  fontWeight?: number;
  color?: string;
  /** A whole word (or exact substring) rendered in the accent color. */
  emphasis?: string;
  align?: "left" | "center" | "right";
  /** Frames between each word's rise. */
  stagger?: number;
  letterSpacing?: string;
  lineHeight?: number;
  /** Soft shadow so the type sits in the lit scene instead of floating flat. */
  glow?: boolean;
  maxWidth?: number;
}

/**
 * Masked kinetic typography: each word rises out from behind a clip edge with a
 * staggered spring — the headline reveal used in premium launch films, not a
 * flat fade. Words wrap naturally; descenders are preserved by the mask padding.
 */
export const RevealText: React.FC<RevealTextProps> = ({
  text,
  theme,
  fontSize,
  startFrame = 0,
  fontWeight = 800,
  color,
  emphasis,
  align = "center",
  stagger = 3,
  letterSpacing = "-0.03em",
  lineHeight = 1.06,
  glow = true,
  maxWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  // Resolve which word indices the accent covers. A multi-word accent phrase
  // ("one command") must emphasize the whole contiguous run, not silently no-op
  // because no single word equals the phrase (F2). Punctuation is stripped from
  // both sides so "video." matches "video".
  const clean = (w: string) => w.replace(/[.,!?:;]/g, "").toLowerCase();
  const cleanedWords = words.map(clean);
  const emphIndices = new Set<number>();
  const accentWords = emphasis?.trim() ? emphasis.trim().split(/\s+/).map(clean).filter(Boolean) : [];
  if (accentWords.length === 1) {
    const a = accentWords[0];
    cleanedWords.forEach((c, i) => {
      if (c === a || c.includes(a)) emphIndices.add(i);
    });
  } else if (accentWords.length > 1) {
    for (let i = 0; i + accentWords.length <= cleanedWords.length; i++) {
      const matches = accentWords.every((a, j) => {
        const c = cleanedWords[i + j];
        return c === a || c.includes(a);
      });
      if (matches) accentWords.forEach((_, j) => emphIndices.add(i + j));
    }
  }

  return (
    <div
      style={{
        fontFamily: theme.fontSans,
        fontSize,
        fontWeight,
        color: color ?? theme.text,
        textAlign: align,
        lineHeight,
        letterSpacing,
        maxWidth,
      }}
    >
      {words.map((word, i) => {
        const elapsed = frame - startFrame - i * stagger;
        const p = spring({ frame: elapsed, fps, config: theme.motion });
        const y = interpolate(p, [0, 1], [112, 0], { extrapolateRight: "clamp" });
        const opacity = interpolate(elapsed, [0, 6], [0, 1], {
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const isEmph = emphIndices.has(i);
        // The clip mask exists only for the rise. Once the word is at rest the
        // mask is released and the glow fades in — a soft 40px shadow inside an
        // overflow-hidden span gets sheared into visible rectangles, so the two
        // must never coexist (gallery feedback: "shadow looks cut off").
        const settled = y < 1;
        const shadowAlpha = glow && settled ? interpolate(p, [0.991, 1], [0, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: settled ? "visible" : "hidden",
                paddingBottom: "0.14em",
                marginBottom: "-0.14em",
                verticalAlign: "bottom",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  translate: `0 ${y}%`,
                  opacity,
                  color: isEmph ? theme.accent : undefined,
                  textShadow: shadowAlpha > 0 ? `0 6px 40px rgba(0,0,0,${shadowAlpha.toFixed(3)})` : undefined,
                }}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
