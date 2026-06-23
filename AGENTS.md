# reelme — agent notes

Non-obvious conventions for working in this repo. (Project context, decisions, and specs live in `.harness/`, which is gitignored.)

## Layout

- The skill bundle is `skills/reelme/` (`SKILL.md` + `references/`), not the repo root — it follows the Agent Skills `skills/<name>/SKILL.md` discovery convention so `npx skills add RubenGlez/reelme` installs only that folder (ADR 0004).
- The CLI is the `reelme` npm package under `cli/` (`cli/src` = CLI, `cli/template` = the Remotion project scaffolded into `~/.reelme/cache/`).
- `gallery/` holds the public showcase and the render eval suite (see below); `assets/` is README media only.

## Gallery briefs are the render eval suite

`gallery/<name>/reelme.json` are real, committed briefs that double as a regression suite. After any change to the CLI (`cli/src`), the Remotion template (`cli/template`), or the brief schema, re-render them to confirm nothing broke:

```
node scripts/eval-gallery.mjs            # all briefs
node scripts/eval-gallery.mjs ripgrep    # one brief
```

It renders each brief with the local CLI and passes when every platform renders with exit 0. Remotion output isn't bit-deterministic, so this is a smoke eval — the committed `gallery/<name>/<name>.gif` files are the visual reference for manual review. Add a new entry by dropping a `gallery/<name>/reelme.json` (rendering reelme itself is a natural candidate).
