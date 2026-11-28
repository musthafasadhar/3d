# Premium reel pipeline (HTML motion graphics -> transparent frames -> ffmpeg)

Used to edit a 48 s talking-head school-ERP reel in the house style of `../SKILL.md`.
Everything is drawn in an HTML page whose state is a pure function of time `render(t)`, screenshotted
frame by frame with Chromium (Playwright), packed into a lossless alpha video and composited over
the graded footage with ffmpeg. No stock footage or AI imagery is used; B-roll is built motion graphics.

## Folder layout (work folder)
```
work/
  gfx/        <- copy of pipeline/gfx (index.html, *.js, cards.py, grain.png)
  fonts/      <- run pipeline/fonts.sh from work/
  base/edited.mp4   <- video-editing-skill output (cuts, punch-ins, audio -14 LUFS)
```
Serve `work/` over HTTP (the page fetches cards.json): `python3 -m http.server 8765 --bind 127.0.0.1`

## Steps
1. `video-editing-skill` -> `base/edited.mp4`. Transcribe the EDITED audio; force the language
   (`language="en"`), Whisper's auto-detect failed on accented English. Anchor caption spans on measured
   speech runs (energy VAD), not on Whisper word times (they clump).
2. Edit `gfx/cards.py` (caption cards: t0, t1, small-before, KEYWORD, small-after, fx) -> `python3 cards.py`.
3. Edit scene times/content in `gfx/scenes*.js`, `gfx/overlays.js`, list them in `gfx/main.js`.
4. Render frames: 4 parallel workers
   `NODE_PATH=$(npm root -g) node render.js range 0 N frames W 4` (W = 0..3). ~0.3 s/frame/worker.
   Re-render only changed frames with `render_list.js` (comma separated frame numbers).
5. Pack: `ffmpeg -framerate 30 -start_number 0 -i frames/f_%05d.png -c:v ffv1 -pix_fmt bgra -level 3 -g 1 overlay.mkv`
6. `python3 compose.py GAIN` builds `sfx_track.wav` from the uisfx pack (cue list inside), then `python3 final.py`
   grades + zooms the base (zoom keeps the face fixed), overlays `overlay.mkv`, mixes sfx, limits.

## Lessons (bugs that cost time)
- Measure text only after `document.fonts.load(...)` (else word gaps collapse). Fit keyword rows by iterating
  on the summed per-word widths, not on one whole-string estimate.
- SVG gradient ids must be unique and not live inside a `display:none` subtree (the gradient stops rendering).
- ffmpeg `overlay` with a PNG image-sequence input silently cut the output short; pack to ffv1 .mkv first.
- Keep captions in y 1090-1500 (above the platform UI), B-roll stage in y 120-1080.
- No stock/music library in the cloud box: sound = uisfx CC0 UI cues only, kept ~14 dB under the voice.
