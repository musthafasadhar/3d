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

## brand-taara-erp — taaraerp.com (captured Nov 2026)
- **Product:** Taara ERP, a complete school management ERP (admissions, attendance, fees, exams, faculty, library, transport, reports). Annual plans from ₹45,000 for up to 500 students. Built by Mila Innovations.
- **Colours:** cream `#FAF9E8`, forest green `#244B37` / ink `#233E32`, gold `#F0D682`, module pastels peach `#F1DDD0`, sage `#DEE6CC`, lavender `#E3E0EE`, butter `#F5E7B7`.
- **Fonts:** *Newsreader* (serif, italic for accents, e.g. "One *connected ERP.*") + *Plus Jakarta Sans* (UI / bold captions).
- **Logo:** 4-point star mark + "Taara ERP" in a green gradient (`logo-transparent.png`, `logo-star-mark.png`).
- Full-page capture, overview and all page copy are in this folder.

## House style learned so far (apply to future edits)
- Gradient **bold** keyword captions (gold gradient + dark-green outline when the background is busy or yellow).
- Clean edit: few effects, **no music/SFX clutter** (max 1–2 soft whooshes on big transitions).
- Natural skin tone: iPhone HDR (HLG) footage must be tone-mapped properly (hable + gentle lift). Never apply a heavy LUT.
- Don't compromise quality: render at 1080×1920 / 30 fps, encode at CRF ≤ 15.
