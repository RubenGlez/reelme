# SFX provenance

The three cue files in this directory were generated with the
[ElevenLabs sound-effects generator](https://elevenlabs.io/sound-effects)
(free tier) — `whoosh.mp3` and `rise.mp3` on 2026-07-04, `pop.mp3` on
2026-07-08 — then trimmed and loudness-normalized
(`loudnorm I=-23:TP=-2`) to sit under the bundled music beds:

| file | prompt (abridged) | timing spec |
|---|---|---|
| `whoosh.mp3` | soft cinematic air whoosh for a fast UI transition | 0.70s, peak at ~0.23s |
| `pop.mp3` | single soft low-frequency pop, muted felt mallet | 0.35s, transient at 0 |
| `rise.mp3` | airy noise swell, no impact at the end | 0.80s, peak at 0.60s (played from 18 frames before the CTA cut) |

**License note.** ElevenLabs free-tier output requires attribution to
elevenlabs.io and is licensed for non-commercial use. reelme is a free,
MIT-licensed tool and ships these cues with this attribution. If reelme's
audio ever needs a commercial-grade license, either regenerate these cues on
a paid ElevenLabs plan or fall back to the fully CC0 procedural versions:
`node cli/assets/audio/generate-sfx.mjs --force`.

The exact generation prompts and the trim/normalize commands live in the
project history; peaks were placed to match how `template/src/Root.tsx`
schedules the cues.
