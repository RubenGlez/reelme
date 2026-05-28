# reelme

**Your README, but as a video.**

`reelme` is an agent skill that generates animated explainer videos for open-source projects. Point it at any repo, answer a few questions, and get an MP4 and a GIF ready to drop into your README, socials, or landing page.

![reelme demo](https://raw.githubusercontent.com/RubenGlez/reelme/main/showcase.gif)

---

## Install

```bash
npx skills add RubenGlez/reelme
```

Installs the `/reelme` skill via [skills.sh](https://skills.sh) into any compatible agent: Claude Code, Cursor, Gemini CLI, OpenAI Codex, and any other [Agent Skills](https://agentskills.io)-compatible tool.

**Requirements:** Node.js >=18, pnpm

---

## Usage

Open your agent inside any repo and run:

```
/reelme
```

The agent will:
1. Ask whether this is a **project intro** or a **feature announcement**
2. Read your repo and pre-fill everything it can infer
3. Ask only about the gaps (brand color, logo, background style, output format, anything uncertain)
4. Propose a scene outline for your approval
5. Scaffold a Remotion project at `.reelme/` and render locally

Output: `.reelme/out/video.mp4` and `.reelme/out/video.gif`

After the first render, edit `.reelme/src/brief.json` and run `cd .reelme && pnpm render` to iterate without restarting the interview.

---

## Two modes

**Project intro** — run once per project. The agent reads your README and source files, figures out what makes it worth using, and builds a full explainer.

**Feature announcement** — run after a release. The agent reads your changelog and recent git history, focuses on what changed and why it matters, and keeps your existing brand.

---

## Examples

See the [`examples/`](./examples/) directory for ready-to-use `brief.json` files:

- [`examples/intro.json`](./examples/intro.json) — project intro (professional tone, deep background, 16:9)
- [`examples/announcement.json`](./examples/announcement.json) — feature announcement (playful tone, branded background, feature-list with icons)

Copy either file to `.reelme/src/brief.json`, drop your logo in `.reelme/public/`, then run `cd .reelme && pnpm render`.

---

## Scene types

| Scene | What it shows |
|---|---|
| `problem` | The pain your project solves, or a release headline |
| `feature-list` | Features or changes revealed one by one; each item can have an icon |
| `code-reveal` | A code snippet typing itself in, key line highlighted |
| `terminal` | Commands running, output appearing progressively |
| `data-flow` | Nodes and arrows showing how data moves through your system |
| `split` | Before/after contrast — great for DX improvements |
| `browser` | A mock browser window with your URL or a screenshot |
| `stat-callout` | Big animated numbers — great for benchmarks or milestones |
| `file-tree` | A directory tree that reveals entry by entry |
| `mobile` | A phone frame with your app UI or a screenshot |
| `os-window` | A macOS-style spotlight/command palette window |
| `hotkey` | A keyboard shortcut with animated key presses |
| `cta` | Install command and repo URL — always last |

---

## brief.json reference

### `project`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Project name |
| `tagline` | string | One-line description |
| `primaryColor` | string | Hex color, e.g. `#6366f1` |
| `tone` | `"professional"` \| `"playful"` \| `"technical"` | Drives font and animation physics. professional → Inter + moderate springs. playful → Nunito + bouncy springs. technical → IBM Plex Sans + Space Mono + tight springs. |
| `mode` | `"intro"` \| `"announcement"` | Default: `"intro"` |
| `bgStyle` | `"deep"` \| `"branded"` \| `"light"` | Background darkness. deep = near-black (default). branded = accent tints the background. light = white-based. |
| `format` | `"16:9"` \| `"1:1"` \| `"9:16"` | Output dimensions. 16:9 = 1920×1080 (default). 1:1 = 1080×1080. 9:16 = 1080×1920. |
| `transition` | `"fade"` \| `"slide"` \| `"zoom"` | Scene transition style. Default: `"fade"` |
| `installCommand` | string | e.g. `npm install mylib` |
| `repoUrl` | string | e.g. `github.com/you/mylib` |
| `logo` | string | Filename in `.reelme/public/`, e.g. `logo.png` |
| `font` | string | Sans font override. Overrides the tone default. |
| `monoFont` | string | Mono font override. Overrides the tone default. |
| `version` | string | Announcement mode only, e.g. `v2.0.0` |

### `scenes`

All scenes accept an optional `caption` — a 5–10 word takeaway shown as a pill overlay after the animation settles.

**`problem`** — animated headline; use as the opening scene
```json
{ "type": "problem", "headline": "", "hero": true, "subtext": "", "caption": "" }
```
Set `"hero": true` for a full-bleed 104px headline with no subtext. Omit for the standard layout with a subtext line.

**`feature-list`** — items revealed one by one
```json
{
  "type": "feature-list",
  "headline": "",
  "items": [
    { "text": "Zero config needed", "icon": "zap" },
    { "text": "Works with any language", "icon": "globe" }
  ],
  "caption": ""
}
```
Items can be plain strings or `{ text, icon }` objects. When `icon` is set, the bullet shows the icon; otherwise it shows the item number. Available icon names: `zap` `star` `globe` `check` `code` `terminal` `database` `server` `lock` `shield` `eye` `download` `upload` `user` `users` `settings` `clock` `package` `file` `folder` `search` `arrow-right` and more — see [`references/scene-schemas.md`](./references/scene-schemas.md).

**`code-reveal`** — code that types itself in, one line highlighted
```json
{ "type": "code-reveal", "language": "ts", "code": "", "highlightLine": 1, "caption": "" }
```

**`terminal`** — commands with progressive output
```json
{ "type": "terminal", "commands": [{ "input": "", "output": "" }], "caption": "" }
```

**`data-flow`** — nodes connected by animated arrows
```json
{
  "type": "data-flow",
  "nodes": [{ "id": "a", "label": "Input" }, { "id": "b", "label": "Output" }],
  "edges": [{ "from": "a", "to": "b", "label": "transforms" }],
  "caption": ""
}
```

**`split`** — before/after panels
```json
{ "type": "split", "before": { "label": "", "content": "" }, "after": { "label": "", "content": "" }, "caption": "" }
```

**`browser`** — mock browser window; provide `image` (filename in `.reelme/public/`) or leave blank for a wireframe
```json
{ "type": "browser", "url": "", "image": "", "caption": "" }
```

**`stat-callout`** — big animated numbers; use as the penultimate scene (proof before the CTA)
```json
{ "type": "stat-callout", "headline": "", "stats": [{ "value": "10x", "label": "faster" }], "caption": "" }
```

**`file-tree`** — directory tree that reveals entry by entry; set `"highlight": true` on key files
```json
{
  "type": "file-tree",
  "headline": "",
  "entries": [
    { "path": "src/", "type": "dir" },
    { "path": "src/index.ts", "type": "file", "highlight": true }
  ],
  "caption": ""
}
```

**`mobile`** — phone frame; provide `image` or leave blank for a wireframe
```json
{ "type": "mobile", "title": "", "image": "", "caption": "" }
```

**`os-window`** — macOS-style spotlight/command palette window
```json
{
  "type": "os-window",
  "title": "",
  "searchQuery": "",
  "items": [{ "icon": "key", "label": "", "value": "", "highlighted": false }],
  "caption": ""
}
```

**`hotkey`** — animated keyboard shortcut
```json
{ "type": "hotkey", "keys": ["⌘", "⇧", "P"], "action": "Open command palette", "caption": "" }
```

**`cta`** — install command and repo URL, always last
```json
{ "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
```

---

## License

MIT
