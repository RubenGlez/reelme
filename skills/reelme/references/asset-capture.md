# Auto-capturing real product assets

Recipes for capturing screenshots and short recordings of the user's product
so scenes carry real pixels instead of mocks. Everything here runs from the
target repo with no permanent dependencies (`npx playwright` fetches on
demand; browsers install once with `npx playwright install chromium`).

## What to capture

- **Web app / playground**: the one screen that shows the product doing its
  job. Not the login page, not an empty state.
- **Docs or marketing site**: the hero section — it's the project's own best
  self-presentation and inherits its real branding.
- **Before/after flows**: two screenshots of the same screen (slow/old vs
  fast/new) beat one generic screenshot; they feed a `split` or paired
  `browser` scenes.

## Quality rules

- Capture at 2x so it stays crisp at video scale: the CLI has no scale flag,
  so use a HiDPI device preset (`--device "Desktop Chrome HiDPI"`); for
  `mobile` scenes use `--device "iPhone 15 Pro"`.
- Match the reel: if the brief uses `bgStyle: deep`, capture the product's
  dark mode when it has one (`--color-scheme=dark`), light mode for `light`.
- Wait for fonts/data: add `--wait-for-timeout=3000` (or a selector wait) so
  screenshots never show spinners or FOUT.
- No personal data in frame. Use demo/seed content.
- Recordings: 8–15s, ONE deliberate flow, no mouse wandering. Slow is
  cinematic; fast is nervous.

## Screenshot (one-liner)

```bash
npx -y playwright install chromium   # once per machine
npx -y playwright screenshot \
  --device "Desktop Chrome HiDPI" \
  --wait-for-timeout=3000 \
  "https://the-projects-site.dev" assets/site-hero.png
```

Reference it from the brief: `{ "type": "browser", "url": "the-projects-site.dev", "image": "assets/site-hero.png" }`
(or `mobile.screenshot` for the phone frame).

## Short recording (script)

Playwright records video per context. Write a throwaway script, run it with
`node`, convert the webm to mp4 for the `clip` scene:

```js
// capture.mjs — npx -y playwright@latest required once; then: node capture.mjs
import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  recordVideo: { dir: "capture/", size: { width: 1600, height: 1000 } },
});
const page = await ctx.newPage();
await page.goto("http://localhost:3000");
await page.waitForTimeout(2500);            // settle before acting
// ONE deliberate flow — type, click, see the result. Pause between actions.
await page.click("text=New project");
await page.waitForTimeout(1200);
await page.fill("#name", "acme");
await page.waitForTimeout(800);
await page.click("text=Create");
await page.waitForTimeout(3000);            // let the payoff breathe
await ctx.close();                          // flushes the video
await browser.close();
```

```bash
ffmpeg -i capture/*.webm -c:v libx264 -crf 18 -pix_fmt yuv420p -an assets/demo.mp4
```

Reference it: `{ "type": "clip", "src": "assets/demo.mp4", "frame": "browser", "durationInFrames": 240 }`.
Trim to the payoff: `startFrom` skips setup frames; the scene should open as
close to the interesting moment as the footage allows.

## Real terminal output (CLIs)

Run the real command and copy its real output into the `terminal` scene:

```bash
script -q /tmp/out.txt <the real command>   # captures exactly what a user sees
```

Strip ANSI noise if needed (`sed 's/\x1b\[[0-9;]*m//g'`), keep the
characteristic lines (counts, timings, ✓ marks), truncate long output to the
3–4 lines that tell the story. Real numbers only — if the output shows
`412ms`, the brief says `412ms`, not a rounder, prettier invention.
