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
  const emphWord = emphasis?.trim().toLowerCase();

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
        textShadow: glow ? "0 6px 40px rgba(0,0,0,0.45)" : undefined,
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
        const clean = word.replace(/[.,!?:;]/g, "").toLowerCase();
        const isEmph = emphWord && (clean === emphWord || word.toLowerCase().includes(emphWord));
        return (
          <React.Fragment key={i}>
            <span
              style={{
                display: "inline-block",
                overflow: "hidden",
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
