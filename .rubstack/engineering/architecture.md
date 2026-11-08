# Architecture

## Overview

`reelme` is delivered as a hybrid: an agent skill that owns the intelligence, plus a thin npm CLI that owns the mechanics (ADR 0003). It has two parts, both hosted in this repo:

- **`skills/reelme/`**: the skill bundle — `SKILL.md` plus its bundled `references/`. Follows the open [Agent Skills](https://agentskills.io) standard (the `skills/<name>/SKILL.md` discovery convention), so it works in any compatible agent (Claude Code, Cursor, Gemini CLI, Codex, etc.) and installs via `npx skills add RubenGlez/reelme`. Keeping the skill in its own directory scopes the install bundle to just this folder, excluding `cli/`, `gallery/`, and `assets/` media (ADR 0004). The skill flow reads the repo, runs the interview, and writes `reelme.json`.
- **`reelme` npm package (CLI)**: `npx reelme render` scaffolds the bundled Remotion project into `~/.reelme/cache/<project-hash>/`, renders all selected platforms, and copies outputs to `./reelme-out/`; `npx reelme studio` opens the Remotion Studio preview against the cache dir; `npx reelme clean` clears the cache. The Remotion template, platform presets, render orchestration, watermark, clip/mobile asset support, vertical polish, teaser rendering, and bundled audio playback ship inside the package.

The skill reads the user's repo, runs a brief interview, writes `reelme.json` at the repo root (committed — it is the brand memory across releases), and shells out to `npx reelme render`. Users select publishing *platforms* (TikTok, Instagram Reel/Story/feed, X, LinkedIn, YouTube/Shorts, GitHub README) — never aspect-ratio formats; aspect ratio, duration ceilings, and safe areas are internal preset details. One render run produces one output per selected platform in `./reelme-out/` (suggested gitignore). Rendering is local only — no cloud account, no billing, no AWS setup. Remotion Lambda is documented as an opt-in option for later.

## Components

### CLI package (`reelme` on npm)

The thin mechanics layer. Bin entry exposes three commands:

- `render`: reads `reelme.json` from the user's repo root, scaffolds the bundled template into `~/.reelme/cache/<project-hash>/` (installing deps there, never in the user's repo), registers one composition per selected platform, renders each, and copies media outputs to `./reelme-out/`
- `studio`: opens Remotion Studio against the cache directory for preview
- `clean`: clears `~/.reelme/cache/`

The package bundles `cli/template/` (the Remotion project), the platform presets, audio assets, and the render orchestration (what was previously planned as a scaffolded `render.mjs`). Re-renders reuse the cache — no reinstall. The `reelme.json` schema version field guards CLI↔schema compatibility.

### Template system

Two layers:

- **Shared primitives**: reusable components (terminal window, animated code block, arrow, label, caption pill). These are the building blocks.
- **Scene templates**: pre-composed full scenes built from primitives.

New scene templates can be contributed by the community using existing primitives.

### Primitives (`src/components/primitives/`)

- `Terminal`: types input lines character-by-character, output lines appear at once; driven by `useCurrentFrame()`
- `CodeBlock`: reveals lines progressively, tokenizes for syntax highlighting, highlights a specific line with a spring-animated accent glow
- `Label`: headline text with size/muted variants; routes through `RevealText` for its entrance
- `RevealText`: masked per-word kinetic reveal — each word rises from behind a clip edge with a staggered spring; supports an emphasis-word color and a depth shadow. Used by `Label`, `Hook`, and the `Problem` hero headline
- `Kicker`: small eyebrow label (accent tick + uppercase mono tag) above a headline; used by `Hook`/`Problem` when `kicker` is set
- `Arrow`: SVG line with animated `strokeDashoffset` draw-on effect; arrowhead is a separate `<polygon>` that fades in only at `progress > 0.85` to avoid the tip appearing before the line reaches it
- `Caption`: frosted-glass pill that slides up and fades in via a spring; accepts a `startFrame` so each scene can delay it until after its main animation settles

### Scene templates

| Scene | Description |
|---|---|
| Problem | Animated headline establishing the pain point or release headline. |
| Feature list | Bullet points that reveal one by one; each item shows a numbered bullet or an icon from the registry. |
| Code reveal | IDE/editor window. Code types itself in line by line, key line highlighted. |
| Terminal | Terminal window sized to its longest line and centered. Commands appear, output streams progressively. |
| Data flow | Arrows and nodes showing how data moves through a system. |
| Split | Before/after content cards (statement centered in each, the "after" card accent-bordered) that slide in from opposite sides. |
| Browser | Mock browser window with typed URL animation and optional screenshot. |
| CTA | Install command + repo URL on a graded radial brand end-card with contrast-aware text. Clean exit. Renders the watermark footer when enabled. |
| Hook | Full-bleed oversized claim, 1.5–2s. Opens the vertical and teaser cuts. |
| Clip | Real video/gif the user already has (screen recording, rendered vhs/asciinema cast) wrapped in a branded frame via `<OffthreadVideo>` or `@remotion/gif`. Fields: `src`, `frame: "browser" \| "mobile" \| "none"`, optional trim. |
| stat-callout | |
| file-tree | |
| mobile | Phone frame. A real `screenshot?: string` gets a slow ken-burns push; with no screenshot it renders an animated app-like feed (header, featured card, content cards, nav). |
| os-window | |
| hotkey | |

All scene types share an optional `caption?: string` field that renders as a `Caption` pill after the scene's main animation settles.

User-provided assets (screenshots, clips) are referenced in `reelme.json` by repo-relative paths; the CLI copies them into the cache scaffold's `public/` at render time using the asset basename. There is no collision suffixing yet, so duplicate basenames can overwrite each other. Automated capture (Playwright, running vhs) is explicitly out of scope — the user brings the recording.

### Platform presets (`cli/src/platforms.ts`, ships in the npm package)

Each preset is `{ id, label, cut, width, height, fps, maxDurationSec, safeArea, output }`:

- `cut`: which cut of the brief it renders (`main` or `vertical`)
- `safeArea`: px reserved top/bottom for platform UI overlays (e.g. TikTok/Reels action bars)
- `output`: `{ file, codec: "h264" | "gif" }`

| Platform | Cut | Aspect | Output |
|---|---|---|---|
| `x` | main | 16:9 | h264 |
| `linkedin` | main | 16:9 or 1:1 | h264 |
| `youtube` | main | 16:9 | h264 |
| `tiktok` | vertical | 9:16 | h264 |
| `instagram-reel` | vertical | 9:16 | h264 |
| `instagram-story` | vertical | 9:16 | h264 |
| `instagram-feed` | main | 1:1 | h264 |
| `github-readme` | main | 16:9 | GIF + embed snippet |

These details are never a user-facing question — the user picks platforms by name, the presets do the rest.

### Audio

The schema includes `project.audio?: { track: string; volume?: number } | false`. A curated set of CC0 tracks ships inside the npm package at `cli/assets/audio/`, with provenance in `manifest.json`. The skill chooses a track by tone and writes it into the Brief, the CLI validates the filename against the manifest and copies only that track into `public/audio/`, and the template plays it with Remotion `<Audio>` using loop and a 45-frame fade-out. GIF outputs have no audio inherently. There is no runtime audio API, and no SFX/sound-design layer — audio is the music bed only (a procedural SFX layer was tried and removed; see the Cinematic layer and ADR 0005). The bundled tracks are smooth ambient beds (the earlier per-beat percussion was removed as it read as a harsh pulse).

### Watermark

A discreet "made with reelme" credit rendered in the CTA scene footer, controlled by `project.watermark?: boolean` (default true), removable. This is the growth loop. This differs from the original feature spec, which placed the field at top-level `Brief`.

### Theming

`buildTheme(hex, font?, monoFont?, tone?, bgStyle?)` is the only theming entry point. It always produces a dark-background theme by default (`bgStyle: "deep"`); pass `"light"` for a white-based theme. The `tone` parameter adds a `motion: MotionProfile` field to the theme object (damping/stiffness/mass) which all scene components and primitives use for their spring animations, replacing per-component hardcoded spring configs. All components receive a `Theme` object as a prop; no global CSS, no context.

The CTA scene renders on a graded radial brand end-card (built from `theme.accent`) — the only full-brand-color frame in the video — with a contrast-aware text color (white on dark/saturated accents, near-black on light ones, chosen by chroma luminance) and an edge vignette. On the gif path it falls back to a flat `theme.accent` fill.

### Cinematic layer (`src/components/../cinematic/`)

A production layer applied once in `Root.tsx`, wrapping every scene on top of the scene components (not inside them). It is what lifts the whole reel from "clean slides" to "film" and gives per-brief variety from a single field. See ADR 0005.

- **`Atmosphere`**: one continuous lit/graded background rendered behind ALL scenes — drifting radial brand-color key (+ optional fill) lights, a `mixBlendMode` color-grade pass, a vignette, and animated film grain. Because it is the background, **scene roots are `background: "transparent"`** so the stage shows through (framed panels keep a solid `theme.bg`). This is the single biggest "not slides" change; it also makes the background continuous across cuts.
- **`Camera`**: a per-scene, center-anchored zoom only (push-in / zoom-out / gentle breathe) — no lateral translate. Disabled on the gif path.
- **`Enter` (transitions)**: a varied per-look cut rhythm (`cut`/`dip`/`whip`/`punch`/`rise`) applied as scene-entrance animations over the continuous atmosphere, replacing the old uniform fade-with-dip-to-black. The legacy `project.transition` field is ignored — the look drives the edit.
- **Looks (`cinematic/look.ts`)**: five art-direction presets — `keynote`, `noir`, `arcade`, `blueprint`, `editorial` — each defining lighting/grade/grain/overlay/camera/cut-rhythm. `resolveLook()` honors `project.look`, else maps from `tone` (professional→keynote, playful→arcade, technical→blueprint).
- **Composition options**: scenes are center-composed by default, but `Hook`/`Problem` accept `align: "left"` + `kicker` (an editorial left-anchored title card), `feature-list` accepts `align: "left"`, and `stat-callout` accepts `layout: "hero"` (one giant number filling the frame). Used to alternate left/center framing so a reel doesn't read as one centered column. Left-align is for 16:9/1:1 only; vertical cuts stay centered for legibility.
- **gif/lite path**: freezes the camera and atmosphere drift, drops patterned overlays (grid/scanlines), and flattens the CTA, because per-frame motion balloons GIF file size. The CLI also renders gifs at `--scale=0.6` (e.g. 1152x648) — fewer pixels roughly halves the file with no layout/timing change. The mp4 cuts keep the full graded cinema; the committed showcase GIFs are the lite preview.

## Data flow

### How a video is produced

1. User edits (or the skill writes) `reelme.json` at the user's repo root
2. `npx reelme render` reads `reelme.json`, validates it (schema version, referenced assets), and scaffolds the bundled template into `~/.reelme/cache/<project-hash>/`, copying the brief and user visual assets into the scaffold
3. The scaffold's `src/index.ts` registers **one Remotion composition per selected platform** (`Reel-<platform>`), taking dimensions/fps from the platform preset and scenes from the preset's cut; `calcTotalDuration()` computes total frames per composition
4. `src/Root.tsx` maps each scene of the active cut to a `<Sequence>` with a fixed duration, rendering the right scene component via `SceneRenderer`
5. Scene components read from the `Brief` type and compose primitives; they also receive the platform preset via composition props, so captions/headlines can scale up and avoid safe areas on 9:16
6. `buildTheme(primaryColor)` in `src/theme.ts` derives a full color palette (bg, surface, accent, text, border) from a single hex using chroma-js
7. The CLI's render orchestration loops `project.platforms`, renders each composition, and copies outputs to `./reelme-out/<platform>.<ext>`; when `cuts.teaser` exists, the teaser cut additionally renders per social platform as `reelme-out/<platform>-teaser.mp4`

`npx reelme studio` opens Remotion Studio against the cache dir, which shows all registered compositions, so every platform variant can be previewed.

### Skill flow (`SKILL.md`)

Intended fresh run: detect existing brief (update vs. fresh) → determine mode (Step 1 proposes announcement mode when a recent tag/changelog is detected) → read repo → interview (only uncertain fields; **platform multi-select replaces the format question**) → propose outline organized by cuts → write `reelme.json` at the repo root (committed) → offer preview via `npx reelme studio` → `npx reelme render` → distribution guidance (GitHub README GIF embed snippet; suggest gitignoring `reelme-out/`).

The skill no longer rsyncs `template/` or runs `pnpm install` in the user's repo — scaffolding and dependency installation happen inside the CLI's global cache.

Update mode (when `reelme.json` exists): re-read repo → surface drift → apply targeted edits to `reelme.json` → offer preview → `npx reelme render` (reuses the cache, no reinstall).

### Generated project location

The Remotion project is scaffolded by the CLI into `~/.reelme/cache/<project-hash>/`, never into the user's repo. The user's repo keeps only `reelme.json` (committed — the brand memory across releases) and `reelme-out/` (render outputs, suggested gitignore). Users who want to tweak the Remotion code can edit the cache scaffold via `npx reelme studio`; `npx reelme clean` resets it.

## Stack

- Language: TypeScript
- Framework: Remotion (pinned 4.0.290)
- Database / storage: none — zero-cloud, local render only
- Key libraries: chroma-js (color palette derivation), lucide-react (icon registry), `@remotion/gif` (GIF output and gif clips), vitest (unit tests), ESLint

## Key decisions

### Hybrid delivery: skill + thin CLI (ADR 0003)

The skill owns the intelligence (read repo → interview → write `reelme.json`); the `reelme` npm package owns the mechanics (cache scaffold, presets, render, studio, clean). This drops the user's repo footprint from a ~150MB scaffolded project to a JSON file, gives reelme an npm registry surface (organic discovery plus download counts, the missing validation metric), and opens a future CI path (`npx reelme render` in an Action). The cost: a second artifact to version and publish, and CLI↔brief schema compatibility managed via a schema version field in `reelme.json`. See ADR 0003.

### Brief schema v2 (`cli/template/src/brief.ts`) — cuts replace format, no backwards compatibility

The `Brief` type is the contract between the skill interview and the Remotion render. The brief lives at `reelme.json` in the user's repo root and carries a schema version field for CLI↔schema compatibility. v2 replaces the single `scenes` array with cuts, with no backwards compatibility:

```ts
cuts: { main: Scene[]; vertical?: Scene[]; teaser?: Scene[] }
```

Cut semantics:

- `main`: the full narrative arc
- `vertical`: hook-first, fewer scenes, less text per second
- `teaser`: ≤10s, hook + CTA

Adding a new scene type means: adding to the union in `brief.ts`, creating a scene component, adding a case in `SceneRenderer`, and adding a duration entry in `SCENE_DURATION_MAP`. `feature-list` duration is computed dynamically from `items.length` in `sceneDuration()` rather than from the map.

`ProjectMeta` v2 fields:

- `platforms: PlatformId[]`: replaces `format`; the user picks platforms, presets derive dimensions
- `audio?: { track: string; volume?: number } | false`: bundled background music selection, or `false` for silence
- `watermark?: boolean`: default true; implemented on `ProjectMeta` as `project.watermark`

`ProjectMeta` optional fields:

- `mode: "intro" | "announcement"`: switches Problem scene between accent bar and version badge; switches CTA copy between "Get started with X" and "X is here"
- `version`: shown in the version badge and CTA title when `mode === "announcement"`
- `logo`: filename in the scaffold's `public/` (e.g. `"logo.svg"`); rendered via Remotion's `<Img src={staticFile(logo)} />` in the CTA scene
- `tone: "professional" | "playful" | "technical"`: drives both the `motion` profile (spring configs) and the default font pair. professional = Inter + JetBrains Mono, moderate springs. playful = Nunito + JetBrains Mono, bouncy springs. technical = IBM Plex Sans + Space Mono, tight springs. Explicit `font`/`monoFont` fields override the tone defaults.
- `bgStyle?: "deep" | "branded" | "light"`: controls background mix ratio. deep = near-black (default, 0.92 mix). branded = visibly tinted (0.76 mix). light = white-based with dark text
- `look?: "keynote" | "noir" | "arcade" | "blueprint" | "editorial"`: art-direction preset (lighting, grade, grain, camera, cut rhythm); defaults from `tone` via `resolveLook()`. See the Cinematic layer.
- `transition?: "fade" | "slide" | "zoom"`: legacy; now ignored — the look's cut rhythm drives the edit.

`ProblemScene` has an optional `hero?: boolean` field: when true, renders the headline at 104px (vs 72px default), spans the accent bar full width, and hides `subtext`. Use for the opening scene.

`FeatureListScene.items` accepts `Array<string | { text: string; icon?: string }>`. Plain strings are backwards compatible. When `icon` is set, the bullet circle shows the icon from the Lucide registry; otherwise it shows the 1-based item number.

### Skill standard

`SKILL.md` follows the open [Agent Skills](https://agentskills.io) standard, making it compatible with any supporting agent (Claude Code, Cursor, Gemini CLI, Codex, etc.) rather than being Claude Code-specific.

### Local rendering only

Rendering runs locally via `npx reelme render` (the CLI's render orchestration over the cache scaffold). No cloud account, no billing, no AWS setup required. This keeps friction near zero for first-time users. Remotion Lambda is documented as an opt-in option for later.

### Platforms, not formats

Users select publishing platforms; aspect ratio, fps, duration ceilings, and safe areas are internal details of the platform presets and are never surfaced as questions. This keeps the interview in the user's language ("where will you post this?") instead of video jargon.

### Audio: curated CC0 set, bundled, no runtime API

A runtime Freesound API integration was rejected: it would require a per-user API key + OAuth (breaking the zero-config principle) and put the license-filtering burden on every run. Instead, Freesound/Pixabay are used once at curation time by the author; the 8–12 CC0 tracks ship inside the npm package, with attribution recorded in `cli/assets/audio/manifest.json` for provenance.

### Watermark as growth loop

The default-on "made with reelme" credit in the CTA footer is the distribution mechanism. It is deliberately discreet and deliberately removable (`watermark: false`) — no nagging, no paywall.

### No DESIGN.md

By decision, there is no fixed palette or design doc: the video's visual system is generated at runtime per project via `buildTheme(hex)`.

## Open questions

- **Teaser render multiplication**: when `cuts.teaser` exists and many platforms are selected, the teaser renders once per social platform. Should it instead render once per unique dimension set, or be capped/opt-in per platform?
- **LinkedIn default aspect**: should the `linkedin` preset default to 1:1 (more feed real estate) or 16:9 (native video player)? Currently both are allowed; a default needs picking.
- **Render time with N platforms**: the CLI renders sequentially, so total time grows linearly with selected platforms on consumer hardware. No parallelism yet — is it worth adding concurrency, or does Remotion's own per-render concurrency already saturate the machine?
- **npm package name availability**: is `reelme` free on the npm registry? Checking is a Phase 1 task; fallback name is `reelme-cli`.
- **CLI↔schema version policy**: `reelme.json` carries a schema version, but the exact compatibility rule (CLI refuses on major mismatch? auto-migrates? warns?) is undecided.
