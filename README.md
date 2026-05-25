# reelme

**Your README, but as a video.**

`reelme` is an agent skill that generates animated explainer videos for open-source projects. Point it at any repo, answer a few questions, and get an MP4 and a GIF ready to drop into your README, socials, or landing page.

![reelme demo](https://raw.githubusercontent.com/RubenGlez/reelme/main/showcase.gif)

---

## Install

**As an agent skill (recommended):**

```bash
npx skills add RubenGlez/reelme
```

This installs the `/reelme` skill via [skills.sh](https://skills.sh) into any compatible agent: Claude Code, Cursor, Gemini CLI, OpenAI Codex, and any other [Agent Skills](https://agentskills.io)-compatible tool.

**As a standalone CLI:**

```bash
npx reelme
```

No agent required. Scaffold and render from a `brief.json` you write or generate yourself.

**Requirements:** Node.js >=18, pnpm

---

## Usage

### With an agent (AI-powered)

Open your agent inside any repo and run:

```
/reelme
```

The agent will:
1. Ask whether this is a **project intro** or a **feature announcement**
2. Read your repo and pre-fill everything it can infer
3. Ask only about the gaps (brand color, logo, anything uncertain)
4. Scaffold a Remotion project and render your video locally

Output lands at `video/out/video.mp4` and `video/out/video.gif` by default.

### With the CLI (manual)

```bash
# Create a starter brief.json in the current directory
npx reelme init

# Edit brief.json, then render
npx reelme render

# Options
npx reelme render --brief path/to/brief.json --out path/to/output
```

---

## Two modes

**Project intro:** run once per project. The agent reads your README and source files, figures out what makes it worth using, and builds a full explainer.

**Feature announcement:** run after a release. The agent reads your changelog and recent git history, focuses on what changed and why it matters, and keeps your existing brand.

---

## Scene types

| Scene | What it shows |
|---|---|
| `problem` | The pain your project solves, or a release headline |
| `feature-list` | Key features or changes, revealed one by one |
| `code-reveal` | A code snippet typing itself in, key line highlighted |
| `terminal` | Commands running, output appearing progressively |
| `data-flow` | Nodes and arrows showing how data moves through your system |
| `split` | Before/after contrast, great for DX improvements |
| `browser` | A mock browser window with your URL or a screenshot |
| `stat-callout` | Big animated numbers — great for benchmarks or milestones |
| `file-tree` | A directory tree that reveals entry by entry |
| `mobile` | A phone frame with your app UI or a screenshot |
| `cta` | Install command and repo URL |

The agent picks the right scenes for your project. You can also edit `video/src/brief.json` directly and re-run `pnpm render` to tweak without restarting the interview.

---

## Customization

Everything is driven by `video/src/brief.json`. After the first render, edit it and run:

```bash
cd video && pnpm render
```

The Remotion source is yours to adjust: timing, copy, colors, scenes.

---

## brief.json reference

### `project`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Project name |
| `tagline` | string | One-line description |
| `primaryColor` | string | Hex color, e.g. `#6366f1` |
| `tone` | `"professional"` \| `"playful"` \| `"technical"` | |
| `mode` | `"intro"` \| `"announcement"` | Default: `"intro"` |
| `installCommand` | string | e.g. `npm install mylib` |
| `repoUrl` | string | e.g. `github.com/you/mylib` |
| `logo` | string | Filename in `video/public/`, e.g. `logo.svg` |
| `version` | string | Announcement mode only, e.g. `v2.0.0` |

### `scenes`

Each scene has a `type` plus type-specific fields. All scenes accept an optional `caption` (5–10 word takeaway shown as a pill overlay).

**`problem`** — animated headline, good for opening or release announcements
```json
{ "type": "problem", "headline": "", "subtext": "", "caption": "" }
```

**`feature-list`** — bullet points that reveal one by one
```json
{ "type": "feature-list", "headline": "", "items": ["", ""], "caption": "" }
```

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
  "nodes": [{ "id": "", "label": "" }],
  "edges": [{ "from": "", "to": "", "label": "" }],
  "caption": ""
}
```

**`split`** — before/after panels
```json
{ "type": "split", "before": { "label": "", "content": "" }, "after": { "label": "", "content": "" }, "caption": "" }
```

**`browser`** — mock browser window; provide `image` (filename in `video/public/`) or leave blank for a wireframe
```json
{ "type": "browser", "url": "", "image": "", "caption": "" }
```

**`stat-callout`** — big animated numbers, great for benchmarks
```json
{ "type": "stat-callout", "headline": "", "stats": [{ "value": "10x", "label": "faster" }], "caption": "" }
```

**`file-tree`** — directory tree that reveals entry by entry; set `"highlight": true` on key files
```json
{
  "type": "file-tree",
  "headline": "",
  "entries": [{ "path": "src/", "type": "dir" }, { "path": "src/index.ts", "type": "file", "highlight": true }],
  "caption": ""
}
```

**`mobile`** — phone frame; provide `image` (filename in `video/public/`) or leave blank for a wireframe
```json
{ "type": "mobile", "title": "", "image": "", "caption": "" }
```

**`cta`** — install command and repo URL, always last
```json
{ "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
```

---

## License

MIT
