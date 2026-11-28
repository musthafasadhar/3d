---
name: pin-reels-editing-style
description: House editing style for vertical talking-head reels/shorts (9:16), learned from three reference videos the user saved on Pinterest (a dark minimal reel, a bright step-by-step tutorial, and a long documentary-style explainer with neon captions, halftone B-roll and map graphics). Kinetic word-by-word captions (one big lime/yellow keyword with small white connector words, glow), numbered step badges, white UI cards with logos, glass-red "REC" viewfinder pills, punch-in with ring, glitch/stripe and colour-flash transitions, inset screen-recording cards on a pale-yellow gradient, B&W + red emphasis for warnings. Use whenever the user asks to edit, caption, style or "make it like my references" for a reel, short, TikTok, talking-head or tutorial video, together with video-editing-skill (cuts/silences) and real-sfx (sound). Also use for fonts, caption style, colours, transitions, overlays and pacing questions for vertical video.
---

# pin-reels-editing-style

Learned by decoding two Pinterest reference videos frame by frame (12 fps for the whole clip, 30 fps around
key moments). Everything below was **measured or read off the frames**. Fonts are visual matches (candidates),
not extracted font files. **Audio (music, sfx, voice levels) was not analysed**; use `real-sfx` for sound.

References (frames in `references/`):
- **Ref 1** "Reels Editing Tutorial: Clean & Minimal Style": 16.9 s, 720x1280, 30 fps. Dark, moody, premium.
- **Ref 2** "Don't use CapCut, use these three editing tools": 80.7 s, 576x1024, 30 fps. Bright, energetic, step-by-step explainer.
- **Ref 3** "Roteiro / Direção, Edição": 176.1 s, 720x1280, 30 fps. Dark-green documentary-style business explainer with neon captions, halftone B-roll, maps (see section 5b).

How to combine skills: `video-editing-skill` decides the cuts (silences, ums, retakes, jump cuts) and renders;
this skill dictates the **look** (captions, overlays, transitions, colour); `real-sfx` adds sound on the same cue times.
Show the user the cue/cut list and a few frames before the final render.

---

## 1. Global look

| Item | Ref 1 (dark/minimal) | Ref 2 (bright/energetic) |
|---|---|---|
| Frame | 9:16, subject centred, chest-up, caption block over the chest (y ~ 50-60 % of height) | same, text sits over the shirt/chest area, never over the face |
| Grade | dark, low-key, crushed blacks (mean brightness ~41/255), warm skin, teal-grey wall | natural warm room, mid brightness (~82/255) |
| Accent colour | lime `#E0FC5E` (sampled) with soft lime glow | pale yellow `#FAFBA4` (sampled; badges, highlights), red `#E5202E`-ish for danger words |
| Neutrals | white text, near-black `#101010`, grey `#303030` | white cards, black text on cards, `#101010` |
| Danger/warning | red glass pills, red strikethrough on a word | whole frame turns **B&W** or **red-tinted** with red text |

Keep ONE accent colour per video. Use red only for negatives (warning, "don't", "failing").

## 2. Captions (the signature)

Word-by-word, sentence-aware kinetic captions, 2 lines max, centred, ~3 to 3.5 words per second.

- Per phrase, pick **one keyword** (the noun/verb that carries meaning: *Prospects, Understand, Content, Camera Stresses, You record, Your plate*) and render it **big, bold, accent colour, with glow**.
- Every other word of the phrase is **small, white, bold, same line or tucked just above/below** the keyword (connector words: *If the ... have to ... meet you*). The small words sit at different baselines, they are not all on one line. Order of appearance follows speech.
- Ref 1 sizes (720x1280): keyword cap height ~90-100 px (~7.5 % of height), connector text ~28-30 px. Keyword is ~3-3.5x the connector size.
- Ref 2: all caps, extended heavy **italic**, white on first words, **accent colour on the last/emphasis words** ("EDITING *YOUR VIDEOS*", "LET ME *TEACH YOU*"), thin dark shadow for legibility. Size ~ cap height 5 % of height. Switches to **red** for negative emphasis ("THAT HARD", "NOT THE TOOLS").
- **Entrance (30 fps, measured)**: keyword appears on the frame its word starts, scale-in from ~85 % to 100 % with a slight blur/glow bloom, settling in ~4 frames (0.13 s). Connector words fade/pop in in 1-2 frames. Phrase swaps are a hard replace, no fade out; the previous phrase is gone by the first frame of the next one (a one-frame empty gap is fine).
- Hold: a keyword stays until the phrase ends (~0.6-1.5 s). Never keep a caption >2 s.
- Strikethrough: a red 3-4 px line drawn left-to-right across the keyword ("~~Content~~ is failing") when the sentence negates it.
- Typed text (Ref 1 pills): characters appear one by one (~12-15 chars/s) with a faint cursor shimmer.

**Font candidates** (identified by eye, free on Google Fonts):
- Ref 1 keyword: tight, heavy, slightly rounded grotesque: **Inter Display ExtraBold/Black**, **Poppins ExtraBold** or **Plus Jakarta Sans ExtraBold**, letter-spacing -2 %.
- Ref 1 connector/pill text: light wide geometric: **Syne Regular** or **Sora Light**, lowercase.
- Ref 2 captions and badge numerals: wide extended heavy italic: **Krona One**, **Unbounded Black** or **Syncopate Bold** (italic via skew -10 deg), uppercase.
- Ref 2 UI cards: **Inter / Geist** medium; one serif accent ("gling" card) in **Instrument Serif Italic**.

## 3. Overlays and graphics

- **Step badges (Ref 2)**: yellow circle (or rounded square) with a black extended numeral, pops in at the left of the caption at the moment a numbered point starts; 1-2-3 squares line up in a row, then each fills with the tool's logo (Premiere, DaVinci, Final Cut) with a short "IT'S FREE" / "BEGINNER FRIENDLY" curved-arrow label. Arc of numbered dots (1..7) orbits the head while saying "7 steps".
- **Counter ring**: "60s / 59s / 58s" in a thin yellow ring, ticking down per second (~3.5-5.5 s).
- **White UI cards (Ref 2)**: rounded-rect (radius ~12 px), white fill, soft shadow, logo/avatar at left + 1-2 lines of Inter text; stacked 1-3 cards for lists of tools or links (Storyblocks / envato / Pexels, URLs). Pop in with a 3-4 frame scale/slide, stack staggered by ~0.15 s, leave together.
- **Glass-red pills (Ref 1)**: dark red gradient rounded rectangles (radius ~16), 1 px light border, small icon at left (warning triangle, cash), light lowercase text; two stacked pills slide up from below at the chest (y ~ 54 % and 66 %), typed text, hold ~2-4 s, drop out together.
- **REC / viewfinder (Ref 1)**: white corner brackets at the four corners (margin ~5 % of width, 28 px arms), red dot + "REC" top-left. Appears for the "even if you record..." beat, so it reads as being on camera.
- **Neon line icons**: lime outline paper-plane that flies across the frame in an arc (~0.5 s) next to the words.
- **Inset screen/B-roll cards (Ref 2)**: a screen recording or stock clip shown as a floating rounded card (~55 % width) with a big soft shadow, on a **pale yellow gradient background** (`#FFFDC8 -> #FFF6A0`, vertical), card bobs/zooms slowly (scale 1.0 -> 1.06 over its length). Cuts in/out hard, 1-5 s long.
- **Ring punch-in (Ref 1)**: see transitions.

## 4. Transitions and camera moves

(all timings at 30 fps, measured on Ref 1 unless noted)

- **Mostly hard cuts**: Ref 1 has 1 transition in 17 s; Ref 2 averages one visual change every 3.8 s (cuts + inserts, shortest 0.08 s flash frames).
- **Venetian-blind / stripe glitch** (Ref 1, 4.43 s -> 4.67 s, 8 frames): vertical white stripes (~6 px wide) sweep across and brighten to ~85 % white at the middle (frames 4-5), the next shot is already underneath and revealed as stripes fade out. Use for a topic change.
- **Punch-in + ring** (Ref 1, 6.17 s): hard cut to a ~1.6x zoomed shot of the speaker with a thin white circle outline around the face, then ease-out zoom down to ~1.15x over ~12 frames (0.4 s), ring shrinks with it. Use on the emotional/pain-point line.
- **Colour flash** (Ref 2): single frame (0.08 s) of pink-orange gradient wash at 18.5 s ("YOU DUMMY") and pale pink wash at 45.5 s; use to punctuate a punchline or to enter an inset.
- **B&W + red**: whole shot desaturated, caption in red (Ref 2, 17-18.5 s "DON'T EVER USE CAPCUT"); **red tint** with red caption for "should not be that hard" (5-6 s). Switch back with a hard cut.
- **Slight continuous push-in** (~1.0 -> 1.05 over a shot) on talking-head between cuts to keep them alive; alternate punch-in levels between consecutive shots (1.0 / 1.15 / 1.0 ...) as jump-cut variation.

## 5. Pacing recipe

1. Cut tight (video-editing-skill): no silences >0.25 s, keep last take.
2. New visual event (caption keyword, badge, card, or cut) **at least every 1.0-1.5 s**; never more than 2.5 s of unchanged frame.
3. Hook in the first 3 s: biggest keyword on screen by 0.3 s (Ref 1 first keyword lands at 0.27 s), no intro logo.
4. Explainer structure (Ref 2): hook -> promise ("7 simple steps") with orbit dots -> numbered steps each with badge + keyword + one UI card/inset -> CTA with a "Follow" button and typed handle.
5. Emphasis hierarchy: accent keyword > white connector > UI card > background.
6. Outro: blue "Follow" button pops in, handle types in a white pill (Ref 2, 76-80 s).

## 5b. Style C: documentary business explainer (Ref 3, "Roteiro / Direção, Edição")

Ref 3: 176.1 s, 720x1280, 30 fps, Portuguese-language, a long-form story explainer (how a Mexican store chain
won). Analysed at 12 fps over all 2,114 frames (contact sheets every 0.75 s) and at 30 fps around the transitions.
Frames: `references/ref3_*`. Use this style for storytelling/case-study/business explainers longer than ~60 s.

**Look**
- Talking head in a dark-green studio (`#031B0D` shadows, warm yellow practical lights, green armchair); neon accent **`#42F491`** (sampled) with a strong outer glow. Everything else is white or the B-roll's own colour.
- **End card** (last ~6 s, from 170.1 s): brand wordmark in a wide techno font with a 1-2 px RGB-split glitch, on a green gradient `#22CA68 -> #1C854F` with faint curved contour lines.

**Captions (two modes, switch between them)**
1. *Neon keyword mode* (on the talking head, for the key claim of a sentence; ~10 times in 176 s): the key word(s) in neon green glow, **bold wide grotesque** (Syne ExtraBold / Sora Bold look-alike) at ~5 % of frame height; connector words small, white, light **italic** (Instrument Sans Italic), slightly offset above/below; letters appear left to right in ~6 frames with a blur-in. Example: "você **confundiu** o *produto* com a **estratégia**". The line sits at chest height, 2 short lines.
2. *Plain narration mode* (the default, nearly all other speech, also over B-roll): small white bold condensed sans (Roboto Condensed / Archivo Narrow Bold), cap height ~2 % of frame height (~28 px of 1280), centred at chest height (y ~ 50-60 %), thin dark shadow, 3-6 words per card, hard swap every 0.5-1.0 s on speech boundaries, no entrance animation. **One word per card is bolder/larger** (melhor, analisam, valiosíssimo, LITERALMENTE) for rhythm.
- Plain mode is for readability, neon mode for emphasis: keep neon rare so it still lands.

**Camera on the talking head**
- Alternate **wide** (subject small, whole armchair visible, scale 1.0) and **close** (face/torso, scale ~1.5-1.8) every 3-6 s. Hard cuts, plus a slow 1.00 -> 1.05 push-in inside each shot.
- Hook: 0-1 s cold open on a halftone black-and-white portrait of the speaker with a big white two-line title (one word in green), then cut to the real footage at 1.5 s.
- Prop/macro inserts (e.g. 5.25 s a glowing red ticket in the hands, 6.75 s a neon digital clock "02:00 AM") to illustrate one concrete noun.

**B-roll (about 45 % of runtime)**: a B-roll clip every ~4.9 s average (1.3-4 s each; one 29.8 s talking-head run is the longest).
- Treated as **halftone/duotone**: visible dot pattern, crimson-red or green duotone, high contrast, film grain, slight RGB split. Real news-style photos and AI stills, always with a slow Ken-Burns push-in (1.0 -> 1.12).
- **Map sequences**: light map with an animated translucent green circle (radius label "400 m", "500 m") growing over ~0.5 s, a red route line drawing along the street with a pin that drops, place labels ("Trabalho", "Casa") in white bold. Zoom in on the map between steps.
- **Data infographic**: dark grey map with red region fill, flag icons, callout lines drawn from the map to text blocks ("77 million people served, 884K points of sale ...") with a stepped reveal.
- Captions continue unchanged over B-roll so the viewer never loses the line.

**Transitions (30 fps, measured)**
- **Green-white flash wipe** (31.97 -> 32.40 s, 13 frames): green radial glow grows from the bottom over 2 frames, the screen goes full white for 2 frames, then the new shot is revealed from the right edge under a green-white wipe over 3-4 frames. Use to go from talking head into B-roll.
- **Whip-zoom cut** (15.27 -> 16.5 s): a one-frame white flash, then a 4x zoom into a logo that spins/pans (rotation ~15 deg, ~6 frames) and settles with ease-out; a second whip leaves the logo. Use on a brand/logo reveal.
- **Datamosh / RGB-split glitch** (109.30 -> 109.57 s, ~8 frames): horizontal slice displacement and chroma split on the talking head (3 frames), then it shrinks into a **desaturated letterboxed halftone "screen"** (black pixel-grid bars above and below) for ~2 s with the neon caption on top, then back with another glitch. Use for a "meanwhile / mind-reading" beat.
- **Hard cuts** with no transition for most B-roll in/out; flashes are for 1 in ~4 changes.

**Pacing**
- Caption card every 0.5-1.0 s, visual change (camera size, B-roll, map step) every 1-5 s, a big transition roughly every 25-30 s.
- Story arc: hook claim -> myth ("you think X") -> reveal with B-roll -> data -> twist -> payoff -> brand end card.

## 6. Build recipe (any editor)

- **HyperFrames / HTML+GSAP**: captions as absolutely positioned spans, keyword `font-size:~7.5vh; font-weight:800; color:#E0FC5E; text-shadow:0 0 18px rgba(224,252,94,.55)`, connectors `font-size:2.2vh; color:#fff`. Entrance `gsap.fromTo(el,{scale:.85,opacity:0,filter:"blur(6px)"},{scale:1,opacity:1,filter:"blur(0)",duration:.13,ease:"power3.out"})`.
- **ffmpeg/Pillow**: render captions as transparent PNG sequences at 30 fps and overlay with `enable='between(t,a,b)'`; punch-in with `zoompan` or `scale+crop` expression `1.6 - 0.45*min(t/0.4,1)`; stripes with a mask built from a 6 px vertical bar pattern and `blend`.
- **CapCut / Premiere / After Effects**: use the per-element numbers above; saved frames in `references/` show target look.

## 6b. Full premium pipeline (used on a real client reel)

`pipeline/` holds a working HTML-to-ffmpeg renderer: bold gradient kinetic captions, 3D glass-card
B-roll scenes (CSS 3D), flash/stripe transitions, ring punch-in, CTA and end card, plus an SFX mixer
(uisfx cues). Read `pipeline/README.md` before using it; edit `cards.py` (captions) and the scene files
for the new video. Palette used there: ink `#0C0A26`/`#15103F`, indigo `#4B3BFF`, single amber gradient
`#FFF1C9 -> #FFD36E -> #FF9B45 -> #FF6A3D` for keywords, Plus Jakarta Sans 800 (keywords), Unbounded
(labels, numerals), Inter (UI). Caption zone y 1090-1500, B-roll stage y 120-1080, hook scene by 1.0 s.

## 6c. Style D: "Taara clean" (client's own reference reel, preferred for Taara ERP)

Analysed at 30 fps (1,398 frames, 46.6 s). Natural footage, NO colour grade. Cream `#F7F5EF` / forest green
`#0E3326-#226B4A` / gold `#E9C36B`; keywords heavy tight grotesque (Plus Jakarta Sans 800, -0.055em) gold gradient
on dark or footage, deep green gradient on cream; small white connector words above; letters reveal with a soft
left-to-right wipe (~0.3 s). B-roll scenes: speaker shrinks to a 390 px gold-ringed circle bottom-centre (0.34 s
morph), captions move to the top with a letter-spaced eyebrow (`. LABEL`), flat white UI cards (serif numerals),
dark scenes carry soft asterisk shapes and a hub diagram. Top pills/timeline chips over the speaker, logo card at
chest, dim title beat, cream end card (logo, "Your school. One connected ERP.", url). Brand is "Taara ERP".
Pipeline: `pipeline/README.md` (v2). Always tone-map HDR phone footage first.

## 7. Re-analysing a new reference video

```
mkdir -p work/f && ffmpeg -i REF.mp4 -vf fps=12 work/f/%04d.jpg       # or fps=30 for exact timing
python3 scripts/analyze_cuts.py work/f      # cut times, shot lengths, brightness, palette (12 fps assumed)
python3 scripts/contact_sheet.py work/f out.jpg 2 8 3 160 0           # step cols rows width start
```
Read the contact sheets, then 30 fps crops around the moments you want exact timing for, and add the new style as a new
section here rather than overwriting these two.

## Limits

- Fonts are best visual matches; ask the user for the actual font names if they know them.
- Audio, music and sfx timing were not analysed.
- Three references only: treat numbers as the house defaults, not as hard rules.
