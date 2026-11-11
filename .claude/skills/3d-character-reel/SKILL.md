---
name: 3d-character-reel
description: Produce a vertical (1080x1920, 30fps) 3D cartoon character reel fully in code - script, two-voice dialogue, a Three.js scene with stylised characters, lip-sync and captions driven by the voice file, and a deterministic frame-by-frame render to MP4. Use when the user asks for a new animated reel/short on a topic in the style analysed in docs/reel-analysis.md.
---

# 3D character reel pipeline (code-rendered, not AI video)

Reference analysis: `docs/reel-analysis.md`. Read it first; it is the style bible.

## 1. Script (you write it)
- 35-45 s, two speakers: HOST (human character) + BUDDY (cute mascot, e.g. the "Claude" blob).
- 15-20 lines, 2-6 words each. Hook in the first line (<2 s), a twist/payoff at ~70%,
  a callback or CTA in the last 3 s. Every line is one shot.
- Save as `reels/<slug>/script.json`: `[{ "speaker": "host"|"buddy", "text": "..." }]`.

## 2. Voices
- ElevenLabs (user's API key in env `ELEVENLABS_API_KEY`) or any TTS; one voice per speaker,
  one clip per line. Concatenate with ~0.3-0.6 s gaps -> `voice.wav`, and record each line's
  start/end in `timeline.json`.
- If no TTS key: ask the user, or use a placeholder silent track with estimated timings.

## 3. Timing data from the voice file
- Word timestamps: faster-whisper `word_timestamps=True` on `voice.wav` -> `words.json`.
- Mouth curve: RMS per 1/30 s frame, normalised 0..1, smoothed -> `mouth.json`.
  Only the active speaker's mouth moves (use `timeline.json`).

## 4. Scene (Three.js, deterministic)
- Everything is a pure function of `frame` (t = frame / 30). No `Date.now`, no random
  without a seed. Expose `window.renderFrame(n)` that sets state, renders, and resolves.
- Characters built from primitives (boxes for voxel style, low-poly spheres for soft style):
  big head (~45% of height), dot/rect eyes, a mouth mesh whose scale.y = mouth curve.
- Idle animation always on: breathing (scale.y 1 +/- 0.01, 0.25 Hz), head sway (+/- 2 deg),
  blinks every 2.5-4 s (3-frame close/open), slight camera drift (push-in 2-4% per shot).
- Shot list from `timeline.json`: speaker's line -> close-up of that speaker; insert a wide
  shot every ~10 s and on the punchline. Hard cuts, no transitions.
- Captions: HTML overlay, word-by-word pop (from `words.json`), key words in accent colour.

## 5. Render
- Serve the scene locally, drive it with Playwright (preinstalled; `require('playwright')`),
  viewport 1080x1920, for each frame: `await page.evaluate(n => renderFrame(n), i)` then
  screenshot to `frames/f%05d.png`.
- `ffmpeg -framerate 30 -i frames/f%05d.png -i voice.wav -c:v libx264 -pix_fmt yuv420p
  -crf 18 -c:a aac -shortest out.mp4`
- Check: duration matches audio, lips line up (look at a 30-frame tile around a hard
  consonant), captions inside the 1080x1420 safe area (Instagram UI covers the bottom ~250 px).

## Rules
- Original characters only; never copy the reference creators' characters 1:1.
  Reuse the *style* (proportions, palette logic, lighting, pacing), not the design.
- Keep each topic's reel in `reels/<slug>/`; generated frames are not committed.
