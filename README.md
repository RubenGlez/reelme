# reelme

**Your README, but as a video.**

`reelme` is a Claude Code skill that generates 2D animated explainer videos for open-source projects. Point it at any repo, answer a few questions, and get an MP4, a GIF, and the Remotion source — ready to drop into your README, Twitter, or landing page.

## How it works

1. Run `/reelme` inside a Claude Code session in your repo
2. Claude reads your codebase and pre-fills what it can
3. It asks about the gaps — key features, tone, brand color
4. It scaffolds a Remotion project and renders your video locally

## Output

- `video.mp4` — for sharing on Twitter, LinkedIn, or embedding in a landing page
- `video.gif` — for your README (renders inline everywhere)
- Remotion source — tweak timing, copy, or colors and re-render yourself

## V1 scene templates

| Scene | What it shows |
|---|---|
| Problem | The pain your project solves |
| Code reveal | The key line of code, typing itself in |
| Terminal | Commands running, output appearing progressively |
| Data flow | How data moves through your system |
| CTA | Install command + repo URL |

## Status

Early development. Design phase complete, implementation in progress.

## License

MIT
