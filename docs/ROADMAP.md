# Roadmap

## V1 — Claude Code skill (current)

The core loop: install the skill, run `/reelme` in any repo, get a video.

- [ ] Claude Code skill scaffold (`/reelme` command)
- [ ] Repo reader — parses README, package.json, key source files
- [ ] Interview flow — hybrid pre-fill + targeted questions
- [ ] Brief schema — structured output from the interview that drives rendering
- [ ] Remotion project scaffolder — generates the project from the brief
- [ ] Shared primitives — terminal, browser, IDE, mobile, code block, arrow, label
- [ ] V1 scene templates — Problem, Code reveal, Terminal, Data flow, CTA
- [ ] Brand-aware theming — color palette from a single hex input via chroma-js
- [ ] Local render — MP4 + GIF output via `npx remotion render`
- [ ] Project location prompt — defaults to `video/` in repo

## V2 — polish and reach

- [ ] Animated captions synced to timeline
- [ ] `npx reelme` CLI entry point (wraps the same Remotion core)
- [ ] More scene templates — browser demo, mobile screen, side-by-side comparison
- [ ] Logo support in theming
- [ ] Remotion Lambda as opt-in for faster rendering

## V3 — ecosystem

- [ ] Community scene template contributions
- [ ] Auto-update flow — re-interview only about what changed since last render
- [ ] CI integration — render on push to main if brief exists
