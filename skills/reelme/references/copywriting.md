# On-screen copy

Read this file when writing the words that appear *inside* the video — headlines, captions, hook text, feature labels, stat labels, and the CTA. Good scene choice (see `references/narrative.md`) sets up the argument; the copy is what actually lands it.

**Scope:** this is about the words on screen, so the video speaks for itself. It is *not* about writing social post copy, captions for the upload, or hashtags — that was deliberately left out of the product (a video should stand on its own). Stay inside the video.

---

## Principles

- **Outcome, not feature.** "Ship in one command" beats "scaffolds a project with a CLI." Say what the viewer gets, not what the tool does.
- **Specific beats vague.** "0.6s cold start" beats "blazing fast." "Zero config" beats "easy to use." Numbers and concrete nouns earn trust; adjectives don't.
- **One idea per line.** Each headline or caption makes a single point. If it has a comma doing the work of an "and", consider splitting it across two scenes.
- **Readable in the time it's on screen.** A caption the viewer can't finish before the cut is wasted. Shorter is almost always better — cut every word that isn't carrying meaning.
- **Active and present tense.** "Catch bugs before they ship", not "Bugs will be caught."
- **No hype the product can't back.** "Revolutionary", "game-changing", "the best" read as noise. Let a real number or a real before/after do the bragging.

---

## Voice by tone

Match `project.tone`. It already drives motion and fonts; keep the words consistent with it.

- **professional** — plain, confident, credible. Short declaratives. No jokes, no exclamation marks. "Type-safe from database to client."
- **playful** — warm, direct, a little cheeky. Contractions, the occasional exclamation, but still specific. "Setup? Already done."
- **technical** — precise, dense with real detail, respects the audience's knowledge. Real commands, real types, real numbers. "Zero-copy parsing. 3.2 GB/s."

When unsure, write it the professional way; it rarely reads wrong.

---

## Field-by-field

- **`hook.text` / `accent`** — the single strongest claim, ≤10 words. `accent` highlights the one or two words that carry the punch. Make it a complete thought a stranger understands with no context. Good: "Full-stack setup in one command" (accent: "one command").
- **`problem.headline`** — name the pain the audience already feels, in their words. The `caption` adds the sting or detail. Don't describe the solution here; that's the next scene's job.
- **`feature-list` items** — benefit-led, parallel grammar, 3–5 items. Start each with a verb or a concrete noun. Keep them roughly equal length so the scene reads as a clean list. Bad: "Has authentication". Good: "Auth that just works".
- **`stat-callout` / `benchmark` labels** — lead with the number, label it in as few words as possible. The number is the headline; the words only say what it measures. Use real, sourced figures only.
- **`code-reveal` / `terminal` captions** — say what the code/command *means for the viewer*, not what it literally does. The viewer can see the syntax; tell them why it matters.
- **`cta`** — one clear next action plus where. Usually the install command and the repo. No "thanks for watching", no second ask. The watermark handles attribution; the CTA handles conversion.

---

## Anti-patterns

- Feature lists that read like a changelog ("Added X, fixed Y").
- Captions that restate the headline instead of advancing it.
- Two scenes making the same point in different words.
- Marketing adjectives with no number behind them.
- A CTA that asks for more than one thing.
- Copy that would fit any project if you swapped the name in — make it specific to this repo.
