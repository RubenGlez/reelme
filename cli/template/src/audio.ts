const FADE_OUT_FRAMES = 45;
const DEFAULT_AUDIO_VOLUME = 0.25;

function clamp01(value: number) {
  if (Number.isNaN(value)) return DEFAULT_AUDIO_VOLUME;
  return Math.min(1, Math.max(0, value));
}

export function audioVolume(
  frame: number,
  durationInFrames: number,
  base = DEFAULT_AUDIO_VOLUME
) {
  const volume = clamp01(base);
  if (durationInFrames <= 0) return 0;

  const fadeStart = Math.max(0, durationInFrames - FADE_OUT_FRAMES);
  if (frame <= fadeStart) return volume;
  if (frame >= durationInFrames) return 0;

  const fadeLength = Math.max(1, durationInFrames - fadeStart);
  const progress = (frame - fadeStart) / fadeLength;
  return volume * (1 - progress);
}
