"""Night clearing: Avani on a rock, warm key, orange rims, blurred blue backdrop.

  python3 scene_night.py --render hero:hero:1080:1920:128
  python3 scene_night.py --surface moss --render ref:ref:1642:1985:128
  python3 scene_night.py --save-blend model/avani.blend --export-glb model/avani.glb

--render takes  name:view:width:height:samples  and may be repeated.
Views: hero, ref, front, threeq, side, back
"""
import argparse
import math
import os
import random

import bpy
import bmesh
from mathutils import Matrix, Vector

from avani import BODY_C, BODY_R, build_avani
from claykit import (add_glow, area_light, blob, clay, configure_render, emissive, finish,
                     link, new_scene)

HERE = os.path.dirname(os.path.abspath(__file__))
HERO_YAW = math.radians(37.0)  # camera swings toward the character's right
SET = {"seat_blue": "#2C5FB4", "seat_moss": "#A9A93E", "rock_bg": "#2B3F63",
       "ground": "#1B2A47"}


def build_set(coll, surface, extras, body_mat):
    seat_hex = SET["seat_blue"] if surface == "blue" else SET["seat_moss"]
    seat_mat = clay("Clay_Seat", seat_hex, rough=0.9, sss=0.0, bump=0.05, sheen=0.0)
    seat_mat.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.12
    rock_mat = clay("Clay_Rock", SET["rock_bg"], rough=0.8, sss=0.0, bump=0.05)
    ground_mat = clay("Clay_Ground", SET["ground"], rough=0.85, sss=0.0, bump=0.04)

    seat = blob("Seat", coll, seat_mat, (1.62, 1.55, 0.62), subdiv=2, square=0.72,
                jitter=0.07, seed=5, bevel=0.04)
    seat.location = (0.0, -0.22, -0.56)

    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=60)
    ground = finish("Ground", bm, coll, ground_mat, smooth=False)
    ground.location = (0, 0, -1.05)

    rng = random.Random(77)
    fwd = Vector((math.sin(HERO_YAW), math.cos(HERO_YAW), 0))
    right = Vector((math.cos(HERO_YAW), -math.sin(HERO_YAW), 0))
    for i in range(9):
        s = rng.uniform(1.6, 4.2)
        rock = blob(f"BgRock_{i}", coll, rock_mat,
                    (s, s * rng.uniform(0.7, 1.1), s * rng.uniform(0.8, 1.5)),
                    subdiv=1, square=0.8, jitter=0.12, seed=100 + i, bevel=0.05)
        pos = fwd * rng.uniform(6, 15) + right * rng.uniform(-9, 9)
        rock.location = (pos.x, pos.y, -1.0 + s * 0.35)
        rock.rotation_euler = (0, 0, rng.uniform(0, 6.28))

    if extras:
        # out-of-focus friend at the frame edge, as in the reference
        buddy = blob("Buddy", coll, body_mat, BODY_R, subdiv=3, square=0.85,
                     jitter=0.028, seed=12, bevel=0.04, decimate=0.46)
        pos = right * 2.2 + fwd * 1.7
        buddy.location = (pos.x, pos.y, 0.35)
        # drifting dust motes that catch the warm light
        mote = emissive("Mote", (1.0, 0.68, 0.36), 9.0)
        bm = bmesh.new()
        rng = random.Random(3)
        for _ in range(90):
            p = (fwd * rng.uniform(-2.2, 2.6) + right * rng.uniform(-2.4, 2.4)
                 + Vector((0, 0, rng.uniform(-0.2, 3.4))))
            if (p - BODY_C).length < 1.3:
                continue
            r = rng.uniform(0.003, 0.0065)
            m = Matrix.Translation(p) @ Matrix.Scale(r, 4)
            bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0, matrix=m)
        finish("Dust", bm, coll, mote)

def build_lights(coll, yaw):
    """Rig is defined relative to the camera so every view is lit the same way."""
    fwd = Vector((math.sin(yaw), math.cos(yaw), 0))
    right = Vector((math.cos(yaw), -math.sin(yaw), 0))
    up = Vector((0, 0, 1))
    tgt = BODY_C + up * 0.1
    # warm key, camera right
    area_light(coll, "Key", -fwd * 4.5 + right * 4.2 + up * 3.4, tgt,
               (1.0, 0.60, 0.33), 400, 3.0)
    # orange rims wrapping both edges of the silhouette
    area_light(coll, "Rim_Right", fwd * 4.2 + right * 2.6 + up * 2.2, tgt,
               (1.0, 0.42, 0.12), 1500, 1.2)
    area_light(coll, "Rim_Left", fwd * 4.2 - right * 2.4 + up * 3.4, tgt,
               (1.0, 0.44, 0.14), 1300, 1.2)
    # cool fill so the shadow side reads as form, not a black hole
    area_light(coll, "Fill", -fwd * 4 - right * 5 + up * 1.2, tgt,
               (0.36, 0.52, 1.0), 45, 6.0)
    # dim moonlight on the backdrop
    area_light(coll, "Backdrop", fwd * 4 + up * 9, fwd * 10,
               (0.35, 0.5, 1.0), 1100, 12.0)


def link_lights(coll, yaw):
    """Keep the orange rims off the sprout and eyes, and give the sprout its own
    soft neutral light, so the leaves stay green and the eyes stay black."""
    own_light = ("Leaf_", "Stem", "Eye_", "Glint_")
    rim_rx = bpy.data.collections.new("RimReceivers")
    sprout_rx = bpy.data.collections.new("SproutReceivers")
    for o in bpy.context.scene.objects:
        if o.type != "MESH":
            continue
        if o.name.startswith(own_light):
            if o.name.startswith(("Leaf_", "Stem")):
                sprout_rx.objects.link(o)
        else:
            rim_rx.objects.link(o)
    for name in ("Rim_Right", "Rim_Left"):
        bpy.data.objects[name].light_linking.receiver_collection = rim_rx
    fwd = Vector((math.sin(yaw), math.cos(yaw), 0))
    right = Vector((math.cos(yaw), -math.sin(yaw), 0))
    top = Vector((0, 0, 2.3))
    kicker = area_light(coll, "Sprout_Kicker", top - fwd * 2.2 + right * 1.2 + Vector((0, 0, 1.6)),
                        top, (1.0, 0.94, 0.8), 55, 1.6)
    kicker.light_linking.receiver_collection = sprout_rx
    back = area_light(coll, "Sprout_Rim", top + fwd * 2.2 - right * 0.8 + Vector((0, 0, 1.2)),
                      top, (1.0, 0.8, 0.5), 40, 1.0)
    back.light_linking.receiver_collection = sprout_rx


def build_world():
    w = bpy.data.worlds.new("Night")
    w.use_nodes = True
    bg = w.node_tree.nodes["Background"]
    bg.inputs["Color"].default_value = (0.012, 0.022, 0.05, 1)
    bg.inputs["Strength"].default_value = 1.0
    bpy.context.scene.world = w


VIEWS = {
    #         yaw (deg)  dist  cam z  look z  lens  f-stop
    "hero":   (37.0,     10.4, 1.32,  1.12,   85,   2.8),
    "ref":    (37.0,     6.9,  1.30,  1.10,   85,   2.4),
    "front":  (0.0,      9.4,  1.20,  1.12,   85,   8.0),
    "threeq": (-40.0,    9.4,  1.20,  1.12,   85,   8.0),
    "side":   (90.0,     9.4,  1.20,  1.12,   85,   8.0),
    "back":   (180.0,    9.4,  1.20,  1.12,   85,   8.0),
}


def setup_camera(coll, view):
    yaw_deg, dist, cz, lz, lens, fstop = VIEWS[view]
    yaw = math.radians(yaw_deg)
    fwd = Vector((math.sin(yaw), math.cos(yaw), 0))
    data = bpy.data.cameras.new("Cam")
    data.lens = lens
    data.dof.use_dof = True
    data.dof.aperture_fstop = fstop
    data.dof.aperture_blades = 0
    cam = bpy.data.objects.new("Cam", data)
    link(cam, coll)
    cam.location = -fwd * dist + Vector((0, 0, cz))
    look = Vector((0, 0, lz))
    cam.rotation_euler = (look - cam.location).to_track_quat("-Z", "Y").to_euler()
    # focus on the face plane, not the body centre
    data.dof.focus_distance = (look - cam.location).length - 0.72
    bpy.context.scene.camera = cam
    return yaw

def build(surface="blue", view="hero", extras=True):
    char_coll, set_coll, rig_coll = new_scene("Character", "Set", "Rig")
    root, mats = build_avani(char_coll)
    build_set(set_coll, surface, extras, mats["body"])
    build_world()
    yaw = setup_camera(rig_coll, view)
    build_lights(rig_coll, yaw)
    link_lights(rig_coll, yaw)
    add_glow()
    return root


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--surface", choices=("blue", "moss"), default="blue")
    ap.add_argument("--render", action="append", default=[],
                    help="name:view:width:height:samples")
    ap.add_argument("--out", default=os.path.join(HERE, "renders"))
    ap.add_argument("--save-blend")
    ap.add_argument("--export-glb")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    for job in args.render:
        name, view, w, h, samples = job.split(":")
        build(args.surface, view, extras=view in ("hero", "ref"))
        configure_render(int(w), int(h), int(samples))
        bpy.context.scene.render.filepath = os.path.join(args.out, name + ".png")
        bpy.ops.render.render(write_still=True)
        print("WROTE", bpy.context.scene.render.filepath)

    if args.save_blend or args.export_glb:
        build(args.surface, "hero", extras=True)
        configure_render(1080, 1920, 256)
        if args.save_blend:
            path = os.path.abspath(args.save_blend)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            bpy.ops.wm.save_as_mainfile(filepath=path, compress=True)
            print("WROTE", path)
        if args.export_glb:
            path = os.path.abspath(args.export_glb)
            os.makedirs(os.path.dirname(path), exist_ok=True)
            bpy.ops.object.select_all(action="DESELECT")
            for o in bpy.data.collections["Character"].all_objects:
                o.select_set(True)
            bpy.ops.export_scene.gltf(filepath=path, use_selection=True,
                                      export_apply=True, export_format="GLB")
            print("WROTE", path)


if __name__ == "__main__":
    main()
