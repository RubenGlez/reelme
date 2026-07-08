# Scene schemas and reference

Read this file when creating or editing `reelme.json`. Current briefs use schema v2: `schemaVersion`, `project`, and `cuts`. The old top-level `scenes` array and `project.format` field are v1 and are rejected by the CLI.

---

## Brief shape

```json
{
  "schemaVersion": 2,
  "project": {
    "name": "Sprout",
    "tagline": "Full-stack apps. Zero config.",
    "problem": "Starting a full-stack project wastes days on setup.",
    "installCommand": "npx create-sprout-app my-app",
    "repoUrl": "github.com/sproutjs/sprout",
    "primaryColor": "#10b981",
    "tone": "professional",
    "platforms": ["x", "tiktok", "github-readme"],
    "mode": "intro",
    "version": "1.2.0",
    "logo": "logo.png",
    "font": "Inter",
    "monoFont": "JetBrains Mono",
    "look": "keynote",
    "bgStyle": "deep",
    "audio": { "track": "calm-keys.mp3" },
    "watermark": true
  },
  "cuts": {
    "main": [
      { "type": "problem", "headline": "Every project starts with setup.", "hero": true },
      { "type": "terminal", "commands": [{ "input": "npx create-sprout-app my-app", "output": "Ready in 60s" }] },
      { "type": "cta", "installCommand": "npx create-sprout-app my-app", "repoUrl": "github.com/sproutjs/sprout" }
    ],
    "vertical": [
      { "type": "hook", "text": "Ship faster", "accent": "faster" },
      { "type": "terminal", "commands": [{ "input": "npx create-sprout-app my-app", "output": "Ready in 60s" }] },
      { "type": "cta", "installCommand": "npx create-sprout-app my-app", "repoUrl": "github.com/sproutjs/sprout" }
    ],
    "teaser": [
      { "type": "hook", "text": "Full-stack setup in one command", "accent": "one command" },
      { "type": "cta", "installCommand": "npx create-sprout-app my-app", "repoUrl": "github.com/sproutjs/sprout" }
    ]
  }
}
```

Enforced by the CLI (a brief that omits these fails to render):

- `schemaVersion: 2`
- `project.platforms` with at least one valid platform id
- `cuts.main` with at least one scene

Always write these too — scenes reference them and the interview collects them, even though the CLI doesn't hard-fail on their absence:

- `project.name`, `project.installCommand`, `project.repoUrl` (used by `cta`)
- `project.primaryColor`, `project.tone` (drive the theme and default look)

Agent-context only — collected to steer copy, but **not rendered anywhere**:

- `project.tagline`, `project.problem`

Optional:

- `project.mode`: `intro` or `announcement`
- `project.version`: useful for announcement mode
- `project.logo`: filename for a logo copied into the render cache
- `project.font`, `project.monoFont`
- `project.look`: art-direction preset that sets lighting, camera move, color grade, film grain, and cut rhythm: `keynote` (clean stage), `noir` (low-key, cool, dips to black), `arcade` (saturated, scanlines, snappy), `blueprint` (engineering grid, measured), or `editorial` (warm, premium, slow). Defaults from tone: professional→keynote, playful→arcade, technical→blueprint. Pick distinct looks across a project's reels so they don't feel templated.
- `project.bgStyle`: `deep`, `branded`, or `light`
- `project.watermark`: default `true`; set `false` to hide the CTA footer credit
- `project.audio`: `{ "track": "calm-keys.mp3", "volume": 0.25 }` for bundled background music, or `false` for silent output. Omit `volume` to use the default 0.25.
- `cuts.vertical`: hook-first cut for vertical platforms
- `cuts.teaser`: <=10s teaser rendered as extra MP4s for non-GIF platforms

---

## Platforms

Set `project.platforms` to one or more platform ids.

| id | Output | Cut |
|---|---|---|
| `x` | `reelme-out/x.mp4` | `main` |
| `linkedin` | `reelme-out/linkedin.mp4` | `main` |
| `youtube` | `reelme-out/youtube.mp4` | `main` |
| `instagram-feed` | `reelme-out/instagram-feed.mp4` | `main` |
| `tiktok` | `reelme-out/tiktok.mp4` | `vertical` |
| `instagram-reel` | `reelme-out/instagram-reel.mp4` | `vertical` |
| `instagram-story` | `reelme-out/instagram-story.mp4` | `vertical` |
| `github-readme` | `reelme-out/github-readme.gif` | `main` |

When `cuts.teaser` exists, the CLI also renders `<platform>-teaser.mp4` for each selected non-GIF platform. `github-readme` does not get a teaser.

If a vertical platform is selected and `cuts.vertical` is missing, the CLI re-renders the main cut at 9:16 (scenes are responsive, not letterboxed) and prints a warning. Dense wide scenes can cramp at 9:16, so author `cuts.vertical` whenever a vertical platform is selected.

---

## Project fields

```ts
{
  name: string;
  tagline: string;
  problem: string;
  installCommand: string;
  repoUrl: string;
  primaryColor: string;
  secondaryColor?: string; // second brand hue for backdrops/gradients; derived from primaryColor when absent
  tone: "professional" | "playful" | "technical";
  platforms: PlatformId[];
  audio?: { track: string; volume?: number } | false;
  watermark?: boolean;
  mode?: "intro" | "announcement";
  version?: string;
  logo?: string;
  font?: string;
  monoFont?: string;
  bgStyle?: "deep" | "branded" | "light";
}
```

### Tone

| tone | Sans default | Mono default |
|---|---|---|
| `professional` | Inter | JetBrains Mono |
| `playful` | Nunito | JetBrains Mono |
| `technical` | IBM Plex Sans | Space Mono |

### Audio

The skill should write an explicit audio choice. `undefined` is treated like `false` by the renderer, so missing audio never breaks a render.

The full bundled track list (set `project.audio.track` to one of these filenames). The tone column is a suggestion, not a restriction — any track works with any tone:

| filename | title | tones |
|---|---|---|
| `lofi-dusk.mp3` | Lofi Dusk | professional |
| `warm-memories.mp3` | Warm Memories | professional |
| `neon-pulse.mp3` | Neon Pulse | technical, playful |
| `night-drive.mp3` | Night Drive | technical |
| `sunny-bounce.mp3` | Sunny Bounce | playful |
| `light-steps.mp3` | Light Steps | playful, professional |

Tone defaults: professional → Lofi Dusk, playful → Sunny Bounce, technical → Neon Pulse. The CLI validates `project.audio.track` against this list and copies only the chosen file into the render cache. GIF outputs do not include audio.

When a track is chosen, scene cuts are quantized to the track's beat grid (the CLI injects the track's BPM into the render), and subtle self-synthesized SFX play under scene transitions. Setting `audio: false` disables the music, the SFX, and the beat quantization together.

### Fonts

`font` options: `Inter`, `Space Grotesk`, `DM Sans`, `Syne`, `Plus Jakarta Sans`, `Nunito`, `IBM Plex Sans`

`monoFont` options: `JetBrains Mono`, `Space Mono`

### Background style

- `deep` - near-black tinted background. Default.
- `branded` - background visibly carries the brand hue.
- `light` - white-based background with light surfaces.

Edit rhythm and transitions are driven entirely by `project.look` — there is no per-scene transition field.

---

## Cuts

```ts
{
  main: Scene[];
  vertical?: Scene[];
  teaser?: Scene[];
}
```

- `main` is the full narrative arc and is always required.
- `vertical` is used by TikTok, Instagram Reel, and Instagram Story. Keep it shorter and more legible than `main`.
- `teaser` should be <=300 frames at 30fps. Use `hook` + `cta`, with at most one quick proof scene.

---

## Scene union

Valid scene types:

`problem` · `feature-list` · `code-reveal` · `terminal` · `data-flow` · `split` · `browser` · `stat-callout` · `benchmark` · `file-tree` · `mobile` · `os-window` · `hotkey` · `hook` · `clip` · `custom` · `cta`

Every scene except `hook` can include `caption?: string`. Captions should be 5-10 words and state the takeaway, not describe the pixels.

---

## Scene shapes

### `problem`

```json
{
  "type": "problem",
  "headline": "Every new project starts the same way.",
  "subtext": "Config files first. Product code later.",
  "caption": "Hours gone before the product starts.",
  "hero": true
}
```

Use `"hero": true` for openers. In hero mode the headline carries the scene; keep it short. Optional `"kicker": string` adds a small eyebrow label above the headline (e.g. the product name), and `"align": "left"` anchors the headline to the left with negative space on the right — a more editorial, less templated composition. Use `align: "left"` only on 16:9/1:1 cuts; keep vertical (9:16) scenes centered for legibility.

### `feature-list`

```json
{
  "type": "feature-list",
  "headline": "Built for teams who ship",
  "items": [
    { "text": "Type-safe API layer out of the box", "icon": "shield" },
    "One-click deploy"
  ],
  "caption": "Start building on day one."
}
```

`items` accepts strings or `{ "text": string, "icon"?: string }` objects. Optional `"align": "left"` left-anchors the list (16:9/1:1 only).

### `code-reveal`

```json
{
  "type": "code-reveal",
  "language": "typescript",
  "code": "export const userRouter = router({ ... });",
  "highlightLine": 1,
  "caption": "End-to-end types, no glue code."
}
```

Use short, representative code. Avoid long files.

### `terminal`

```json
{
  "type": "terminal",
  "commands": [
    { "input": "npx create-sprout-app my-app", "output": "Creating project..." },
    { "input": "cd my-app && pnpm dev", "output": "Local: http://localhost:3000" }
  ],
  "caption": "One command. Production stack."
}
```

Keep outputs concise. The terminal scene should look like a demo, not a full log.

### `data-flow`

```json
{
  "type": "data-flow",
  "nodes": [
    { "id": "repo", "label": "Repo" },
    { "id": "brief", "label": "Brief" },
    { "id": "video", "label": "Video" }
  ],
  "edges": [
    { "from": "repo", "to": "brief", "label": "read" },
    { "from": "brief", "to": "video", "label": "render" }
  ],
  "caption": "Your repo becomes a launch asset."
}
```

Use only for clear pipelines.

### `split`

```json
{
  "type": "split",
  "before": { "label": "Before", "content": "Manual screenshots and captions" },
  "after": { "label": "After", "content": "One brief, every platform" },
  "caption": "One source of truth for launch media."
}
```

Best for before/after contrast.

### `browser`

```json
{
  "type": "browser",
  "url": "https://example.com",
  "image": "assets/dashboard.png",
  "caption": "Show the real product."
}
```

`image` is a repo-relative path to `png`, `jpg`, `jpeg`, or `webp`. The CLI copies it to the render cache.

### `stat-callout`

```json
{
  "type": "stat-callout",
  "headline": "Ready for real projects",
  "stats": [
    { "value": "60s", "label": "to first run" },
    { "value": "0", "label": "cloud APIs" }
  ],
  "caption": "Concrete proof beats broad claims."
}
```

Use real numbers only. Optional `"layout": "hero"` renders the **first** stat at giant scale (one dominant number filling the frame, left-anchored) with the remaining stats small below — a dramatic, distinctive moment. Great as an opener or a single-metric flex.

### `benchmark`

```json
{
  "type": "benchmark",
  "headline": "Faster than the alternatives",
  "metric": "Search time on the Linux kernel (lower is better)",
  "lowerIsBetter": true,
  "bars": [
    { "label": "ripgrep", "value": 0.3, "display": "0.3s", "hero": true },
    { "label": "ag", "value": 1.2, "display": "1.2s" },
    { "label": "grep", "value": 2.1, "display": "2.1s" }
  ],
  "caption": "Real numbers, not vibes."
}
```

Head-to-head comparison as animated horizontal bars. `value` drives bar length; the winner always gets the longest bar (set `lowerIsBetter: true` for metrics like time/size where smaller wins). `display` is the text drawn on the bar (falls back to `value`). Mark the project's own bar with `"hero": true` to highlight it in the accent color. Use 2–4 bars with real, sourced numbers; `metric` names what's measured.

### `file-tree`

```json
{
  "type": "file-tree",
  "headline": "A structure that scales",
  "entries": [
    { "path": "src/app/", "type": "dir", "highlight": true },
    { "path": "src/server/router.ts", "type": "file" }
  ],
  "caption": "Every folder has a job."
}
```

`type` defaults to `file`; use `dir` for directories.

### `mobile`

```json
{
  "type": "mobile",
  "title": "Mobile Preview",
  "screenshot": "assets/mobile-home.png",
  "headline": "One codebase, truly native apps.",
  "points": ["iOS and Android from one project", "Native performance"],
  "caption": "Designed for the small screen."
}
```

Use `screenshot`, not `image`. The path is repo-relative and copied to the render cache.

Add `headline` (and optional `points`) to compose the device as a showcase: the
copy sits beside the phone on landscape cuts and above it on vertical cuts, so the
frame carries weight on both sides. Without them the device sits centered on its
own — fine, but it leaves wide margins on 16:9, so prefer the copy on landscape.

### `os-window`

```json
{
  "type": "os-window",
  "title": "Command Palette",
  "searchQuery": "deploy",
  "items": [
    { "icon": "terminal", "label": "deploy", "value": "Ship to production", "highlighted": true },
    { "icon": "database", "label": "db:push", "value": "Sync schema" }
  ],
  "caption": "Every task is one command away."
}
```

Good for desktop app, command palette, or settings-like experiences.

### `hotkey`

```json
{
  "type": "hotkey",
  "keys": ["Cmd", "Shift", "P"],
  "action": "Open command palette",
  "caption": "No context switching."
}
```

Use plain key labels that render legibly.

### `hook`

```json
{
  "type": "hook",
  "text": "Launch videos from your repo",
  "accent": "repo"
}
```

Use in vertical and teaser cuts, and as a strong 16:9/1:1 opener. Keep `text` short; `accent` highlights one word or phrase. Optional `"kicker": string` adds an eyebrow label (e.g. the product name), and `"align": "left"` left-anchors the hook for an editorial title-card composition (16:9/1:1 only — keep vertical centered).

### `clip`

```json
{
  "type": "clip",
  "src": "assets/demo.mp4",
  "frame": "browser",
  "startFrom": 30,
  "durationInFrames": 120,
  "caption": "Show the real workflow."
}
```

`src` is a repo-relative `mp4`, `mov`, or `gif`. `frame` is `browser`, `mobile`, or `none`. `startFrom` and `durationInFrames` are frame counts.

### `custom`

```json
{
  "type": "custom",
  "component": "reelme-scenes/pipeline.tsx",
  "durationInFrames": 150,
  "caption": "One brief. Every platform."
}
```

A bespoke scene YOU author for this specific project — reserved for the one
differentiating moment no stock scene can express (an animated diagram of the
project's core idea, a signature visual). `component` is a repo-relative
`.tsx` file with a default-exported React component; the CLI stages it and
registers it at render time.

Authoring rules (the component is copied to `src/custom/` in the render
project, so template imports are one level up):

- Default-export a component taking `CustomSceneProps` from
  `"../custom-scenes"` (`theme`, `project`, `platform`, `bottomInset`).
- Build on `"../components/primitives/Stage"` — never paint an opaque
  full-frame background (the film's continuous backdrop must show through).
- Use `theme` colors/fonts only; use `spring({ config: theme.motion })` so
  motion inherits the look; no infinite loops or oscillation during holds.
- Respect the type floors (headline >=84px, supporting >=44px, labels >=32px
  at 1080-wide) and keep the composition hero + supporting mass, no voids.
- At most 1-2 custom scenes per reel. If a stock scene expresses the idea,
  use the stock scene.

### `cta`

```json
{
  "type": "cta",
  "installCommand": "npx create-sprout-app my-app",
  "repoUrl": "github.com/sproutjs/sprout",
  "caption": "Less setup. More shipping."
}
```

Use as the final scene in main and vertical cuts. The CTA footer watermark appears by default unless `project.watermark` is `false`.

---

## Icon registry

Available icon names for `feature-list` items and `os-window` items:

`alert-circle` `arrow-right` `bell` `brackets` `check` `check-circle` `chevron-down` `chevron-right` `clock` `cloud` `code` `copy` `database` `download` `edit` `eye` `eye-off` `file` `file-code` `fingerprint` `folder` `folder-open` `globe` `hard-drive` `info` `key` `lock` `package` `plus` `search` `server` `settings` `shield` `star` `terminal` `trash` `upload` `user` `users` `x` `zap`
