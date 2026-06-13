import { registerRoot, Composition } from "remotion";
import React from "react";
import { Reel } from "./Root";
import { calcTotalDuration, TEASER_MAX_FRAMES } from "./duration";
import { Brief, Scene } from "./brief";
import { PLATFORMS, cutForPlatform } from "./platforms";
import briefJson from "./brief.json";

const brief = briefJson as unknown as Brief;

const VALID_PLATFORMS = Object.keys(PLATFORMS).join(", ");

const platformIds = brief.project?.platforms;
if (!Array.isArray(platformIds) || platformIds.length === 0) {
  throw new Error(
    `reelme: project.platforms is missing or empty in the brief. ` +
      `Select at least one platform: ${VALID_PLATFORMS}.`
  );
}
const unknown = platformIds.filter((id) => !PLATFORMS[id]);
if (unknown.length > 0) {
  throw new Error(
    `reelme: unknown platform(s) in the brief: ${unknown.join(", ")}. ` +
      `Valid platforms: ${VALID_PLATFORMS}.`
  );
}
if (!brief.cuts || !Array.isArray(brief.cuts.main) || brief.cuts.main.length === 0) {
  throw new Error(
    "reelme: cuts.main is missing or empty in the brief. " +
      "Brief schema v2 requires cuts: { main: Scene[] } (the v1 top-level scenes array is no longer supported)."
  );
}

// A vertical platform without cuts.vertical falls back to the main cut.
function scenesForCut(cut: "main" | "vertical"): Scene[] {
  if (cut === "vertical") return brief.cuts.vertical ?? brief.cuts.main;
  return brief.cuts.main;
}

const verticalFallback = platformIds.filter(
  (id) => cutForPlatform(id) === "vertical" && !brief.cuts.vertical
);
if (verticalFallback.length > 0) {
  console.warn(
    `reelme: no cuts.vertical in the brief — ${verticalFallback.join(", ")} will render the main cut ` +
      `letterboxed into 9:16. Author a vertical cut for better results.`
  );
}

const compositions = platformIds.map((id) => {
  const preset = PLATFORMS[id];
  const scenes = scenesForCut(cutForPlatform(id));
  if (preset.maxDurationSec !== undefined) {
    const seconds = calcTotalDuration(scenes) / preset.fps;
    if (seconds > preset.maxDurationSec) {
      console.warn(
        `reelme: the ${preset.label} cut runs ${seconds.toFixed(1)}s, over the platform's ` +
          `${preset.maxDurationSec}s ceiling. Rendering anyway — consider trimming scenes.`
      );
    }
  }
  return React.createElement(Composition, {
    key: `Reel-${id}`,
    id: `Reel-${id}`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Reel as React.FC<any>,
    durationInFrames: calcTotalDuration(scenes),
    fps: preset.fps,
    width: preset.width,
    height: preset.height,
    defaultProps: { brief, platform: preset },
  });
});

// Teaser pass: one Reel-<platform>-teaser composition per selected social
// platform (gif outputs excluded), same dimensions as the platform preset.
const teaser = brief.cuts.teaser;
if (teaser && teaser.length > 0 && calcTotalDuration(teaser) > TEASER_MAX_FRAMES) {
  console.warn(
    `reelme: the teaser cut runs ${calcTotalDuration(teaser)} frames, over the ${TEASER_MAX_FRAMES}-frame ` +
      `(10s) ceiling. Rendering anyway — a teaser should be hook + CTA, nothing more.`
  );
}
const teaserCompositions =
  teaser && teaser.length > 0
    ? platformIds
        .filter((id) => PLATFORMS[id].output.codec !== "gif")
        .map((id) => {
          const preset = PLATFORMS[id];
          return React.createElement(Composition, {
            key: `Reel-${id}-teaser`,
            id: `Reel-${id}-teaser`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            component: Reel as React.FC<any>,
            durationInFrames: calcTotalDuration(teaser),
            fps: preset.fps,
            width: preset.width,
            height: preset.height,
            defaultProps: { brief, platform: preset, cut: "teaser" as const },
          });
        })
    : [];

registerRoot(() => {
  return React.createElement(React.Fragment, null, ...compositions, ...teaserCompositions);
});
