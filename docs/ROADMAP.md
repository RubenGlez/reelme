# Roadmap

## V1: Claude Code skill (current)

The core loop: install the skill, run `/reelme` in any repo, get a video.

- [x] Claude Code skill scaffold (`/reelme` command)
- [x] Repo reader: parses README, package.json, key source files
- [x] Interview flow: hybrid pre-fill + targeted questions
- [x] Brief schema: structured output from the interview that drives rendering
- [x] Remotion project scaffolder: generates the project from the brief
- [x] Shared primitives: terminal, code block, arrow, label
- [x] V1 scene templates: Problem, Code reveal, Terminal, Data flow, CTA
- [x] Brand-aware theming: color palette from a single hex input via chroma-js
- [x] Local render: MP4 + GIF output via `npx remotion render`
- [x] Project location prompt: defaults to `video/` in repo

## V2: polish and reach

- [x] Animated captions synced to timeline
- [x] More scene templates: browser frame, split comparison, feature list
- [x] More scene templates: mobile screen, stat callout, file tree
- [x] More scene templates: os-window, hotkey
- [x] Logo support — renders as app-icon card in CTA scene
- [x] Feature announcement mode: interview reads git diff, changelog, or release notes instead of the full README; version badge on Problem scene, "X is here" CTA
- [x] Tone drives motion physics (spring configs) and font defaults — professional/playful/technical each produce a distinct visual character
- [x] `bgStyle` — deep (near-black), branded (accent-tinted), light (white-based)
- [x] `format` — 16:9, 1:1, 9:16 for social variants
- [x] Hero mode on Problem scene — full-bleed oversized headline
- [x] CTA visual overhaul — full accent background, reversed text
- [x] Feature list icons — items support `{ text, icon }` with numbered fallback
- [x] Global scene transitions: fade, slide, zoom
- [x] Example briefs for intro and announcement modes
- [ ] Remotion Lambda as opt-in for faster rendering

## V3: ecosystem

- [ ] Community scene template contributions
- [ ] Auto-update flow: re-interview only about what changed since last render
- [ ] CI integration: render on push to main if brief exists
