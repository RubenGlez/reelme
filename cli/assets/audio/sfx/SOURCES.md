# SFX provenance

The three cue files in this directory are curated **CC0 (public domain)** cues
from [Freesound](https://freesound.org), loudness-normalized (`loudnorm
I=-23:TP=-2`) to sit under the bundled music beds. CC0 requires no attribution;
the uploader credits are kept as a courtesy.

| file | Freesound | uploader | role |
|---|---|---|---|
| `whoosh.mp3` | https://freesound.org/s/60013/ | qubodup | fast lateral cut (soft air whoosh) |
| `pop.mp3` | https://freesound.org/s/245645/ | unfa | settle cut (clean pop) |
| `rise.mp3` | https://freesound.org/s/523057/ | magnuswaker | CTA swell (played from 18 frames before the cut) |

The peaks land where `template/src/Root.tsx` schedules each cue. If these ever
need regenerating without Freesound, `node cli/assets/audio/generate-sfx.mjs
--force` produces synthetic CC0 stand-ins.
