import { BenchmarkScene, ClipScene, CodeRevealScene, CustomScene, FeatureListScene, FileTreeScene, HookScene, HotkeyScene, OSWindowScene, Scene, StatCalloutScene, TerminalScene } from "./brief";
import { CAPTION_HOLD, codeRevealCaptionStart, terminalCaptionStart } from "./timing";

// Hard ceiling for the teaser cut: 10s at 30fps. Renders over the limit
// succeed, but the CLI prints a prominent warning.
export const TEASER_MAX_FRAMES = 300;

// Frames appended after each scene's content animation settles.
// Gives content time to breathe and provides room for the fade-out.
export const SCENE_TAIL = 30;

export const SCENE_DURATION_MAP: Record<Scene["type"], number> = {
  problem: 120,
  "code-reveal": 165,
  terminal: 150,
  "data-flow": 200,
  cta: 120,
  browser: 150,
  split: 165,
  "feature-list": 180,
  "stat-callout": 180,
  "file-tree": 200,
  mobile: 150,
  "os-window": 180,
  hotkey: 120,
  hook: 50,
  clip: 150,
  benchmark: 180,
  custom: 150,
};

// Hook length scales with how much there is to read: the words stagger in and
// the viewer still needs a beat to actually read the line. ~3 words/sec of
// reading plus the reveal, floored so even a two-word hook lands, capped so
// the hook never drags (it's a hook, not a scene). No tail: the cut to the
// next scene IS the punctuation.
export function hookDuration(scene: HookScene): number {
  const words = scene.text.trim().split(/\s+/).length;
  return Math.min(Math.max(40 + words * 8, 70), 120);
}

export function sceneDuration(scene: Scene): number {
  if (scene.type === "hook") return hookDuration(scene as HookScene);
  if (scene.type === "clip") {
    const s = scene as ClipScene;
    return (s.durationInFrames ?? SCENE_DURATION_MAP.clip) + SCENE_TAIL;
  }
  if (scene.type === "custom") {
    const s = scene as CustomScene;
    return (s.durationInFrames ?? SCENE_DURATION_MAP.custom) + SCENE_TAIL;
  }
  let content: number;
  if (scene.type === "terminal") {
    // Long enough to type every command out, then show the caption (F7).
    const s = scene as TerminalScene;
    const start = terminalCaptionStart(s);
    content = s.caption ? start + CAPTION_HOLD : start;
  } else if (scene.type === "code-reveal") {
    const s = scene as CodeRevealScene;
    const start = codeRevealCaptionStart(s);
    content = s.caption ? start + CAPTION_HOLD : start;
  } else if (scene.type === "feature-list") {
    const s = scene as FeatureListScene;
    content = 20 + s.items.length * 25 + 60;
  } else if (scene.type === "stat-callout") {
    const s = scene as StatCalloutScene;
    content = 20 + s.stats.length * 35 + 60;
  } else if (scene.type === "file-tree") {
    const s = scene as FileTreeScene;
    content = 20 + s.entries.length * 20 + 60;
  } else if (scene.type === "os-window") {
    const s = scene as OSWindowScene;
    const searchDuration = s.searchQuery ? s.searchQuery.length * 3 + 10 : 0;
    content = 20 + searchDuration + (s.items?.length ?? 0) * 20 + 60;
  } else if (scene.type === "hotkey") {
    const s = scene as HotkeyScene;
    content = 20 + s.keys.length * 20 + 70;
  } else if (scene.type === "benchmark") {
    const s = scene as BenchmarkScene;
    content = 20 + s.bars.length * 30 + 60;
  } else {
    content = SCENE_DURATION_MAP[scene.type];
  }
  return content + SCENE_TAIL;
}

/**
 * Per-scene durations snapped to the music's beat grid: every cut lands on a
 * beat (the bundled tracks start on the beat at t=0, so the grid is anchored
 * at frame 0). Durations only ever grow — each cut moves to the next beat at
 * or after its natural position — so captions and reveals always still fit.
 * Without a bpm, the natural durations pass through unchanged.
 */
export function sceneDurationsOnGrid(scenes: Scene[], fps: number, bpm?: number): number[] {
  const raw = scenes.map(sceneDuration);
  if (!bpm || bpm <= 0 || !fps) return raw;
  const beat = (60 / bpm) * fps; // fractional frames per beat
  const out: number[] = [];
  let cursor = 0;
  for (const duration of raw) {
    const beats = Math.ceil((cursor + duration) / beat - 1e-6);
    const cut = Math.max(cursor + 1, Math.round(beats * beat));
    out.push(cut - cursor);
    cursor = cut;
  }
  return out;
}

// Duration is computed per cut: callers pass the scene list of the chosen cut
// (cuts.main, cuts.vertical, or cuts.teaser). With fps+bpm, the total reflects
// the beat-quantized cuts so the composition length matches the sequencing.
export function calcTotalDuration(scenes: Scene[], fps?: number, bpm?: number): number {
  if (fps && bpm) return sceneDurationsOnGrid(scenes, fps, bpm).reduce((a, b) => a + b, 0);
  return scenes.reduce((sum, scene) => sum + sceneDuration(scene), 0);
}
