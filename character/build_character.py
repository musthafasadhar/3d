"""
Sprout — the round orange root-vegetable clay character.

Builds the character, its set and lighting from scratch with Blender's Python
module (pip install bpy), so every render of every reel uses the exact same
model. Everything is seeded: running this twice gives the identical character.

Usage examples
  python3 build_character.py --render hero:hero:1080:1920:160
  python3 build_character.py --surface moss --render ref:ref:1642:1985:200
  python3 build_character.py --save-blend model/sprout.blend --export-glb model/sprout.glb

--render takes  name:view:width:height:samples  and may be repeated.
Views: hero, ref, front, threeq, side, back
"""
import argparse
import math
import os
import random

import bpy  # must come first: it registers bmesh and mathutils
import bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------------------------------
# Palette (sRGB hex) — change these and nothing else to recolour the character
# --------------------------------------------------------------------------
PALETTE = {
    "body": "#E4622A",
    "eye": "#140B08",
    "eye_glint": "#F6ECE4",
    "mouth": "#3A140C",
    "leaf": "#58AA46",
    "stem": "#74B552",
    "seat_blue": "#2C5FB4",
    "seat_moss": "#A9A93E",
    "rock_bg": "#2B3F63",
    "ground": "#1B2A47",
}

# Character faces -Y, Z is up, and it sits with its base at z = 0.
BODY_C = Vector((0.0, 0.0, 1.01))
BODY_R = Vector((0.87, 0.82, 1.03))
HERO_YAW = math.radians(37.0)  # camera swings toward the character's right


def srgb(hexstr, alpha=1.0):
    h = hexstr.lstrip("#")
    out = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        out.append(c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4)
    return (*out, alpha)


# --------------------------------------------------------------------------
# Materials
# --------------------------------------------------------------------------
def clay(name, hexcol, rough=0.62, sss=0.18, bump=0.035, sheen=0.25, variation=0.06):
    """Matte modelling-clay: soft subsurface, faint fingerprint-scale bump."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    col = srgb(hexcol)

    tex = nt.nodes.new("ShaderNodeTexCoord")
    big = nt.nodes.new("ShaderNodeTexNoise")
    big.inputs["Scale"].default_value = 2.2
    big.inputs["Detail"].default_value = 3.0
    nt.links.new(tex.outputs["Object"], big.inputs["Vector"])

    # gentle hue/value drift so large faces are not a dead flat colour
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.blend_type = "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.3
    ramp.inputs["From Max"].default_value = 0.7
    ramp.inputs["To Min"].default_value = 1.0 - variation * 2
    ramp.inputs["To Max"].default_value = 1.0
    nt.links.new(big.outputs["Factor" if "Factor" in big.outputs else "Fac"], ramp.inputs["Value"])
    mix.inputs["A"].default_value = col
    nt.links.new(ramp.outputs["Result"], mix.inputs["B"])
    nt.links.new(mix.outputs["Result"], b.inputs["Base Color"])

    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 55.0
    fine.inputs["Detail"].default_value = 6.0
    fine.inputs["Roughness"].default_value = 0.65
    nt.links.new(tex.outputs["Object"], fine.inputs["Vector"])
    bmp = nt.nodes.new("ShaderNodeBump")
    bmp.inputs["Strength"].default_value = bump
    bmp.inputs["Distance"].default_value = 0.02
    nt.links.new(fine.outputs["Factor" if "Factor" in fine.outputs else "Fac"], bmp.inputs["Height"])
    nt.links.new(bmp.outputs["Normal"], b.inputs["Normal"])

    b.inputs["Roughness"].default_value = rough
    b.inputs["Subsurface Weight"].default_value = sss
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.18)
    b.inputs["Subsurface Scale"].default_value = 0.12
    b.inputs["Sheen Weight"].default_value = sheen
    b.inputs["Sheen Roughness"].default_value = 0.6
    b.inputs["Specular IOR Level"].default_value = 0.35
    return m


def emissive(name, rgb, strength):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Emission Color"].default_value = (*rgb, 1)
    b.inputs["Emission Strength"].default_value = strength
    return m


# --------------------------------------------------------------------------
# Mesh helpers
# --------------------------------------------------------------------------
def link(obj, coll):
    coll.objects.link(obj)
    return obj


def finish(name, bm, coll, mat, smooth=True):
    mesh = bpy.data.meshes.new(name)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    link(obj, coll)
    mesh.materials.append(mat)
    if smooth:
        for p in mesh.polygons:
            p.use_smooth = True
    return obj


def soft_facets(obj, width=0.03, segments=3, decimate=None):
    """Low-poly facets with rounded, thumb-smoothed edges (the clay look)."""
    if decimate:
        d = obj.modifiers.new("Decimate", "DECIMATE")
        d.ratio = decimate
    bv = obj.modifiers.new("Bevel", "BEVEL")
    bv.width = width
    bv.segments = segments
    bv.limit_method = "NONE"
    bv.harden_normals = False
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = False
    wn.weight = 80
    return obj


def blob(name, coll, mat, scale, subdiv=2, square=1.0, jitter=0.03, seed=0,
         shape=None, bevel=0.03, decimate=None):
    """Jittered, optionally squared-off ellipsoid."""
    rng = random.Random(seed)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdiv, radius=1.0)
    for v in bm.verts:
        p = v.co.normalized()
        p = Vector([math.copysign(abs(c) ** square, c) for c in p])
        if shape:
            p = shape(p)
        p = Vector((p.x * scale[0], p.y * scale[1], p.z * scale[2]))
        j = jitter * min(scale)
        p += Vector((rng.uniform(-j, j), rng.uniform(-j, j), rng.uniform(-j, j)))
        v.co = p
    obj = finish(name, bm, coll, mat)
    return soft_facets(obj, width=bevel, decimate=decimate)


def rounded_tablet(name, coll, mat, half_w, half_h, corner, depth, bevel=0.012):
    """Rounded-rectangle slab in local XZ, front face at local -Y."""
    bm = bmesh.new()
    pts = []
    seg = 8
    for cx, cz, a0 in ((half_w - corner, half_h - corner, 0),
                       (-half_w + corner, half_h - corner, 90),
                       (-half_w + corner, -half_h + corner, 180),
                       (half_w - corner, -half_h + corner, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + corner * math.cos(a), cz + corner * math.sin(a)))
    back = [bm.verts.new((x, 0.0, z)) for x, z in pts]
    front = [bm.verts.new((x, -depth, z)) for x, z in pts]
    bm.faces.new(back)
    bm.faces.new(list(reversed(front)))
    n = len(pts)
    for i in range(n):
        bm.faces.new((back[i], front[i], front[(i + 1) % n], back[(i + 1) % n]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = finish(name, bm, coll, mat)
    bv = obj.modifiers.new("Bevel", "BEVEL")
    bv.width = bevel
    bv.segments = 4
    bv.limit_method = "ANGLE"
    bv.angle_limit = math.radians(50)
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = False
    return obj


def bvh_of(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    return BVHTree.FromObject(obj, dg), obj.matrix_world.copy()


def surface_frame(bvh, mw, yaw, z, lift=0.0, pitch_bias=1.0):
    """World matrix sitting on the body's front surface at a given yaw/height.

    Local -Y points out of the body, local Z stays as upright as possible.
    Orientation follows the smooth underlying egg, not the individual facet.
    """
    inv = mw.inverted()
    target = Vector((0.0, 0.0, z))
    direction = Vector((math.sin(yaw), -math.cos(yaw), 0.0))
    origin = target + direction * 5.0
    hit, _n, _i, _d = bvh.ray_cast(inv @ origin, (inv.to_3x3() @ -direction).normalized())
    hit = mw @ hit
    rel = hit - BODY_C
    n = Vector((rel.x / BODY_R.x ** 2, rel.y / BODY_R.y ** 2,
                pitch_bias * rel.z / BODY_R.z ** 2)).normalized()
    y_ax = -n
    x_ax = y_ax.cross(Vector((0, 0, 1))).normalized()
    z_ax = x_ax.cross(y_ax).normalized()
    rot = Matrix((x_ax, y_ax, z_ax)).transposed().to_4x4()
    return Matrix.Translation(hit + n * lift) @ rot


# --------------------------------------------------------------------------
# Character
# --------------------------------------------------------------------------
def build_character(coll):
    mats = {
        "body": clay("Clay_Orange", PALETTE["body"]),
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

    root = bpy.data.objects.new("Sprout", None)
    link(root, coll)
    parts = []

    # ---- body: tall egg, a little heavier at the bottom, flattened crown
    def egg(p):
        r = 1.0 + 0.075 * (-p.z)
        return Vector((p.x * r, p.y * r, p.z))

    body = blob("Body", coll, mats["body"], BODY_R, subdiv=3, square=0.85,
                jitter=0.028, seed=11, shape=egg, bevel=0.07, decimate=0.46)
    body.location = BODY_C
    parts.append(body)

    # ---- legs: stubby logs pointing forward, resting on the seat
    for side, sx in (("L", 1), ("R", -1)):
        def log(p):
            return Vector((p.x, math.copysign(abs(p.y) ** 0.42, p.y), p.z))
        leg = blob(f"Leg_{side}", coll, mats["body"], (0.235, 0.40, 0.225), subdiv=2,
                   jitter=0.04, seed=21 + sx, shape=log, bevel=0.04)
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
        eye = rounded_tablet(f"Eye_{side}", coll, mats["eye"], 0.105, 0.25, 0.052, 0.07)
        eye.matrix_world = surface_frame(bvh, mw, sx * eye_yaw, eye_z, lift=-0.04,
                                         pitch_bias=0.55)
        parts.append(eye)
        glint = rounded_tablet(f"Glint_{side}", coll, mats["glint"], 0.035, 0.07, 0.033,
                               0.016, bevel=0.006)
        glint.parent = eye
        glint.location = (0.004, -0.063, 0.118)
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
    mouth = finish("Mouth", bm, coll, mats["mouth"])
    mouth.matrix_world = surface_frame(bvh, mw, 0.0, 0.93, lift=0.002)
    parts.append(mouth)

    # ---- sprout: stem + two plump leaves
    sprout = bpy.data.objects.new("Sprout_Top", None)
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


# --------------------------------------------------------------------------
# Set, lights, camera
# --------------------------------------------------------------------------
def build_set(coll, surface, extras, body_mat):
    seat_hex = PALETTE["seat_blue"] if surface == "blue" else PALETTE["seat_moss"]
    seat_mat = clay("Clay_Seat", seat_hex, rough=0.9, sss=0.0, bump=0.05, sheen=0.0)
    seat_mat.node_tree.nodes["Principled BSDF"].inputs["Specular IOR Level"].default_value = 0.12
    rock_mat = clay("Clay_Rock", PALETTE["rock_bg"], rough=0.8, sss=0.0, bump=0.05)
    ground_mat = clay("Clay_Ground", PALETTE["ground"], rough=0.85, sss=0.0, bump=0.04)

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
                     jitter=0.028, seed=12, bevel=0.07, decimate=0.46)
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


def area_light(coll, name, pos, target, colour, power, size):
    data = bpy.data.lights.new(name, "AREA")
    data.color = colour
    data.energy = power
    data.size = size
    obj = bpy.data.objects.new(name, data)
    link(obj, coll)
    obj.location = pos
    obj.rotation_euler = (Vector(target) - Vector(pos)).to_track_quat("-Z", "Y").to_euler()
    return obj


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


def configure_render(w, h, samples):
    s = bpy.context.scene
    s.render.engine = "CYCLES"
    s.cycles.device = "CPU"
    s.cycles.samples = samples
    s.cycles.use_adaptive_sampling = True
    s.cycles.adaptive_threshold = 0.015
    s.cycles.use_denoising = True
    try:
        s.cycles.denoiser = "OPENIMAGEDENOISE"
    except TypeError:
        pass
    s.cycles.max_bounces = 6
    s.cycles.caustics_reflective = False
    s.cycles.caustics_refractive = False
    s.render.resolution_x = w
    s.render.resolution_y = h
    s.render.resolution_percentage = 100
    s.render.threads_mode = "AUTO"
    s.render.image_settings.file_format = "PNG"
    s.render.image_settings.color_mode = "RGB"
    s.view_settings.view_transform = "AgX"
    for look in ("AgX - Punchy", "Punchy"):
        try:
            s.view_settings.look = look
            break
        except TypeError:
            continue
    s.view_settings.exposure = 0.0


def add_glow():
    """Soft bloom so highlights and dust motes breathe, like the reference."""
    s = bpy.context.scene
    try:
        tree = bpy.data.node_groups.new("Glow", "CompositorNodeTree")
        tree.interface.new_socket("Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        rl = tree.nodes.new("CompositorNodeRLayers")
        glare = tree.nodes.new("CompositorNodeGlare")
        out = tree.nodes.new("NodeGroupOutput")
        glare.inputs["Type"].default_value = "Bloom"
        glare.inputs["Threshold"].default_value = 1.0
        glare.inputs["Strength"].default_value = 0.35
        glare.inputs["Size"].default_value = 0.55
        tree.links.new(rl.outputs["Image"], glare.inputs["Image"])
        tree.links.new(glare.outputs["Image"], out.inputs["Image"])
        s.render.compositor_device = "CPU"  # no GPU needed on render boxes
        s.compositing_node_group = tree
        s.render.use_compositing = True
    except Exception as exc:  # compositor API differs between Blender versions
        print("glow skipped:", exc)


def build(surface="blue", view="hero", extras=True):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    char_coll = bpy.data.collections.new("Character")
    set_coll = bpy.data.collections.new("Set")
    rig_coll = bpy.data.collections.new("Rig")
    for c in (char_coll, set_coll, rig_coll):
        scene.collection.children.link(c)
    root, mats = build_character(char_coll)
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
