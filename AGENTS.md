# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`reelme` is a Claude Code skill (`/reelme`) that generates animated explainer videos for open-source projects. It has two parts:

- **`SKILL.md`** — the skill definition; follows the open [Agent Skills](https://agentskills.io) standard, so it works in any compatible agent (Claude Code, Cursor, Gemini CLI, Codex, etc.). Installed via `npx skills add RubenGlez/reelme`. Step 6 locates the skill directory portably with `find "$HOME" -name "SKILL.md" -path "*/reelme/SKILL.md"` rather than any agent-specific variable.
- **`template/`** — a Remotion project that gets copied into the user's repo and rendered locally

The skill reads the user's repo, runs a brief interview, writes `brief.json`, copies `template/` into the chosen output path, and runs `pnpm render`.

## Template development commands

All commands run from `template/`:

```bash
pnpm install && pnpm approve-builds --all  # first-time setup (esbuild needs approval)
pnpm typecheck                             # TypeScript check, no emit
pnpm start                                 # Remotion Studio at localhost:3000 for live preview
pnpm render:mp4                            # render out/video.mp4
pnpm render:gif                            # render out/video.gif
pnpm render                                # render both
```

Capture a still for quick visual checks without a full render:
```bash
template/node_modules/.bin/remotion still Reel out/frame_N.png --frame=N
```

## Architecture

### How a video is produced

1. User edits (or the skill writes) `template/src/brief.json`
2. `src/index.ts` reads `brief.json`, calls `calcTotalDuration()` to compute total frames, and registers a single Remotion composition (`Reel`)
3. `src/Root.tsx` maps each scene in `brief.scenes` to a `<Sequence>` with a fixed duration, rendering the right scene component via `SceneRenderer`
4. Scene components read from the `Brief` type and compose primitives
5. `buildTheme(primaryColor)` in `src/theme.ts` derives a full color palette (bg, surface, accent, text, border) from a single hex using chroma-js

### Brief schema (`src/brief.ts`)

The `Brief` type is the contract between the skill interview and the Remotion render. Scene types: `problem`, `code-reveal`, `terminal`, `data-flow`, `cta`, `browser`, `split`, `feature-list`. All scene types share an optional `caption?: string` field that renders as a `Caption` pill after the scene's main animation settles. Adding a new scene type means: adding to the union in `brief.ts`, creating a scene component, adding a case in `SceneRenderer`, and adding a duration entry in `SCENE_DURATION_MAP`. `feature-list` duration is computed dynamically from `items.length` in `sceneDuration()` rather than from the map.

`ProjectMeta` has two optional fields that drive mode-specific rendering:
- `mode: "intro" | "announcement"` — switches Problem scene between accent bar and version badge; switches CTA copy between "Get started with X" and "X is here"
- `version` — shown in the version badge and CTA title when `mode === "announcement"`
- `logo` — filename in `template/public/` (e.g. `"logo.svg"`); rendered via Remotion's `<Img src={staticFile(logo)} />` in the CTA scene

### Primitives (`src/components/primitives/`)

- `Terminal` — types input lines character-by-character, output lines appear at once; driven by `useCurrentFrame()`
- `CodeBlock` — reveals lines progressively, tokenizes for syntax highlighting, highlights a specific line with a spring-animated accent glow
- `Label` — spring-entrance text with size/muted variants
- `Arrow` — SVG line with animated `strokeDashoffset` draw-on effect; arrowhead is a separate `<polygon>` that fades in only at `progress > 0.85` to avoid the tip appearing before the line reaches it
- `Caption` — frosted-glass pill that slides up and fades in via a spring; accepts a `startFrame` so each scene can delay it until after its main animation settles

### Theming

`buildTheme(hex)` is the only theming entry point. It mixes the accent color toward a near-black or near-white base depending on luminance, so both light and dark primary colors produce a readable dark-background theme. All components receive a `Theme` object as a prop — no global CSS, no context.

### Skill flow (`SKILL.md`)

Steps: read repo → interview (only uncertain fields) → write `brief.json` → confirm output path → `cp -r template/ <path>` → `cp brief.json <path>/src/` → `pnpm install && pnpm approve-builds --all` → `pnpm render`.

The `pnpm approve-builds --all` step is required because esbuild (a Remotion dependency) needs a post-install script. `template/pnpm-workspace.yaml` persists this approval so subsequent installs don't re-prompt.
