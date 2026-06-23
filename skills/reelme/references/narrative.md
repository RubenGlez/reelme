# Narrative and pacing

Read this file when proposing the outline (Step 4) — before you decide scene order, scene count, or which scenes carry the story. Scene *schemas* live in `references/scene-schemas.md`; this file is about *which scenes, in what order, and why*.

A launch video is not a feature tour. It is a short argument: here is a real pain, here is the thing that removes it, here is proof, here is how to get it. Order scenes so each one earns the next.

---

## The first moment decides everything

On social feeds the first ~1.5 seconds (about 45 frames at 30fps) decide whether the rest is watched. Lead with the single strongest thing the project has, not with setup or context.

- Strongest claim, number, or before/after → goes first.
- Logos, slow intros, "in this video we'll…" → never.
- If the project's best asset is a benchmark or a one-command install, open on that, then back-fill the problem.

The `hero: true` flag on `problem` and the `hook` scene exist for this. Use them.

---

## Arc templates

Pick the arc that fits the project, then map real repo details onto each beat. These are defaults, not rules — cut a beat if the project doesn't earn it.

**Intro (explain what it does)**
1. Hook the pain — `problem` with `hero: true`, or a `hook` that names the frustration.
2. Show the turn — the one command, the core code, the moment it gets easy (`terminal`, `code-reveal`, `data-flow`).
3. Prove it — concrete benefits or numbers (`feature-list`, `stat-callout`, `benchmark`, `split`, `clip`).
4. Close — `cta` with install command and repo.

**Announcement (what's new)**
1. Lead with the news — `hook` ("X 2.0 is here") or a punchy `problem` that states what changed.
2. Show the change in action — `clip`, `terminal`, `code-reveal`, `split` (before/after is gold for releases).
3. Reinforce — `feature-list` of what shipped, or `stat-callout`/`benchmark` if the release competes on a metric.
4. Close — `cta`, version-aware.

Skip dense intro-only scenes (`file-tree`, `os-window`, long code) in announcements unless the release is specifically about that surface.

---

## Scene-to-beat map

Each scene type does one narrative job well. Use it for that job.

| Beat | Best scenes | Avoid for this beat |
|---|---|---|
| Hook / pain | `hook`, `problem` (hero) | `cta`, `file-tree` |
| The turn / how | `terminal`, `code-reveal`, `data-flow`, `os-window` | `stat-callout` |
| Proof | `stat-callout`, `benchmark`, `split`, `clip`, `feature-list` | `problem` |
| Demo of real product | `browser`, `mobile`, `clip` | synthetic scenes when a real asset exists |
| Close | `cta` | anything else |

Rules of thumb:
- One idea per scene. If a scene argues two things, split it or cut one.
- A scene that doesn't advance the argument is a scene to cut, even if it looks nice.
- Prefer real assets (`browser`, `mobile`, `clip`) over synthetic scenes when the user supplied them — a real product shot out-converts an illustration.
- Use `benchmark`/`stat-callout` only with real, sourced numbers. A fabricated stat destroys trust faster than no stat.

---

## Scene count and pacing

- `cuts.main`: 3–8 scenes, prefer 3–6. More scenes means less time each, which means the viewer absorbs less, not more.
- Every scene needs enough screen time to be read once without rushing. If you have 7 strong scenes but a tight duration, cut to the 5 strongest rather than starving all 7.
- Momentum should build: open strong, keep proof tight, end clean. Avoid two low-energy scenes back to back.

---

## Per-platform shape

The same brief renders to several cuts. Author them to the platform, don't just letterbox.

- **Vertical (`cuts.vertical`, for TikTok / Reels / Stories):** open on `hook` with one claim ≤10 words. Fewer scenes than main, less text per second, larger legible captions. Favor `hook`, `problem`, `feature-list`, `stat-callout`, `terminal`, `mobile`, `clip`, `cta`. Drop dense `file-tree`, `data-flow`, and long `code-reveal`.
- **Teaser (`cuts.teaser`, ≤10s / ≤300 frames):** usually `[hook, cta]`, at most one proof scene between. It is a trailer, not a summary — it should make someone want the full cut, not replace it.
- **GitHub README GIF:** can carry a bit more density since it loops and is viewed deliberately, but still lead with the strongest frame because GIF autoplay has no sound to lean on.

---

## Quality bar

Before proposing the outline, ask: *would the project's maintainer be proud to post this?* If the story is generic enough that it would fit any project with the names swapped, it is too generic. Anchor every beat in something specific and true about this repo.
