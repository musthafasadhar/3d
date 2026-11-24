# Video reference library

Saved references for future reels. Each one was analysed at **30 fps**: every frame was extracted, then cuts, motion, brightness and saturation were measured per frame (`frame-metrics-30fps.json`), and contact sheets were reviewed.

---

## ref-01 — Website 3D scroll showcase (use for website / product B-roll)
Source: https://pin.it/6nxIK47X1 · 720×576 · 14.5 s · 30 fps · no hard cuts (one continuous move)

| Time | What happens |
|---|---|
| 0–1 s | Website plane tilted back in 3D (≈45–55° X-rotation, slight Z-rotation), floating 3D props (envelopes) around it |
| 1–4.5 s | Fast scroll through sections with heavy **directional motion blur**. Per-frame motion peaks at 13–15 (vs 0.2 when still) |
| 4.5–8.5 s | Plane flattens and pulls back to reveal the whole page as a tall column, brand word in huge type |
| 8.5–14.5 s | Settles into a **framed card** (rounded corners, soft shadow) with a pill tag + 2-line bold title above. Props float around card edges. Fully static (motion ≈ 0.1) |

**Look:** very bright (luma ≈ 230/255), low saturation, airy pastel background, soft shadows, depth-of-field blur on near/far props.
**How we recreate it:** CSS 3D transforms on a full-page screenshot, rendered frame by frame. Real motion blur comes from averaging 5–8 sub-frames per frame. Brand-coloured module chips play the role of the "floating props".

---

## ref-02 — Talking-head with two-tier gradient captions (use for A-roll caption style)
Source: https://pin.it/6Cvd1utLc · 720×1280 · 16.9 s · 30 fps · cuts at 4.4 s (glitch/stripe transition), 6.2 s, 8.3 s

**Caption system (the main thing to copy):**
- **Lead line:** small white bold words (≈ ⅓ size), left-aligned above the keyword, words appear one by one as spoken.
- **Keyword:** huge extra-bold sans with a **vertical gradient fill** (lime→yellow in the ref), soft dark shadow, pops in with scale + blur.
- **Sub line:** small white, right-aligned under the keyword.
- Placed mid-frame over the chest (~55–65 % of height), never at the very bottom.
- **Strike-through** (red bar drawn left→right) to negate a word ("Content ~~failing~~").
- **Text behind the subject:** keyword placed behind the head using a person matte.
- UI "pills" (dark glass, red gradient, emoji/icon) stack in as a list.
- Extras used sparingly: circle-ring zoom, REC viewfinder frame, paper-plane icon draw.

**Look:** dark moody room, warm skin, saturated (sat ≈ 100/255), jump cuts with framing changes every 2–4 s.

---

---

## ref-03 — White motion-graphics B-rolls (use to break up talking-head every 5–8 s)
Source: https://pin.it/1upehth87 · 720×1280 · 34.9 s · 30 fps · 8 hard cuts (4.5, 7.1, 13.1, 15.1, 16.2, 18.0, 26.0, 28.3 s)

- At **4.5 s** it hard-cuts from the face to a full-screen **white paper card** (soft diagonal light, faint grid) for ~2.5 s: small words type on ("So as we are"), then a huge bold "**10K**" in red with depth/shadow lands.
- Repeats every 5–8 s: "content creators", "scripting" (+ 3D search icon), "simple way". Keywords sit in a **solid colored highlight box**.
- A-roll captions mix bold white sans with small italic accent words, and a red swoosh underline.

## ref-04 — Kinetic-typography B-rolls (pattern interrupt every 1.5–3 s)
Source: https://pin.it/2t04zTlVn · 720×1280 · 43 s · 60 fps (analysed at 30 fps) · editing before/after showcase

- First 10 s: a new full-screen graphic every **1.5–3 s**: glowing condensed words ("ADVICE", "FANBASE"), crowd/spotlight imagery, text inside **[bracket frames]**, a huge faded word in the background.
- **3D objects** used as visual nouns: spinning silver coin, ₹ / $ / € symbols, cash stacks.
- One accent word per line in a different color or script ("young", "everyday", "gold").

## Retention rules learned (from ref-03/04 + feedback)
- **First 10 s must never sit still:** a pattern interrupt every 1–2 s (new scene, punch-in, stamp, counter, shake).
- Every on-screen word gets a sound: typing clicks on small words, pop/whoosh on keywords, a bass hit on the hook number.
- Turn spoken lists into **rapid motion-graphics scenes** (one scene per item, ~1–1.5 s each, hard cuts with swishes), alternating **white** and **green** backgrounds.
- Motion-graphics kit: highlight-box word + big gradient title + huge faded ghost word + grid + light sweep + one animated object (counter, coin, bar chart, stamp, chat bubbles).

## brand-taara-erp — taaraerp.com (captured Nov 2026)
- **Product:** Taara ERP, a complete school management ERP (admissions, attendance, fees, exams, faculty, library, transport, reports). Annual plans from ₹45,000 for up to 500 students. Built by Mila Innovations.
- **Colours:** cream `#FAF9E8`, forest green `#244B37` / ink `#233E32`, gold `#F0D682`, module pastels peach `#F1DDD0`, sage `#DEE6CC`, lavender `#E3E0EE`, butter `#F5E7B7`.
- **Fonts:** *Newsreader* (serif, italic for accents, e.g. "One *connected ERP.*") + *Plus Jakarta Sans* (UI / bold captions).
- **Logo:** 4-point star mark + "Taara ERP" in a green gradient (`logo-transparent.png`, `logo-star-mark.png`).
- Full-page capture, overview and all page copy are in this folder.

## House style learned so far (apply to future edits)
- **Caption font = ref-02 font: Inter Tight ExtraBold (800)**, tight tracking (−0.035em keyword, −0.04em lead words). File: `taara-erp-reel-01/assets/InterTight.ttf`.
- Keyword = **gradient fill only** (lime-yellow `#F4FF86 → #E2FC52 → #C3EE2E`, top→bottom) + soft dark drop-shadow. **NO outline / stroke / border on text, ever.**
- Lead words: white Inter Tight 800 at ~⅓ size, tucked onto the keyword (left-aligned); sub line right-aligned.
- Use the same font for all on-screen text (pills, B-roll titles, end card).
- Sound: subtle SFX are welcome: soft pops on keywords, ticks on UI pills, whooshes on B-roll transitions, a low hit on the hook, a chime on the end card. Keep them under the voice.
- Add visuals that illustrate the words (UI cards, dashboard B-roll, website scroll).
- Natural skin tone: iPhone HDR (HLG) footage must be tone-mapped properly (hable + gentle lift). Never apply a heavy LUT.
- Don't compromise quality: render at 1080×1920 / 30 fps, encode at CRF ≤ 15.
