import { Brief, FeatureListScene, FileTreeScene, HotkeyScene, OSWindowScene, Scene, StatCalloutScene } from "./brief";

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
  if (scene.type === "feature-list") {
    const s = scene as FeatureListScene;
    return 20 + s.items.length * 25 + 60;
  }
  if (scene.type === "stat-callout") {
    const s = scene as StatCalloutScene;
    return 20 + s.stats.length * 35 + 60;
  }
  if (scene.type === "file-tree") {
    const s = scene as FileTreeScene;
    return 20 + s.entries.length * 20 + 60;
  }
  if (scene.type === "os-window") {
    const s = scene as OSWindowScene;
    const searchDuration = s.searchQuery ? s.searchQuery.length * 3 + 10 : 0;
    return 20 + searchDuration + (s.items?.length ?? 0) * 20 + 60;
  }
  if (scene.type === "hotkey") {
    const s = scene as HotkeyScene;
    return 20 + s.keys.length * 20 + 70;
  }
  return SCENE_DURATION_MAP[scene.type];
}

export function calcTotalDuration(brief: Brief): number {
  return brief.scenes.reduce((sum, scene) => sum + sceneDuration(scene), 0);
}
