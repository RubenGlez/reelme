# Implementation plan — reelme v2

Scope: the v2 launch-video repositioning, per the frozen backlog in `.rubstack/product/roadmap.md` (decided 2026-06-12). This plan defines WHAT ships and in WHICH order; feature specs and the code itself define HOW. Each task is scoped to one agent session.

Key architecture decisions are recorded in `.rubstack/adr/`:

- ADR 0001 — `cuts` replace `format`, no backwards compatibility
- ADR 0002 — bundled curated CC0 audio, no runtime audio API
- ADR 0003 — hybrid delivery: agent skill (intelligence) + thin npm CLI (mechanics)

Breaking change reminder: Brief schema v2 replaces `scenes` with `cuts` and `ProjectMeta.format` with `ProjectMeta.platforms`, and the brief moves to `reelme.json` at the user's repo root (schema-versioned). There is no compatibility path; everything in Phase 1 lands together before anything downstream.

---

## Phase 1 — Foundation

The CLI package bootstrap, Brief schema v2, platform presets, multi-composition registration, the render orchestration, and per-cut durations. Per ADR 0003, the template, presets, and render orchestration live inside the `reelme` npm package (`cli/`). Everything else in v2 depends on this phase.

### Task 1.1 — CLI package bootstrap
> Done (shipped in reelme@0.2.2).

**Goal**: Create the `reelme` npm package skeleton: bin entry, the `render` / `studio` / `clean` command surface, and cache management (`~/.reelme/cache/<project-hash>/`), per ADR 0003.
**Scope**: `cli/package.json` (name `reelme`, bin entry), `cli/src/` command dispatch with `render` (reads `reelme.json` from the repo root, scaffolds the bundled template into the cache dir, installs deps there, copies outputs to `./reelme-out/`), `studio` (opens Remotion Studio against the cache dir), `clean` (clears the cache); project-hash derivation and cache reuse (re-renders don't reinstall). Check npm name availability for `reelme` (fallback: `reelme-cli`) and record the result.
**Acceptance criteria**: `npx reelme --help` (via local link) lists the three commands; `render` against a fixture brief scaffolds into the cache dir and leaves the fixture repo untouched except `reelme-out/`; running `render` twice reuses the cache without reinstalling; `clean` empties the cache; npm name decision recorded.

### Task 1.2 — Brief schema v2
> Done (shipped in reelme@0.2.2).

**Goal**: Replace the v1 brief contract with the v2 shape: `cuts: { main: Scene[]; vertical?: Scene[]; teaser?: Scene[] }` instead of `scenes`; `ProjectMeta.platforms: PlatformId[]` instead of `format`; new `project.audio?: { track: string; volume?: number } | false`; new `project.watermark?: boolean` (default true); a schema version field for CLI↔schema compatibility. The brief lives at `reelme.json` in the user's repo root.
**Scope**: `cli/template/src/brief.ts` (types), example `reelme.json` (example brief updated to v2 shape). No back-compat shims.
**Acceptance criteria**: `tsc --noEmit` passes in `cli/template/`; `brief.ts` contains no `scenes` field on `Brief` and no `format` field on `ProjectMeta`; example `reelme.json` validates against the new types (a cuts object with at least `main`, a `platforms` array, a schema version).
**Depends on**: Task 1.1 (the package layout the schema lives in).

### Task 1.3 — Platform presets module
> Done (shipped in reelme@0.2.2).

**Goal**: Introduce the platform preset table that turns a `PlatformId` into concrete render parameters.
**Scope**: Create `cli/src/platforms.ts` exporting presets shaped `{ id, label, cut, width, height, fps, maxDurationSec, safeArea, output: { file, codec } }` for: `x`, `linkedin`, `youtube` (main cut, 16:9); `tiktok`, `instagram-reel`, `instagram-story` (vertical cut, 9:16); `instagram-feed` (main cut, 1:1); `github-readme` (main cut, GIF codec). Add a vitest unit test for the table (every preset complete, ids unique, cut values valid).
**Acceptance criteria**: `pnpm test` passes including the new platforms test; all 8 platforms present with correct cut/aspect/codec mapping.
**Depends on**: Task 1.1, Task 1.2 (PlatformId lives in the schema).

### Task 1.4 — Multi-composition registration
> Done (shipped in reelme@0.2.2).

**Goal**: Register one Remotion composition per selected platform instead of the single `Reel` composition.
**Scope**: `cli/template/src/index.ts` (loop `project.platforms`, register `Reel-<platform>` with the preset's width/height/fps and the cut's duration), `cli/template/src/Root.tsx` (SceneRenderer renders the scene list of the cut named by the platform preset, falling back to `main` when an optional cut is absent).
**Acceptance criteria**: `npx remotion compositions` (or opening Remotion Studio) lists exactly one `Reel-<platform>` entry per platform in the example brief, each with the preset's dimensions; a brief without `vertical` still registers vertical platforms against the `main` cut without crashing — or fails with a clear validation error (pick one behavior and test it).
**Depends on**: Task 1.2, Task 1.3.

### Task 1.5 — Per-cut duration calculation
> Done (shipped in reelme@0.2.2).

**Goal**: Duration is computed per cut, not per brief, so each composition gets the length of its own scene list and can be checked against the platform's `maxDurationSec`.
**Scope**: `cli/template/src/duration.ts` (compute from a `Scene[]` rather than the whole brief; keep `SCENE_DURATION_MAP` as the source of per-scene lengths), update `cli/template/src/__tests__/duration.test.ts` to the new schema, fix any other test fallout from the schema change (`theme.test.ts` should be unaffected but verify).
**Acceptance criteria**: `pnpm test` passes; duration of a teaser cut differs from the main cut for the example brief; a cut exceeding its platform `maxDurationSec` surfaces a warning or error (decide and test).
**Depends on**: Task 1.2.

### Task 1.6 — CLI render orchestration
> Done (shipped in reelme@0.2.2).

**Goal**: `npx reelme render` renders every selected platform to a predictable output path.
**Scope**: Implement the render orchestration in `cli/src/` (this replaces the previously planned scaffolded `render.mjs`): read `reelme.json`, loop `project.platforms`, render `Reel-<platform>` in the cache scaffold and copy to `./reelme-out/<platform>.<ext>` using the preset's codec/extension; when `cuts.teaser` exists, additionally render `reelme-out/<platform>-teaser.mp4` for social platforms (not `github-readme`).
**Acceptance criteria**: Running `npx reelme render` on the example brief with two platforms selected produces exactly the expected files in `reelme-out/` with correct extensions (`.gif` for `github-readme`, `.mp4` elsewhere); adding a teaser cut produces the extra `-teaser.mp4` files for social platforms only.
**Depends on**: Task 1.1, Task 1.4, Task 1.5.

---

## Phase 2 — Media & scenes

New scene types, real-asset support, watermark, audio, and vertical-format polish.

### Task 2.1 — Hook scene
> Done (shipped in reelme@0.2.2).

**Goal**: Add the `hook` scene: a full-bleed, oversized claim lasting 1.5–2s, designed to open vertical and teaser cuts.
**Scope**: New `cli/template/src/components/scenes/Hook.tsx`, scene type in `cli/template/src/brief.ts`, entry in `SCENE_DURATION_MAP`, registration in the SceneRenderer, duration test update.
**Acceptance criteria**: A brief whose vertical cut opens with a `hook` scene renders the claim full-bleed within 1.5–2s; `pnpm test` passes; the scene respects theme/tone like existing scenes.
**Depends on**: Phase 1.

### Task 2.2 — Clip scene
> Done (shipped in reelme@0.2.2).

**Goal**: Add the `clip` scene: a user-provided video or GIF playing inside a branded frame.
**Scope**: New `cli/template/src/components/scenes/Clip.tsx` using `<OffthreadVideo>` for video and `@remotion/gif` for GIFs; add `@remotion/gif` (matching the pinned Remotion 4.0.290) to `cli/template/package.json`; scene type in `brief.ts` with `frame: "browser" | "mobile" | "none"` and optional trim; assets referenced by repo-relative paths in `reelme.json` and copied by the CLI into the cache scaffold's `public/`; duration map + renderer registration + tests.
**Acceptance criteria**: A brief referencing a video file and a GIF in `public/` renders both inside the chosen frame style; trim options cut the source correctly; `pnpm test` passes.
**Depends on**: Phase 1.

### Task 2.3 — Mobile scene screenshot support
> Done (shipped in reelme@0.2.2).

**Goal**: Bring the `mobile` scene to parity with `browser`: render a real screenshot inside the device frame.
**Scope**: `cli/template/src/brief.ts` (`screenshot?: string` on `MobileScene`), `cli/template/src/components/scenes/MobileScreen.tsx` (render the image from `public/` when provided, keep the current placeholder rendering when absent).
**Acceptance criteria**: A mobile scene with `screenshot` set shows the image correctly fitted in the device frame; without it, output is unchanged from v1 behavior; `pnpm test` passes.
**Depends on**: Phase 1.

### Task 2.4 — Watermark in CTA scene
> Done (shipped in reelme@0.2.2). Implementation variance: the field lives on `ProjectMeta` as `project.watermark`, not top-level `Brief`.

**Goal**: The growth loop: a discreet "made with reelme" credit in the CTA scene footer, default on, removable via `watermark: false`.
**Scope**: `cli/template/src/components/scenes/CTA.tsx` (footer credit), reads the `watermark` flag from the brief (added in Task 1.2).
**Acceptance criteria**: Default brief renders the credit in the CTA footer; `watermark: false` removes it; the credit is legible but visually subordinate to the CTA content on all aspect ratios.
**Depends on**: Phase 1.

### Task 2.5 — Curated CC0 audio set with manifest
**Goal**: Bundle 8–12 curated CC0 background tracks, organized by tone, inside the npm package (see ADR 0002, ADR 0003).
**Scope**: `cli/assets/audio/` (track files) + `cli/assets/audio/manifest.json` recording for each track: id, tone(s), duration, source URL, author, and license provenance (CC0 confirmed at curation time, via Freesound/Pixabay). The CLI's render scaffold copies only the chosen track into the cache scaffold's `public/audio/`. No template code in this task.
**Acceptance criteria**: 8–12 tracks present covering all three tones (professional, playful, technical); every manifest entry has source + license fields; total added package weight reviewed and accepted; tracks audition well as background music (loopable, no vocals dominating); the CLI copies the brief's chosen track into the cache scaffold at render time.
**Depends on**: Task 1.1 (the package the tracks ship in; curation itself can run parallel to Phase 1).

### Task 2.6 — Audio playback in template
**Goal**: Render the chosen track under the video: Remotion `<Audio>` with loop and fade-out, honoring `audio.volume` and `audio: false`.
**Scope**: `cli/template/src/Root.tsx` (or a small `AudioTrack` component) mounting `<Audio>` from `public/audio/<track>` with loop + fade-out over the cut's last seconds; respects `audio?: { track, volume } | false` from the schema. The render-time copy of the chosen track into the cache scaffold's `public/audio/` is CLI work (Task 2.5).
**Acceptance criteria**: A brief with `audio.track` set renders MP4s with the track looped to full duration and a fade-out at the end; `audio: false` and absent `audio` render silent video; volume option is applied.
**Depends on**: Phase 1, Task 2.5 (a real track to test with).

### Task 2.7 — Vertical typography and safe-area handling
> Done (shipped in reelme@0.2.2).

**Goal**: Scenes and captions look native on 9:16: larger relative type, less text per second, and content kept out of platform UI overlay zones using each preset's `safeArea`.
**Scope**: Scene components in `cli/template/src/components/scenes/` and the caption primitive in `cli/template/src/components/primitives/`; consume `safeArea` from the active platform preset (plumbed via Root/SceneRenderer context or props).
**Acceptance criteria**: Visual review of rendered frames for a vertical platform: no caption or key content inside the safe-area margins; type scale on 9:16 is noticeably larger relative to frame than on 16:9; 16:9 and 1:1 output is unchanged from before this task.
**Depends on**: Phase 1, Task 2.1 (hook is a primary vertical scene).

---

## Phase 3 — Skill flow & copy

The agent-facing flow in SKILL.md, reference docs, and the repositioned copy.

### Task 3.1 — Release-aware start in SKILL.md
> Done (2026-06-23), folded into SKILL.md Step 1. The originally-specced detection logic (git-describe invocation, version regex, 90-day staleness threshold, multiple fallback branches) was deliberately reduced to a few sentences of agent judgment: lead the mode question with a detected tag/changelog signal, otherwise ask plainly, never block. Enumerated procedural logic was over-engineering for what is agent behavior, not deterministic code.

**Goal**: On `/reelme` start, detect a recent git tag or changelog entry and proactively propose announcement mode ("you shipped v2.3 — make the announcement video?").
**Scope**: `SKILL.md` step 1 (repo reading): add tag/changelog detection instructions and the proposal branch into the existing intro/announcement mode choice.
**Acceptance criteria**: Dry-run the skill on a repo with a recent tag: the agent leads with the announcement proposal; on a repo with no tags/changelog, the flow is unchanged.

### Task 3.2 — Platform multi-select, cuts outline, and CLI handoff in SKILL.md
**Goal**: Replace the format question with platform multi-select, organize the outline step by cuts, and replace the scaffold steps with the CLI handoff: the skill writes `reelme.json` and shells out to `npx reelme render`.
**Scope**: `SKILL.md`: interview step asks which platforms the user will publish to (the 8 preset ids) and which real assets exist; outline step produces per-cut scene lists (main always; vertical when a 9:16 platform is selected, hook-first, fewer scenes; teaser proposed for social platforms); brief step writes v2 `reelme.json` at the repo root (schema version, repo-relative asset paths, tone-matched audio track chosen from the package manifest); remove the rsync and `pnpm install` steps entirely — scaffolding, asset copy, and audio copy are CLI behavior; render step calls `npx reelme render`, preview via `npx reelme studio`.
**Acceptance criteria**: End-to-end dry run: selecting `tiktok` + `x` yields a `reelme.json` with `main` and `vertical` cuts and a chosen audio track, and a successful `npx reelme render` producing both platform outputs in `reelme-out/`; nothing is scaffolded or installed inside the user's repo.
**Depends on**: Phase 1, Task 2.5, Task 2.6.

### Task 3.3 — Publication kit and distribution guidance in SKILL.md
> Dropped (2026-06-23). The publication kit (per-platform marketing post copy) was cut from scope: writing post copy is a separate job from making videos, dilutes the product, and has no defensible value (any agent can draft a post on request). The one useful piece — the GitHub README GIF embed snippet — was absorbed into the existing distribution-guidance step. The distribution-guidance update itself remains valid and shipped as part of that step.

**Goal**: Complete the "announce my release" job: after rendering, the agent writes platform-native post copy alongside each video, plus updated guidance on where/how to publish.
**Scope**: `SKILL.md`: new post-render step writing `reelme-out/posts/<platform>.md` for each selected platform (post copy in the platform's idiom, video file reference, teaser usage note when present); update the closing distribution guidance section (including the `reelme-out/` gitignore suggestion). No template code.
**Acceptance criteria**: Dry run produces one `reelme-out/posts/<platform>.md` per selected platform with copy that references the actual project (not boilerplate) and matches platform conventions (length, tone, hashtag norms).
**Depends on**: Task 3.2.

### Task 3.4 — Reference docs update
**Goal**: Keep agent-facing reference docs accurate for schema v2 and the new scenes.
**Scope**: `references/scene-schemas.md` (cuts structure, `hook` and `clip` scenes, `mobile.screenshot`, `audio`, `watermark`, `platforms`); `references/architecture.md` where the composition/render model changed (multi-composition, the CLI render command and cache scaffold, presets).
**Acceptance criteria**: Every type in `cli/template/src/brief.ts` and every preset field in `platforms.ts` is reflected in the references; no mention of `format` or a top-level `scenes` array remains.
**Depends on**: Phase 1, Phase 2.

### Task 3.5 — README and positioning copy rewrite
> Done for current public copy (2026-06-13): README/CLI copy and SKILL.md frontmatter now use the launch-video positioning.

**Goal**: Move all copy from "explainer videos for open-source projects" to "launch videos for any dev project", announcement-first.
**Scope**: `README.md` (documents both surfaces: `npx skills add RubenGlez/reelme` as the recommended path and the `npx reelme` CLI), `SKILL.md` frontmatter `description` (and name/title copy if affected), any example briefs in `examples/` whose copy carries the old positioning.
**Acceptance criteria**: No remaining "explainer" / "open-source projects" positioning language in README or SKILL.md frontmatter; README leads with the announcement use case and documents both install surfaces; skill description still triggers correctly for the skill-discovery patterns it served before.
**Depends on**: Task 3.1–3.3 (rewrite once the flow it describes is final).

### Task 3.6 — Publish the npm package
> Progress note (2026-06-13): `reelme@0.2.0` was published early at the owner's request, right after Phase 1 — the name republish worked (the prior unpublished `reelme` was the owner's own 0.1.x). Smoke-tested via `npx reelme@0.2.0 --help` from the registry. Still pending for this task: provenance (publish from CI), a clean-machine end-to-end render smoke test, and re-publishing whenever Phases 2–3 land.

**Goal**: `reelme` (or the fallback name) is live on the npm registry before any gallery or launch work, so `npx reelme render` works for real users and downloads become measurable.
**Scope**: Final package metadata (name per Task 1.1's availability check, description, keywords, repository field), publish with npm provenance, smoke-test `npx reelme render` from the published package in a clean directory.
**Acceptance criteria**: Package installable via `npx reelme` from the public registry with provenance attested; a clean-machine smoke run renders the example brief end to end; SKILL.md's CLI handoff works against the published version.
**Depends on**: Phases 1–2, Task 3.2.

---

## Phase 4 — Public proof & launch prep

Mostly using the product, not building it. This phase is also the quality gate: if the gallery output isn't proudly publishable, that is the real no-go signal.

### Task 4.1 — Gallery generation: run reelme on 5–10 known OSS projects
**Goal**: Produce real launch videos for 5–10 well-known OSS projects using reelme itself, exercising the full v2 flow (platforms, cuts, audio, real assets where obtainable).
**Scope**: No product code. Select candidate repos (recognizable, visually distinct brands, mix of CLI/library/app); run the skill end to end per repo; capture friction notes as issues. Fix-forward only for blocking bugs (each fix is its own small task).
**Acceptance criteria**: At least 5 finished videos rendered without manual editing of generated code; a written friction log; every blocking bug found has a filed issue or a landed fix.
**Depends on**: Phases 1–3 complete.

### Task 4.2 — Curate gallery and README showcase
**Goal**: Publish the proof: the best outputs become the repo's opening showcase and the launch content.
**Scope**: Curate the strongest 5+ videos (drop any that fail the "would the maintainer be proud to post this?" bar); host/embed them; `README.md` opens with the best one; gallery section links the rest.
**Acceptance criteria**: README opens with a working embedded/linked video; every published gallery item passes the maintainer-pride bar; gallery covers at least two aspect ratios to demonstrate the platform presets.
**Depends on**: Task 4.1.

### Task 4.3 — Success criteria and launch checklist
**Goal**: Define numeric success criteria before the dogfood launch, and the checklist that gates it.
**Scope**: `.rubstack/product/` doc (e.g. `launch.md`): numeric targets for the first 2 weeks (stars, repo clones via GitHub traffic API, mentions/replies, per-platform engagement), measurement method for each, and the launch checklist (gallery live, watermark verified in published videos, decision rule from the roadmap: if launch moves nothing, the answer is distribution work or accepting modest scope, not more features).
**Acceptance criteria**: Every criterion has a number and a concrete measurement source; checklist is actionable (each item verifiable yes/no); reviewed and accepted before any launch post goes out.
**Depends on**: Task 4.2 (criteria reference the gallery and growth loop being live).
