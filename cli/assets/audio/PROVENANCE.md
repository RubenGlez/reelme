# ReelMe Bundled Audio Provenance

The bundled music beds in this directory are curated **CC0 (public domain)**
loops from [Freesound](https://freesound.org). Each `manifest.json` entry lists
the uploader (`artist`) and the sound's Freesound page (`source`); CC0 requires
no attribution, but the credits are kept as a courtesy. The files were loudness-
normalized (`loudnorm I=-16:TP=-1.5`) to sit under the mix and re-encoded as MP3;
they are otherwise unedited.

| file | Freesound | uploader |
|---|---|---|
| `lofi-dusk.mp3` | https://freesound.org/s/852231/ | holizna |
| `warm-memories.mp3` | https://freesound.org/s/826622/ | xkeril |
| `neon-pulse.mp3` | https://freesound.org/s/415922/ | newagesoup |
| `night-drive.mp3` | https://freesound.org/s/211555/ | waveplaySFX |
| `sunny-bounce.mp3` | https://freesound.org/s/512340/ | mistermender |
| `light-steps.mp3` | https://freesound.org/s/410520/ | Jamessi |

**Beat sync.** Each bed is an exact whole-beat loop at the `bpm` recorded in
`manifest.json`, so the CLI can quantize scene cuts to the beat and the loop
stays locked when Remotion repeats it (`sunny-bounce` is within ~0.1 beat).

Each file is kept below 2 MB for package size.
