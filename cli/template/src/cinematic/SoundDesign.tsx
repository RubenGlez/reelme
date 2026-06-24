import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { Scene } from "../brief";
import { CinematicLook } from "./look";
import { transitionFor } from "./transitions";

export interface SequencedScene {
  scene: Scene;
  from: number;
  duration: number;
}

interface Props {
  sequenced: SequencedScene[];
  fps: number;
  look: CinematicLook;
}

const SFX = {
  whoosh: "sfx/whoosh.mp3",
  tick: "sfx/tick.mp3",
  impact: "sfx/impact.mp3",
  riser: "sfx/riser.mp3",
  sub: "sfx/sub-drop.mp3",
} as const;

interface Cue {
  at: number;
  src: string;
  volume: number;
  startFrom?: number;
}

/** Frame where the bed should duck for the CTA, or null when there's no CTA. */
export function ctaDuckFrame(sequenced: SequencedScene[]): number | null {
  const cta = sequenced.find((s) => s.scene.type === "cta");
  return cta ? cta.from : null;
}

function buildCues(sequenced: SequencedScene[], fps: number, look: CinematicLook): Cue[] {
  const cues: Cue[] = [];
  const total = sequenced.length;
  // Understated mix: sound design should sit under the music, felt not heard.
  const gain = 0.3 + look.energy * 0.2;

  sequenced.forEach(({ scene, from }, i) => {
    // Transition sweetener at the cut, matched to how the shot arrives.
    if (i > 0) {
      const style = transitionFor(look, i, total);
      if (style === "whip" || style === "zoom") {
        cues.push({ at: from - 4, src: SFX.whoosh, volume: 0.2 * gain });
      } else if (style === "punch") {
        cues.push({ at: from, src: SFX.impact, volume: 0.24 * gain });
      } else if (style === "cut") {
        cues.push({ at: from, src: SFX.tick, volume: 0.14 * gain });
      }
    }

    // A single accent hit when data-heavy scenes land their content.
    if (scene.type === "stat-callout" || scene.type === "benchmark") {
      cues.push({ at: from + 18, src: SFX.tick, volume: 0.18 * gain });
    }

    // The CTA arrival: a riser into it and a soft sub on the hit.
    if (scene.type === "cta") {
      cues.push({ at: Math.max(0, from - Math.round(fps * 1.3)), src: SFX.riser, volume: 0.26 * gain });
      cues.push({ at: from, src: SFX.sub, volume: 0.3 * gain });
    }
  });

  return cues;
}

/**
 * Composed sound design layered over the music bed: whooshes on whip cuts,
 * ticks on hard cuts and data reveals, a riser and sub-drop into the CTA. This
 * is what stops two reels with the same bed from sounding identical.
 */
export const SoundDesign: React.FC<Props> = ({ sequenced, fps, look }) => {
  const cues = buildCues(sequenced, fps, look);
  return (
    <>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.max(0, cue.at)} durationInFrames={Math.round(fps * 3)} layout="none">
          <Audio src={staticFile(cue.src)} volume={cue.volume} startFrom={cue.startFrom ?? 0} />
        </Sequence>
      ))}
    </>
  );
};
