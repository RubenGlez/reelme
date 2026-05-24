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

export type Scene =
  | ProblemScene
  | CodeRevealScene
  | TerminalScene
  | DataFlowScene
  | CTAScene;

export interface Brief {
  project: ProjectMeta;
  scenes: Scene[];
}
