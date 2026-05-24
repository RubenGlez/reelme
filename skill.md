# reelme

Generate a 2D animated explainer video for any open-source project — as an MP4, a GIF, and editable Remotion source.

## Trigger

User runs `/reelme` inside a Claude Code session in their repo.

---

## Step 1 — Read the repo

Read the following files if they exist. Do not ask the user anything yet.

- `README.md`
- `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` (whichever applies)
- Up to 3 key source files (infer from the README or entry point)

Extract and hold in memory:
- **name** — project name
- **tagline** — one sentence describing what it does
- **problem** — the pain it solves (infer from README "why" sections, motivation, background)
- **install_command** — the primary install/get-started command (e.g. `npm install mylib`, `cargo add mylib`)
- **repo_url** — from package.json `repository`, or leave blank
- **key_feature** — the one thing that makes this project worth using
- **code_example** — a short, representative code snippet (5–15 lines max) that shows the key feature in action

Mark each field as `confident` or `uncertain`. A field is `uncertain` if you had to guess or if the source was ambiguous.

---

## Step 2 — Interview

Ask only about `uncertain` fields plus the two fields below that are always required (since they can't be inferred from code):

**Always ask:**
- **primary_color** — "What's the project's primary brand color? (hex code, e.g. #6366f1)"
- **tone** — "What tone should the video have? (choose: professional / playful / technical)"

**Ask only if uncertain:**
- For each uncertain field, ask a single, direct question. Pre-fill with your best guess so the user can confirm or override.

Ask all questions at once in a single message. Use a numbered list. Keep it short.

Wait for the user's answers before proceeding.

---

## Step 3 — Build the brief

Write `video/brief.json` to the repo root with the following shape (fill every field):

```json
{
  "project": {
    "name": "",
    "tagline": "",
    "problem": "",
    "installCommand": "",
    "repoUrl": "",
    "primaryColor": "",
    "tone": "professional"
  },
  "scenes": [
    { "type": "problem", "headline": "", "subtext": "" },
    { "type": "code-reveal", "language": "", "code": "", "highlightLine": 1, "caption": "" },
    { "type": "cta", "installCommand": "", "repoUrl": "" }
  ]
}
```

Scene selection rules:
- Always include `problem` first and `cta` last.
- Include `code-reveal` if there is a good code example.
- Include `terminal` if the project is a CLI tool or the install/run flow is the main demo.
- Include `data-flow` if the project has a clear pipeline (e.g. data in → transform → data out).
- The middle can have 1–3 scenes. Prefer fewer; clarity beats completeness.

For `code-reveal`, use the code example from step 1. Set `highlightLine` to the single most important line. Set `language` to the file extension (e.g. `ts`, `py`, `rs`).

For `terminal`, populate `commands` as an array of `{ "input": "...", "output": "..." }`.

For `data-flow`, populate `nodes` (array of `{ "id": "...", "label": "..." }`) and `edges` (array of `{ "from": "...", "to": "...", "label": "..." }`).

---

## Step 4 — Ask where to put the video project

Tell the user: "I'll scaffold the Remotion project at `video/` inside this repo. Is that OK, or do you want a different path?"

Wait for confirmation. Use `video/` if they say yes or don't respond with a path.

---

## Step 5 — Scaffold the Remotion project

Copy the contents of the `reelme` skill's `template/` directory into the chosen path (e.g. `video/`).

The template is located at the same directory as this skill file. Use the Bash tool:

```bash
SKILL_DIR="$(dirname "$(realpath "${CLAUDE_SKILL_FILE}")")"
cp -r "$SKILL_DIR/template/." "<chosen_path>/"
```

Then copy `video/brief.json` into `<chosen_path>/src/brief.json`:

```bash
cp video/brief.json <chosen_path>/src/brief.json
```

Then install dependencies:

```bash
cd <chosen_path> && pnpm install && pnpm approve-builds --all
```

---

## Step 6 — Render

Run the render from the video project directory:

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
