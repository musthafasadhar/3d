# Avni Health ERP: launch film (16:9 · 1920×1080 · 60 fps · 66 s)

Motion-graphics launch video for https://avni-health-erp.vercel.app/, built entirely from the site's
own content, colours, type and imagery. The final file is `output/Avni_Launch_Film_1080p60.mp4`.

## Storyboard (120 BPM, so every cut lands on a beat)
| Time | Scene | Source on the site |
|---|---|---|
| 0–4 s | Ripple intro, "A little care. A healthier tomorrow." | Hero eyebrow |
| 4–10 s | "Your health deserves a more **connected** kind of care." Cursor clicks the CTA, which expands into the next scene | Hero |
| 10–15 s | "Care shouldn't feel like starting over." Pain-point chips get pulled away | "More than a single appointment" |
| 15–18 s | "It should feel *connected.*" Text highlight, then a beat drop | same |
| 18–22 s | Logo build: "Meet *Avni.*", plus the three feature pills | Hero + feature strip |
| 22–36 s | Orbit: 01 Understand (records), 02 Connect (doctors), 03 Continue (Ask Avni booking) | 01 / Our approach, 03 / Doctors |
| 36–42 s | For patients: phone UI ("Hello, Sara"), toggles, CTA | 02 / Built around you |
| 42–48 s | For hospitals & care teams: role network, "More time for *what matters.*" | Hospital section + /login |
| 48–52 s | "Small steps. *Meaningful connections.*" 01 · 04 · One | Stats band |
| 52–56 s | "A healthier tomorrow starts with a little *care today.*" | Wellbeing banner |
| 56–66 s | "Your next chapter of care *starts here.*", then logo, tagline, URL, "Discover Avni" | Closing CTA + footer |

## Brand system used
* Colours: `#125b49` green, `#123e33` deep, `#168567` accent, `#e6f3ed` / `#e5f3e3` mint, `#fefefa` cream,
  logo gradient `#0ba77e → #00574d`, leaf `#32d58b`, sparkle gold `#b5a54e`, lime `#b6df7e`
* Type: Arial-metric sans (Arimo) for headlines, Georgia-metric italic (Gelasio) for the emphasised second lines,
  as on the site
* All copy is quoted from the site. The only new lines are the four "pain point" chips in the problem scene

## Sound
`audio.py` synthesises an original score from scratch (no samples and no licensed music), so there are no copyright issues:
marimba lead, plucks, warm pad, round bass, kick, clap, hats and shaker, with humanised timing, kick sidechain
and risers into every section change. Around 20 SFX (whooshes, clicks, pops, ticks, typing, toggles, chimes,
impacts) are generated from the cue sheet that the animation timeline exports, so each one lands on its exact frame.
Master: about -14 LUFS, true peak below -1 dBTP.

## Rebuild
```
./make.sh
```
Needs node + playwright/chromium, python3 + numpy + scipy, ffmpeg. `index.html` opened in a browser shows the
first frame; `window.renderFrame(f, 60)` scrubs to any frame.
