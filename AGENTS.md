# reelme — agent notes

Non-obvious conventions for working in this repo. (Project context, decisions, and specs live in `.harness/`, which is gitignored.)

## Layout

- The skill bundle is `skills/reelme/` (`SKILL.md` + `references/`), not the repo root — it follows the Agent Skills `skills/<name>/SKILL.md` discovery convention so `npx skills add RubenGlez/reelme` installs only that folder (ADR 0004).
- The CLI is the `reelme` npm package under `cli/` (`cli/src` = CLI, `cli/template` = the Remotion project scaffolded into `~/.reelme/cache/`).
- `gallery/` holds the public showcase and the render eval suite (see below); `assets/` is README media only.

## Scene conventions

- A continuous atmosphere is rendered behind every scene, so scene roots are intentionally `background: "transparent"` — the stage shows through. When adding or editing a scene, do not paint an opaque full-frame fill on its root, or you'll hide the atmosphere. Framed panels (browser/phone/window bodies, the install pill) keep a solid `theme.bg` on purpose.
- New scenes should use the shared `Stage` root (`components/primitives/Stage.tsx`): it bakes in the transparent background, a standard safe inset, and centered-by-default content, so the convention above can't be forgotten by hand. Compose for the whole frame — center a single block so leftover space stays symmetric, or balance a hero against secondary mass with `direction="row"`. Never anchor content to one edge with a void opposite, and give supporting text/graphics real weight (layout floors: headline ≥84px, supporting ≥44px, labels ≥32px at 1080-wide). The full audit + scorecard is `.harness/engineering/video-craft-rubric.md`.
- `project.look` defaults from `tone`. The legacy `project.transition` field is ignored.

## Gallery briefs are the render eval suite

`gallery/<name>/reelme.json` are real, committed briefs that double as a regression suite. After any change to the CLI (`cli/src`), the Remotion template (`cli/template`), or the brief schema, re-render them to confirm nothing broke:

```
node scripts/eval-gallery.mjs            # all briefs
node scripts/eval-gallery.mjs ripgrep    # one brief
```

Each render re-syncs the template `src/` into the cache, so the eval reflects your local `cli/template` edits without a `reelme clean` first. It renders each brief with the local CLI and passes when every platform renders with exit 0. Remotion output isn't bit-deterministic, so this is a smoke eval — the committed `gallery/<name>/<name>.gif` files are the visual reference for manual review. Add a new entry by dropping a `gallery/<name>/reelme.json` (rendering reelme itself is a natural candidate).

## Release

`reelme` is published to npm **manually** — there is no publish-on-tag automation (`.github/workflows/ci.yml` only runs the `cli/template` typecheck/lint/test on push and PR). Flow: bump the version in `cli/package.json`, commit, annotate-tag `v<version>` on `main`, push branch + tag, then `cd cli && npm publish` (maintainer: rubenglez). What ships in the package is controlled by the `files` allowlist in `cli/package.json`.
