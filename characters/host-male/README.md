# Host (male): character reference

A male version of the host from the reference reel (`docs/reel-analysis.md`, Reel A), in the
same soft low-poly chibi style. The model is built in code (`character.js`), so every reel uses
the exact same character.

- `reference-sheet.png`: 14 labelled views (front, back, both sides, all four 3/4 views, top,
  low angle, face close-ups and the reel close-up)
- `spin-360.mp4` / `spin-360.gif`: full 360° turntable (120 frames, 3° per frame)
- `views/*.png`: each view as a separate full-size image

## Specs
| Part | Spec |
|---|---|
| Proportions | chibi; the head is about 45% of total height (head radius = 1 unit, about 4.5 units tall) |
| Skin | `#f0a888`, finely faceted low-poly |
| Eyes | small vertical black ovals with one white highlight, no brows |
| Glasses | big round thin black rims (`#17141c`), lens radius 0.4, wrap slightly around the face |
| Nose / mouth | tiny orange triangle (`#d9775a`) / flat dark line (`#3b1f1f`) |
| Hair | short, chunky faceted strands, dark brown (`#4a2c1c`), side part with the fringe swept to his left |
| Outfit | oversized puffy **blue** jacket (`#2f6ed8`), open at the front, thick collar; black tee (`#1b1a22`); dark pants; white sneakers |

## Re-render / change
```bash
cd characters && npm install
node render-turnaround.mjs host-male --spin    # views + spin frames
python3 make-sheet.py host-male/views          # reference sheet
ffmpeg -framerate 30 -i host-male/views/spin/f%04d.png -pix_fmt yuv420p host-male/spin-360.mp4
```
Colours can be overridden per reel: `createHostMale({ jacket: 0x1f9e5a })`.
Animatable parts are named: `head`, `eyeL`, `eyeR`, `mouth`, `glasses`, `hair`, `armL`, `armR`, `torso`.
