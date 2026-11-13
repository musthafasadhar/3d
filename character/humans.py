"""Clay humans for the reels: the Doctor and the Patient.

Both face -Y with their feet at z = 0. Each builder returns a root empty; move,
turn or scale it to place the character. `<Name>_Head` is a pivot at the neck
for head turns and tilts. Everything is seeded, so the models never change.

    mouth: "smile" | "neutral" | "open" (mid-word) | "wide" (surprised)
    blink: True shuts the eyes
"""
import math
import random

import bpy
import bmesh
from mathutils import Matrix, Vector

from claykit import (adopt, band, blob, box, bvh_of, capsule, clay, decal, finish, front_y,
                     link, ring, soft_facets, stroke, surface_frame)


class Rig:
    """Collects a character's parts under one root."""

    def __init__(self, name, coll):
        self.name, self.coll = name, coll
        self.root = link(bpy.data.objects.new(name, None), coll)
        self.parts = []
        self.mats = {}

    def n(self, part):
        return f"{self.name}_{part}"

    def mat(self, key, hexcol, **kw):
        if key not in self.mats:
            self.mats[key] = clay(self.n("Clay_" + key), hexcol, **kw)
        return self.mats[key]

    def add(self, obj, parent=None):
        if parent is not None:
            adopt(obj, parent)
        self.parts.append(obj)
        return obj

    def close(self):
        for o in self.parts:
            if o.parent is None:
                o.parent = self.root
        return self.root


def _metal(name, hexcol):
    m = clay(name, hexcol, rough=0.32, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    m.node_tree.nodes["Principled BSDF"].inputs["Metallic"].default_value = 0.85
    return m


def _smooth_blob(rig, name, mat, scale):
    o = blob(rig.n(name), rig.coll, mat, scale, subdiv=3, jitter=0.0, bevel=0.0)
    o.modifiers.clear()
    return o


def _place(obj, matrix, local=None):
    obj.matrix_world = matrix @ (local if local is not None else Matrix.Identity(4))
    return obj


# --------------------------------------------------------------------------
# Head and face
# --------------------------------------------------------------------------
def _head(rig, centre, radii, skin, seed):
    centre, radii = Vector(centre), Vector(radii)
    pivot = link(bpy.data.objects.new(rig.n("Head"), None), rig.coll)
    pivot.location = (0, 0, centre.z - radii.z * 0.92)
    rig.parts.append(pivot)

    def skull(p):  # a little narrower at the jaw, fuller at the cheeks
        r = 1.0 + 0.06 * p.z - 0.05 * max(0.0, -p.z - 0.45)
        return Vector((p.x * r, p.y * r, p.z))

    head = blob(rig.n("Skull"), rig.coll, skin, radii, subdiv=3, square=0.9, jitter=0.018,
                seed=seed, shape=skull, bevel=0.03, decimate=0.5)
    head.location = centre
    rig.add(head, pivot)
    for side, sx in (("L", 1), ("R", -1)):
        ear = blob(rig.n("Ear_" + side), rig.coll, skin, (0.075, 0.115, 0.16), subdiv=2,
                   jitter=0.03, seed=seed + sx, bevel=0.02)
        ear.location = (sx * (radii.x - 0.015), 0.06, centre.z - 0.1)
        ear.rotation_euler = (0, 0, math.radians(sx * -18))
        rig.add(ear, pivot)
    return head, pivot


def _face(rig, head, pivot, centre, radii, mouth, blink, eye_yaw=20.0, eye_dz=-0.02,
          eye_size=(0.056, 0.03, 0.084), brow_dz=0.25, brow_tilt=7.0, nose_dz=-0.17,
          mouth_dz=-0.37, mouth_w=0.07, glasses=0.25, rim=0.013, nose_col="#E2794E",
          brow_col="#3A2823"):
    centre, radii = Vector(centre), Vector(radii)
    bvh, mw = bvh_of(head)
    dark = rig.mat("Eye", "#17100E", rough=0.28, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    brow_m = rig.mat("Brow", brow_col, rough=0.6, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    lip = rig.mat("Mouth", "#6B2F28", rough=0.55, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    nose_m = rig.mat("Nose", nose_col, rough=0.6, sss=0.25, bump=0.0)

    def on(yaw_deg, dz, lift=0.0, pitch=0.6):
        return surface_frame(bvh, mw, math.radians(yaw_deg), centre.z + dz, centre, radii,
                             lift=lift, pitch_bias=pitch)

    for side, sx in (("L", 1), ("R", -1)):
        eye = _smooth_blob(rig, "Eye_" + side, dark, eye_size)
        _place(eye, on(sx * eye_yaw, eye_dz, lift=-0.004))
        if blink:
            eye.scale = (1.15, 1.0, 0.14)
        rig.add(eye, pivot)
        brow = stroke(rig.n("Brow_" + side), rig.coll, brow_m,
                      [(-0.075, 0, 0), (0, 0, 0.014), (0.075, 0, 0)], 0.014, smooth=4, taper=0.55)
        _place(brow, on(sx * eye_yaw, eye_dz + brow_dz, lift=0.004),
               Matrix.Rotation(math.radians(sx * -brow_tilt), 4, "Y"))
        rig.add(brow, pivot)

    # nose: a small faceted wedge, a shade warmer than the skin
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=3, radius1=0.085, radius2=0.02,
                          depth=0.15)
    nose = finish(rig.n("Nose"), bm, rig.coll, nose_m)
    soft_facets(nose, width=0.01, segments=2)
    _place(nose, on(0, nose_dz, lift=0.02),
           Matrix.Rotation(math.radians(90), 4, "X") @ Matrix.Rotation(math.radians(-90), 4, "Z"))
    rig.add(nose, pivot)

    # mouth
    if mouth in ("smile", "neutral"):
        dip = 0.022 if mouth == "smile" else 0.002
        pts = [(t * mouth_w, 0, dip * (t * t - 1)) for t in (-1, -0.5, 0, 0.5, 1)]
        m = stroke(rig.n("Mouth"), rig.coll, lip, pts, 0.011, smooth=3, taper=0.5)
        _place(m, on(0, mouth_dz, lift=0.003))
    else:
        size = (0.05, 0.014, 0.036) if mouth == "open" else (0.062, 0.016, 0.07)
        m = _smooth_blob(rig, "Mouth", lip, size)
        _place(m, on(0, mouth_dz - 0.01, lift=0.0))
    rig.add(m, pivot)

    if not glasses:
        return
    frame = rig.mat("Frames", "#1F1E26", rough=0.35, sss=0.0, bump=0.0, sheen=0.0,
                    variation=0.0)
    centres = {}
    for side, sx in (("L", 1), ("R", -1)):
        hit = on(sx * eye_yaw, eye_dz - 0.01).translation
        pos = Vector((hit.x * 1.02, hit.y - 0.115, hit.z))
        centres[sx] = pos
        r = ring(rig.n("Rim_" + side), rig.coll, frame, glasses, rim)
        _place(r, Matrix.Translation(pos) @ Matrix.Rotation(math.radians(sx * 7), 4, "Z"))
        rig.add(r, pivot)
        # temple arm back to the ear
        outer = pos + Vector((sx * glasses, 0.01, 0.03))
        ear = Vector((sx * (radii.x + 0.01), 0.02, centre.z + 0.02))
        mid = (outer + ear) / 2 + Vector((sx * 0.05, 0, 0))
        rig.add(stroke(rig.n("Temple_" + side), rig.coll, frame, [outer, mid, ear], rim,
                       smooth=4), pivot)
    a = centres[-1] + Vector((glasses, 0, 0.05))
    b = centres[1] + Vector((-glasses, 0, 0.05))
    rig.add(stroke(rig.n("Bridge"), rig.coll, frame,
                   [a, (a + b) / 2 + Vector((0, -0.02, 0.035)), b], rim, smooth=4), pivot)


def _hair_cap(rig, pivot, mat, centre, radii, grow, shift, front_dz, back_dz, seed,
              bevel=0.04, decimate=0.5):
    """A thick cap of hair: an enlarged skull cut along a slanted hairline."""
    centre, radii = Vector(centre), Vector(radii)
    scale = (radii.x * grow[0], radii.y * grow[1], radii.z * grow[2])
    cap = blob(rig.n("Hair_Cap"), rig.coll, mat, scale, subdiv=3, square=0.9, jitter=0.03,
               seed=seed, bevel=bevel, decimate=decimate)
    cap.location = centre + Vector(shift)
    bm = bmesh.new()
    bm.from_mesh(cap.data)
    # front_dz / back_dz: hairline height relative to the head centre, at the brow and nape
    slope = (front_dz - back_dz) / (2 * scale[1])
    p0 = Vector((0, -scale[1], front_dz - shift[2]))
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                                 plane_co=p0, plane_no=Vector((0, slope, 1)).normalized(),
                                 clear_inner=True)
    cut = [e for e in res["geom_cut"] if isinstance(e, bmesh.types.BMEdge)]
    if cut:
        bmesh.ops.edgeloop_fill(bm, edges=cut)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(cap.data)
    bm.free()
    for p in cap.data.polygons:
        p.use_smooth = True
    return rig.add(cap, pivot)


def _lock(rig, pivot, mat, name, scale, loc, rot_deg, seed, bevel=0.025):
    o = blob(rig.n(name), rig.coll, mat, scale, subdiv=2, square=0.92, jitter=0.07, seed=seed,
             bevel=bevel)
    o.location = loc
    o.rotation_euler = [math.radians(a) for a in rot_deg]
    return rig.add(o, pivot)


# --------------------------------------------------------------------------
# Body parts
# --------------------------------------------------------------------------
def _arm(rig, side, shoulder, elbow, wrist, sleeve, skin, r=(0.2, 0.175, 0.155), hand=True,
         seed=0):
    rig.add(capsule(rig.n(f"UpperArm_{side}"), rig.coll, sleeve, shoulder, elbow, r[0], r[1],
                    seed=seed))
    rig.add(capsule(rig.n(f"Forearm_{side}"), rig.coll, sleeve, elbow, wrist, r[1], r[2],
                    seed=seed + 1))
    cap = blob(rig.n(f"Shoulder_{side}"), rig.coll, sleeve, (r[0] * 1.12,) * 3, subdiv=2,
               jitter=0.03, seed=seed + 3, bevel=0.02)
    cap.location = Vector(shoulder) + Vector((0, 0, -0.02))
    rig.add(cap)
    if hand:
        d = (Vector(wrist) - Vector(elbow)).normalized()
        h = blob(rig.n(f"Hand_{side}"), rig.coll, skin, (0.135, 0.135, 0.165), subdiv=2,
                 jitter=0.04, seed=seed + 2, bevel=0.02)
        h.matrix_world = (Matrix.Translation(Vector(wrist) + d * 0.13)
                          @ d.to_track_quat("Z", "Y").to_matrix().to_4x4())
        rig.add(h)


def _legs(rig, mat, hip_z, ankle_z, x, r, shoe_mat, shoe, seed):
    for side, sx in (("L", 1), ("R", -1)):
        rig.add(capsule(rig.n("Leg_" + side), rig.coll, mat, (sx * x, 0, hip_z),
                        (sx * x, 0, ankle_z), r[0], r[1], seed=seed + sx))
        s = blob(rig.n("Shoe_" + side), rig.coll, shoe_mat, shoe, subdiv=2, square=0.75,
                 jitter=0.03, seed=seed + 5 + sx, bevel=0.03)
        s.location = (sx * (x + 0.01), -shoe[1] * 0.32, shoe[2] * 0.95)
        s.rotation_euler = (0, 0, math.radians(sx * 7))
        rig.add(s)


def _mirror(outline):
    return [(-u, z) for u, z in reversed(outline)]


# --------------------------------------------------------------------------
# Doctor
# --------------------------------------------------------------------------
def build_doctor(coll, mouth="smile", blink=False, clipboard=True):
    """Dr — dark hair in a high messy bun, big round glasses, white coat over navy
    scrubs, stethoscope round her neck, clipboard in her left hand. 5.9 units tall
    to the top of the bun."""
    rig = Rig("Doctor", coll)
    skin = rig.mat("Skin", "#F0B28A", sss=0.3)
    hair = rig.mat("Hair", "#33221E", rough=0.72, sss=0.03, sheen=0.08)
    coat_m = rig.mat("Coat", "#E9E5DD", rough=0.75, sss=0.1, sheen=0.1, variation=0.04)
    navy = rig.mat("Scrubs", "#232C50", rough=0.74, sss=0.03, sheen=0.06)
    shoe_m = rig.mat("Shoes", "#1C2036", rough=0.6, sss=0.0, sheen=0.05)

    C, R = Vector((0, 0, 4.42)), Vector((0.80, 0.76, 0.82))
    head, pivot = _head(rig, C, R, skin, seed=201)
    _face(rig, head, pivot, C, R, mouth, blink, glasses=0.255)

    # hair: cap, a side-swept fringe, two locks in front of the ears, bun on top
    _hair_cap(rig, pivot, hair, C, R, grow=(1.07, 1.1, 1.06), shift=(0, 0.07, 0.07),
              front_dz=0.44, back_dz=-0.62, seed=210)
    _lock(rig, pivot, hair, "Fringe_R", (0.62, 0.17, 0.21), (-0.24, -0.535, C.z + 0.50),
          (24, -17, 14), 211)
    _lock(rig, pivot, hair, "Fringe_L", (0.34, 0.15, 0.17), (0.50, -0.46, C.z + 0.47),
          (20, 32, -28), 212)
    _lock(rig, pivot, hair, "Lock_R", (0.09, 0.13, 0.46), (-0.735, -0.36, C.z - 0.10),
          (0, -5, 10), 213, bevel=0.02)
    _lock(rig, pivot, hair, "Lock_L", (0.085, 0.12, 0.40), (0.735, -0.34, C.z - 0.05),
          (0, 5, -10), 214, bevel=0.02)
    bun_c = Vector((0.0, 0.2, C.z + R.z + 0.24))
    _lock(rig, pivot, hair, "Bun", (0.56, 0.52, 0.46), bun_c, (0, 0, 0), 215, bevel=0.035)
    rng = random.Random(216)
    for i in range(4):
        a = rng.uniform(0, 6.28)
        d = Vector((math.cos(a) * 0.38, math.sin(a) * 0.34, rng.uniform(-0.05, 0.24)))
        _lock(rig, pivot, hair, f"BunLump_{i}", (0.24, 0.22, 0.2), bun_c + d,
              (rng.uniform(-30, 30), rng.uniform(-30, 30), 0), 217 + i)
    for i in range(5):  # stray wisps
        a = rng.uniform(0, 6.28)
        d = Vector((math.cos(a), math.sin(a) * 0.8, rng.uniform(0.2, 0.9))).normalized()
        base = bun_c + d * 0.42
        rig.add(stroke(rig.n(f"Wisp_{i}"), rig.coll, hair,
                       [base, base + d * 0.14 + Vector((0, 0, 0.03)), base + d * 0.24], 0.03,
                       smooth=3, taper=0.8), pivot)

    rig.add(capsule(rig.n("Neck"), rig.coll, skin, (0, 0, 3.42), (0, 0, 3.72), 0.2, 0.19))

    # coat doubles as the torso; the scrubs show through a strip down the front
    def a_line(p):
        r = 1.0 + 0.13 * (-p.z)  # narrow sloping shoulders, fuller hem
        return Vector((p.x * r, p.y * (1.0 + 0.05 * (-p.z)), p.z))

    coat = blob(rig.n("Coat"), rig.coll, coat_m, (0.66, 0.45, 1.18), subdiv=3, square=0.62,
                jitter=0.03, seed=220, shape=a_line, bevel=0.03, decimate=0.5)
    coat.location = (0, 0, 2.40)
    rig.add(coat)
    strip = [(-0.2, 3.56), (0.2, 3.56), (0.07, 2.72), (0.11, 1.24), (-0.11, 1.24),
             (-0.07, 2.72)]
    rig.add(decal(rig.n("Scrubs_Front"), rig.coll, navy, strip, coat, stand=0.014,
                  thickness=0.03, cuts=5))
    rig.add(decal(rig.n("Neckline"), rig.coll, skin, [(-0.13, 3.58), (0.13, 3.58), (0, 3.30)],
                  coat, stand=0.024, thickness=0.02, cuts=3))
    lapel = [(0.19, 3.57), (0.36, 3.5), (0.23, 2.98), (0.07, 2.70)]
    pocket = [(0.22, 1.96), (0.62, 1.96), (0.62, 1.52), (0.22, 1.52)]
    for side, shape in (("L", lambda o: o), ("R", _mirror)):
        rig.add(decal(rig.n("Lapel_" + side), rig.coll, coat_m, shape(lapel), coat,
                      stand=0.045, thickness=0.05, cuts=3))
        rig.add(decal(rig.n("Pocket_" + side), rig.coll, coat_m, shape(pocket), coat,
                      stand=0.03, thickness=0.035, cuts=3))
    btn = rig.mat("Button", "#CFCBC2", rough=0.5, sss=0.0, bump=0.0, variation=0.0)
    for i, z in enumerate((2.52, 2.2, 1.88)):
        disc = [(0.18 + 0.034 * math.cos(a), z + 0.034 * math.sin(a))
                for a in (2 * math.pi * k / 8 for k in range(8))]
        rig.add(decal(rig.n(f"Button_{i}"), rig.coll, btn, disc, coat, stand=0.035,
                      thickness=0.03, cuts=0))

    _legs(rig, navy, 1.55, 0.22, 0.27, (0.25, 0.2), shoe_m, (0.2, 0.36, 0.15), seed=230)

    # arms: her right hangs relaxed, her left is raised to hold the clipboard
    arm_r = (0.175, 0.155, 0.135)
    _arm(rig, "R", (-0.55, 0, 3.26), (-0.76, -0.02, 2.58), (-0.78, -0.14, 1.98), coat_m, skin,
         r=arm_r, seed=240)
    if clipboard:
        _arm(rig, "L", (0.55, 0, 3.26), (0.78, -0.04, 2.58), (0.62, -0.60, 2.42), coat_m, skin,
             r=arm_r, seed=244)
        wood = rig.mat("Clipboard", "#A9734E", rough=0.6, sss=0.05)
        paper = rig.mat("Paper", "#F4F1EA", rough=0.8, sss=0.0, bump=0.0, variation=0.0)
        steel = _metal(rig.n("Clay_Steel"), "#B9BDC6")
        board = box(rig.n("Clipboard"), rig.coll, wood, (0.27, 0.014, 0.37), bevel=0.012)
        board.location = (0.42, -0.86, 2.60)
        board.rotation_euler = (math.radians(-58), math.radians(8), math.radians(-28))
        rig.add(board)
        sheet = box(rig.n("Clipboard_Paper"), rig.coll, paper, (0.235, 0.006, 0.33), bevel=0.004)
        sheet.parent, sheet.location = board, (0, -0.02, -0.02)
        clip = box(rig.n("Clipboard_Clip"), rig.coll, steel, (0.1, 0.02, 0.045), bevel=0.01)
        clip.parent, clip.location = board, (0, -0.03, 0.335)
        rig.parts += [sheet, clip]
    else:
        _arm(rig, "L", (0.55, 0, 3.26), (0.76, -0.02, 2.58), (0.78, -0.14, 1.98), coat_m, skin,
             r=arm_r, seed=244)

    # stethoscope: round the back of the neck, down both sides of the chest
    tube_m = rig.mat("Steth", "#262E4C", rough=0.4, sss=0.0, bump=0.0, sheen=0.0, variation=0.0)
    steel = _metal(rig.n("Clay_Chrome"), "#C3C7CF")
    bvh, mw = bvh_of(coat)

    def chest(x, z, out=0.045):
        p = front_y(bvh, mw, x, z)
        return Vector((p.x, p.y - out, p.z))

    path = [chest(-0.30, 2.70), chest(-0.335, 3.05), chest(-0.33, 3.38),
            Vector((-0.30, -0.10, 3.60)), Vector((-0.20, 0.22, 3.62)),
            Vector((0.20, 0.22, 3.62)), Vector((0.30, -0.10, 3.60)),
            chest(0.33, 3.38), chest(0.345, 3.05), chest(0.37, 2.66)]
    rig.add(stroke(rig.n("Steth_Tube"), rig.coll, tube_m, path, 0.03, sides=8, smooth=6))
    end = path[-1]
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.095, radius2=0.085,
                          depth=0.05)
    piece = finish(rig.n("Steth_Chest"), bm, rig.coll, steel)
    piece.location = end + Vector((0.01, -0.01, -0.09))
    piece.rotation_euler = (math.radians(90), 0, 0)
    rig.add(piece)
    fork = path[0]
    for i, dx in enumerate((-0.085, 0.085)):
        tip = fork + Vector((dx, -0.005, -0.2))
        rig.add(stroke(rig.n(f"Steth_Ear_{i}"), rig.coll, steel,
                       [fork, fork + Vector((dx * 0.7, 0, -0.08)), tip], 0.018, smooth=4))
        bud = _smooth_blob(rig, f"Steth_Tip_{i}", tube_m, (0.03, 0.03, 0.035))
        bud.location = tip
        rig.add(bud)
    return rig.close()


# --------------------------------------------------------------------------
# Patient
# --------------------------------------------------------------------------
def build_patient(coll, mouth="neutral", blink=False, bags=True):
    """The patient — big wavy dark hair, round glasses, black jacket over a white
    hoodie, black cargo trousers, chunky white trainers, navy mail bag on a
    cross-body strap. 4.7 units tall to the top of the hair."""
    rig = Rig("Patient", coll)
    skin = rig.mat("Skin", "#F4B78F", sss=0.3)
    hair = rig.mat("Hair", "#261A1D", rough=0.72, sss=0.03, sheen=0.08)
    black = rig.mat("Jacket", "#201F28", rough=0.78, sss=0.02, sheen=0.06)
    pants = rig.mat("Cargo", "#22212A", rough=0.8, sss=0.02, sheen=0.06)
    white = rig.mat("Hoodie", "#EFE9DE", rough=0.75, sss=0.12, variation=0.03)
    shoe_m = rig.mat("Trainers", "#F2EEE7", rough=0.6, sss=0.1, variation=0.02)
    bag_m = rig.mat("Bag", "#24335C", rough=0.72, sss=0.02, sheen=0.06)

    C, R = Vector((0, 0, 3.42)), Vector((0.86, 0.82, 0.86))
    head, pivot = _head(rig, C, R, skin, seed=301)
    _face(rig, head, pivot, C, R, mouth, blink, eye_yaw=19.0, eye_dz=-0.08, brow_dz=0.24,
          brow_tilt=3.0, nose_dz=-0.22, mouth_dz=-0.40, mouth_w=0.05, glasses=0.275,
          rim=0.012, nose_col="#EC9A72", brow_col="#2A1C1F")

    # hair: a full cap, then thick wavy locks combed outward from the crown, and a
    # fringe that falls to the top of the glasses
    HC = C + Vector((0, 0.05, 0.1))
    _hair_cap(rig, pivot, hair, C, R, grow=(1.12, 1.13, 1.12), shift=(0, 0.05, 0.1),
              front_dz=0.40, back_dz=-0.5, seed=310)
    rng = random.Random(311)

    def flow_lock(name, polar, az, size, seed, out=1.13, twist=0.0, droop=0.0):
        n = Vector((math.sin(polar) * math.sin(az), -math.sin(polar) * math.cos(az),
                    math.cos(polar)))
        flow = Vector((0, 0, -1)) + n * n.z  # downhill, away from the crown
        flow = flow.normalized() if flow.length > 0.05 else Vector((0, -1, 0))
        flow = (Matrix.Rotation(twist, 3, n) @ flow - n * droop).normalized()
        side = n.cross(flow).normalized()
        up = flow.cross(side).normalized()
        o = blob(rig.n(name), rig.coll, hair, size, subdiv=2, square=0.92, jitter=0.08,
                 seed=seed, bevel=0.03)
        pos = HC + Vector((n.x * R.x, n.y * R.y, n.z * R.z)) * out
        o.matrix_world = Matrix.Translation(pos) @ Matrix((flow, side, up)).transposed().to_4x4()
        return rig.add(o, pivot)

    k = 0
    for polar_deg, count in ((18, 5), (44, 9), (70, 11)):
        for c in range(count):
            az = 2 * math.pi * (c + 0.5 * (polar_deg > 30) + rng.uniform(-0.15, 0.15)) / count
            az = (az + math.pi) % (2 * math.pi) - math.pi
            if polar_deg > 60 and abs(az) < math.radians(112):
                continue  # the face and the ears
            k += 1
            flow_lock(f"Lock_{k}", math.radians(polar_deg + rng.uniform(-5, 5)), az,
                      (rng.uniform(0.34, 0.44), rng.uniform(0.2, 0.26), rng.uniform(0.16, 0.21)),
                      320 + k, out=1.2 if polar_deg < 60 else 1.13,
                      twist=math.radians(rng.uniform(-28, 28)))
    for t in range(7):  # tufts that flick up out of the mop
        flow_lock(f"Tuft_{t}", math.radians(rng.uniform(8, 50)), rng.uniform(-math.pi, math.pi),
                  (0.24, 0.13, 0.12), 380 + t, out=1.3, twist=math.radians(rng.uniform(-60, 60)),
                  droop=-0.55)
    for j, (az_deg, twist, length) in enumerate(((-58, -30, 0.3), (-34, -22, 0.36), (-10, -12, 0.38),
                                                (14, 16, 0.37), (38, 24, 0.34), (60, 32, 0.28))):
        flow_lock(f"Fringe_{j}", math.radians(57), math.radians(az_deg),
                  (length, 0.19, 0.13), 360 + j, out=1.07, twist=math.radians(twist), droop=0.12)

    rig.add(capsule(rig.n("Neck"), rig.coll, skin, (0, 0, 2.42), (0, 0, 2.66), 0.2, 0.19))

    hoodie = blob(rig.n("Hoodie"), rig.coll, white, (0.58, 0.40, 0.62), subdiv=3, square=0.62,
                  jitter=0.02, seed=330, bevel=0.03, decimate=0.55)
    hoodie.location = (0, 0, 1.96)
    rig.add(hoodie)
    jacket = blob(rig.n("Jacket"), rig.coll, black, (0.64, 0.44, 0.60), subdiv=3, square=0.62,
                  jitter=0.025, seed=331, bevel=0.03, decimate=0.55)
    jacket.location = (0, 0, 2.06)
    rig.add(jacket)
    rig.add(decal(rig.n("Hoodie_Front"), rig.coll, white,
                  [(-0.2, 2.64), (0.2, 2.64), (0.1, 2.2), (0.13, 1.47), (-0.13, 1.47),
                   (-0.1, 2.2)], jacket, stand=0.014, thickness=0.03, cuts=5))
    collar = [(0.2, 2.65), (0.42, 2.60), (0.27, 2.24), (0.1, 2.18)]
    flap = [(0.27, 2.18), (0.55, 2.18), (0.55, 2.06), (0.27, 2.06)]
    for side, shape in (("L", lambda o: o), ("R", _mirror)):
        rig.add(decal(rig.n("Collar_" + side), rig.coll, black, shape(collar), jacket,
                      stand=0.05, thickness=0.05, cuts=3))
        rig.add(decal(rig.n("ChestFlap_" + side), rig.coll, black, shape(flap), jacket,
                      stand=0.03, thickness=0.035, cuts=3))
    hood = blob(rig.n("Hood"), rig.coll, white, (0.52, 0.32, 0.27), subdiv=2, jitter=0.05,
                seed=332, bevel=0.03)
    hood.location = (0, 0.30, 2.60)
    rig.add(hood)
    rim = blob(rig.n("Hood_Rim"), rig.coll, white, (0.40, 0.36, 0.15), subdiv=2, jitter=0.04,
               seed=333, bevel=0.03)
    rim.location = (0, -0.02, 2.63)
    rig.add(rim)
    bvh, mw = bvh_of(jacket)
    for k, sx in enumerate((-1, 1)):
        top = front_y(bvh, mw, sx * 0.06, 2.5) + Vector((0, -0.05, 0))
        low = front_y(bvh, mw, sx * 0.07, 2.1) + Vector((0, -0.05, 0))
        rig.add(stroke(rig.n(f"Drawstring_{k}"), rig.coll, white, [top, (top + low) / 2, low],
                       0.016, smooth=3))

    _legs(rig, pants, 1.5, 0.24, 0.27, (0.3, 0.28), shoe_m, (0.25, 0.41, 0.19), seed=340)
    for side, sx in (("L", 1), ("R", -1)):
        pk = box(rig.n("CargoPocket_" + side), rig.coll, pants, (0.06, 0.15, 0.18), bevel=0.03)
        pk.location = (sx * 0.555, 0.0, 0.92)
        rig.add(pk)
        # hands tucked into the jacket pockets
        _arm(rig, side, (sx * 0.58, 0, 2.42), (sx * 0.78, 0.02, 1.96), (sx * 0.62, -0.2, 1.6),
             black, skin, r=(0.18, 0.17, 0.16), hand=False, seed=345 + sx)

    if bags:
        # strap from his left shoulder down to the bag on his right hip
        loop = []
        for k in range(28):
            a = 2 * math.pi * k / 28
            x = 0.66 * math.cos(a)
            loop.append((x, 0.47 * math.sin(a), 2.12 + 0.86 * x))
        rig.add(band(rig.n("Strap"), rig.coll, bag_m, loop, 0.1, jacket, stand=0.012,
                     thickness=0.022))
        bag = box(rig.n("MailBag"), rig.coll, bag_m, (0.3, 0.11, 0.23), bevel=0.04)
        bag.location = (-0.63, -0.33, 1.36)
        bag.rotation_euler = (0, 0, math.radians(14))
        rig.add(bag)
        flap_b = box(rig.n("MailBag_Flap"), rig.coll, bag_m, (0.305, 0.118, 0.09), bevel=0.03)
        flap_b.parent, flap_b.location = bag, (0, -0.004, 0.145)
        ink = rig.mat("Envelope", "#F4F1EA", rough=0.7, sss=0.0, bump=0.0, variation=0.0)
        env = box(rig.n("MailBag_Envelope"), rig.coll, ink, (0.115, 0.008, 0.075), bevel=0.006)
        env.parent, env.location = bag, (0, -0.118, -0.06)
        vee = stroke(rig.n("MailBag_Vee"), rig.coll, bag_m,
                     [(-0.1, 0, 0.06), (0, 0, -0.01), (0.1, 0, 0.06)], 0.009)
        vee.parent, vee.location = env, (0, -0.01, 0)
        rig.parts += [flap_b, env, vee]
        pack = box(rig.n("Backpack"), rig.coll, black, (0.44, 0.2, 0.5), bevel=0.09)
        pack.location = (0, 0.6, 2.0)
        rig.add(pack)
        pouch = box(rig.n("Backpack_Pouch"), rig.coll, black, (0.33, 0.07, 0.22), bevel=0.05)
        pouch.parent, pouch.location = pack, (0, 0.2, -0.18)
        rig.parts.append(pouch)
    return rig.close()
