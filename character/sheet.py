"""Studio renders of the cast for character sheets.

  python3 sheet.py --who doctor --view front --size 900x1200 --samples 96 --out renders/doctor_front.png
  python3 sheet.py --who lineup --view front --size 1600x1200

who:  avani | doctor | patient | lineup
view: front | threeq | side | back | face
"""
import argparse
import math
import os

import bpy
import bmesh
from mathutils import Vector

from avani import build_avani
from claykit import add_glow, area_light, clay, configure_render, finish, look_at_camera, new_scene
from humans import build_doctor, build_patient

HERE = os.path.dirname(os.path.abspath(__file__))
YAW = {"front": 0, "threeq": -35, "side": -90, "back": 180, "face": -18}
# full height, face height and overall width, for framing
CAST = {"avani": (2.35, 1.2, 2.7), "doctor": (5.95, 4.45, 2.6), "patient": (4.85, 3.45, 2.6)}


def backdrop(coll, yaw):
    """Seamless cyclorama behind the subject, turned to face the camera."""
    mat = clay("Backdrop", "#B9B4D6", rough=0.9, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    prof = [(-60.0, 0.0)] + [(9 + 6 * math.sin(a), 6 - 6 * math.cos(a))
                              for a in (math.pi / 2 * k / 16 for k in range(17))] + [(15.0, 60.0)]
    bm = bmesh.new()
    rows = [(bm.verts.new((-70, y, z)), bm.verts.new((70, y, z))) for y, z in prof]
    for a, b in zip(rows, rows[1:]):
        bm.faces.new((a[0], a[1], b[1], b[0]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    cyc = finish("Cyclorama", bm, coll, mat)
    cyc.rotation_euler = (0, 0, -yaw)
    w = bpy.data.worlds.new("Studio")
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.42, 0.40, 0.62, 1)
    w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.7
    bpy.context.scene.world = w


def lights(coll, yaw, target, reach):
    fwd = Vector((math.sin(yaw), math.cos(yaw), 0))
    right = Vector((math.cos(yaw), -math.sin(yaw), 0))
    up = Vector((0, 0, 1))
    t = Vector(target)
    area_light(coll, "Key", t - fwd * reach + right * reach * 0.7 + up * reach * 0.6, t,
               (1.0, 0.93, 0.84), 52 * reach ** 2, reach * 0.8)
    area_light(coll, "Fill", t - fwd * reach - right * reach * 0.9 + up * reach * 0.1, t,
               (0.8, 0.86, 1.0), 12 * reach ** 2, reach * 1.2)
    area_light(coll, "Rim", t + fwd * reach * 0.9 - right * reach * 0.5 + up * reach * 0.8, t,
               (1.0, 0.9, 0.8), 60 * reach ** 2, reach * 0.5)


def build(who, view, **pose):
    char, stage, rig = new_scene("Character", "Stage", "Rig")
    backdrop(stage, math.radians(YAW[view]))
    if who == "lineup":
        build_patient(char).location = (-2.3, 0, 0)
        build_doctor(char).location = (0.2, 0, 0)
        avani = build_avani(char)[0]
        avani.location = (2.5, 0, 0)
        height, centre, width = 5.95, Vector((0.1, 0, 3.0)), 7.2
    else:
        builder = {"avani": lambda c, **k: build_avani(c, **k)[0], "doctor": build_doctor,
                   "patient": build_patient}[who]
        builder(char, **pose)
        height, face_z, width = CAST[who]
        centre = Vector((0, 0, height / 2))
        if view == "face":
            centre, height, width = Vector((0, 0, face_z + 0.1)), 2.3, 2.3
    yaw = math.radians(YAW[view])
    fwd = Vector((math.sin(yaw), math.cos(yaw), 0))
    return centre, fwd, yaw, height, width, rig


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--who", default="doctor")
    ap.add_argument("--view", default="front")
    ap.add_argument("--size", default="600x800")
    ap.add_argument("--samples", type=int, default=48)
    ap.add_argument("--mouth")
    ap.add_argument("--blink", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--save-blend")
    ap.add_argument("--export-glb")
    args = ap.parse_args()
    w, h = (int(v) for v in args.size.split("x"))
    pose = {"blink": args.blink}
    if args.mouth:
        pose["mouth"] = args.mouth
    centre, fwd, yaw, height, width, rig = build(args.who, args.view,
                                                 **(pose if args.who != "lineup" else {}))
    # 85 mm on a 36 mm sensor: fit whichever of height / width is tighter
    half = math.atan(18 / 85)
    frame_h = max(height * 1.12, width * 1.12 * h / w) if h >= w else max(
        height * 1.12 * w / h, width * 1.12)
    dist = (frame_h / 2) / math.tan(half)
    look_at_camera(rig, centre - fwd * dist + Vector((0, 0, height * 0.03)), centre, fstop=11)
    lights(rig, yaw, centre, max(height, width) * 1.1)
    add_glow()
    configure_render(w, h, args.samples)
    if args.out:
        bpy.context.scene.render.filepath = os.path.abspath(args.out)
        bpy.ops.render.render(write_still=True)
        print("WROTE", bpy.context.scene.render.filepath)
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.save_blend), compress=True)
        print("WROTE", args.save_blend)
    if args.export_glb:
        bpy.ops.object.select_all(action="DESELECT")
        for o in bpy.data.collections["Character"].all_objects:
            o.select_set(True)
        bpy.ops.export_scene.gltf(filepath=os.path.abspath(args.export_glb), use_selection=True,
                                  export_apply=True, export_format="GLB")
        print("WROTE", args.export_glb)


if __name__ == "__main__":
    main()
