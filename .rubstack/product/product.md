# reelme

## What it is

reelme turns a dev's repo into a launch video for social media in one command. Delivery is hybrid (decided 2026-06-12, ADR 0003): an agent skill (`/reelme`) owns the intelligence — it reads the repo, runs a brief interview, and writes `reelme.json` — and a thin npm CLI (`npx reelme`) owns the mechanics — it scaffolds the Remotion project in a global cache (`~/.reelme/cache/`), renders every selected platform locally, and drops outputs in `reelme-out/`. No cloud account or API keys required, and the user's repo keeps only a small committed `reelme.json` (the brand memory across releases) instead of a 150MB scaffold.

The skill is installed via `npx skills add RubenGlez/reelme` and works in Claude Code, Cursor, Gemini CLI, OpenAI Codex, and any Agent Skills-compatible agent (follows the open [Agent Skills](https://agentskills.io) standard). The CLI lives on npm, which also gives the product a registry surface: organic discovery and download counts.

Each run currently produces platform-specific outputs in `reelme-out/`: MP4s for social platforms, a GIF for GitHub README when selected, and teaser MP4s for social platforms when `cuts.teaser` exists. The Remotion source lives in the CLI cache and can be inspected or tweaked via `npx reelme studio`.

Each run's deliverable is the rendered media in `reelme-out/`; for the GitHub README platform, the skill's distribution guidance hands over the GIF embed snippet (`![demo](reelme-out/github-readme.gif)`). reelme does not generate marketing post copy — that was considered and dropped (2026-06-23) as a separate job from making videos that dilutes the product. The video is the output and is meant to speak for itself.

Videos are silent, no voiceover, no ElevenLabs dependency. Animated caption pills appear on each scene as a text reinforcement layer. Silent videos with strong motion and text work well on social feeds, where most playback is muted.

Videos follow a fixed narrative arc with variable length: Problem (establish the pain) → Solution/demo (one or more scenes) → CTA (install command + repo URL). A library with one killer feature might run 20 seconds; a platform with five distinct use cases might run 45 seconds. The arc is always the same; the middle expands.

## Audience

**Any dev who launches or promotes something built on a repo**: OSS maintainers, indie hackers, small devtool startups. Private repos included — the repo is the raw material, whether the product is open source or not. The early adopter is the dev who already posts releases on X/LinkedIn and builds in public; reelme removes the production cost of the visual asset.

Two use cases, in order of importance:

- **Feature announcement** (hero use case): run after shipping a notable release. Reads git diff, changelog, or release notes instead of the full README. Skips the Problem scene, leads with what changed and why it matters. Keeps the same brand/style as previous videos for that project. This is the recurring use: every release, one video.
- **Project intro**: the first-run experience. Run once per project to explain what it does, full Problem → Solution → CTA arc. Targets the launch post, the landing page, and the README embed.

## Positioning

An agent skill that turns a release into a social-ready launch video in one command, with zero cloud dependencies and zero video production knowledge required. Social-first: the video exists to reach the people who haven't found the repo yet — launch posts, release announcements, build-in-public threads. The GitHub README is one publishing target among several, not the primary destination.

The reasoning behind the social-first stance (decided 2026-06-12): what works inside a README is a 5–10 second demo GIF, not a narrative explainer. A dev already reading the repo doesn't need the problem pitched to them, and a CTA is redundant three lines above the install command. The narrative arc reelme produces is marketing register, and marketing happens off-GitHub. The product had implicitly voted this way already — 9:16 and 1:1 formats, announcement mode, and per-platform distribution guidance all serve social, not READMEs.

The output feels native to each project (brand-aware theming from a single hex color + optional logo) rather than templated.

The interview is hybrid: the agent reads the repo first (README, package.json, key source files) and pre-fills everything it can confidently infer, then asks only about gaps. The goal is fewer questions with higher-quality answers, not a blank form.

Rendering is local only (`npx reelme render` on the user's machine, against the global cache scaffold). No cloud account, no billing, no AWS setup. Remotion Lambda is documented as an opt-in option for a future version.

## Direction Assessment

The original v1/v2 scope (scene library, theming, formats, modes, update flow) is complete and usable today. On 2026-06-12 the product was repositioned from "explainer videos for open-source projects" to "launch videos for social media, for any dev who ships" — announcement mode promoted to hero use case, audience broadened beyond OSS, and platforms (not aspect-ratio formats) made the user-facing vocabulary.

The next phase ("v2 — Launch-video repositioning" in the roadmap) was revised after a conditional-go review on 2026-06-12. Three gaps were judged more important than any planned feature: no public proof (the examples are for a fictional project), no growth loop (published videos carried no reference to reelme), and a format conflict (silent slow-arc explainers vs. TikTok/Reels, which are first-class targets). Several Phase 2 mitigations are now shipped in code: a "made with reelme" watermark, hook-first vertical cuts, teaser rendering, real-asset ingestion for clips and screenshots, mobile screenshot support, and vertical type/safe-area polish. Bundled audio playback has since landed in code (commit 44cb9a5; unreleased and not yet QA'd). Release-aware skill startup was folded into SKILL.md Step 1 (2026-06-23) as lightweight agent judgment rather than a standalone feature, and the publication kit was dropped from scope the same day. The remaining genuinely pending item is the public proof gallery. CI integration was deferred to nice-to-have until repeat usage is proven. The moat against a bare agent improvising with Remotion is the curated scene library, the brief schema, and the hybrid pre-fill interview — plus the brand-memory update path (`reelme.json` committed and re-rendered consistently across releases), which a one-off improvisation can't match (see competitors.md).

A second decision the same day settled the delivery vehicle (ADR 0003): hybrid agent skill + thin npm CLI. The skill keeps the intelligent interview (the differentiator); the CLI takes the deterministic mechanics out of the user's repo and onto npm, which solves the 150MB footprint, makes future CI integration trivial (`npx reelme render` in an Action), and creates the registry surface the product lacked. MCP and library delivery were considered and rejected (batch job, no embedding use case); CLI-first was rejected because it degrades the interview to a form.

Validation strategy is build-first with two safeguards: the OSS gallery doubles as the quality-bar test before launch (if the videos aren't proudly publishable, that is the no-go signal), and numeric success criteria (stars, clones, npm downloads, mentions in 2 weeks) are defined before the dogfood launch so the result is readable. User interviews and a copy-only relaunch were considered and rejected.

## Key Risks

Discovery remains the most immediate risk, though v2 narrows it: the npm CLI gives the product a registry surface, search presence, and download counts (the previously missing usage metric). The skill itself is still only findable via a GitHub reference, a social post, or word of mouth. The v2 dogfood launch is the explicit test: if a well-produced launch video posted by the author generates no installs or downloads, the problem is distribution, not product.

Platform fit is unproven. Animated explainers compete on TikTok/Reels/Shorts against platform-native content: talking heads, screen recordings, memes. Phase 2 mitigates the slow-opening problem with hook-first vertical cuts and real asset ingestion, but videos remain silent until the audio tasks land. Whether the format earns engagement is still an open question. Engagement must be measured per platform during the dogfood launch before investing further in any single platform preset. Audio licensing is itself a sub-risk: CC-BY tracks require attribution handling, and NC-licensed tracks are unusable for commercial projects; the implementation must be license-aware, preferring CC0.

Build-before-validate is a self-inflicted risk, now larger because the conditional-go review grew the phase from five items to ten. The mitigations: the planned OSS gallery acts as a quality gate before launch, and the backlog is frozen — nothing enters v2 that isn't already listed.

Video quality consistency depends on the README the skill reads. A well-written README produces a strong brief with minimal questioning; a sparse one produces an interview-heavy run and a weaker brief. There is no fallback for low-information repos.

Remotion compatibility is a long-term fragility. The bundled template pins specific Remotion internals; a Remotion major version bump could break renders. The CLI softens this versus v1 — the cache scaffold is regenerated from the installed CLI version, so shipping a fixed CLI release heals every user on next render — but CLI↔`reelme.json` schema compatibility now needs managing (schema version field).

Local render performance has no progress visibility. Multi-scene renders at 1080p can take minutes on consumer hardware with no frame counter or ETA surfaced by the skill, and rendering one variant per selected platform multiplies this cost.
