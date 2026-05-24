# Design decisions

Decisions made before implementation started, resolved through a structured design interview.

## User

**OSS maintainer**: someone who built a library or tool, wants visibility, and has no time or budget for professional video production. Two use cases:

- **Project intro**: run once per project to explain what it does. Targets README, landing page, and social sharing.
- **Feature announcement**: run after shipping a notable release or feature. Reads git diff, changelog, or release notes instead of the full README. Skips the Problem scene, leads with what changed and why it matters. Keeps the same brand/style as previous videos for that project.

## Entry point

**Agent skill** (`/reelme`). Follows the open [Agent Skills](https://agentskills.io) standard, works in any compatible agent (Claude Code, Cursor, Gemini CLI, Codex, etc.). Installed via `npx skills add RubenGlez/reelme` through [skills.sh](https://skills.sh). A `npx reelme` standalone CLI is a natural v2 if there's demand.

## Interview approach

**Hybrid**: the agent reads the repo first (README, package.json, key source files) and pre-fills everything it can confidently infer. Then it asks only about the gaps, things it couldn't determine from the code. The goal is fewer questions with higher-quality answers, not a blank form.

## Output

Three artifacts per render:

- `video.mp4`: primary output, for social sharing and landing pages
- `video.gif`: for README embedding (renders inline on GitHub without click)
- Remotion source project: so the maintainer can tweak and re-render without rerunning the full flow

## Video structure

Fixed narrative arc, variable length:

1. Problem: establish the pain
2. Solution/demo: one or more scenes showing the fix (length varies by project complexity)
3. CTA: install command + repo URL

A library with one killer feature might run 20 seconds. A platform with five distinct use cases might run 45 seconds. The arc is always the same; the middle expands.

## Template system

Two layers:

- **Shared primitives**: reusable components (terminal window, animated code block, arrow, label, caption pill). These are the building blocks.
- **Scene templates**: pre-composed full scenes built from primitives.

New scene templates can be contributed by the community using existing primitives.

## Scene templates

| Scene | Description |
|---|---|
| Problem | Animated headline establishing the pain point or release headline. |
| Feature list | Bullet points that reveal one by one with checkmark icons. |
| Code reveal | IDE/editor window. Code types itself in line by line, key line highlighted. |
| Terminal | Terminal window. Commands appear, output streams progressively. |
| Data flow | Arrows and nodes showing how data moves through a system. |
| Split | Side-by-side before/after panels that slide in from opposite sides. |
| Browser | Mock browser window with typed URL animation and optional screenshot. |
| CTA | Install command + repo URL. Clean exit. |

## Visual style

**Brand-aware theming.** The interview asks for the project's primary color and optionally a logo. A full color palette (background, accent, text, contrast) is generated from the single hex input using `chroma-js`. If no logo is provided, the project name is used as text. Every video feels native to the project, not templated.

## Audio

**Silent.** No voiceover, no ElevenLabs dependency, no API keys required. Silent videos with strong motion and text work well on social and in READMEs. Animated caption pills appear on each scene as a text reinforcement layer.

## Rendering

**Local only.** `npx remotion render` on the maintainer's machine. No cloud account, no billing, no AWS setup. Slow for long videos but zero friction. Remotion Lambda is documented as an opt-in option for v2.

## Generated project location

**Asks the user, defaults to `video/` inside the repo.** Versioning the Remotion source with the project means the video can be updated when the project changes. The `video/` directory should be added to `.gitignore` for npm publishes if the repo is a published package.
