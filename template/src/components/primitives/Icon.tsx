import React from "react";
import {
  AlertCircle, ArrowRight, Bell, Brackets, Check, CheckCircle,
  ChevronDown, ChevronRight, Clock, Cloud, Code, Copy, Database,
  Download, Edit, Eye, EyeOff, File, FileCode, Fingerprint, Folder,
  FolderOpen, Globe, HardDrive, Info, Key, Lock, Package, Plus,
  Search, Server, Settings, Shield, Star, Terminal, Trash, Upload,
  User, Users, X, Zap, type LucideProps,
} from "lucide-react";

type LucideIcon = React.FC<LucideProps>;

const ICON_MAP: Record<string, LucideIcon> = {
  "alert-circle": AlertCircle,
  "arrow-right": ArrowRight,
  bell: Bell,
  brackets: Brackets,
  check: Check,
  "check-circle": CheckCircle,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  clock: Clock,
  cloud: Cloud,
  code: Code,
  copy: Copy,
  database: Database,
  download: Download,
  edit: Edit,
  eye: Eye,
  "eye-off": EyeOff,
  file: File,
  "file-code": FileCode,
  fingerprint: Fingerprint,
  folder: Folder,
  "folder-open": FolderOpen,
  globe: Globe,
  "hard-drive": HardDrive,
  info: Info,
  key: Key,
  lock: Lock,
  package: Package,
  plus: Plus,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  star: Star,
  terminal: Terminal,
  trash: Trash,
  upload: Upload,
  user: User,
  users: Users,
  x: X,
  zap: Zap,
};

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = "currentColor", strokeWidth = 1.5 }) => {
  const LucideIcon = ICON_MAP[name.toLowerCase()];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
};
