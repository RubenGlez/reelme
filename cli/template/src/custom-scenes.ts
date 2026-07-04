import type { ComponentType } from "react";
import { Theme } from "./theme";
import { ProjectMeta } from "./brief";
import { PlatformPreset } from "./platforms";

export interface CustomSceneProps {
  theme: Theme;
  project: ProjectMeta;
  platform: PlatformPreset;
  bottomInset: number;
  caption?: string;
}

// Registry of skill-authored bespoke scenes. This DEFAULT file exports an
// empty registry; when a brief references `custom` scenes, the CLI overwrites
// this file at stage time with generated imports of the staged components
// (see cache.mjs). Never add entries here by hand — they'd be wiped on the
// next render's template re-sync.
export const CUSTOM_SCENES: Record<string, ComponentType<CustomSceneProps>> = {};
