export interface ProjectMeta {
  name: string;
  tagline: string;
  problem: string;
  installCommand: string;
  repoUrl: string;
  primaryColor: string;
  tone: "professional" | "playful" | "technical";
}

export interface ProblemScene {
  type: "problem";
  headline: string;
  subtext?: string;
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
}

export interface CTAScene {
  type: "cta";
  installCommand: string;
  repoUrl: string;
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
