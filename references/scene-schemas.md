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
    "monoFont": ""
  },
  "scenes": [
    { "type": "problem", "headline": "", "subtext": "", "caption": "" },
    { "type": "feature-list", "headline": "", "items": ["", ""], "caption": "" },
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
    "monoFont": ""
  },
  "scenes": [
    { "type": "problem", "headline": "", "subtext": "", "caption": "" },
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

## os-window icon registry

Available icon names for `items[].icon`: `lock` `key` `shield` `eye` `eye-off` `fingerprint` `database` `server` `globe` `cloud` `hard-drive` `terminal` `code` `file-code` `file` `folder` `folder-open` `copy` `check` `search` `plus` `trash` `edit` `download` `upload` `chevron-right` `chevron-down` `arrow-right` `user` `users` `star` `settings` `bell` `clock` `zap` `package` `alert-circle` `info` `check-circle`
