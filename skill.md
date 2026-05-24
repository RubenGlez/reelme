# reelme

Generate a 2D animated explainer video for any open-source project — as an MP4, a GIF, and editable Remotion source.

## Trigger

User runs `/reelme` inside a Claude Code session in their repo.

---

## Step 1 — Determine mode

Ask the user one question before reading anything:

> "Is this a **project intro** (explain what the project does) or a **feature announcement** (highlight what's new in a release)?"

Wait for the answer. This determines what to read and how to build the brief.

---

## Step 2 — Read the repo

**For intro mode**, read:
- `README.md`
- `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` (whichever applies)
- Up to 3 key source files (infer from the README or entry point)

Extract and hold in memory:
- **name** — project name
- **tagline** — one sentence describing what it does
- **problem** — the pain it solves (infer from README "why" sections, motivation, background)
- **install_command** — the primary install/get-started command
- **repo_url** — from package.json `repository`, or leave blank
- **key_feature** — the one thing that makes this project worth using
- **code_example** — a short, representative code snippet (5–15 lines max) showing the key feature

**For announcement mode**, read:
- `CHANGELOG.md` or `CHANGELOG` (if it exists)
- `git log --oneline -20` (to find the latest tag and recent commits)
- `git diff <latest-tag>..HEAD --stat` (to understand what changed)

Extract and hold in memory:
- **name** — project name (from package.json or git remote)
- **version** — latest tag or the version being announced (e.g. `v2.0.0`)
- **headline** — one punchy sentence: what's new ("Feature announcement mode and logo support")
- **subtext** — one sentence on why it matters
- **key_change** — the most important change: a code snippet, a command, or a description
- **install_command** — current install/upgrade command
- **repo_url** — from package.json `repository`, or leave blank

Mark each field as `confident` or `uncertain`.

---

## Step 3 — Interview

**Always ask (both modes):**
- **primary_color** — "What's the project's primary brand color? (hex code, e.g. #6366f1)"
- **logo** — "Do you have a logo file? (optional — provide a path relative to the repo root, e.g. `assets/logo.png`)"

**Ask only if uncertain:**
- For each uncertain field, ask a single, direct question. Pre-fill with your best guess.

Ask all questions at once in a single message. Use a numbered list. Keep it short.

Wait for the user's answers before proceeding.

---

## Step 4 — Build the brief

Write `video/brief.json` to the repo root.

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
    { "type": "problem", "headline": "", "subtext": "", "caption": "" },
    { "type": "code-reveal", "language": "", "code": "", "highlightLine": 1, "caption": "" },
    { "type": "terminal", "commands": [], "caption": "" },
    { "type": "data-flow", "nodes": [], "edges": [], "caption": "" },
    { "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
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
    { "type": "problem", "headline": "", "subtext": "", "caption": "" },
    { "type": "code-reveal", "language": "", "code": "", "highlightLine": 1, "caption": "" },
    { "type": "cta", "installCommand": "", "repoUrl": "", "caption": "" }
  ]
}
```

**Scene selection rules:**

For intro:
- Always include `problem` first and `cta` last.
- Include `code-reveal` if there is a good code example.
- Include `terminal` if the project is a CLI tool or the install/run flow is the main demo.
- Include `data-flow` if the project has a clear pipeline.
- The middle can have 1–3 scenes. Prefer fewer; clarity beats completeness.

For announcement:
- The `problem` scene acts as the "what's new" opener. Headline = punchy release statement. Subtext = why it matters.
- Do NOT use the pain-framing for `problem` — use it as a release headline instead.
- Include `code-reveal` if the key change is best shown as code.
- Include `terminal` if the key change is a new command or CLI flow.
- Skip `data-flow` unless the architecture changed.
- Always end with `cta`.

**Captions:** write a short caption (5–10 words) for each scene. Captions appear as a pill overlay near the bottom of the scene after the main animation settles. They reinforce the scene's point — not a description of what's shown, but the takeaway. Omit the `caption` field or leave it as `""` to skip it for a scene.

Examples:
- problem → "Developers judge a project in seconds."
- code-reveal → "One command. One video."
- terminal → "Works in any repo, no config needed."
- data-flow → "Claude writes the brief. Remotion does the rest."
- cta → "Star it, share it, ship it."

**Logo:** if the user provided a logo path, set `"logo": "<filename-only>"` (e.g. `"logo.png"`). Leave as `""` if none.

---

## Step 5 — Ask where to put the video project

Tell the user: "I'll scaffold the Remotion project at `video/` inside this repo. Is that OK, or do you want a different path?"

Wait for confirmation. Use `video/` if they say yes or don't respond with a path.

---

## Step 6 — Scaffold the Remotion project

Copy the template:

```bash
SKILL_DIR="$(dirname "$(realpath "${CLAUDE_SKILL_FILE}")")"
cp -r "$SKILL_DIR/template/." "<chosen_path>/"
```

Copy `brief.json` into the template:

```bash
cp video/brief.json <chosen_path>/src/brief.json
```

If the user provided a logo, copy it to the `public/` directory:

```bash
cp <logo_path_in_repo> <chosen_path>/public/<logo_filename>
```

Install dependencies:

```bash
cd <chosen_path> && pnpm install && pnpm approve-builds --all
```

---

## Step 7 — Render

```bash
cd <chosen_path>
pnpm render
```

This produces:
- `out/video.mp4`
- `out/video.gif`

Tell the user where to find the output files and mention they can edit `src/brief.json` + re-run `pnpm render` to tweak without re-running the full interview.

---

## Error handling

- If `pnpm install` fails: check Node version (requires ≥18), suggest `nvm use 20`.
- If `pnpm render` fails: show the last 30 lines of stderr and ask the user to share the error.
- If a required field is still empty after the interview: ask one follow-up question rather than failing silently.
- If the logo file doesn't exist at the given path: warn the user and proceed without it (set `logo` to `""`).
