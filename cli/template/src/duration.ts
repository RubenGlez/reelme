import { FeatureListScene, FileTreeScene, HotkeyScene, OSWindowScene, Scene, StatCalloutScene } from "./brief";

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
};

export function sceneDuration(scene: Scene): number {
  let content: number;
  if (scene.type === "feature-list") {
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
  } else {
    content = SCENE_DURATION_MAP[scene.type];
  }
  return content + SCENE_TAIL;
}

// Duration is computed per cut: callers pass the scene list of the chosen cut
// (cuts.main, cuts.vertical, or cuts.teaser).
export function calcTotalDuration(scenes: Scene[]): number {
  return scenes.reduce((sum, scene) => sum + sceneDuration(scene), 0);
}
