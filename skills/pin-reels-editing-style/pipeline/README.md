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

## v2 pipeline: "Taara clean style" (gfx2/) - the whole frame is composed in HTML
Used for the brand's own reference reel (cream + forest green, flat white UI cards, gold keywords, real logo,
speaker shrinks into a gold-ringed circle during B-roll). The speaker footage is a JPEG sequence drawn in the page,
so morphs/zoom/avatar are exact; no colour grade is applied to the person.
1. **HDR first.** iPhone clips are HLG/BT.2020. Convert before cutting or skin looks grey and flat:
   `ffmpeg -i IN.mov -vf "zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=mobius:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p" -c:v libx264 -crf 12 -colorspace bt709 -color_primaries bt709 -color_trc bt709 master_sdr.mp4`
2. Cut with video-editing-skill on that master (`punch_in: 0`).
3. Frames for the page (JPEG needs a BT.601 matrix): `ffmpeg -i edited.mp4 -vf "scale=in_range=tv:in_color_matrix=bt709:out_range=pc:out_color_matrix=bt601,format=yuvj420p" -qscale:v 1 gfx2/src/%05d.jpg`
4. `python3 cards.py`, then `node render2.js range 0 N frames W 4` (4 workers), `python3 compose2.py` (sfx), `python3 final2.py out.mp4`
   (final encode is bt709-tagged; verified skin/wall patch within 1-2 levels of the source).
Lessons: scene backgrounds must be opaque (a fade over black turns grey); use an iris/clip-path reveal between
adjacent scenes and keep the previous scene alive during it; gold keywords on a cream kurta need a dark outline;
dim overlays should mask the face out. Brand logo was cut out of the reference end card with an alpha-unmix
(see logo_taara.png); replace with the official file when available.
