// Platform presets: turn a PlatformId into concrete render parameters.
// Users pick platforms by name; aspect ratio, fps, duration ceilings, and
// safe areas are internal preset details, never user-facing questions.
//
// The data lives in platforms.json — the single source of truth shared with
// the CLI (which reads the JSON directly; it has no TypeScript build step).

import presets from "./platforms.json";

export type PlatformId =
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "instagram-reel"
  | "instagram-story"
  | "instagram-feed"
  | "github-readme";

export interface PlatformPreset {
  id: PlatformId;
  label: string;
  cut: "main" | "vertical";
  width: number;
  height: number;
  fps: number;
  maxDurationSec?: number;
  safeArea?: { top: number; bottom: number }; // px insets at preset resolution
  output: { file: string; codec: "h264" | "gif" };
}

export const PLATFORMS = presets as Record<PlatformId, PlatformPreset>;

export function cutForPlatform(id: PlatformId): "main" | "vertical" {
  return PLATFORMS[id].cut;
}
