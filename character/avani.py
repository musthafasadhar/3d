"""Avani — the round orange clay character with the two-leaf sprout.

Seeded and procedural: build_avani() always returns the identical model.
She faces -Y, Z is up, and she sits with her base at z = 0 (about 2.3 units to
the tip of the sprout). Move, turn or scale the returned root to place her.
"""
import math

import bpy
import bmesh
from mathutils import Vector

from claykit import (blob, bvh_of, clay, finish, link, rounded_tablet, soft_facets, srgb,
                     surface_frame)

PALETTE = {
    "body": "#E4581C",
    "eye": "#140B08",
    "eye_glint": "#F6ECE4",
    "mouth": "#3A140C",
    "leaf": "#6FAE4E",
    "stem": "#86B95A",
}

BODY_C = Vector((0.0, 0.0, 1.01))
BODY_R = Vector((0.87, 0.82, 1.03))


def build_avani(coll, mouth="smile", blink=False):
    """mouth: "smile" | "o" (talking) | "open" (surprised).  blink: eyes shut."""
    mats = {
        "body": clay("Clay_Orange", PALETTE["body"], sss=0.15, sheen=0.08),
        "eye": clay("Clay_Eye", PALETTE["eye"], rough=0.6, sss=0.0, bump=0.01,
                    sheen=0.0, variation=0.0),
        "glint": clay("Clay_Glint", PALETTE["eye_glint"], rough=0.45, sss=0.1,
                      bump=0.0, sheen=0.0, variation=0.0),
        "mouth": clay("Clay_Mouth", PALETTE["mouth"], rough=0.5, sss=0.0, bump=0.0,
                      sheen=0.0, variation=0.0),
        "leaf": clay("Clay_Leaf", PALETTE["leaf"], rough=0.6, sss=0.2, sheen=0.1),
        "stem": clay("Clay_Stem", PALETTE["stem"], rough=0.6, sss=0.2, sheen=0.1),
    }
    for key in ("leaf", "stem"):  # green clay scatters green, not the body's warm red
        mats[key].node_tree.nodes["Principled BSDF"].inputs[
            "Subsurface Radius"].default_value = (0.45, 1.0, 0.25)
    # the glint glows a touch so the eyes stay alive in dark shots
    g = mats["glint"].node_tree.nodes["Principled BSDF"]
    g.inputs["Emission Color"].default_value = srgb(PALETTE["eye_glint"])
    g.inputs["Emission Strength"].default_value = 0.35

    root = bpy.data.objects.new("Avani", None)
    link(root, coll)
    parts = []

    # ---- body: tall egg, a little heavier at the bottom, flattened crown
    def egg(p):
        r = 1.0 + 0.075 * (-p.z)
        return Vector((p.x * r, p.y * r, p.z))

    body = blob("Body", coll, mats["body"], BODY_R, subdiv=3, square=0.85,
                jitter=0.028, seed=11, shape=egg, bevel=0.04, decimate=0.46)
    body.location = BODY_C
    parts.append(body)

    # ---- legs: stubby logs pointing forward, resting on the seat
    for side, sx in (("L", 1), ("R", -1)):
        def log(p):
            return Vector((p.x, math.copysign(abs(p.y) ** 0.42, p.y), p.z))
        leg = blob(f"Leg_{side}", coll, mats["body"], (0.235, 0.40, 0.225), subdiv=2,
                   jitter=0.05, seed=21 + sx, shape=log, bevel=0.025)
        leg.location = (sx * 0.39, -0.76, 0.225)
        leg.rotation_euler = (math.radians(-3), 0, math.radians(sx * 9))
        parts.append(leg)

    # ---- arms: small nubs low on the sides
    for side, sx in (("L", 1), ("R", -1)):
        arm = blob(f"Arm_{side}", coll, mats["body"], (0.135, 0.175, 0.225), subdiv=2,
                   jitter=0.05, seed=31 + sx, bevel=0.03)
        arm.location = (sx * 0.845, 0.02, 0.66)
        arm.rotation_euler = (math.radians(8), math.radians(sx * -16), 0)
        parts.append(arm)

    # ---- face, placed on the evaluated (bevelled) body surface
    bvh, mw = bvh_of(body)
    eye_yaw = math.radians(22.0)
    eye_z = 1.31
    for side, sx in (("L", 1), ("R", -1)):
        eye = rounded_tablet(f"Eye_{side}", coll, mats["eye"], 0.095, 0.245, 0.048, 0.07)
        eye.matrix_world = surface_frame(bvh, mw, sx * eye_yaw, eye_z, BODY_C, BODY_R,
                                         lift=-0.04, pitch_bias=0.55)
        parts.append(eye)
        if blink:  # squash to a contented line
            eye.scale = (1.0, 1.0, 0.13)
        glint = rounded_tablet(f"Glint_{side}", coll, mats["glint"], 0.035, 0.07, 0.033,
                               0.016, bevel=0.006)
        glint.parent = eye
        glint.location = (0.004, -0.063, 0.118)
        glint.hide_render = blink
        parts.append(glint)

    # tiny smile: a short upturned stroke of dark clay
    bm = bmesh.new()
    half_w, dip, rad, n = 0.043, 0.015, 0.0075, 10
    rings = []
    for i in range(n + 1):
        t = -1 + 2 * i / n
        centre = Vector((t * half_w, 0, dip * (t * t - 1)))
        taper = 0.55 + 0.45 * (1 - t * t)
        ring = [bm.verts.new(centre + Vector((0, math.cos(a) * rad * taper,
                                              math.sin(a) * rad * taper)))
                for a in (math.radians(k * 60) for k in range(6))]
        rings.append(ring)
    for a, b in zip(rings, rings[1:]):
        for k in range(6):
            bm.faces.new((a[k], a[(k + 1) % 6], b[(k + 1) % 6], b[k]))
    bm.faces.new(rings[0])
    bm.faces.new(list(reversed(rings[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    smile = finish("Mouth", bm, coll, mats["mouth"])
    smile.matrix_world = surface_frame(bvh, mw, 0.0, 0.93, BODY_C, BODY_R, lift=0.002)
    parts.append(smile)
    if mouth != "smile":  # talking / surprised: a small dark oval instead of the stroke
        smile.hide_render = True
        size = (0.03, 0.012, 0.036) if mouth == "o" else (0.05, 0.014, 0.06)
        oval = blob("Mouth_Open", coll, mats["mouth"], size, subdiv=2, jitter=0.0, bevel=0.0)
        oval.modifiers.clear()
        oval.matrix_world = surface_frame(bvh, mw, 0.0, 0.92, BODY_C, BODY_R, lift=0.002)
        parts.append(oval)

    # ---- sprout: stem + two plump leaves
    sprout = bpy.data.objects.new("Avani_Sprout", None)
    link(sprout, coll)
    top_hit, *_ = bvh.ray_cast(mw.inverted() @ Vector((0, 0, 5)), Vector((0, 0, -1)))
    top_z = (mw @ top_hit).z
    sprout.location = (0.0, 0.02, top_z - 0.03)
    sprout.rotation_euler = (0, 0, math.radians(-24))
    parts.append(sprout)

    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=7, radius1=0.058, radius2=0.04,
                          depth=0.24)
    for v in bm.verts:
        v.co.z += 0.12
        v.co.x += 0.03 * (v.co.z / 0.24) ** 2  # slight lean
    stem = finish("Stem", bm, coll, mats["stem"])
    soft_facets(stem, width=0.008, segments=2)
    stem.parent = sprout
    parts.append(stem)

    def leaf_shape(p):
        # plump teardrop: rounded base, pointed tip, shallow fold along the midrib
        t = (p.x + 1) / 2
        w = 0.55 + 0.6 * math.sin(math.pi * min(max(t, 0.0), 1.0) ** 0.7)
        if p.x > 0.55:
            w *= 1.0 - 0.75 * ((p.x - 0.55) / 0.45) ** 1.5
        return Vector((p.x, p.y * w, p.z * w + 0.35 * abs(p.y)))

    for nm, sx, length, tilt, roll, seed in (("Leaf_R", -1, 0.24, 10, 26, 41),
                                             ("Leaf_L", 1, 0.20, 30, 22, 42)):
        leaf = blob(nm, coll, mats["leaf"], (length, 0.125, 0.058), subdiv=2,
                    jitter=0.05, seed=seed, shape=leaf_shape, bevel=0.014)
        leaf.parent = sprout
        tilt_r = math.radians(tilt)
        reach = length * 0.9
        leaf.location = (0.03 + sx * reach * math.cos(tilt_r), 0.0,
                         0.225 + reach * math.sin(tilt_r))
        # roll tips the upper face toward the hero camera
        leaf.rotation_euler = (math.radians(sx * roll), -tilt_r,
                               0 if sx > 0 else math.pi)
        parts.append(leaf)

    for o in parts:
        if o.parent is None:
            o.parent = root  # root sits at the origin, so transforms carry over
    return root, mats