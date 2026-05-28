---
name: reelme
description: "Generate a 2D animated explainer video for any open-source project: MP4, GIF, and editable Remotion source. Use when the user wants to create a demo video, explainer video, or feature announcement video for their project."
license: MIT
compatibility: Works with any Agent Skills-compatible agent. Requires Node.js >=18 and pnpm on the host machine.
disable-model-invocation: true
---

# reelme

Generate a 2D animated explainer video for any open-source project: MP4, GIF, and editable Remotion source.

---

## Step 1: Determine mode

Ask the user one question before reading anything:

> "Is this a **project intro** (explain what the project does) or a **feature announcement** (highlight what's new in a release)?"

Wait for the answer. This determines what to read and how to build the brief.

---

## Step 2: Read the repo

**For intro mode**, read:
- `README.md`
- `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` (whichever applies)
- Up to 3 key source files (infer from the README or entry point)

Extract and hold in memory:
- **name**: project name
- **tagline**: one sentence describing what it does
- **problem**: the pain it solves (infer from README "why" sections, motivation, background)
- **install_command**: the primary install/get-started command
- **repo_url**: from package.json `repository`, or leave blank
- **key_feature**: the one thing that makes this project worth using
- **code_example**: a short, representative code snippet (5-15 lines max) showing the key feature

**For announcement mode**, read:
- `CHANGELOG.md` or `CHANGELOG` (if it exists)
- `git log --oneline -20` (to find the latest tag and recent commits)
- `git diff <latest-tag>..HEAD --stat` (to understand what changed)

Extract and hold in memory:
- **name**: project name (from package.json or git remote)
- **version**: latest tag or the version being announced (e.g. `v2.0.0`)
- **headline**: one punchy sentence: what's new ("Feature announcement mode and logo support")
- **subtext**: one sentence on why it matters
- **key_change**: the most important change: a code snippet, a command, or a description
- **install_command**: current install/upgrade command
- **repo_url**: from package.json `repository`, or leave blank

Mark each field as `confident` or `uncertain`.

---

## Step 3: Interview

**Always ask (both modes):**
- **primary_color**: "What's the project's primary brand color? (hex code, e.g. #6366f1)"
- **logo**: "Do you have a logo file? (optional; provide a path relative to the repo root, e.g. `assets/logo.png`)"

**Ask only if uncertain:**
- For each uncertain field, ask a single, direct question. Pre-fill with your best guess.

Ask all questions at once in a single message. Use a numbered list. Keep it short.

Wait for the user's answers before proceeding.

---

## Step 4: Propose the outline

Before writing anything, present the proposed video to the user for approval.

Synthesise everything from Steps 2 and 3 into a short, readable outline — one line per scene describing what it will show and why. Include the narrative arc (what story the video tells from first frame to last).

Format it like this:

> Here's what I'm planning:
>
> **Narrative:** [one sentence on the overall story]
>
> 1. **[Scene type]** — [what it shows and the point it makes]
> 2. **[Scene type]** — [what it shows and the point it makes]
> …
>
> Does this capture what you want to show? Anything to change, add, or cut?

Rules:
- Use plain language, not JSON or field names
- Be specific — name the actual content ("shows `npx reelme` producing a GIF in 30 seconds"), not abstractions ("demonstrates the CLI")
- Keep the list to 3–6 scenes; fewer is better
- If you're unsure about a scene (e.g. whether a code example is worth showing), flag it explicitly

Wait for the user's response. If they request changes, update your mental model of the brief and confirm the revised outline before proceeding. Do not move to Step 5 until the user explicitly approves the outline.

---

## Step 5: Build the brief

Write `.reelme/brief.json` to the repo root.

**Intro mode shape:**

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
    "logo": ""
  },
  "scenes": [
    {
      "type": "problem",
      "headline": "",
      "subtext": "",
      "caption": ""
    },
    {
      "type": "feature-list",
      "headline": "",
      "items": ["", ""],
      "caption": ""
    },
    {
      "type": "code-reveal",
      "language": "",
      "code": "",
      "highlightLine": 1,
      "caption": ""
    },
    {
      "type": "terminal",
      "commands": [
        { "input": "", "output": "" }
      ],
      "caption": ""
    },
    {
      "type": "data-flow",
      "nodes": [
        { "id": "", "label": "" }
      ],
      "edges": [
        { "from": "", "to": "", "label": "" }
      ],
      "caption": ""
    },
    {
      "type": "split",
      "before": { "label": "", "content": "" },
      "after": { "label": "", "content": "" },
      "caption": ""
    },
    {
      "type": "browser",
      "url": "",
      "image": "",
      "caption": ""
    },
    {
      "type": "stat-callout",
      "headline": "",
      "stats": [
        { "value": "", "label": "" }
      ],
      "caption": ""
    },
    {
      "type": "file-tree",
      "headline": "",
      "entries": [
        { "path": "", "type": "file", "highlight": false }
      ],
      "caption": ""
    },
    {
      "type": "mobile",
      "title": "",
      "image": "",
      "caption": ""
    },
    {
      "type": "cta",
      "installCommand": "",
      "repoUrl": "",
      "caption": ""
    }
  ]
}
```

**Announcement mode shape:**

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
    "logo": ""
  },
  "scenes": [
    {
      "type": "problem",
      "headline": "",
      "subtext": "",
      "caption": ""
    },
    {
      "type": "feature-list",
      "headline": "",
      "items": ["", ""],
      "caption": ""
    },
    {
      "type": "code-reveal",
      "language": "",
      "code": "",
      "highlightLine": 1,
      "caption": ""
    },
    {
      "type": "terminal",
      "commands": [
        { "input": "", "output": "" }
      ],
      "caption": ""
    },
    {
      "type": "split",
      "before": { "label": "", "content": "" },
      "after": { "label": "", "content": "" },
      "caption": ""
    },
    {
      "type": "stat-callout",
      "headline": "",
      "stats": [
        { "value": "", "label": "" }
      ],
      "caption": ""
    },
    {
      "type": "cta",
      "installCommand": "",
      "repoUrl": "",
      "caption": ""
    }
  ]
}
```

**Scene selection rules:**

For intro:
- Always include `problem` first and `cta` last.
- Include `feature-list` to enumerate what the project does (3–5 items max).
- Include `code-reveal` if there is a good code example.
- Include `terminal` if the project is a CLI tool or the install/run flow is the main demo.
- Include `data-flow` if the project has a clear pipeline.
- Include `split` if the core value is a before/after contrast (DX improvement, verbosity reduction, etc).
- Include `browser` if the project has a web UI or produces a visual output worth showing.
- Include `stat-callout` if the project has compelling numbers (performance, adoption, reduction in code).
- Include `file-tree` if the project's structure or generated output is itself a selling point.
- Include `mobile` if the project is a mobile app or has a mobile UI.
- The middle can have 1–3 scenes. Prefer fewer; clarity beats completeness.

For announcement:
- The `problem` scene acts as the "what's new" opener. Headline = punchy release statement. Subtext = why it matters.
- Do NOT use the pain-framing for `problem`; use it as a release headline instead.
- Include `feature-list` if the release has multiple notable changes.
- Include `code-reveal` if the key change is best shown as code.
- Include `terminal` if the key change is a new command or CLI flow.
- Include `split` if the release fixes a pain point that's easy to show as before/after.
- Include `stat-callout` if the release has measurable improvements (speed, size, lines of code).
- Skip `data-flow`, `browser`, `file-tree`, and `mobile` unless directly relevant to what changed.
- Always end with `cta`.

**Captions:** write a short caption (5-10 words) for each scene. Captions appear as a pill overlay near the bottom of the scene after the main animation settles. They reinforce the scene's point, not a description of what's shown, but the takeaway. Omit the `caption` field or leave it as `""` to skip it for a scene.

Examples:
- problem → "Developers judge a project in seconds."
- code-reveal → "One command. One video."
- terminal → "Works in any repo, no config needed."
- data-flow → "Claude writes the brief. Remotion does the rest."
- cta → "Star it, share it, ship it."

**Logo:** if the user provided a logo path, set `"logo": "<filename-only>"` (e.g. `"logo.png"`). Leave as `""` if none.

---

## Step 6: Ask about gitignore

Tell the user: "I'll scaffold the Remotion project at `.reelme/` in this repo. Do you want to keep it for future edits? If not, I'll add it to `.gitignore`."

Wait for their answer. If they say no (don't want to keep it), add `.reelme/` to `.gitignore` after scaffolding. If yes, skip that step.

---

## Step 7: Scaffold the Remotion project

Copy the template (excluding dev-only files):

```bash
SKILL_DIR=$(find "$HOME" -maxdepth 6 -name "SKILL.md" -path "*/reelme/SKILL.md" 2>/dev/null | head -1 | xargs dirname)
rsync -a \
  --exclude='.gitignore' \
  --exclude='src/__tests__' \
  --exclude='src/brief.json' \
  --exclude='src/showcase.json' \
  --exclude='eslint.config.mjs' \
  --exclude='vitest.config.ts' \
  --exclude='out' \
  --exclude='node_modules' \
  --exclude='public/logo.svg' \
  --exclude='public/.gitkeep' \
  "$SKILL_DIR/template/" ".reelme/"
```

Copy `brief.json` into the template:

```bash
cp .reelme/brief.json .reelme/src/brief.json
```

If the user provided a logo, copy it to the `public/` directory:

```bash
cp <logo_path_in_repo> .reelme/public/<logo_filename>
```

If the user chose not to keep the project for future edits, add it to `.gitignore`:

```bash
echo ".reelme/" >> .gitignore
```

Install dependencies:

```bash
cd .reelme && pnpm install && pnpm approve-builds --all
```

---

## Step 8: Render

```bash
cd .reelme
pnpm render
```

This produces:
- `.reelme/out/video.mp4`
- `.reelme/out/video.gif`

Tell the user where to find the output files and mention they can edit `.reelme/src/brief.json` + re-run `pnpm render` to tweak without re-running the full interview.

---

## Error handling

- If `pnpm install` fails: check Node version (requires ≥18), suggest `nvm use 20`.
- If `pnpm render` fails: show the last 30 lines of stderr and ask the user to share the error.
- If a required field is still empty after the interview: ask one follow-up question rather than failing silently.
- If the logo file doesn't exist at the given path: warn the user and proceed without it (set `logo` to `""`).
