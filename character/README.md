# The cast

Three clay characters built as real 3D models, so they stay identical in every
shot of every reel. Everything is procedural and seeded: rebuilding gives the
same models.

| Character | Builder | Notes |
|---|---|---|
| **Avani** | `avani.py` → `build_avani()` | Round orange character, tall black eyes, two-leaf sprout. Sits; 2.3 units tall. |
| **Doctor** | `humans.py` → `build_doctor()` | Dark hair in a high bun, big round glasses, white coat over navy scrubs, stethoscope, clipboard. 5.9 units tall. |
| **Patient** | `humans.py` → `build_patient()` | Wavy dark hair, round glasses, black jacket over white hoodie, cargo trousers, white trainers, navy mail bag. 4.8 units tall. |

Every builder takes `mouth=` and `blink=` so a shot can be rendered in the few
face states the edit needs (closed, talking, eyes shut). The humans have a
`<Name>_Head` pivot for head turns.

## Files

| Path | What it is |
|---|---|
| `claykit.py` | Shared tools: clay material, soft low-poly blobs, limbs, pressed-on details, lights, render settings. |
| `sheet.py` | Studio renders: turnarounds, faces, the line-up. |
| `scene_night.py` | Avani's night clearing (warm key, orange rim, blurred blue backdrop). |
| `model/*.glb` | Each character on its own, for three.js / React Three Fiber or any 3D tool. |
| `model/cast.blend` | Blender file with all three in the studio. |
| `renders/` | Character sheets, the line-up and Avani's hero still. |

## Rendering

```bash
pip install bpy==5.3.0

python3 sheet.py --who doctor --view threeq --size 900x1200 --samples 96 --out renders/doctor.png
python3 sheet.py --who patient --view face --mouth open --out renders/patient_talking.png
python3 sheet.py --who lineup --size 1600x1000 --out renders/cast_lineup.png
python3 scene_night.py --render hero:hero:1080:1920:128
```

Views: `front`, `threeq`, `side`, `back`, `face`. Rendering is CPU path tracing
(Cycles) with denoising, so no GPU is needed.

## Keep fixed between reels

- **Avani** — tall egg body in orange clay `#E4581C`, soft low-poly facets; two tall
  rounded-rectangle eyes with one white glint each; tiny upturned mouth (a small
  dark oval when talking); two arm nubs, two stubby legs pointing forward; short
  stem with two plump leaves, the left larger and flatter.
- **Doctor** — skin `#F0B28A`, hair `#33221E`, coat `#E9E5DD`, scrubs `#232C50`;
  side-swept fringe, a lock in front of each ear, bun with stray wisps; thin
  round frames; dot eyes, short brows, small orange wedge nose, small smile.
- **Patient** — skin `#F4B78F`, hair `#261A1D`, jacket `#201F28`, hoodie
  `#EFE9DE`, bag `#24335C`; mop of wavy locks with a fringe to the top of the
  glasses; larger head than the Doctor; hands in pockets.
