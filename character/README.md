# Sprout — clay character for reels

A round orange root-vegetable character with tall black eyes, a tiny smile and a
two-leaf sprout, built as a real 3D model so it stays identical in every reel.

| File | What it is |
| --- | --- |
| `build_character.py` | Builds the character, set, lights and camera from scratch. Seeded, so it always produces the same model. |
| `model/sprout.blend` | Blender scene (character + set + lighting + hero camera), ready to pose and animate. |
| `model/sprout.glb` | The character alone, for three.js / React Three Fiber or any other 3D tool. |
| `renders/sprout_hero_9x16_4k.png` | Hero still, 2160×3840 (vertical 4K), muted blue seat. |
| `renders/sprout_reference_match.png` | Same framing and mossy seat as the original reference image. |
| `renders/sprout_turnaround.png` | Front / three-quarter / side / back sheet. |

## Re-rendering

```bash
pip install bpy==5.3.0

# hero reel frame on the blue seat
python3 build_character.py --render hero:hero:1080:1920:128

# reference framing on the mossy seat
python3 build_character.py --surface moss --render ref:ref:1642:1985:128
```

`--render` is `name:view:width:height:samples`; views are `hero`, `ref`, `front`,
`threeq`, `side`, `back`. Rendering is CPU path tracing (Cycles) with denoising.

## Character sheet

Keep these fixed between reels:

- **Body** — tall egg, slightly heavier at the bottom, soft low-poly facets with
  thumb-smoothed edges; matte orange clay `#E4622A`.
- **Eyes** — two tall rounded-rectangle tablets of near-black clay, raised from the
  face, each with one white rounded glint in the upper half.
- **Mouth** — a very small upturned stroke, centred below the eyes.
- **Limbs** — two small arm nubs low on the sides; two stubby log legs pointing
  forward (it sits).
- **Sprout** — short green stem with two plump leaves, the left one larger and
  flatter, the right one smaller and more upright.
- **Light** — warm key from camera right, orange rim on both edges, weak cool fill,
  dark blue night backdrop with drifting warm dust motes and shallow depth of field.

Colours live in `PALETTE` at the top of the script.
