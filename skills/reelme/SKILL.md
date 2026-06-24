---
name: reelme
description: "Generate local Remotion-rendered launch videos for dev projects: social MP4s, README GIFs, and editable reelme.json briefs. Use when the user wants a project intro, release announcement, demo video, or feature launch video for a repo."
license: MIT
compatibility: Requires Node.js >=18 and pnpm on the host machine.
metadata:
  disable-model-invocation: "true"
allowed-tools: Bash Read Write Edit
---

# reelme

Create or update a `reelme.json` brief at the target repo root, then render with the npm CLI:

```bash
npx reelme render
```

The CLI keeps the Remotion project in `~/.reelme/cache/<project-hash>/` and writes final files to `reelme-out/`. Do not scaffold `.reelme/` in the user's repo.

## Step 0: Check for an existing brief

Check whether `reelme.json` exists at the repo root.

```bash
[ -f "reelme.json" ] && echo "exists" || echo "not found"
```

**If not found** -> continue to Step 1.

**If found:**

Read `reelme.json` and show a compact summary:

> **Existing reelme brief found**
> Project: [name] · Mode: [mode] · Platforms: [platform ids] · Main cut: [N] scenes

Then ask:

> Update the existing video, or start fresh?

- **Start fresh** -> continue to Step 1 and replace `reelme.json` after outline approval.
- **Update** -> skip to [Update Mode](#update-mode).

If the brief is v1 (`scenes` at the top level, `format` in `project`, or no `schemaVersion`), tell the user it needs to be migrated to schema v2 and continue through the normal flow.

## Step 1: Determine mode

Ask one question before reading the repo:

> Is this a **project intro** (explain what the project does) or a **feature announcement** (highlight what's new in a release)?

If you notice an obvious recent release signal while looking at the repo — a version tag (`git describe --tags --abbrev=0`) or the top entry in `CHANGELOG.md` / `CHANGES.md` / `HISTORY.md` — lead with it instead of asking cold:

> Looks like you shipped **v2.0.0** — announce it, or a project intro?

Accepting prefills announcement mode and the version. Use judgment: skip the suggestion if the signal is stale or not a real version, and never let detection block or error — if anything is unclear, fall back to the plain question above. If the user already stated intent in their prompt, skip the question entirely.

Wait for the answer before proceeding.

## Step 2: Read the repo

**Intro mode** - read `README.md`, the manifest file (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod`), and up to 3 key source files. Extract:

- `name`
- `tagline`
- `problem`
- `installCommand`
- `repoUrl`
- key features
- representative code or terminal flow
- useful UI, screenshot, screen recording, or demo assets

**Announcement mode** - read `CHANGELOG.md` if it exists, run `git log --oneline -20`, and inspect the latest release diff when a tag is available. Extract:

- `name`
- `version`
- release headline
- release subtext
- key changes
- `installCommand`
- `repoUrl`
- assets that prove the change

Mark each field as confident or uncertain. Interview only for gaps.

## Step 3: Interview

Always ask for missing or preference-only fields in one compact numbered list:

- `primaryColor` - brand color as a hex value, e.g. `#6366f1`
- `logo` - optional repo-relative logo path
- `bgStyle` - `deep` (near-black), `branded` (brand-tinted), or `light` (white-based)
- `look` - art-direction preset (`keynote`, `noir`, `arcade`, `blueprint`, `editorial`); defaults from tone. Sets lighting, camera move, grade, grain, and cut rhythm. Suggest the tone default but pick a distinct look per reel so a project's videos don't all feel the same.
- `platforms` - one or more of `x`, `linkedin`, `youtube`, `tiktok`, `instagram-reel`, `instagram-story`, `instagram-feed`, `github-readme`
- `assets` - optional repo-relative screenshots or clips to use in `browser`, `mobile`, or `clip` scenes
- `audio` - Background music? Offer the tone-matched default by name, an alternative from the bundled manifest, or none.
- `watermark` - whether to keep the default "made with reelme" CTA footer credit

Ask uncertain content questions only when the repo does not give a reliable answer. Pre-fill each question with your best guess.

If assets are provided, verify each path exists and has a supported extension:

- clips: `mp4`, `mov`, `gif`
- images: `png`, `jpg`, `jpeg`, `webp`

Use repo-relative paths in the brief. The CLI copies referenced `clip.src`, `mobile.screenshot`, and `browser.image` files into the render cache at render time.

Audio choices come from the bundled manifest in `cli/assets/audio/manifest.json`. The CLI copies only the chosen track into the render cache at render time. Default by project tone:

| tone | default | alternatives |
|---|---|---|
| `professional` | Calm Keys (`calm-keys.mp3`) | Steady Launch, Clean Horizon, Midnight Protocol |
| `playful` | Bright Sparks (`bright-sparks.mp3`) | Pixel Bounce, Sunny Loop |
| `technical` | Circuit Pulse (`circuit-pulse.mp3`) | Vector Grid, Midnight Protocol, Pixel Bounce |

When writing the brief, set `project.audio` explicitly to `{ "track": "<filename>" }` or `false`. Audio is the chosen music bed only; `audio: false` renders silent.

## Step 4: Propose the outline

Read [`references/narrative.md`](references/narrative.md) before deciding scene order, scene count, and which scenes carry the story.

Present the proposed video before writing anything:

> **Narrative:** [one sentence on the story]
>
> **Main cut**
> 1. **[Scene type]** - [what it shows and why it matters]
> 2. ...
>
> **Platform cuts:** [which platforms will render from main vs vertical]
>
> Does this capture what you want to show? Anything to change, add, or cut?

Rules:

- Use plain language and actual repo details.
- Keep `cuts.main` to 3-8 scenes. Prefer 3-6 unless the project really needs more.
- For 9:16 platforms, propose `cuts.vertical` with 3-5 high-legibility scenes.
- Wait for explicit approval before writing `reelme.json`.

After the user approves the main outline, offer a teaser:

> I'll also add a <=10s teaser (hook + CTA) for short social posts. Want it?

If yes, include `cuts.teaser`, usually `[hook, cta]` with at most one proof scene between them. Keep it at or below 300 frames at 30fps.

## Step 5: Build `reelme.json`

Read [`references/scene-schemas.md`](references/scene-schemas.md) before writing or editing scene JSON, and [`references/copywriting.md`](references/copywriting.md) before writing the on-screen text (headlines, captions, hook, feature labels, CTA).

Write `reelme.json` at the repo root using schema v2:

```json
{
  "schemaVersion": 2,
  "project": {
    "name": "",
    "tagline": "",
    "problem": "",
    "installCommand": "",
    "repoUrl": "",
    "primaryColor": "",
    "tone": "professional",
    "platforms": ["x", "github-readme"],
    "mode": "intro",
    "audio": { "track": "calm-keys.mp3" },
    "watermark": true,
    "bgStyle": "deep"
  },
  "cuts": {
    "main": [],
    "vertical": [],
    "teaser": []
  }
}
```

Required:

- `schemaVersion: 2`
- `project.platforms` with at least one valid platform id
- `cuts.main` with at least one scene

Optional:

- `cuts.vertical` for 9:16 platforms. If omitted, the CLI renders the main cut letterboxed into vertical outputs and warns the user.
- `cuts.teaser` for additional `<platform>-teaser.mp4` outputs on social platforms. GIF platforms are excluded from teaser rendering.
- `project.watermark`; defaults to `true`. Set `false` only if the user asks to remove the CTA footer credit.
- `project.logo`, `font`, `monoFont`, `look`, `bgStyle`, `version`. (`transition` is legacy and ignored; the look drives the edit rhythm.)
- `project.audio`; set `{ "track": "<filename>", "volume": 0.25 }` for bundled background music or `false` for silent output. Omit `volume` to use the default 0.25.

### Scene selection - intro

- Open with `problem` using `"hero": true`; end with `cta`.
- Use `terminal` for CLI tools or install/demo flows.
- Use `code-reveal` for a concise representative code example.
- Use `feature-list` for 3-5 concrete benefits.
- Use `stat-callout` when the repo has compelling standalone numbers.
- Use `benchmark` when the project competes on a measurable metric against named alternatives (speed, size, throughput) — animated comparison bars with the project's bar marked `"hero": true`. Use real, sourced numbers only.
- Use `split` for before/after contrast.
- Use `data-flow` for pipelines.
- Use `browser`, `mobile`, or `clip` when real visual assets exist.
- Use `file-tree`, `os-window`, or `hotkey` only when those surfaces are central to the value.

### Scene selection - announcement

- Open with `hook` or a punchy `problem` scene that states what's new.
- Prefer `feature-list`, `clip`, `terminal`, `code-reveal`, `split`, `stat-callout`, or `benchmark` for proof.
- Skip dense intro-only scenes unless the release is specifically about that surface.
- End with `cta`.

### Vertical cut

Use `cuts.vertical` whenever any selected platform is `tiktok`, `instagram-reel`, or `instagram-story`.

- Open with `hook`: one short claim, ideally <=10 words.
- Use fewer scenes than the main cut.
- Favor `hook`, `problem`, `feature-list`, `stat-callout`, `terminal`, `mobile`, `clip`, and `cta`.
- Keep captions short and avoid dense file trees, data flows, or long code.

## Step 6: Preview or render

Ask:

> Preview in Remotion Studio before rendering, or render now?
>
> - **Preview first** - run `npx reelme studio` to open Remotion Studio against the cached project.
> - **Render now** - run `npx reelme render`.

Wait for the user's signal.

For preview:

```bash
npx reelme studio
```

For render:

```bash
npx reelme render
```

After a successful render, confirm the output files in `reelme-out/`:

- Social/video platforms: `<platform>.mp4`
- GitHub README: `github-readme.gif`
- Teasers when `cuts.teaser` exists: `<platform>-teaser.mp4` for non-GIF platforms

Share concise distribution guidance:

- Upload MP4 files directly to X, LinkedIn, YouTube, TikTok, and Instagram.
- For `github-readme`, embed the GIF in the README with `![demo](reelme-out/github-readme.gif)` (commit the GIF, or host it as a release asset and use that URL).
- Commit `reelme.json` as the editable source of truth.
- Usually add `reelme-out/` to `.gitignore` unless the repo intentionally tracks generated media.

## Update Mode

Reached from Step 0 when `reelme.json` already exists.

### U1: Read current brief and re-read repo

Read `reelme.json` in full.

If it is not schema v2, migrate it during the update:

- Add `schemaVersion: 2`.
- Move top-level `scenes` to `cuts.main`.
- Replace any `project.format` choice with `project.platforms`.
- Rename `mobile.image` to `mobile.screenshot`.

Then re-read the repo using the same logic as Step 2 for the current `project.mode`:

- **intro**: re-read `README.md` and the manifest file.
- **announcement**: re-read `CHANGELOG.md` if it exists and run `git log --oneline -10`.

### U2: Surface the diff and ask what to change

Show:

> **Current brief:** [name, mode, platforms, main/vertical/teaser scene counts]
>
> **What I noticed:** [drift between repo and brief, or "no obvious changes detected"]
>
> What do you want to update?

Wait for the answer.

### U3: Apply targeted edits

Make only the requested changes and any necessary schema migration edits. Read `references/scene-schemas.md` if adding or changing scene types, and `references/copywriting.md` if rewriting on-screen text.

Write the updated brief back to `reelme.json`. Do not create `.reelme/`, do not edit `~/.reelme/cache/`, and do not manually copy assets.

### U4: Preview or render

Ask the same preview/render question from Step 6, then run `npx reelme studio` or `npx reelme render` based on the user's choice.

## Gotchas

- **No `.reelme/` project in the repo.** The CLI owns the cache at `~/.reelme/cache/<project-hash>/`.
- **Schema v2 is required.** The CLI rejects briefs without `schemaVersion: 2`, with top-level `scenes`, or with old `project.format`.
- **Use platform ids, not aspect ratios.** `project.platforms` drives output dimensions and safe areas.
- **Assets stay repo-relative.** Use paths like `assets/demo.mp4`; the CLI copies referenced assets into cache during render.
- **`mobile` uses `screenshot`, not `image`.** `browser` still uses `image`; `clip` uses `src`.
- **Teasers render only for non-GIF platforms.** `github-readme` does not get a teaser.
- **Vertical platforms can fall back to the main cut, but it is lower quality.** Author `cuts.vertical` for TikTok/Reels/Stories whenever possible.
- **pnpm is required.** The CLI installs render dependencies in the cache on first run and runs `pnpm approve-builds --all` for esbuild.
- **Node >=18 required.** If dependency install fails, check the user's Node version.
