export interface ProjectMeta {
  name: string;
  tagline: string;
  problem: string;
  installCommand: string;
  repoUrl: string;
  primaryColor: string;
  tone: "professional" | "playful" | "technical";
  mode?: "intro" | "announcement";
  version?: string;
  logo?: string;
  font?: string;
  monoFont?: string;
}

export interface ProblemScene {
  type: "problem";
  headline: string;
  subtext?: string;
  caption?: string;
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

export interface FeatureListScene {
  type: "feature-list";
  headline?: string;
  items: string[];
  caption?: string;
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
  image?: string;
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
  | HotkeyScene;

export interface Brief {
  project: ProjectMeta;
  scenes: Scene[];
}
