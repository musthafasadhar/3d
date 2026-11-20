# Reel B-roll: "Ask Meta AI why your views are stuck"

These are vertical 1080×1920, 30 fps motion-graphics B-roll clips for the @ig_cyberwar Telugu reel. They use a soft green gradient-and-grid background in the style of the reference image. The clips are clean: they have no watermark, and only the end card has text.

## Files (`out/`)
| File | What |
|---|---|
| `broll_full.mp4` | The full 35 s B-roll track with SFX |
| `broll_silent.mp4` | The same track without audio |
| `sfx.wav` | The SFX track on its own (48 kHz, peaks at −6 dBFS, sits under the voice) |
| `clips/01_*.mp4` … `07_*.mp4` | Each visual as its own clip with SFX, ready to drop on the timeline |

## Timeline mapped to the script
| Time | Clip | Line | Visual |
|---|---|---|---|
| 0–5 s | 01_views_stuck | "ఎంత కన్సిస్టెంట్ గా పోస్ట్ చేసినా… వ్యూస్ ఇలాగే" | A 3D Instagram icon drops in. Reel cards fan out, but their view meters stall and a flatline chart draws across. |
| 5–10 s | 02_ask_meta | "ఎవరికి అర్థం కాదు… డైరెక్ట్ గా మెటాని అడిగి" | A frosted orb with tangled orbits turns into a 3D Meta tile. |
| 10–15 s | 03_search_meta | "ఇన్స్టాగ్రామ్ ఓపెన్… మెసేజెస్… మెటాని సెర్చ్" | Phone sequence: tap Instagram, open Messages, search, and tap the Meta AI result. |
| 15–20 s | 04_paste_report | "ప్రాంప్ట్ ని పేస్ట్… డీటెయిల్ రిపోర్ట్" | A prompt sheet is pasted and sent. Meta AI types, then a report card builds itself. |
| 20–25 s | 05_account_glowup | "అకౌంట్ ని మొత్తం చేంజ్" | Your profile glows up: the grid tiles flip from grey to colour. |
| 25–29.5 s | 06_500k_views | "500K+ వ్యూస్" | A growth curve shoots up, followed by a burst of hearts and pop-up notifications. |
| 29.5–35 s | 07_follow_comment | "ఫాలో చేసి… ఐడిని కమెంట్స్" | End card: your avatar, @ig_cyberwar, Follow → Following, then a comment of "@your_insta_id" is typed and sent. |

If your voice runs faster or slower than this, trim or slide the individual clips.

## Re-render
```
node render.js out/broll_silent.mp4 0 35 30   # video (Playwright + ffmpeg)
python3 sfx.py out/sfx.wav                      # sound effects
```
