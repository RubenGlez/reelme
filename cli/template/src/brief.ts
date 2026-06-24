import { PlatformId } from "./platforms";
import { LookId } from "./cinematic/look";

// Brief schema version. Bump on breaking changes to the reelme.json contract;
// the CLI refuses briefs whose schemaVersion doesn't match.
export const BRIEF_SCHEMA_VERSION = 2;

export interface ProjectMeta {
  name: string;
  tagline: string;
  problem: string;
  installCommand: string;
  repoUrl: string;
  primaryColor: string;
  tone: "professional" | "playful" | "technical";
  /** Publishing targets; required, at least one. Presets derive dimensions. */
  platforms: PlatformId[];
  /** Bundled CC0 track selection; false disables audio. */
  audio?: { track: string; volume?: number } | false;
  /** "made with reelme" credit in the CTA footer; default true. (Rendering lands in Phase 2.) */
  watermark?: boolean;
  mode?: "intro" | "announcement";
  version?: string;
  logo?: string;
  font?: string;
  monoFont?: string;
  /** Legacy per-scene transition; superseded by the look's edit rhythm. */
  transition?: "fade" | "slide" | "zoom";
  bgStyle?: "deep" | "branded" | "light";
  /**
   * Art-direction preset: lighting, camera, grade, grain, and cut rhythm.
   * Defaults from tone (professional→keynote, playful→arcade, technical→blueprint).
   */
  look?: LookId;
}

export interface ProblemScene {
  type: "problem";
  headline: string;
  subtext?: string;
  caption?: string;
  hero?: boolean;
  /** Small eyebrow label above the headline (e.g. the product name). */
  kicker?: string;
  /** Composition: centered (default) or left-anchored with negative space. */
  align?: "center" | "left";
}

export interface CodeRevealScene {
  type: "code-reveal";
  language: string;
  code: string;
  highlightLine?: number;
  caption?: string;
}

export interface TerminalCommand {
  input: string;
  output: string;
}

export interface TerminalScene {
  type: "terminal";
  commands: TerminalCommand[];
  caption?: string;
}

export interface DataFlowNode {
  id: string;
  label: string;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface DataFlowScene {
  type: "data-flow";
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  caption?: string;
}

export interface CTAScene {
  type: "cta";
  installCommand: string;
  repoUrl: string;
  caption?: string;
}

export interface BrowserScene {
  type: "browser";
  url: string;
  image?: string;
  caption?: string;
}

export interface SplitPanel {
  label: string;
  content: string;
}

export interface SplitScene {
  type: "split";
  before: SplitPanel;
  after: SplitPanel;
  caption?: string;
}

export interface FeatureItem {
  text: string;
  icon?: string;
}

export interface FeatureListScene {
  type: "feature-list";
  headline?: string;
  items: Array<string | FeatureItem>;
  caption?: string;
  /** Composition: centered (default) or left-anchored. */
  align?: "center" | "left";
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatCalloutScene {
  type: "stat-callout";
  headline?: string;
  stats: StatItem[];
  caption?: string;
  /** "hero" renders the first stat at giant scale (one dominant number). */
  layout?: "row" | "hero";
}

export interface FileTreeEntry {
  path: string;
  type?: "file" | "dir";
  highlight?: boolean;
}

export interface FileTreeScene {
  type: "file-tree";
  headline?: string;
  entries: FileTreeEntry[];
  caption?: string;
}

export interface MobileScene {
  type: "mobile";
  title?: string;
  screenshot?: string;
  caption?: string;
}

export interface ClipScene {
  type: "clip";
  src: string;
  frame: "browser" | "mobile" | "none";
  startFrom?: number;
  durationInFrames?: number;
  caption?: string;
}

export interface OSWindowItem {
  icon?: string;
  label: string;
  value?: string;
  highlighted?: boolean;
}

export interface OSWindowScene {
  type: "os-window";
  title?: string;
  searchQuery?: string;
  items: OSWindowItem[];
  caption?: string;
}

export interface HotkeyScene {
  type: "hotkey";
  keys: string[];
  action?: string;
  caption?: string;
}

export interface HookScene {
  type: "hook";
  text: string;
  accent?: string;
  /** Small eyebrow label above the hook (e.g. the product name). */
  kicker?: string;
  /** Composition: centered (default) or left-anchored with negative space. */
  align?: "center" | "left";
}

export interface BenchmarkBar {
  label: string;
  /** Raw metric value; bar length is derived from it. */
  value: number;
  /** Text shown on the bar, e.g. "0.3s". Falls back to the value. */
  display?: string;
  /** The project's own bar — highlighted in the accent color. */
  hero?: boolean;
}

export interface BenchmarkScene {
  type: "benchmark";
  headline?: string;
  /** Metric description, e.g. "Search time (lower is better)". */
  metric?: string;
  /** When true, the smallest value wins (gets the longest bar). */
  lowerIsBetter?: boolean;
  bars: BenchmarkBar[];
  caption?: string;
}

export type Scene =
  | ProblemScene
  | CodeRevealScene
  | TerminalScene
  | DataFlowScene
  | CTAScene
  | BrowserScene
  | SplitScene
  | FeatureListScene
  | StatCalloutScene
  | FileTreeScene
  | MobileScene
  | OSWindowScene
  | HotkeyScene
  | HookScene
  | BenchmarkScene
  | ClipScene;

export interface Cuts {
  /** The full narrative arc. Always required. */
  main: Scene[];
  /** Hook-first, fewer scenes, less text per second. For 9:16 platforms. */
  vertical?: Scene[];
  /** ≤10s (300 frames at 30fps), hook + CTA. Rendered per social platform. */
  teaser?: Scene[];
}

export interface Brief {
  schemaVersion: number;
  project: ProjectMeta;
  cuts: Cuts;
}
