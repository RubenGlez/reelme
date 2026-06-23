![reelme banner](./assets/reelme_banner.png)

`reelme` is an agent skill that generates launch videos for any dev project. Point it at any repo, answer a few questions, and get platform-ready MP4s and GIFs for socials, your README, and release announcements.

---

## Install

```bash
npx skills add RubenGlez/reelme
```

Works in any [Agent Skills](https://agentskills.io)-compatible agent: Claude Code, Cursor, Gemini CLI, OpenAI Codex, and more.

**Requirements:** Node.js >=18

The skill invokes the `reelme` CLI automatically. You don't need to install it separately.

---

## Usage

Open your agent inside any repo and run:

```
/reelme
```

The skill reads your repo, interviews you for brand details it can't infer, and writes `reelme.json` at the repo root. That file is your brand memory — commit it so future runs can update rather than start fresh.

Once the brief is ready, the skill runs:

```bash
npx reelme render
```

The CLI scaffolds a Remotion project in `~/.reelme/cache/<project-hash>/` (global cache, never inside your repo), renders all selected platforms, and copies the outputs to `./reelme-out/`.

**Preview before rendering:**

```bash
npx reelme studio
```

Opens Remotion Studio so you can scrub through scenes before committing to a full render.

**Iterate:**

Edit `reelme.json` directly, then re-run:

```bash
npx reelme render
```

**Outputs** land in `reelme-out/`, one file per selected platform: `x.mp4`, `tiktok.mp4`, `github-readme.gif`, etc. Social platforms also get a `<platform>-teaser.mp4` when a teaser cut is defined.

---

## Modes

**Project intro** — run once per project. Reads your README and source files, explains what makes it worth using.

**Feature announcement** — run after a release. Reads your changelog and recent git history, focuses on what changed and why it matters.

**Update existing video** — run `/reelme` again in a repo that already has a `reelme.json`. The skill re-reads the repo, surfaces any drift, and proposes changes to the brief. Only `reelme.json` is updated — no re-scaffold needed.

---

## Examples

| | Intro | Announcement |
|---|---|---|
| **MP4** | [examples/intro.mp4](./examples/intro.mp4) | [examples/announcement.mp4](./examples/announcement.mp4) |
| **GIF** | [examples/intro.gif](./examples/intro.gif) | [examples/announcement.gif](./examples/announcement.gif) |
| **Brief** | [examples/intro.json](./examples/intro.json) | [examples/announcement.json](./examples/announcement.json) |

---

## Scene types

`hook` · `problem` · `feature-list` · `clip` · `code-reveal` · `terminal` · `data-flow` · `split` · `browser` · `stat-callout` · `file-tree` · `mobile` · `os-window` · `hotkey` · `cta`

Full schema reference: [`references/scene-schemas.md`](./references/scene-schemas.md)

---

## License

MIT
