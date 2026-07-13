# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-07-14

### Added
- Five distinct per-look cinematic backdrop systems (mesh, spotlight, sweep, structural grid, field) so different briefs read as different productions.
- `project.secondaryColor` for real two-color brand palettes.
- Real-asset capture guidance: the skill sources real screenshots and media before the interview, and the gallery now uses real captures for several projects.
- Beat-synced editing: scene cuts quantize to the background track's tempo, with curated cut sound effects (whoosh, pop, rise) riding the music and rising into the closing call-to-action.
- A `custom` scene type for bespoke, skill-authored scene components a stock scene can't express.

### Changed
- Audio is now 6 curated CC0 (public-domain) music beds from Freesound — real recordings, zero-attribution, commercial-safe — replacing the earlier synthetic tracks; each bed is an exact whole-beat loop so it stays on-beat when looped.
- Settled motion: the camera moves only on a scene's arrival then holds perfectly still (a continuous zoom re-rasterized text and read as vibration), springs are near-critically damped (no overshoot), and terminal/code windows open at their final size instead of growing as content types in.
- Real screenshots in the phone and browser frames now hold still instead of slowly zooming.

### Fixed
- Rebuilt the data-flow and file-tree scenes for legibility.

## [0.4.0] - 2026-07-03

### Added
- `reelme validate` command with exhaustive brief and scene validation, run as a pre-pass before rendering.
- Per-project `reelme clean` (with `--all`) that prunes stale render output.
- Composition rebuild of the stat, CTA, feature-list, and mobile scenes on a shared `Stage` root, plus a `Loop` motion primitive and wipe/flip transitions.
- CLI smoke test suite and a CI job to run it.

### Changed
- Cache staleness is keyed to a template fingerprint; a missing marker now counts as stale.
- Studio staging validates assets, audio, and logo before rendering.
- Smaller GIF output via gifsicle and a lower h264 bitrate.

### Fixed
- Hardened against path traversal on asset and logo copy, and made pnpm spawns Windows-safe.
- Scene timing fixes so captions fit, clips honor the bottom inset, and vertical scenes respect `safeArea.top`.
- Moved `react`/`react-dom` to dependencies and removed the dead `transition` field.
- Resolved high and critical dependency CVEs.

### Removed
- Over-broad `approve-builds --all` and a dangerous root `postversion` script.

## [0.3.0] - 2026-06-24

### Added
- Cinematic render engine: continuous atmosphere, camera moves, edit rhythm, and art-direction looks.
- Composition variety across scenes with redesigned gallery briefs.
- Bundled background audio (music beds).
- Hook scene, "Made with reelme" watermark, real-asset ingestion, and vertical-format polish.

### Changed
- Restructured the skill into `skills/reelme/` with added narrative and copywriting references.

### Removed
- Standalone SFX / sound-design layer and the electronic kick/hi-hat pulse from music beds.

## [0.2.2] - 2026-06-13

### Added
- Platform selector and brief v2 with CLI render orchestration.
- Tone-driven font defaults, motion profiles, CTA overhaul, and hero mode.
- Global transition field (fade, slide, zoom).
- New `os-window` and `hotkey` scenes, an icon library, and Google Fonts support.
- Intro and announcement modes, plus an outline proposal step before writing the brief.

## [0.1.3] - 2026-05-28

### Added
- Scaffolds into `.reelme/` and prompts about gitignore.

### Changed
- Trimmed the file set synced into user projects to essentials.
- Standardized on the MIT license.

## [0.1.2] - 2026-05-26

### Added
- npm provenance support.

## [0.1.1] - 2026-05-25

### Added
- Initial public release: the reelme CLI and Agent Skill with showcase scenes.
