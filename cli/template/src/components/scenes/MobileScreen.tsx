import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from "remotion";
import { MobileScene as MobileBrief } from "../../brief";
import { Theme } from "../../theme";
import { PlatformPreset } from "../../platforms";
import { Caption } from "../primitives/Caption";
import { Icon } from "../primitives/Icon";

interface Props {
  scene: MobileBrief;
  theme: Theme;
  platform?: PlatformPreset;
  bottomInset?: number;
}

const PHONE_W = 384;
const PHONE_H = 808;
const NOTCH_H = 32;
const RADIUS = 46;

export const MobileScreen: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = height > width;
  const hasCopy = Boolean(scene.headline || (scene.points && scene.points.length > 0));

  // Phone entrance.
  const progress = spring({ frame, fps, config: theme.motion });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [60, 0]);
  const enterScale = interpolate(progress, [0, 1], [0.9, 1]);

  // The phone is a fixed 384×808 device; scale it to the frame. With copy beside
  // it (landscape) or above it (vertical) it sits a touch smaller to share the
  // frame; on its own it grows to command the height.
  const targetH = hasCopy
    ? (portrait ? height * 0.56 : height * 0.84)
    : (portrait ? height * 0.74 : height * 0.84);
  const fit = targetH / PHONE_H;

  // The wrapper takes the *scaled* footprint so the device occupies a real
  // layout slot — a bare transform:scale would resize the phone visually while
  // its box stayed 808px tall, overlapping copy stacked above it on vertical cuts.
  const phone = (
    <div
      style={{
        width: PHONE_W * fit,
        height: PHONE_H * fit,
        flexShrink: 0,
        opacity,
        translate: `0 ${translateY}px`,
      }}
    >
      <div style={{ scale: String(enterScale * fit), transformOrigin: "top left" }}>
        <PhoneFrame scene={scene} theme={theme} frame={frame} fps={fps} />
      </div>
    </div>
  );

  // Single centered device when no copy is supplied (composed symmetric margins).
  if (!hasCopy) {
    return (
      <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {phone}
        {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} bottomInset={bottomInset} />}
      </AbsoluteFill>
    );
  }

  const copy = <CopyColumn scene={scene} theme={theme} frame={frame} fps={fps} portrait={portrait} width={width} />;

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: portrait ? "column" : "row",
        alignItems: "center",
        justifyContent: portrait ? "center" : "space-between",
        gap: portrait ? 12 : 80,
        padding: portrait ? "0 80px" : "0 130px",
      }}
    >
      {copy}
      {phone}
      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={50} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};

/** Headline + supporting bullets that balance the device. */
const CopyColumn: React.FC<{
  scene: MobileBrief;
  theme: Theme;
  frame: number;
  fps: number;
  portrait: boolean;
  width: number;
}> = ({ scene, theme, frame, fps, portrait, width }) => {
  const headlineSize = portrait ? Math.round(width * 0.06) : Math.round(width * 0.032);
  const pointSize = portrait ? Math.round(width * 0.032) : Math.round(width * 0.019);

  const headP = spring({ frame: frame - 6, fps, config: theme.motion });
  const headOpacity = interpolate(headP, [0, 1], [0, 1]);
  const headShift = interpolate(headP, [0, 1], [portrait ? 18 : -28, 0]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: portrait ? 22 : 30,
        maxWidth: portrait ? width * 0.82 : width * 0.44,
        alignItems: portrait ? "center" : "flex-start",
        textAlign: portrait ? "center" : "left",
      }}
    >
      {scene.headline && (
        <div
          style={{
            opacity: headOpacity,
            translate: portrait ? `0 ${headShift}px` : `${headShift}px 0`,
            fontFamily: theme.fontSans,
            fontSize: headlineSize,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            color: theme.text,
          }}
        >
          {scene.headline}
        </div>
      )}

      {scene.points && scene.points.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: portrait ? 16 : 20 }}>
          {scene.points.map((point, i) => {
            const p = spring({ frame: frame - 18 - i * 7, fps, config: theme.motion });
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  opacity: interpolate(p, [0, 1], [0, 1]),
                  translate: `${interpolate(p, [0, 1], [portrait ? 0 : -16, 0])}px 0`,
                }}
              >
                <Icon name="check" size={Math.round(pointSize * 0.95)} color={theme.accent} />
                <span style={{ fontFamily: theme.fontSans, fontSize: pointSize, fontWeight: 500, color: theme.text, lineHeight: 1.3 }}>
                  {point}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** The fixed-size device. Scaled to the frame by its parent. */
const PhoneFrame: React.FC<{ scene: MobileBrief; theme: Theme; frame: number; fps: number }> = ({ scene, theme, frame, fps }) => {
  return (
    <div
      style={{
        width: PHONE_W,
        height: PHONE_H,
        borderRadius: RADIUS,
        border: `3px solid ${theme.border}`,
        background: theme.surface,
        boxShadow: `0 30px 100px -20px ${theme.accent}59, 0 50px 120px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 120,
          height: NOTCH_H,
          background: theme.surface,
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          zIndex: 10,
        }}
      />

      {/* Screen */}
      <div style={{ position: "absolute", inset: 0, background: theme.bg, display: "flex", flexDirection: "column" }}>
        {/* Status bar */}
        <div
          style={{
            height: NOTCH_H + 2,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            paddingLeft: 22,
            paddingRight: 22,
            paddingBottom: 4,
            fontFamily: theme.fontSans,
            fontSize: 12,
            fontWeight: 600,
            color: theme.text,
            flexShrink: 0,
          }}
        >
          <span>9:41</span>
          <span style={{ letterSpacing: 1 }}>●●●</span>
        </div>

        {/* App header */}
        {scene.title && (
          <div
            style={{
              height: 52,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 18px",
              borderBottom: `1px solid ${theme.border}`,
              fontFamily: theme.fontSans,
              fontSize: 17,
              fontWeight: 700,
              color: theme.text,
              flexShrink: 0,
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: theme.accent }} />
            {scene.title}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {scene.screenshot ? (
            // Held static: the screenshot reads as the app's real screen, not a
            // slowly zooming still. (A moving screenshot also re-encodes the
            // whole screen area every frame and balloons the gif.)
            <Img
              src={staticFile(scene.screenshot)}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          ) : (
            <MockFeed theme={theme} frame={frame} fps={fps} />
          )}
        </div>

        {/* Bottom nav */}
        <div
          style={{
            height: 56,
            borderTop: `1px solid ${theme.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            flexShrink: 0,
            background: theme.surface,
          }}
        >
          {["⌂", "⊞", "♡", "◉"].map((icon, i) => (
            <div
              key={i}
              style={{
                width: 38,
                height: 38,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 19,
                color: i === 0 ? theme.accent : theme.textMuted,
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** An app-like feed that builds in and gently scrolls, when no screenshot is given. */
const MockFeed: React.FC<{ theme: Theme; frame: number; fps: number }> = ({ theme, frame, fps }) => {
  const scrollY = interpolate(frame, [24, 200], [0, -46], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const Item: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
    const p = spring({ frame: frame - 8 - index * 7, fps, config: theme.motion });
    return (
      <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), translate: `0 ${interpolate(p, [0, 1], [16, 0])}px` }}>
        {children}
      </div>
    );
  };

  const cardBase: React.CSSProperties = {
    background: theme.surface,
    borderRadius: 14,
    border: `1px solid ${theme.border}`,
  };

  return (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, translate: `0 ${scrollY}px` }}>
      <Item index={0}>
        <div style={{ ...cardBase, height: 36, display: "flex", alignItems: "center", padding: "0 14px", fontFamily: theme.fontSans, fontSize: 13, color: theme.textMuted }}>
          Search
        </div>
      </Item>

      {/* Featured hero card */}
      <Item index={1}>
        <div
          style={{
            height: 132,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentMuted} 100%)`,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <div style={{ height: 13, width: "62%", background: "rgba(255,255,255,0.92)", borderRadius: 5 }} />
          <div style={{ height: 10, width: "40%", background: "rgba(255,255,255,0.6)", borderRadius: 5 }} />
        </div>
      </Item>

      {[0, 1, 2, 3].map((i) => (
        <Item key={i} index={2 + i}>
          <div style={{ ...cardBase, height: 70, display: "flex", alignItems: "center", gap: 12, padding: "0 12px" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: theme.accentMuted,
                border: `1.5px solid ${theme.accent}`,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ height: 11, background: theme.text, opacity: 0.85, borderRadius: 4, width: `${70 - i * 8}%` }} />
              <div style={{ height: 9, background: theme.textMuted, opacity: 0.5, borderRadius: 4, width: `${48 - i * 5}%` }} />
            </div>
            <div style={{ width: 30, height: 18, borderRadius: 6, background: theme.accentMuted, flexShrink: 0 }} />
          </div>
        </Item>
      ))}
    </div>
  );
};
