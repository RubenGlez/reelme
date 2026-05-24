# Roadmap

## V1 — Claude Code skill (current)

The core loop: install the skill, run `/reelme` in any repo, get a video.

- [x] Claude Code skill scaffold (`/reelme` command)
- [x] Repo reader — parses README, package.json, key source files
- [x] Interview flow — hybrid pre-fill + targeted questions
- [x] Brief schema — structured output from the interview that drives rendering
- [x] Remotion project scaffolder — generates the project from the brief
- [x] Shared primitives — terminal, code block, arrow, label
- [x] V1 scene templates — Problem, Code reveal, Terminal, Data flow, CTA
- [x] Brand-aware theming — color palette from a single hex input via chroma-js
- [x] Local render — MP4 + GIF output via `npx remotion render`
- [x] Project location prompt — defaults to `video/` in repo

## V2 — polish and reach

- [x] Animated captions synced to timeline
- [ ] `npx reelme` CLI entry point (wraps the same Remotion core)
- [ ] More scene templates — browser demo, mobile screen, side-by-side comparison
- [x] Logo support in theming
- [ ] Remotion Lambda as opt-in for faster rendering
- [x] Feature announcement mode — interview reads git diff, changelog, or release notes instead of the full README; version badge on Problem scene, "X is here" CTA

## V3 — ecosystem

- [ ] Community scene template contributions
- [ ] Auto-update flow — re-interview only about what changed since last render
- [ ] CI integration — render on push to main if brief exists
