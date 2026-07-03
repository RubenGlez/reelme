# Adversarial codebase audit — 2026-07-03

Auditor role: senior staff engineer + skeptical first-time user (`npx skills add RubenGlez/reelme` → `/reelme` → `npx reelme render`) + adversarial reviewer. Every tracked file in the repo was read (143 files; binaries and encrypted `.harness/**` accounted for). Findings are marked **CONFIRMED** (traced end-to-end in code, or arithmetic verified) or **PLAUSIBLE** (strongly indicated, not executed).

---

## 1. System map

### Architecture

Three layers, deliberately split (ADR 0003 "hybrid skill + thin CLI"):

1. **Agent skill** — `skills/reelme/SKILL.md` + `references/{narrative,copywriting,scene-schemas}.md`. Owns the intelligence: reads the target repo, interviews the user, writes `reelme.json` (schema v2) at the repo root. Never touches the cache.
2. **npm CLI `reelme`** — `cli/src/{cli,cache,render}.mjs`, zero runtime deps (gifsicle optional). Owns mechanics: scaffolds the bundled Remotion template into `~/.reelme/cache/<sha256(repoRoot)[0:12]>/`, installs deps there with pnpm, copies the brief + referenced assets + one bundled audio track into the cache, invokes `pnpm exec remotion render` per platform, post-processes GIFs with gifsicle, copies outputs to `<repo>/reelme-out/`.
3. **Remotion template** — `cli/template/src/`. `index.ts` re-validates the brief, registers one `Reel-<platform>` composition per selected platform (+ `Reel-<platform>-teaser` for non-GIF platforms when `cuts.teaser` exists). `Root.tsx` resolves the cinematic look, builds the theme, sequences scenes back-to-back (`duration.ts`), wraps each in `Enter` (transition) + `Camera` (move), and renders one of 16 scene components over a single continuous `Atmosphere`.

### Real execution paths

**Render:** `cli.mjs:38` → `render(repoRoot=process.cwd())` (`render.mjs:143`) → `readBrief` (`cache.mjs:51`: JSON parse, `schemaVersion === 2`, platforms valid & non-empty, `cuts.main` non-empty) → `ensureScaffold` (`cache.mjs:105`: version-marker staleness check → full template copy on first run → **unconditional `src/` re-sync every render** → brief copy to `src/brief.json` → `pnpm install` + `pnpm approve-builds --all` gated on missing `node_modules`) → `copyAssets`/`copyAudioTrack`/`copyLogo` into `cache/public/` → per platform: `pnpm exec remotion render Reel-<id> out/<file>` (`--codec=gif --scale=0.6` or `--crf=20`) → gifsicle `--lossy=60` (best-effort) → `cpSync` to `reelme-out/`. Failures at every CLI step call `fail()` → stderr + exit 1. Render subprocess failure is caught (`render.mjs:53`).

**Studio:** `cli.mjs:24` → `ensureScaffold` only → `pnpm exec remotion studio`. Note what it does *not* do — see F1.

**Eval:** `scripts/eval-gallery.mjs` runs `node cli/src/cli.mjs render` in each `gallery/<name>/` (cwd = brief dir), passes on exit 0. Smoke only; committed GIFs are the visual reference.

### Key invariants (as documented)

- Brief is schema v2: `{schemaVersion: 2, project, cuts: {main, vertical?, teaser?}}`; v1 (top-level `scenes` / `project.format`) rejected.
- Scene roots are transparent (`Stage`), atmosphere is continuous behind all scenes.
- Cut selection: teaser > platform preset cut; vertical falls back to main.
- Cache invalidation: CLI version bump rebuilds scaffold; `src/` re-synced every render.
- `platforms.json` is the single source of truth shared by CLI (raw JSON) and template (typed import).
- Audio: bundled manifest only; `basename(track) === track` blocks traversal; GIF output silent; watermark default on.

---

## 2. Findings

Severity scale: **P1** (a first-time user following the docs hits a broken or badly wrong result), **P2** (real defect / drift, needs a specific path), **P3** (polish, dead code, doc nits).

### P1 — Correctness / first-run breakage

**F1. `reelme studio` skips brief validation and all asset/audio/logo copying — the documented "preview first" path is broken for exactly the briefs the skill produces.**
`cli/src/cli.mjs:24-32` calls only `ensureScaffold`; `copyAssets`, `copyAudioTrack`, `copyLogo` live in the render path (`cli/src/render.mjs:150-152`). SKILL.md Step 6 explicitly offers "Preview first — run `npx reelme studio`", and Update Mode U4 does the same.
Scenario: the skill writes a brief with `project.logo`, `project.audio`, or any `clip`/`browser`/`mobile` asset (5 of 7 gallery briefs have a logo; all have audio), user picks "preview first" → Studio opens against a cache whose `public/` lacks the files → `staticFile()` 404s, `<Img>`/`<Audio>` error overlays in every affected scene. Worse, with no `reelme.json` at all, `ensureScaffold`'s `cpSync(join(repoRoot, "reelme.json"), …)` (`cache.mjs:141`) throws a raw `ENOENT` stack trace instead of `readBrief`'s friendly "no reelme.json found" message. **CONFIRMED** (traced; studio never calls `readBrief` or the copy functions).
Direction: make `studio()` run the same pipeline as `render()` minus the render loop (readBrief + copyAssets + copyAudioTrack + copyLogo), and validate the brief exists first.

**F2. Multi-word `accent` phrases silently never highlight — and the docs and gallery briefs all use them.**
`RevealText.tsx:46-47,72-73`: text is split on spaces and the emphasis test is per-word (`clean === emphWord || word.toLowerCase().includes(emphWord)`). A phrase accent (`"one command"`, `"desktop app."`, `"5 MB"`, `"launch video."`, `"one codebase."`) can never match any single word, so the hook renders with zero emphasis.
This contradicts `skills/reelme/references/scene-schemas.md:410` ("`accent` highlights one word or phrase"), the schema example itself (`"accent": "one command"`, line 43), SKILL.md copy guidance, and 5 committed gallery briefs (expo, pake ×2 cuts + teaser, reelme). The render eval can't catch it (exit-0 smoke). **CONFIRMED**.
Direction: match the accent as a substring across the joined text and emphasize the covered word range (or split the text into pre/accent/post segments before word-splitting).

**F3. `cuts.vertical: []` (empty array) crashes the render after the CLI promises a letterbox fallback — `??` vs `?.length` divergence between the two validators.**
`cli/src/render.mjs:155` treats empty-or-missing the same (`!brief.cuts.vertical?.length`) and prints "will render the main cut letterboxed". But `cli/template/src/index.ts:36` and `Root.tsx:56` use `brief.cuts.vertical ?? brief.cuts.main` — an empty array is *not* nullish, so the vertical composition gets 0 scenes and `durationInFrames: 0`, which Remotion rejects (composition duration must be positive), failing the render with an error that never mentions the real cause. `index.ts:41`'s own fallback warning uses `!brief.cuts.vertical`, so it doesn't even warn. **CONFIRMED** (traced both branches).
Direction: normalize in one place — treat empty cuts as absent (or reject them in `readBrief` with a good message).

**F4. No scene-level validation anywhere: a typo'd scene type or missing required prop dies minutes later inside Remotion with a cryptic error.**
`readBrief` (`cache.mjs:51-87`) validates only schemaVersion/platforms/cuts.main-non-empty. A scene `{"type": "stat_callout"}` (underscore) reaches `duration.ts:57` where `SCENE_DURATION_MAP[scene.type]` is `undefined` → `undefined + 30` = `NaN` → `calcTotalDuration` = `NaN` → Remotion rejects the composition, or worse `SceneRenderer` (`Root.tsx:139`) silently renders `null` for a near-miss type that has a mapped duration. A `feature-list` missing `items` throws `TypeError: Cannot read properties of undefined (reading 'length')` at `duration.ts:39` during bundling — after the user has already sat through the first-run `pnpm install`. The agent writing the brief is an LLM; typos are the expected failure mode, and the primary interface (the skill) has no machine check. **CONFIRMED**.
Direction: ship a `reelme validate` (or validate inside `readBrief`) against a real schema — per-scene type whitelist + required props — with errors that name the cut/index/field. The TS types in `brief.ts` already encode the contract; today nothing enforces it at runtime.

**F5. The CLI is almost certainly broken on Windows: `spawnSync("pnpm", …)` without `shell` cannot resolve `pnpm.cmd`.**
`cache.mjs:94-100` (`pnpm install`, `approve-builds`), `render.mjs:52` (`pnpm exec remotion render`), `cli.mjs:27` (studio). On Windows, pnpm/npx shims are `.cmd` files; Node's `spawnSync` without `shell: true` fails with `ENOENT` (and since the CVE-2024-27980 hardening, `shell: true` is the only sanctioned route for `.cmd`). No doc anywhere restricts the tool to macOS/Linux; README says only "Node.js >=18". **PLAUSIBLE** (well-known Node behavior; not executed on Windows here).
Direction: use `shell: process.platform === "win32"` or resolve the pnpm binary via `process.env.npm_execpath`/`which`, and state OS support in the README either way.

**F6. The template's own bundled sample brief references icons that don't exist in the icon registry — the showcase renders with empty marker boxes.**
`cli/template/src/brief.json:64-68` (`"play"`, `"user-check"`, `"rocket"`) and `:85-86` (`"git-branch"`, `"rocket"`) are absent from `ICON_MAP` (`Icon.tsx:14-56`) and from the documented registry (`scene-schemas.md:446`). `Icon` returns `null` for unknown names; `FeatureList.tsx:73-88` then renders an empty 40px slot instead of falling back to the numbered marker (the fallback triggers on missing `icon` prop, not on unknown name); `OSWindowScene.tsx:131-147` renders an empty chip. First thing a curious user previews in Studio (the sample composition before their brief is synced) silently violates the product's own registry. **CONFIRMED**.
Direction: fix the four icon names in `brief.json`; make `Icon` fall back visibly (or `FeatureList` fall back to the number when the lookup misses); consider registering the missing lucide icons since briefs in the wild will guess names.

**F7. `terminal` and `code-reveal` durations are fixed while their content animation is content-length-driven — the bundled sample brief's own terminal caption mathematically never appears, and long commands get cut mid-typing.**
`duration.ts:11-28` gives `terminal` a fixed 150+30 frames, but `Terminal.tsx:41-61` types inputs at 2 frames/char + 23/line. For the sample brief (`brief.json:25-37`): input1 (28 ch)=79f, output1=23f, input2 (21 ch)=65f, output2=23f → content ends at elapsed 190; `TerminalScene.tsx:21-24` sets `captionStart = 8+190+20 = 218` — past the 180-frame scene. The caption `"One command. Production stack. Under 60 seconds."` never renders; the second output pops in 5 frames before the cut. Any brief with 2+ realistic commands overruns. Same structural issue in `code-reveal` (fixed 165f vs `14 + lines*9 + 20` caption start → >14 lines of code overrun). Meanwhile `feature-list`/`stat-callout`/`file-tree`/`os-window`/`hotkey`/`benchmark` *do* scale with content (`duration.ts:37-55`) — the two most content-variable scenes are the ones left fixed. **CONFIRMED** (arithmetic above).
Direction: compute `terminal`/`code-reveal` durations from the same formulas the components use (share one timing module), and unit-test the invariant `captionStart + captionAnimation < sceneDuration` for every scene type.

### P2 — Cache lifecycle, drift, affordances

**F8. Cache staleness check treats a *missing* version marker as fresh — caches created before the marker existed (or half-created) are never rebuilt.**
`cache.mjs:109-111`: `stale = existsSync(versionMarker) && content !== CLI_VERSION`. A cache dir with `package.json` but no marker skips both the rebuild and the marker write forever. Related: the per-render re-sync covers only `template/src` (`cache.mjs:135`), so a change to `template/package.json` (e.g. bumping Remotion) never reaches an existing cache until a CLI version bump — including during local development and the gallery eval, which will happily "PASS" new scene code against old dependencies. The comment acknowledges deleted files aren't pruned but not the dependency skew. **CONFIRMED** (logic traced).
Direction: treat a missing marker as stale; include a hash of `template/package.json` (or the whole template) in the marker instead of the CLI version.

**F9. `clip` captions ignore platform safe areas — on TikTok/Reels the caption pill sits inside the platform UI overlay zone.**
`Root.tsx:135` renders `<Clip scene theme />` without `bottomInset` (every other captioned scene gets it), and `Clip.tsx:97,114,122` calls `Caption` without `bottomInset`, so the pill lands 72px from the bottom of a 1920px-tall frame whose preset declares a 320-420px bottom safe area (`platforms.json:46,56`). SKILL.md tells authors vertical cuts should "favor … `clip`". **CONFIRMED**.
Direction: pass `bottomInset` through `SceneRenderer` → `Clip` → `Caption` like the other scenes.

**F10. `safeArea.top` is declared, tested, and documented ("presets resolve … safe areas internally") but consumed by nothing.**
Only `safeArea.bottom` is read (`Root.tsx:104`). Content is vertically centered so this mostly self-heals, but tall scenes (mobile with copy above the device on portrait, `Kicker`+hero problem) can reach into TikTok's top 160px / Story's top 250px. `platforms.test.ts:32-41` asserts the data exists — it tests dead data. **CONFIRMED** (grep: no other consumer).
Direction: apply top inset as stage padding on vertical platforms, or delete the field.

**F11. Asset copy has a `../` path-traversal write primitive.**
`render.mjs:81-84` and `copyLogo` (`:130-141`): `join(publicDir, asset)` with `asset = "../../…"` escapes the cache and copies any readable file (existence pre-checked against `join(repoRoot, asset)`, which also escapes) to a path outside `public/`. The brief is usually self-authored, but the *skill's whole premise* is an agent writing this file, and briefs get committed/shared — a malicious PR editing `reelme.json` gets a file-write on the maintainer's machine at render time. Audio does this right (`basename(track) === track`, `render.mjs:107`). Renders with escaped paths would fail later at `staticFile`, but the copy has already happened. **CONFIRMED** (no normalization anywhere in the path).
Direction: resolve and reject any asset/logo path whose `path.resolve(repoRoot, p)` escapes `repoRoot`, and whose destination escapes `publicDir`.

**F12. "Rendered locally, zero cloud, zero API keys" undersells real network requirements — first render needs the npm registry, a headless-browser download, and Google Fonts.**
`cli/README.md:3` claims zero cloud; `fonts.ts:11-19` eagerly loads 9 font families from Google Fonts at bundle/render time; Remotion downloads Chrome Headless Shell on first render; the scaffold `pnpm install` pulls the tree. Offline, the render fails after a confusing distance from the claim. No doc mentions the browser download (hundreds of MB) or that fonts are fetched per render. **CONFIRMED** for install/fonts (code traced), **PLAUSIBLE** for exact offline failure mode.
Direction: soften the claim to "renders on your machine (no accounts, no upload)", document first-run downloads, and consider `@remotion/fonts` with packaged font files to make renders genuinely offline-capable after first install.

**F13. Two validators, two languages, drifting behavior — brief validation is duplicated between `cache.mjs:51-87` and `template/src/index.ts:13-48`.**
Same checks, different messages, and already-different semantics (F3's `??` vs `?.length` is the symptom). The template validator's errors surface as bundling failures wrapped by Remotion. **CONFIRMED**.
Direction: validate exhaustively in the CLI (it runs first and owns UX); reduce the template checks to assertions.

**F14. `react`/`react-dom` are devDependencies of the template — any production-mode install produces a cache that can't render.**
`template/package.json:19-30`. pnpm installs devDeps by default, so the happy path works, but `NODE_ENV=production` or `pnpm config production=true` on the user's machine silently yields a Remotion project without React. Remotion treats React as a peer/runtime requirement; these belong in `dependencies`. **PLAUSIBLE** (env-dependent; not executed).

**F15. `pnpm approve-builds --all` approves *every* dependency's build scripts, not just esbuild — and `pnpm-workspace.yaml`'s `allowBuilds:` key doesn't appear to be a real pnpm setting.**
`cache.mjs:147`, `template/pnpm-workspace.yaml:3-4`. The comment says the workspace file "persists the approval", but pnpm's mechanism is `onlyBuiltDependencies`; if `allowBuilds` is unrecognized, the only thing doing work is the blanket `--all`, which re-opens the supply-chain hole pnpm 10's gating exists to close. **PLAUSIBLE** (key validity not verified offline; `--all` breadth is CONFIRMED from the flag itself).
Direction: replace with `onlyBuiltDependencies: [esbuild]` in the scaffolded workspace file and drop `approve-builds --all`.

**F16. Unbounded cache growth with no lifecycle management.**
Each repo path hash gets its own full Remotion install (`node_modules` several hundred MB) plus an ever-growing `out/` of every render (never pruned; outputs are *copied*, not moved, `render.mjs:168`). Renaming or moving a repo orphans its cache forever (hash of absolute path, `cache.mjs:90`). The only tool is `clean`, which nukes every project's cache at once. **CONFIRMED** (no eviction code exists).
Direction: `reelme clean` for current project by default (`--all` for everything); prune `out/` after copying; print cache size.

**F17. Ctrl+C mid-render leaves no cleanup and re-render clobbering is fine, but *concurrent* renders in one repo race on `src/brief.json` and `out/`.**
Two `reelme render` processes in the same repo share a cache dir; the second's brief copy (`cache.mjs:141`) swaps the brief under the first's in-flight `remotion render` bundle step nondeterministically. Low likelihood, silent wrong-output failure mode. **PLAUSIBLE**.
Direction: a simple lockfile in the cache dir.

### P2 — Skill/doc vs code drift (the skill is the primary interface)

**F18. `scene-schemas.md` "Required" list is fiction: `name`/`tagline`/`problem`/`installCommand`/`repoUrl`/`primaryColor`/`tone` are not required by the CLI — and `tagline` and `problem` are never rendered by anything.**
`scene-schemas.md:50-61` vs `cache.mjs:64-85` (only schemaVersion/platforms/cuts.main enforced). Grep confirms `project.tagline` and `project.problem` have zero render-time consumers; the interview collects them, the brief carries them, nothing uses them. SKILL.md Step 5's own "Required" list (`:179-183`) disagrees with scene-schemas.md's. Two sources of truth, both partly wrong. **CONFIRMED**.
Direction: pick one canonical requirements list (the CLI's), mark `tagline`/`problem` as agent-context-only (or render them somewhere — the CTA has no tagline line today), and make scene-schemas.md defer to it.

**F19. `scene-schemas.md` still documents `transition` semantics as a live feature.**
`scene-schemas.md:117-119` lists `transition?: "fade" | "slide" | "zoom"` in the Project fields type, and `:158-162` has a "### Transition" section explaining what each value does ("neutral default / more kinetic / punchier launch feel") — with no mention of it being ignored; only line 70 says superseded. AGENTS.md says it's ignored; the code confirms (`Root.tsx` never reads it). An agent reading the reference will keep writing and "tuning" a dead field. Relatedly, `CinematicLook.transition` (`look.ts:42,60,68,76,84,92`) is itself dead — `transitionFor` (`transitions.tsx:16-21`) uses only `RHYTHM[look.id]` and `look.energy`; the five per-look `transition:` values are never read. **CONFIRMED**.
Direction: delete the "### Transition" section and the type field from docs; drop `transition` from `CinematicLook` or actually seed the rhythm from it.

**F20. SKILL.md points agents at `cli/assets/audio/manifest.json` — a path that does not exist for a skill user.**
`SKILL.md:109` and `scene-schemas.md:144`. The installed skill bundle is `skills/reelme/` only (ADR 0004); the manifest lives inside the npm package in some npx cache, not in the user's repo. The tone table in SKILL.md happens to enumerate all 9 tracks by name, which saves the flow, but the instruction "an alternative from the bundled manifest" is unfollowable as written. **CONFIRMED**.
Direction: inline the full 9-track table (title, filename, tone) into SKILL.md/scene-schemas.md as canonical, or add `reelme tracks` to the CLI.

**F21. "Letterboxed into 9:16" is not what happens — vertical fallback re-lays-out main-cut scenes at 1080×1920.**
`render.mjs:158-161`, `index.ts:44-47`, SKILL.md `:187`, scene-schemas.md `:96` all say "letterboxed". Actually the main cut's scenes render natively into the vertical composition (components are responsive; `typeScale` bumps 1.25×). That's better than letterboxing but means wide scenes (`split`, `data-flow` with 4 nodes at `spacing=(1080-240)/4`, `benchmark` label column of 300px) can genuinely cramp or overflow — which "letterboxed" wouldn't. Users are being warned about the wrong artifact. **CONFIRMED**.
Direction: reword to "re-rendered at 9:16 — dense wide scenes may cramp; author cuts.vertical".

**F22. `brief.ts:21` still says the watermark "Rendering lands in Phase 2" — it shipped.**
`CTA.tsx:109-124` renders it. Stale comment misleads contributors. Also `watermark.test.ts` tests a local re-implementation of `watermark !== false`, not the CTA code — it can never fail when the real logic changes. **CONFIRMED**.

**F23. Clip `durationInFrames` shows ~30 extra frames of footage beyond what was asked.**
`duration.ts:34` adds `SCENE_TAIL` (30) to the user-specified `durationInFrames`, and `Clip.tsx:26-31`'s `OffthreadVideo` has `startFrom` but no `endAt`, so the video keeps playing through the tail. A user trimming a demo to exactly frames 30-150 gets 30-180. scene-schemas.md documents `durationInFrames` as a plain frame count with no mention of the tail. **CONFIRMED** for the arithmetic; end-of-file behavior (freeze vs error when the source is too short) **PLAUSIBLE**.
Direction: `endAt={startFrom + durationInFrames}` and document the tail.

**F24. SKILL.md asset-extension validation (`mp4|mov|gif`, `png|jpg|jpeg|webp`) is skill-side prose only — the CLI accepts anything.**
`render.mjs:59-86` copies whatever the brief references; `Clip.tsx:13` special-cases only `.gif`; a `.webm` or `.avif` fails later inside Remotion. Consistent with "skill owns intelligence", but nothing protects the direct-CLI path the cli/README advertises. **CONFIRMED**. Low priority; fold into F4's validator.

### P3 — Dead things, packaging, DX

**F25. Root `.npmignore` is dead.** The published package lives in `cli/` (its `files` allowlist governs packing); a root `.npmignore` listing `template/*` paths does nothing. Leftover from when the package was published from the root. **CONFIRMED**.

**F26. Root `package.json` version 0.1.3 with a `postversion: git push --tags` script vs cli 0.3.0 and a manual-release doc.** Three version numbers in play (root 0.1.3, cli 0.3.0, template 1.0.0); AGENTS.md's release flow uses none of the root machinery. An `npm version` in the root would push a bogus tag. **CONFIRMED** (drift; consolidate or delete the root script).

**F27. reelme's own AGENTS.md says `.harness/` is gitignored; it is tracked (doctier-encrypted).** `git ls-files` lists `.harness/**`; `.gitignore` doesn't contain it; `.gitattributes` applies the doctier filter. Doc drift inside the repo's own agent instructions. **CONFIRMED** (noting only — not editing AGENTS.md).

**F28. CI covers only the template; `cli/src` has zero automated coverage and the gallery eval is never run in CI.** `.github/workflows/ci.yml` = template typecheck/lint/test. All of F1/F3/F8/F11 live in `cli/src/*.mjs` — untyped, unlinted, untested. The eval is manual by design (render cost), but even a `--help` / `readBrief`-unit smoke of the CLI would have caught the studio ENOENT path. **CONFIRMED**.

**F29. Eval DX: `spawnSync` with buffered output means multi-minute renders emit nothing until PASS/FAIL, and there's no per-brief timeout.** A hung Chrome download looks identical to a slow render. Also gallery coverage note: no gallery brief exercises `mobile.screenshot` or `browser.image` (both mobile/browser scenes in the gallery use the mock/wireframe path), so the image-asset copy path in `collectAssets` is exercised only by `clip` (reelme/demo.mp4). **CONFIRMED**.

**F30. `generate-tracks.mjs` leaves a stale MP3 if ffmpeg fails after a previous success, and deletes the intermediate WAV before checking the encode status.** Cosmetic; regeneration is rare. **CONFIRMED**.

**F31. README "Requirements: Node.js >=18" omits pnpm.** cli/README and SKILL.md's gotchas have it; the top-level README — the first thing a user reads — doesn't. First render then dies at `failed to run pnpm: spawnSync pnpm ENOENT` after the interview. **CONFIRMED**.

**F32. Icon fallback asymmetry:** `os-window` tolerates missing `items` (`?? []` in component and duration), `feature-list` crashes on missing `items` (F4), `hotkey` crashes on missing `keys`. Same-shaped scenes, different failure behavior. **CONFIRMED**.

---

## 3. Design tensions

**T1. The contract is enforced by prose, but the author is an LLM.** The skill (prose) instructs an agent to hand-write JSON that two ad-hoc validators check only at the top level. Every P1 in this report except F5 is some form of "the brief said something plausible and the renderer did something silent or cryptic." The natural fix is structural: ship a JSON Schema (or zod validation) for the brief *in the CLI*, add `reelme validate`, and make SKILL.md's last step before render "run `npx reelme validate`". That converts the whole class of scene-typo/missing-prop/unknown-icon/phrase-accent failures into immediate, named errors — and gives the skill a feedback loop it currently lacks.

**T2. Timing is split between a duration oracle and the components' own animation math.** `duration.ts` guesses how long a scene needs; each component independently re-implements its reveal timeline (`TerminalScene` literally has a comment "Mirror Terminal's timing"). When they disagree (F7), captions vanish and typing gets cut — and nothing can test it because the two halves live in different modules with no shared constants. Alternative: each scene exports `contentDuration(scene)` next to its component; `duration.ts` sums those; a single unit test asserts caption-start < duration for every scene type at representative sizes.

**T3. Cache invalidation is keyed to the CLI version, but the thing that changes is the template.** The `src/` re-sync papers over half of it (scene code) while dependencies, config, and deleted files drift (F8). The honest key is a content hash of `template/` (cheap: hash the file list + mtimes or the packed tarball at publish). That also fixes the dev/eval mismatch where local template `package.json` edits silently don't apply.

**T4. Two brief validators in two languages will keep drifting.** F3 is the first observable divergence; F13 the structural cause. Since the template can't run without the CLI (it's scaffolded by it), the template's validator adds no safety for real users — only for people poking Studio directly in the cache. Collapse validation into the CLI; keep template-side checks as `console.warn` diagnostics at most.

**T5. The eval suite asserts the wrong thing for the product's failure modes.** reelme's regressions are visual/semantic (accent no-op, empty icon slots, caption past scene end, safe-area collisions) — all exit-0. The smoke eval is still worth keeping for pipeline breakage, but the highest-leverage addition is a *brief linter* run over the gallery (icons in registry, accents matchable, caption timing invariant, assets exist) plus optionally a `renderStill` of one frame per scene with a pixel check for accent-color presence. Cheap, deterministic, and it would have caught F2/F6/F7 mechanically.

---

## 4. Expectation gaps ("I expected X, found Y")

- **Expected** `reelme studio` to preview exactly what `reelme render` would produce; **found** it skips asset/audio/logo staging and even brief-existence checks (F1).
- **Expected** `accent` to highlight the phrase the docs told me to write; **found** only single words can ever match (F2).
- **Expected** the CLI's "letterboxed" warning to describe the fallback; **found** re-layout, not letterboxing (F21) — and an empty vertical array crashes instead (F3).
- **Expected** the bundled sample brief to be a working showcase of the scene registry; **found** four unregistered icon names rendering as empty boxes (F6).
- **Expected** scene durations to fit the content, since half the scene types compute duration from content; **found** `terminal`/`code-reveal` fixed, with the sample brief's own caption unreachable (F7).
- **Expected** "upgrading the CLI rebuilds the scaffold automatically" to be robust; **found** a missing marker means never-rebuild, and template dependency changes don't propagate at all between versions (F8).
- **Expected** platform "safe areas" to be enforced; **found** `top` consumed by nothing and `clip` captions ignoring `bottom` (F9, F10).
- **Expected** "zero cloud" to mean renders work offline; **found** Google Fonts + headless-browser + registry downloads on the critical path (F12).
- **Expected** the fields the interview insists on (`tagline`, `problem`) to appear in the video; **found** they're never rendered (F18).
- **Expected** `reelme.json` to be inert data; **found** `../` asset paths give it a file-write primitive at render time (F11).
- **Expected** the npm package's `files` allowlist to be load-bearing; **found** it correct — template, assets, lockfile all ship; sample logo and tests excluded (verified; no finding).
- **Expected** the audio path to be the sloppy one; **found** it's the best-validated input in the codebase (manifest check + basename guard) — the pattern the rest of the brief handling should copy.

## 5. Open questions

1. Is `accent` *meant* to support phrases (docs and gallery say yes) or should docs/gallery be corrected to single words? The fix direction differs.
2. Is Windows in scope? If yes, F5 is P1; if no, one README line closes it.
3. Should `tagline`/`problem` render somewhere (e.g., CTA subline / opening kicker), or be re-documented as agent-context-only fields?
4. Is `allowBuilds` in `pnpm-workspace.yaml` a real pnpm key on the pnpm versions users have, or dead config that `approve-builds --all` is compensating for (F15)?
5. What should `safeArea.top` do — pad the stage on vertical platforms, or be deleted (and the platforms test with it)?
6. Cache policy: is ~1GB per rendered repo with no eviction acceptable for the target user, or should `clean` become per-project with an `--all` escape hatch (F16)?
7. Does `project.watermark: true` vs absent ever need to differ (e.g., future "required attribution on free tier")? Today `!== false` folds them together.
