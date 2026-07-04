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
 * a deck of slides into one film.
 *
 * Each look stages the film on a distinct backdrop SYSTEM (look.backdrop)
 * instead of one shared orb recipe. The system covers the frame with intent —
 * a full gradient field, a structural grid, an aimed light — so no region is
 * ever a flat void with a detached glow floating in it.
 */
export const Atmosphere: React.FC<Props> = ({ theme, look, quality }) => {
  const liveFrame = useCurrentFrame();
  const lite = quality === "lite";
  // Gif output freezes the motion: a frame that changes every tick defeats gif
  // compression and balloons file size. The graded look stays; only motion goes.
  const frame = lite ? 0 : liveFrame;

  // Patterned overlays (1px grid/scanlines) are GIF-compression poison — every
  // frame becomes high-frequency detail. Drop them on the lite path.
  const showOverlay = !lite;

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <Backdrop theme={theme} look={look} frame={frame} lite={lite} />

      {showOverlay && look.overlay === "grid" && look.backdrop !== "grid" && (
        <GridOverlay color={theme.border} lite={lite} />
      )}
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

/** Dispatch to the look's backdrop system. */
const Backdrop: React.FC<{ theme: Theme; look: CinematicLook; frame: number; lite: boolean }> = ({
  theme,
  look,
  frame,
  lite,
}) => {
  const accent = chroma(theme.accent);
  const accent2 = chroma(theme.accent2);
  // On light stages the color has to stay pastel or text contrast dies.
  const lightBg = chroma(theme.bg).luminance() > 0.5;
  // Lite keeps most of the backdrop's identity: at half strength the gif's
  // stage read as a flat dark void, which is exactly the look this system
  // replaced. Slightly larger gif files are the accepted price.
  const k = look.glow * (lite ? 0.75 : 1) * (lightBg ? 0.5 : 1);

  switch (look.backdrop) {
    case "mesh": {
      // Full-bleed gradient field: three large soft color poles (brand hue,
      // second hue, and a deep counter-tone) drifting very slowly. The whole
      // frame carries color variation — no dead flat region, no orb smudge.
      const ax = 22 + drift(frame, 620, 0) * 10;
      const ay = 24 + drift(frame, 760, 1.1) * 8;
      const bx = 80 + drift(frame, 680, 2.3) * 10;
      const by = 30 + drift(frame, 820, 0.5) * 10;
      const cx = 55 + drift(frame, 720, 3.4) * 12;
      const cy = 92 + drift(frame, 900, 1.9) * 6;
      const deep = accent.set("hsl.h", "-30").darken(1.2);
      return (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(70% 65% at ${ax}% ${ay}%, ${accent.alpha(0.5 * k).css()} 0%, transparent 72%)`,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(65% 60% at ${bx}% ${by}%, ${accent2.alpha(0.38 * k).css()} 0%, transparent 70%)`,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(80% 55% at ${cx}% ${cy}%, ${deep.alpha(0.4 * k).css()} 0%, transparent 75%)`,
            }}
          />
        </>
      );
    }

    case "spotlight": {
      // One aimed light: an elliptical pool centered on the content zone
      // (slightly above frame center), like a subject lit on a dark stage.
      // The light falls ON the content instead of drifting in empty space.
      const sway = drift(frame, 780, 0.4) * 3;
      const warm = accent.brighten(0.4);
      return (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(52% 44% at ${50 + sway}% 42%, ${warm.alpha(0.34 * k).css()} 0%, ${warm.alpha(0.08 * k).css()} 55%, transparent 74%)`,
            }}
          />
          {/* Faint floor bounce so the lower frame isn't pure void. */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(90% 30% at 50% 104%, ${accent2.alpha(0.14 * k).css()} 0%, transparent 70%)`,
            }}
          />
        </>
      );
    }

    case "sweep": {
      // Saturated full-frame diagonal wash between the two brand hues, with a
      // slow-moving highlight band. Vibrant edge to edge — arcade energy comes
      // from color, not from floating lights.
      const shiftA = 12 + drift(frame, 560, 0.8) * 8;
      const shiftB = 88 + drift(frame, 640, 2.6) * 8;
      const bandY = 50 + drift(frame, 700, 1.5) * 16;
      return (
        <>
          <AbsoluteFill
            style={{
              background: `linear-gradient(128deg, ${accent.alpha(0.42 * k).css()} 0%, transparent ${shiftA + 34}%), linear-gradient(308deg, ${accent2.alpha(0.36 * k).css()} 0%, transparent ${100 - shiftB + 42}%)`,
            }}
          />
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, transparent ${bandY - 24}%, ${accent.brighten(1).alpha(0.1 * k).css()} ${bandY}%, transparent ${bandY + 24}%)`,
            }}
          />
        </>
      );
    }

    case "grid": {
      // The engineering grid IS the backdrop: structural lines with a soft
      // cool wash rising from the baseline. Reads as a drafting table, not a
      // dark room with a lamp.
      return (
        <>
          <AbsoluteFill
            style={{
              background: `linear-gradient(180deg, transparent 55%, ${accent.alpha(0.16 * k).css()} 100%)`,
            }}
          />
          <StructuralGrid color={theme.border} accent={theme.accent} frame={frame} lite={lite} />
        </>
      );
    }

    case "field":
    default: {
      // Editorial poster field: a rich duotone wash — second hue at the top,
      // brand hue rising from below — over the deep base. Near-solid, carried
      // by grain and grade rather than by lights.
      return (
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${accent2.alpha(0.2 * k).css()} 0%, transparent 40%, transparent 62%, ${accent.alpha(0.3 * k).css()} 100%)`,
          }}
        />
      );
    }
  }
};

/**
 * Blueprint's structural grid: minor + major lines and a center crosshair
 * tick, strong enough to read as the actual set design instead of a texture.
 */
const StructuralGrid: React.FC<{ color: string; accent: string; frame: number; lite: boolean }> = ({
  color,
  accent,
  frame,
  lite,
}) => {
  const shift = lite ? 0 : (frame * 0.12) % 72;
  const minor = chroma(color).alpha(lite ? 0.08 : 0.13).css();
  const major = chroma(color).alpha(lite ? 0.14 : 0.22).css();
  const tick = chroma(accent).alpha(0.4).css();
  return (
    <>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${minor} 1px, transparent 1px), linear-gradient(90deg, ${minor} 1px, transparent 1px), linear-gradient(${major} 1px, transparent 1px), linear-gradient(90deg, ${major} 1px, transparent 1px)`,
          backgroundSize: "72px 72px, 72px 72px, 360px 360px, 360px 360px",
          backgroundPosition: `${shift}px ${shift}px`,
          maskImage: "radial-gradient(130% 110% at 50% 50%, black 35%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(130% 110% at 50% 50%, black 35%, transparent 85%)",
        }}
      />
      {/* Center crosshair tick: the drafting-table registration mark. */}
      {!lite && (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 28, height: 28, opacity: 0.5 }}>
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: tick }} />
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: tick }} />
          </div>
        </AbsoluteFill>
      )}
    </>
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
