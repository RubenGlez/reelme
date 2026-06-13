# reelme

Turn your repo into launch videos for social platforms — rendered locally with [Remotion](https://www.remotion.dev), zero cloud, zero API keys.

`reelme` is the rendering engine behind the [reelme agent skill](https://github.com/RubenGlez/reelme). The skill does the thinking (it reads your repo, interviews you, and writes a `reelme.json` brief at your repo root); this CLI does the work: it scaffolds a Remotion project in a global cache and renders one video variant per publishing platform.

## Install & use

No install needed:

```bash
npx reelme render
```

Run it in a repo that has a `reelme.json`. To create one, use the agent skill in Claude Code, Cursor, Gemini CLI, or any [Agent Skills](https://agentskills.io)-compatible agent:

```bash
npx skills add RubenGlez/reelme
```

## Commands

| Command | What it does |
|---|---|
| `npx reelme render` | Renders every platform selected in `reelme.json` to `./reelme-out/` |
| `npx reelme studio` | Opens Remotion Studio against the cached project, for previewing and tweaking |
| `npx reelme clean` | Removes the reelme cache (`~/.reelme/cache`) |

## How it works

- Your repo keeps only two things: `reelme.json` (the brief — commit it, it's your video's source of truth across releases) and `reelme-out/` (rendered videos; add it to `.gitignore`).
- The heavy Remotion project lives in `~/.reelme/cache/<project-hash>/`, scaffolded on first render and reused afterwards. Re-renders don't reinstall anything; upgrading the CLI rebuilds the scaffold automatically.
- Each platform you select (X, LinkedIn, YouTube, TikTok, Instagram Reel/Story/Feed, GitHub README) maps to a preset that resolves dimensions, duration ceilings, and safe areas internally — you never deal with aspect ratios. GitHub README outputs a GIF; everything else is MP4. Briefs with a `teaser` cut also get a short `<platform>-teaser.mp4` per social platform.

## Requirements

- Node.js >= 18
- [pnpm](https://pnpm.io) (used to install render dependencies inside the cache)

## License

MIT
