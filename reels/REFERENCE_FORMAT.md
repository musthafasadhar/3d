# Reference reel — format breakdown

Source: `instagram.com/reel/DfAGr0CoH0A` (hashhh.co, "Let's try this · Ep 1").
Analysed from the full file: 1080×1920, 30 fps, 1767 frames, 58.9 s, audio −17.3 LUFS.

This is the format we are reproducing with our own cast (Avani, the Doctor, the
Patient) and our own script. We copy the *grammar* below, not the reel's content.

## How it is built

The reel says so itself, on screen:

1. **6 pictures** of one location, reused for the whole episode ("same campfire every episode").
2. **A script** of very short lines.
3. **Typed voices** (text-to-speech, one voice per character).
4. **The edit, in code**: a cut on every line, captions word by word, faces animated, rendered 1080×1920.

Nothing in the picture is truly animated except faces, captions, overlays and
drifting particles. Each shot is a still plate held for one line.

## The six plates

| # | Framing | Used for |
|---|---|---|
| A | Wide establishing: both characters, fire in the middle, trees framing | Opening of each "chapter", recap lines |
| B | Human, medium close-up, three-quarter left, laptop in the foreground | Every human line |
| C | Avani-type character, medium close-up, three-quarter, a second prop blurred at the frame edge | Every reply |
| D | Human reaction pose (arms crossed), lower in frame | One beat only, for a change of attitude |
| E | Extreme close-up of the small character, lit hot by the fire, sparks flying | Punchlines only (twice) |
| F | Over-the-shoulder: human's back and bright screen in the foreground, small character sharp behind | "Explaining" sections with an overlay card |

## Cutting

- ~30 shots in 59 s; every spoken line gets its own shot (shot / reverse-shot).
- Line length 0.8–4 s. Never more than ~8 words on screen.
- Speech is wall-to-wall: no gap longer than 0.35 s in the whole reel.
- The wide (A) and over-shoulder (F) plates break up the ping-pong roughly every 10 s.
- The hot close-up (E) is saved for the two punchlines, the second being the last line.
- Hook in the first second: the question is on screen before the first cut, with
  three small comment bubbles popping in one by one.
- Last 2 s: the final frame dims to ~15 % and a two-line call to action fades up.

## Camera and look

- Every plate is a long-lens portrait: subject sharp, background heavily blurred,
  bright points in the background turned into soft round bokeh.
- Complementary palette: one warm practical light on the faces (fire) against a
  cool, dark, desaturated background. Rim light separates the silhouette.
- Subject sits in the lower two thirds; the top third is kept clean for captions.
- Three-quarter views alternate direction so the two characters face each other
  across the cut (human looks screen-left, small character looks screen-right).
- Very slow push-in or drift on each plate (a few pixels over the shot).
- A layer of warm dust motes drifts over every shot and ties the plates together.

## Faces

- Mouth: two or three shapes only — closed line, small oval, larger oval —
  switched by the loudness of the voice, about 6–10 changes per second while speaking.
- Blink: eyes squash shut for 2–3 frames, once every few seconds, and on reactions.
- A small smile is held after a line lands.

## Captions

- White semi-bold geometric sans (Montserrat-like), about 52 px on a 1080 frame,
  soft shadow, no box.
- In the top fifth of the frame: left-aligned for the human, right-aligned for the
  small character, so the caption sits on the speaker's side.
- Word by word: each word appears as it is spoken; the next word is pre-shown at
  ~35 % opacity. The finished line dims as the cut arrives.
- When an overlay card is up, captions move to the bottom, centred.

## Overlay cards

- Dark translucent rounded panel, small orange "STEP n" label, white title,
  content typed or revealed row by row.
- Used for lists, thumbnails, waveforms and terminal-style lines.
- A tiny letter-spaced series title sits at the very top of the first shot.

## Sound

- Three layers: a constant location bed (fire and night air) that never drops
  out, the two voices, and light interface ticks when cards and words appear.
- No prominent music; the bed and the voices carry it.
- Dialogue is compressed and even (loudness range 4.3 LU).

## How we map it onto our pipeline

| Reel | Us |
|---|---|
| 6 AI pictures | 6–8 plates rendered from our own 3D set and cast (Blender, `character/`), so characters never drift between episodes |
| Typed voices | Added last; captions and mouths are timed from the voice files |
| Edit in code | Shot list → plates → face states → captions → sound, all from one timeline file |
| Fire bed | A location bed that suits the script's setting |
