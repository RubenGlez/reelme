---
name: reelme
description: "Generate a 2D animated explainer video for any open-source project: MP4, GIF, and editable Remotion source. Use when the user wants to create a demo video, explainer video, or feature announcement video for their project."
license: MIT
compatibility: Requires Node.js >=18 and pnpm on the host machine.
metadata:
  disable-model-invocation: "true"
allowed-tools: Bash Read Write Edit
---

## Step 0: Check for existing brief

Check whether `.reelme/src/brief.json` already exists.

```bash
[ -f ".reelme/src/brief.json" ] && echo "exists" || echo "not found"
```

**If not found** → skip to Step 1.

**If found:**

Read `.reelme/src/brief.json` and show the user a compact summary:

> **Existing video found**
> Project: [name] · Mode: [mode] · [N] scenes: [scene types joined by ", "]

Then ask:

> Update the existing video, or start fresh?

- **Start fresh** → continue to Step 1 (the full flow; the existing `.reelme/` will be overwritten at Step 7).
- **Update** → skip to **[Update Mode](#update-mode)** at the bottom of this file.

---

## Step 1: Determine mode

Ask the user one question before reading anything:

> "Is this a **project intro** (explain what the project does) or a **feature announcement** (highlight what's new in a release)?"

Wait for the answer before proceeding.

---

## Step 2: Read the repo

**Intro mode** — read `README.md`, the manifest file (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod`), and up to 3 key source files. Extract: `name`, `tagline`, `problem`, `installCommand`, `repoUrl`, `key_feature`, `code_example`.

**Announcement mode** — read `CHANGELOG.md` (if it exists), run `git log --oneline -20`, and `git diff <latest-tag>..HEAD --stat`. Extract: `name`, `version`, `headline`, `subtext`, `key_change`, `installCommand`, `repoUrl`.

Mark each field `confident` or `uncertain`.

---

## Step 3: Interview

**Always ask:**
- `primary_color` — "What's the project's primary brand color? (hex, e.g. #6366f1)"
- `logo` — "Do you have a logo file? (optional; path relative to the repo root)"
- `bg_style` — "Background style: **deep** (near-black, default), **branded** (background visibly tinted with your accent), or **light** (white-based)?"
- `format` — "Output format: **16:9** (YouTube / README embeds, default), **1:1** (Twitter / LinkedIn), or **9:16** (Reels / Shorts)?"

**Ask only if uncertain:** one question per uncertain field, pre-filled with your best guess. Ask all questions in a single numbered list.

---

## Step 4: Propose the outline

Present the proposed video to the user before writing anything:

> **Narrative:** [one sentence on the overall story]
>
> 1. **[Scene type]** — [what it shows and the point it makes]
> 2. …
>
> Does this capture what you want to show? Anything to change, add, or cut?

Rules: use plain language; name actual content (not abstractions); keep to 3–6 scenes; flag uncertainty. Wait for explicit approval before proceeding to Step 5.

---

## Step 5: Build the brief

Read [`references/scene-schemas.md`](references/scene-schemas.md) for the full JSON shapes, transition options, font options, caption guidance, and icon registry.

Write `.reelme/brief.json` using only the scenes the user approved in Step 4.

**Scene selection — intro:**
- `problem` first (with `"hero": true`), `cta` last. Always.
- Minimum structure: opener → proof point → CTA. Every scene beyond that must earn its place.
- `stat-callout` is the strongest proof point — use it penultimate (before CTA) whenever there are compelling numbers (speed, size, count). It's the "proof before the ask."
- `split` for before/after contrast — the most visceral way to show value.
- `feature-list` to enumerate what it does (3–5 items). Assign an icon from the registry to each item where a match exists.
- `code-reveal` if there is a representative code example.
- `terminal` if it's a CLI tool or the install flow is the demo.
- `data-flow` if the project has a clear pipeline.
- `browser` if it has a web UI or produces visual output.
- `file-tree` if the generated structure is a selling point.
- `mobile` if it's a mobile app.
- `os-window` if it has a native desktop UI (menu bar app, settings panel).
- `hotkey` if there's a signature keyboard shortcut (e.g. ⌘⇧Space, Ctrl+K).
- 1–3 middle scenes max. Fewer is better.

**Scene selection — announcement:**
- `problem` acts as the "what's new" opener — punchy release headline, not pain framing.
- `feature-list` if there are multiple notable changes.
- `code-reveal` / `terminal` / `split` / `stat-callout` if the key change fits.
- Skip `data-flow`, `browser`, `file-tree`, `mobile` unless directly relevant.
- Always end with `cta`.

---

## Step 6: Ask about gitignore

> "I'll scaffold the Remotion project at `.reelme/`. Do you want to keep it for future edits? If not, I'll add it to `.gitignore`."

---

## Step 7: Scaffold

```bash
SKILL_DIR=$(find "$HOME" -maxdepth 6 -name "SKILL.md" -path "*/reelme/SKILL.md" 2>/dev/null | head -1 | xargs dirname)
rsync -a \
  --exclude='.gitignore' \
  --exclude='src/__tests__' \
  --exclude='src/brief.json' \
  --exclude='eslint.config.mjs' \
  --exclude='vitest.config.ts' \
  --exclude='out' \
  --exclude='node_modules' \
  --exclude='public/logo.png' \
  --exclude='public/.gitkeep' \
  "$SKILL_DIR/template/" ".reelme/"
cp .reelme/brief.json .reelme/src/brief.json
```

If the user provided a logo: `cp <logo_path> .reelme/public/<logo_filename>`

If the user chose not to keep it: `echo ".reelme/" >> .gitignore`

```bash
cd .reelme && pnpm install && pnpm approve-builds --all
```

---

## Step 8: Preview and render

Your project is scaffolded and ready. Ask:

> Preview in Remotion Studio before rendering, or render now?
>
> - **Preview first** — run `cd .reelme && pnpm start` (or `! cd .reelme && pnpm start`) to open Remotion Studio at http://localhost:3000. Come back when you're happy and I'll render the final video.
> - **Render now** — I'll render immediately.

Wait for the user's signal, then run:

```bash
cd .reelme && pnpm render
```

**After a successful render**, confirm the output files and share distribution guidance:

> Your video is ready:
> - `.reelme/out/video.mp4` — best quality; use for YouTube, landing pages, direct sharing
> - `.reelme/out/video.gif` — for README embeds and GitHub previews
>
> **Where to share it:**
> - **README**: `` ![demo](.reelme/out/video.gif) `` for an auto-playing GIF
> - **Twitter/X or LinkedIn**: upload the MP4 directly; 1:1 performs best — re-render with `"format": "1:1"` in brief.json if you're on 16:9
> - **Instagram Reels / TikTok / YouTube Shorts**: re-render with `"format": "9:16"` for vertical
> - **YouTube**: the 16:9 MP4 is ready to upload as-is
>
> Adapt based on `brief.project.format`:
> - `"1:1"` already set → MP4 is ready for Twitter/LinkedIn; note that YouTube needs 16:9
> - `"9:16"` already set → MP4 is ready for Reels/Shorts; note that YouTube/README need 16:9
> - `"16:9"` (default) → use GIF for README, MP4 for YouTube; mention the other formats for social
>
> To iterate: edit `.reelme/src/brief.json` and run `cd .reelme && pnpm render`

---

## Update Mode

_Reached from Step 0 when `.reelme/src/brief.json` already exists._

### U1: Read current brief and re-read repo

Read `.reelme/src/brief.json` in full. Then re-read the repo using the same logic as Step 2 for the current `mode` in `brief.project`:

- **intro**: re-read `README.md` and the manifest file.
- **announcement**: re-read `CHANGELOG.md` (if exists) and run `git log --oneline -10`.

Compare what the repo says now against what's in the brief. Note any obvious drift (e.g. tagline changed, new version in manifest, new sections in README).

### U2: Surface the diff and ask what to change

Show the user:

> **Current brief:** [compact summary — name, mode, scenes]
>
> **What I noticed:** [any drift between current repo and brief, or "no obvious changes detected"]
>
> What do you want to update? Describe it in plain language — e.g. "update the tagline", "the version is now 2.1", "add a stat-callout with these numbers", "change the color to #f97316", "replace the terminal scene with a code-reveal".

Wait for their answer.

### U3: Apply targeted edits

Make only the changes the user asked for. Read `references/scene-schemas.md` if adding or changing scene types. Write the updated brief back to `.reelme/src/brief.json` directly — do not write to `.reelme/brief.json` or re-run rsync.

### U4: Preview and render

Ask:

> Brief updated. Preview in Remotion Studio before rendering, or render now?
>
> - **Preview first** — run `cd .reelme && pnpm start` (or `! cd .reelme && pnpm start`) to open Remotion Studio at http://localhost:3000. Come back when you're happy.
> - **Render now** — I'll render immediately.

Wait for the user's signal, then run:

```bash
cd .reelme && pnpm render
```

After a successful render, show the same distribution guidance from Step 8.

---

## Gotchas

- **`pnpm approve-builds --all` is required.** esbuild needs a post-install script. Skipping this step causes `pnpm render` to fail. `template/pnpm-workspace.yaml` persists the approval so re-installs don't re-prompt.
- **Node ≥18 required.** If `pnpm install` fails, check the Node version and suggest `nvm use 22`.
- **`find` may resolve to the author's local clone.** If you are working in the `reelme` repo itself, `find` picks up the local SKILL.md. The rsync excludes (`out`, `node_modules`, `public/logo.svg`) are there to handle this safely.
- **brief.json must land at `.reelme/src/brief.json`.** Writing it anywhere else and the Remotion composition won't find it.
- **Keep scene count to 3–5 total.** More scenes makes the video feel padded, not comprehensive.
- **`font` takes the display name with spaces** (e.g. `"Space Grotesk"`), not a CSS identifier.
- **Missing logo path:** warn the user and proceed with `"logo": ""` rather than blocking.
- **Update mode never re-scaffolds.** Only write `.reelme/src/brief.json` and render. Do not run rsync or `pnpm install` in update mode.
