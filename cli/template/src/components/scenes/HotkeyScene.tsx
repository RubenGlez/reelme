import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { HotkeyScene as HotkeyBrief } from "../../brief";
import { Theme } from "../../theme";
import { KeyPill } from "../primitives/KeyPill";
import { Caption } from "../primitives/Caption";

interface Props {
  scene: HotkeyBrief;
  theme: Theme;
  bottomInset?: number;
}

const FRAMES_PER_KEY = 20;
const ACTION_DELAY = 15;

export const Hotkey: React.FC<Props> = ({ scene, theme, bottomInset = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const keys = scene.keys ?? [];
  const actionStart = keys.length * FRAMES_PER_KEY + ACTION_DELAY;
  const captionStart = actionStart + 50;

  const actionProgress = spring({ frame: frame - actionStart, fps, config: theme.motion });
  const actionOpacity = interpolate(Math.max(0, actionProgress), [0, 1], [0, 1]);
  const actionY = interpolate(Math.max(0, actionProgress), [0, 1], [16, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {keys.map((key, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span
                style={{
                  fontFamily: theme.fontSans,
                  fontSize: 28,
                  color: theme.textMuted,
                  opacity: frame >= i * FRAMES_PER_KEY ? 1 : 0,
                }}
              >
                +
              </span>
            )}
            <KeyPill label={key} theme={theme} startFrame={i * FRAMES_PER_KEY} />
          </React.Fragment>
        ))}
      </div>

      {scene.action && (
        <div
          style={{
            opacity: actionOpacity,
            translate: `0 ${actionY}px`,
            fontFamily: theme.fontSans,
            fontSize: 28,
            fontWeight: 400,
            color: theme.textMuted,
            letterSpacing: "-0.01em",
          }}
        >
          {scene.action}
        </div>
      )}

      {scene.caption && <Caption text={scene.caption} theme={theme} startFrame={captionStart} bottomInset={bottomInset} />}
    </AbsoluteFill>
  );
};
