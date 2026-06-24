# ReelMe Sound-Design SFX Provenance

The sound-design effects (`whoosh`, `tick`, `impact`, `riser`, `sub-drop`) are
synthesized from scratch by `generate-sfx.mjs` — filtered noise and oscillators,
no third-party recordings, samples, or stems.

They are dedicated to the public domain under CC0 1.0. The generated MP3s are
committed under `cli/template/public/sfx/` so they scaffold with the Remotion
project and are layered automatically by the renderer's sound-design pass.
Regenerate them with:

```bash
node cli/assets/sfx/generate-sfx.mjs
```
