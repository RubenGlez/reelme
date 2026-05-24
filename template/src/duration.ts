import { Brief, FeatureListScene, Scene } from "./brief";

export const SCENE_DURATION_MAP: Record<Scene["type"], number> = {
  problem: 120,
  "code-reveal": 165,
  terminal: 150,
  "data-flow": 200,
  cta: 120,
  browser: 150,
  split: 165,
  "feature-list": 180,
};

export function sceneDuration(scene: Scene): number {
  if (scene.type === "feature-list") {
    const s = scene as FeatureListScene;
    return 20 + s.items.length * 25 + 60;
  }
  return SCENE_DURATION_MAP[scene.type];
}

export function calcTotalDuration(brief: Brief): number {
  return brief.scenes.reduce((sum, scene) => sum + sceneDuration(scene), 0);
}
