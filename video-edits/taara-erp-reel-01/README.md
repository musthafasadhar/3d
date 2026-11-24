# Taara ERP reel #01: edit project

**Final:** `output/Taara_ERP_Reel_Final.mp4` (1080×1920, 30 fps, H.264 High CRF 14 at ~19 Mbps, BT.709, AAC 320k, −14 LUFS, 38.2 s)

**Source:** `IMG_2751.mov`: iPhone HDR (HLG / BT.2020, 10-bit), 39.2 s single take, Telugu with English terms.
**References:** see `../references/` (ref-01 website 3D scroll, ref-02 two-tier gradient captions, brand-taara-erp).

## Script (translated)
> Imagine knowing the entire institute's performance within 5 minutes of the principal walking in: students present, fees collection, academic performance, admission status, parents' concerns. For this basic info you call different departments and ask for reports. In our Taara dashboard you see every key update in a single view. Management gets clear visibility and takes decisions fast. Because a principal's job isn't collecting data, it's making decisions smartly. So choose Taara: better visibility, smarter decisions.

## Edit decisions
| Out time | Section | Treatment |
|---|---|---|
| 0.0–4.8 | Hook | zoom-out reveal · typing clicks on each word · riser → bass hit + **camera shake** as **"5 Minutes" lands behind her head** · clock ticks · "**Performance**" with light-shine sweep + shimmer |
| 4.8–10.9 | **5 motion-graphics scenes** (white/green alternating, ref-03/04 style) | Students Present (avatar grid + 482/500 counter) → Fees Collection (spinning ₹ coin + bar, cha-ching) → Academic Performance (bars + trend line + A+) → Admission Status (APPROVED stamp slam + shake) → Parents' Concerns (chat pings → All resolved) |
| 10.9–15.0 | Problem | wide · "for basic info, you call **Departments** one by one" + iPhone-style "Calling Accounts / Admissions / Exam cell" cards |
| 15.0–17.1 | Problem | tight · "and ask for **Reports**" + red strike-through · "not anymore." |
| 17.6–22.7 | **B-roll** | ref-01 style: taaraerp.com tilted in 3D, fast scroll with real motion blur, floating module chips → framed card "Every key update, *in one single view.*" |
| 22.7–24.0 | | "see it all, **Easily**" |
| 24.0–26.7 | **B-roll 2** | animated principal's dashboard (attendance ring, fee/admission counters, performance chart), "management gets clear **Visibility**" |
| 26.7–29.0 | Benefit | punch-in · **Decisions** — fast. |
| 29.0–31.8 | Twist | tight · "a principal's job isn't collecting **Data**" + strike |
| 31.8–33.7 | Twist | wide · "it's making decisions **Smartly**" ✦ |
| 33.7–38.2 | CTA | "So, choose **Taara ERP**" → she shrinks into a card on the brand background · logo · "Better visibility. **Smarter decisions.**" · Explore plans taaraerp.com · freeze on her smile |

- 8 silent gaps trimmed (≈2.4 s); every jump cut alternates wide/tight framing.
- Grade: hable tone-map from HLG + gentle lift (+3 % sat). Skin kept natural, no LUT.
- Captions: Inter Tight ExtraBold (matched to ref-02), lime gradient fill, soft shadow, no outline.
- SFX (`scripts/sfx.py`, synthesised, royalty-free): pops on keywords, ticks on pills/call cards, whooshes on B-roll in/out, a low hit on the hook, swipes on strikes, a chime on the end card. Mixed ~10 dB under the voice.
- Audio: 80 Hz high-pass, light de-ess, −1.5 dB @250 Hz, +1.8 dB @3.8 kHz, 2.8:1 compression, two-pass loudnorm −14 LUFS / −1.5 dBTP. No music, so trending audio can be added in-app at low volume if wanted.

## Re-render
```bash
python3 scripts/timeline.py timeline.json                       # edit list -> timeline.json
scripts/grade.sh IMG_2751.mov graded.rgb                         # HDR -> SDR graded raw frames
node scripts/render_overlays.js timeline.json ov/               # captions / pills / b-roll / end card (Playwright)
python3 scripts/sfx.py timeline.json sfx.wav                      # sound design
python3 scripts/audio.py timeline.json IMG_2751.mov audio.wav sfx.wav  # cut + clean + mix + loudness
python3 scripts/composite.py timeline.json graded.rgb ov full video.mp4
ffmpeg -i video.mp4 -i audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -movflags +faststart final.mp4
```
Change any caption wording or timing in `scripts/timeline.py` (times are source seconds), and styling in `scripts/overlay.html`.
Needs: ffmpeg (with zscale), Python (numpy, opencv-python-headless, rembg, faster-whisper), Node + Playwright/Chromium.
