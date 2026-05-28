![reelme banner](./assets/reelme_banner.png)

`reelme` is an agent skill that generates animated explainer videos for open-source projects. Point it at any repo, answer a few questions, and get an MP4 and a GIF ready to drop into your README, socials, or landing page.

---

## Install

```bash
npx skills add RubenGlez/reelme
```

Works in any [Agent Skills](https://agentskills.io)-compatible agent: Claude Code, Cursor, Gemini CLI, OpenAI Codex, and more.

**Requirements:** Node.js >=18, pnpm

---

## Usage

Open your agent inside any repo and run:

```
/reelme
```

The agent reads your repo, asks only what it can't infer (brand color, logo, output format), proposes a scene outline for your approval, then scaffolds and renders locally.

Before the final render you can preview in Remotion Studio (`cd .reelme && pnpm start`) — the agent will ask.

Output: `.reelme/out/video.mp4` and `.reelme/out/video.gif`

After rendering, the agent gives you platform-specific guidance: which file to use for your README, Twitter/X, LinkedIn, YouTube, and Reels/Shorts.

To iterate: edit `.reelme/src/brief.json` and run `cd .reelme && pnpm render`.

---

## Modes

**Project intro** — run once per project. Reads your README and source files, explains what makes it worth using.

**Feature announcement** — run after a release. Reads your changelog and recent git history, focuses on what changed and why it matters.

**Update existing video** — run `/reelme` again in a repo that already has a `.reelme/` folder. The skill detects the existing brief, re-reads the repo, surfaces any drift, and asks what you want to change. Only the brief is updated — no re-scaffold, no re-install.

---

## Examples

| | Intro | Announcement |
|---|---|---|
| **MP4** | [examples/intro.mp4](./examples/intro.mp4) | [examples/announcement.mp4](./examples/announcement.mp4) |
| **GIF** | [examples/intro.gif](./examples/intro.gif) | [examples/announcement.gif](./examples/announcement.gif) |
| **Brief** | [examples/intro.json](./examples/intro.json) | [examples/announcement.json](./examples/announcement.json) |

---

## Scene types

`problem` · `feature-list` · `code-reveal` · `terminal` · `data-flow` · `split` · `browser` · `stat-callout` · `file-tree` · `mobile` · `os-window` · `hotkey` · `cta`

Full schema reference: [`references/scene-schemas.md`](./references/scene-schemas.md)

---

## License

MIT
