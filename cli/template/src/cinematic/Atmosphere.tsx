import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import chroma from "chroma-js";
import { Theme } from "../theme";
import { CinematicLook } from "./look";

interface Props {
  theme: Theme;
  look: CinematicLook;
  /** "lite" drops grain and softens overlays for gif output. */
  quality: "full" | "lite";
}

/** Slow oscillation in [-1, 1] with a per-axis phase, for drifting lights. */
function drift(frame: number, period: number, phase: number) {
  return Math.sin((frame / period) * Math.PI * 2 + phase);
}

/**
 * The continuous stage the reel is shot on. Rendered once, behind every scene,
 * so the background never resets between cuts — that single fact is what turns
 * a deck of slides into one film. Lights drift slowly over the whole runtime.
 */
export const Atmosphere: React.FC<Props> = ({ theme, look, quality }) => {
  const liveFrame = useCurrentFrame();
  const lite = quality === "lite";
  // Gif output freezes the lights: a frame that changes every tick defeats gif
  // compression and balloons file size. The graded look stays; only motion goes.
  const frame = lite ? 0 : liveFrame;

  const accent = chroma(theme.accent);
  const cool = accent.set("hsl.h", "+150").desaturate(0.8).hex();

  // Primary key light drifts across the upper third.
  const keyX = 50 + drift(frame, 520, 0) * 14;
  const keyY = 32 + drift(frame, 680, 1.3) * 8;
  // Secondary fill light (only on two-tone looks) sweeps the opposite corner.
  const fillX = 24 + drift(frame, 600, 2.1) * 12;
  const fillY = 74 + drift(frame, 740, 0.6) * 10;

  const glowAlpha = look.glow * (lite ? 0.6 : 1);
  // Patterned overlays (1px grid/scanlines) are GIF-compression poison — every
  // frame becomes high-frequency detail. Drop them on the lite path.
  const showOverlay = !lite;
  // Gif compresses flat areas; smooth wide gradients (worst with bright accents)
  // explode its 256-color palette. On lite, the key light is a smaller, tighter
  // pool and the fill light is dropped, leaving most of the frame the flat base.
  const keyGradient = lite
    ? `radial-gradient(42% 38% at ${keyX}% ${keyY}%, ${accent.alpha(0.34 * glowAlpha).css()} 0%, transparent 62%)`
    : `radial-gradient(60% 55% at ${keyX}% ${keyY}%, ${accent.alpha(0.55 * glowAlpha).css()} 0%, ${accent.alpha(0.12 * glowAlpha).css()} 38%, transparent 70%)`;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      {/* Key light */}
      <AbsoluteFill style={{ background: keyGradient }} />
      {/* Fill light */}
      {look.twoTone && !lite && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(55% 50% at ${fillX}% ${fillY}%, ${chroma(cool).alpha(0.4 * glowAlpha).css()} 0%, transparent 68%)`,
          }}
        />
      )}

      {showOverlay && look.overlay === "grid" && <GridOverlay color={theme.border} lite={lite} />}
      {showOverlay && look.overlay === "scanlines" && <Scanlines lite={lite} />}

      {/* Grade pass: a subtle full-frame tint that unifies the palette. */}
      <AbsoluteFill
        style={{
          background: look.grade.color,
          mixBlendMode: look.grade.blend,
          opacity: look.grade.alpha * (lite ? 0.5 : 1),
        }}
      />

      {/* Vignette: darkens the edges so the eye stays centered. Softened on lite
          so the gif stays mostly flat base color and compresses. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 120% at 50% 48%, transparent 45%, rgba(0,0,0,${lite ? Math.min(look.vignette, 0.22) : look.vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const GridOverlay: React.FC<{ color: string; lite: boolean }> = ({ color, lite }) => {
  const frame = useCurrentFrame();
  const shift = lite ? 0 : (frame * 0.15) % 64;
  const line = chroma(color).alpha(0.12).css();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
        backgroundPosition: `${shift}px ${shift}px`,
        maskImage: "radial-gradient(120% 100% at 50% 50%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(120% 100% at 50% 50%, black 30%, transparent 80%)",
      }}
    />
  );
};

const Scanlines: React.FC<{ lite: boolean }> = ({ lite }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,${lite ? 0.04 : 0.07}) 0px, rgba(0,0,0,${lite ? 0.04 : 0.07}) 1px, transparent 2px, transparent 4px)`,
    }}
  />
);

/**
 * Film grain laid over the finished frame. Animated for video (a fresh noise
 * tile every couple of frames reads as real grain); skipped entirely for gif,
 * where it would balloon file size for no benefit.
 */
export const Grain: React.FC<{ look: CinematicLook }> = ({ look }) => {
  const frame = useCurrentFrame();
  if (look.grain <= 0) return null;
  // Step the noise so it shimmers without recomputing every single frame.
  const seed = Math.floor(frame / 2);
  const baseFreq = 0.9;
  const turbulence = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${baseFreq}' numOctaves='2' seed='${seed % 97}' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>`;
  const url = `data:image/svg+xml;utf8,${turbulence}`;
  const jitter = interpolate(random(`grain-${seed}`), [0, 1], [-4, 4]);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url("${url}")`,
        backgroundSize: "180px 180px",
        backgroundPosition: `${jitter}px ${-jitter}px`,
        opacity: look.grain,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  );
};
