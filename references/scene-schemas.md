# Scene schemas and reference

Read this file during Step 5 (Build the brief) to get the full JSON shapes, scene field details, and font/caption options.

---

## Intro mode shape

```json
{
  "project": {
    "name": "",
    "tagline": "",
    "problem": "",
    "installCommand": "",
    "repoUrl": "",
    "primaryColor": "",
    "tone": "professional",
    "mode": "intro",
    "logo": "",
    "font": "",
    "monoFont": "",
    "transition": "fade",
    "bgStyle": "deep",
    "format": "16:9"
  },
  "scenes": [
    { "type": "problem", "headline": "", "subtext": "", "caption": "", "hero": true },
    { "type": "feature-list", "headline": "", "items": [{ "text": "", "icon": "check" }], "caption": "" },
    { "type": "code-reveal", "language": "", "code": "", "highlightLine": 1, "caption": "" },
    { "type": "terminal", "commands": [{ "input": "", "output": "" }], "caption": "" },
    { "type": "data-flow", "nodes": [{ "id": "", "label": "" }], "edges": [{ "from": "", "to": "", "label": "" }], "caption": "" },
    { "type": "split", "before": { "label": "", "content": "" }, "after": { "label": "", "content": "" }, "caption": "" },
    { "type": "browser", "url": "", "image": "", "caption": "" },
    { "type": "stat-callout", "headline": "", "stats": [{ "value": "", "label": "" }], "caption": "" },
    { "type": "file-tree", "headline": "", "entries": [{ "path": "", "type": "file", "highlight": false }], "caption": "" },
    { "type": "mobile", "title": "", "image": "", "caption": "" },
    { "type": "os-window", "title": "", "searchQuery": "", "items": [{ "icon": "key", "label": "", "value": "", "highlighted": false }], "caption": "" },
    { "type": "hotkey", "keys": ["⌘", "⇧", "Space"], "action": "", "caption": "" },
    { "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
  ]
}
```

## Announcement mode shape

```json
{
  "project": {
    "name": "",
    "tagline": "",
    "problem": "",
    "installCommand": "",
    "repoUrl": "",
    "primaryColor": "",
    "tone": "professional",
    "mode": "announcement",
    "version": "",
    "logo": "",
    "font": "",
    "monoFont": "",
    "transition": "fade",
    "bgStyle": "deep",
    "format": "16:9"
  },
  "scenes": [
    { "type": "problem", "headline": "", "subtext": "", "caption": "", "hero": true },
    { "type": "feature-list", "headline": "", "items": ["", ""], "caption": "" },
    { "type": "code-reveal", "language": "", "code": "", "highlightLine": 1, "caption": "" },
    { "type": "terminal", "commands": [{ "input": "", "output": "" }], "caption": "" },
    { "type": "split", "before": { "label": "", "content": "" }, "after": { "label": "", "content": "" }, "caption": "" },
    { "type": "stat-callout", "headline": "", "stats": [{ "value": "", "label": "" }], "caption": "" },
    { "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
  ]
}
```

---

## Transition

One global transition style applied to every scene cut. Pick based on `tone` + `mode`:

- `"fade"` — dissolve to background. Default. Suits professional intros, neutral tones, most libraries and dev tools.
- `"slide"` — content slides up in, out to top. More kinetic. Suits energetic projects, vibrant colors, CLI tools with a bold personality.
- `"zoom"` — slight scale-in + fade. Punchy. Suits announcements and bold product launches.

When in doubt, use `"fade"`. A single consistent transition style across all scenes always beats mixing multiple types.

---

## Fonts

`font` (sans): `"Inter"` · `"Space Grotesk"` · `"DM Sans"` · `"Syne"` · `"Plus Jakarta Sans"` · `"Nunito"` · `"IBM Plex Sans"`

Pick by project character:
- **Inter** — clean, neutral; safe default
- **Space Grotesk** — geometric, techy; CLI tools, dev utilities, startups
- **DM Sans** — warm, rounded; libraries, friendly APIs
- **Syne** — bold, display; announcements, product launches
- **Plus Jakarta Sans** — modern, professional; SaaS, design tools
- **Nunito** — playful; educational tools, creative projects
- **IBM Plex Sans** — precise; infrastructure, databases, enterprise

`monoFont`: `"JetBrains Mono"` (default) · `"Space Mono"` (retro/hacker feel, good for CLI-first tools)

---

## Captions

5–10 words. The takeaway, not a description. Appears as a pill overlay after the scene's animation settles. Omit or `""` to skip.

Examples: `"Developers judge a project in seconds."` · `"One command. One video."` · `"Star it, share it, ship it."`

---

## Logo

Set `"logo": "<filename-only>"` (e.g. `"logo.png"`) if the user provided a logo path. Leave as `""` if none.

---

## Background style (`bgStyle`)

Controls background darkness. Add to `project`:

- `"deep"` — near-black tinted background. Default. Works for all accent colors.
- `"branded"` — background visibly carries the brand hue (0.76 mix vs 0.92 deep). Use when the accent is strong and the user wants the brand to show in the background.
- `"light"` — white-based background with light surfaces. Use for bright-brand tools that would look off on dark backgrounds.

---

## Format (`format`)

Output dimensions. Add to `project`:

- `"16:9"` — 1920×1080. Default. YouTube, README embeds, presentations.
- `"1:1"` — 1080×1080. Twitter/X, LinkedIn.
- `"9:16"` — 1080×1920. Instagram Reels, TikTok, YouTube Shorts.

---

## Problem scene: hero mode

Add `"hero": true` to a `problem` scene to activate full-bleed headline mode:
- Headline renders at ~104px (vs 72px default), filling the frame
- Accent bar spans full width
- `subtext` is hidden in hero mode — use only the headline

Always use `"hero": true` for the opening problem scene. Only omit `hero` for a secondary problem-style scene mid-video.

---

## Feature list items: icons

`items` accepts plain strings (backwards compatible) or objects with an optional icon:

```json
{ "text": "Zero config needed", "icon": "zap" }
```

When `icon` is set, the bullet circle shows the icon. When omitted, the bullet shows the item number (1, 2, 3…). Prefer icons when a clear match exists — it makes each item visually distinct. Use the same icon registry as `os-window` items.

---

## os-window icon registry

Available icon names for `items[].icon` and `feature-list` item icons: `lock` `key` `shield` `eye` `eye-off` `fingerprint` `database` `server` `globe` `cloud` `hard-drive` `terminal` `code` `file-code` `file` `folder` `folder-open` `copy` `check` `search` `plus` `trash` `edit` `download` `upload` `chevron-right` `chevron-down` `arrow-right` `user` `users` `star` `settings` `bell` `clock` `zap` `package` `alert-circle` `info` `check-circle`
