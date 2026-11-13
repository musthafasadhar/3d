"""Shared clay-look toolkit for the reel characters and sets (Blender / bpy)."""
import math
import random

import bpy  # must come first: it registers bmesh and mathutils
import bmesh
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree


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


def surface_frame(bvh, mw, yaw, z, centre, radii, lift=0.0, pitch_bias=1.0):
    """World matrix sitting on a blob's front surface at a given yaw/height.

    Local -Y points out of the surface, local Z stays as upright as possible.
    Orientation follows the smooth underlying ellipsoid (centre, radii), not the
    individual facet, so features do not tilt with the low-poly faces.
    """
    centre, radii = Vector(centre), Vector(radii)
    inv = mw.inverted()
    target = Vector((centre.x, centre.y, z))
    direction = Vector((math.sin(yaw), -math.cos(yaw), 0.0))
    origin = target + direction * 8.0
    hit, _n, _i, _d = bvh.ray_cast(inv @ origin, (inv.to_3x3() @ -direction).normalized())
    hit = mw @ hit
    rel = hit - centre
    n = Vector((rel.x / radii.x ** 2, rel.y / radii.y ** 2,
                pitch_bias * rel.z / radii.z ** 2)).normalized()
    y_ax = -n
    x_ax = y_ax.cross(Vector((0, 0, 1))).normalized()
    z_ax = x_ax.cross(y_ax).normalized()
    rot = Matrix((x_ax, y_ax, z_ax)).transposed().to_4x4()
    return Matrix.Translation(hit + n * lift) @ rot


def adopt(child, parent):
    """Parent while keeping the child where it was authored (parent only translated)."""
    child.parent = parent
    child.matrix_parent_inverse = Matrix.Translation(parent.location).inverted()
    return child


def _smooth_path(pts, steps):
    """Catmull-Rom through the given points."""
    pts = [Vector(p) for p in pts]
    if steps <= 1 or len(pts) < 3:
        return pts
    out = []
    ext = [pts[0] * 2 - pts[1]] + pts + [pts[-1] * 2 - pts[-2]]
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for k in range(steps):
            t = k / steps
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
                              + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return out


def stroke(name, coll, mat, pts, radius, sides=6, smooth=1, taper=0.0, closed=False):
    """A rolled 'snake' of clay along a path. taper thins both ends (0..1)."""
    path = _smooth_path(pts, smooth) if not closed else [Vector(p) for p in pts]
    n = len(path)
    bm = bmesh.new()
    rings = []
    up = Vector((0, 0, 1))
    prev_n = None
    for i, p in enumerate(path):
        a = path[(i - 1) % n] if (closed or i > 0) else p
        b = path[(i + 1) % n] if (closed or i < n - 1) else p
        tan = (b - a).normalized()
        nrm = prev_n - tan * prev_n.dot(tan) if prev_n else tan.cross(up)
        if nrm.length < 1e-5:
            nrm = tan.cross(Vector((1, 0, 0)))
        nrm.normalize()
        prev_n = nrm
        bi = tan.cross(nrm)
        t = i / max(n - 1, 1)
        r = radius * (1.0 - taper * (2 * t - 1) ** 2) if not closed else radius
        rings.append([bm.verts.new(p + (nrm * math.cos(q) + bi * math.sin(q)) * r)
                      for q in (2 * math.pi * k / sides for k in range(sides))])
    pairs = list(zip(rings, rings[1:])) + ([(rings[-1], rings[0])] if closed else [])
    for a, b in pairs:
        for k in range(sides):
            bm.faces.new((a[k], a[(k + 1) % sides], b[(k + 1) % sides], b[k]))
    if not closed:
        bm.faces.new(rings[0])
        bm.faces.new(list(reversed(rings[-1])))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, coll, mat)


def ring(name, coll, mat, radius, thickness, segments=28, sides=6):
    """Torus in local XZ (faces -Y), e.g. a spectacle rim."""
    pts = [(radius * math.cos(a), 0.0, radius * math.sin(a))
           for a in (2 * math.pi * k / segments for k in range(segments))]
    return stroke(name, coll, mat, pts, thickness, sides=sides, closed=True)


def capsule(name, coll, mat, p0, p1, r0, r1, sides=8, jitter=0.02, seed=0, bevel=0.02):
    """Low-poly tapered limb from p0 to p1 with domed ends."""
    p0, p1 = Vector(p0), Vector(p1)
    axis = p1 - p0
    length = axis.length
    rng = random.Random(seed)
    bm = bmesh.new()
    rows = [(-r0 * 0.55, r0 * 0.62), (0.0, r0), (length * 0.5, (r0 + r1) / 2),
            (length, r1), (length + r1 * 0.55, r1 * 0.62)]
    rings = []
    for ri, (z, r) in enumerate(rows):
        off = (ri % 2) * math.pi / sides
        rings.append([bm.verts.new((r * math.cos(off + 2 * math.pi * k / sides)
                                    + rng.uniform(-jitter, jitter) * r,
                                    r * math.sin(off + 2 * math.pi * k / sides)
                                    + rng.uniform(-jitter, jitter) * r, z))
                      for k in range(sides)])
    for a, b in zip(rings, rings[1:]):
        for k in range(sides):
            bm.faces.new((a[k], a[(k + 1) % sides], b[(k + 1) % sides], b[k]))
    bm.faces.new(list(reversed(rings[0])))
    bm.faces.new(rings[-1])
    bmesh.ops.triangulate(bm, faces=[f for f in bm.faces if len(f.verts) == 4])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = finish(name, bm, coll, mat)
    obj.matrix_world = Matrix.Translation(p0) @ axis.to_track_quat("Z", "Y").to_matrix().to_4x4()
    return soft_facets(obj, width=bevel)


def box(name, coll, mat, half, bevel=0.03, segments=3):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=2.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * half[0], v.co.y * half[1], v.co.z * half[2]))
    obj = finish(name, bm, coll, mat)
    bv = obj.modifiers.new("Bevel", "BEVEL")
    bv.width = bevel
    bv.segments = segments
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = False
    return obj


def decal(name, coll, mat, outline, target, pivot=(0.0, 0.0), yaw=0.0, stand=0.012,
          thickness=0.02, cuts=3):
    """A flat piece of clay pressed onto a surface (pocket, lapel, panel, icon).

    outline: (u, z) points; u runs across the surface, z is world height. The
    shape is projected onto `target` from outside, looking along the direction
    given by yaw (0 = onto the front, pi = onto the back, +-pi/2 = the sides).
    """
    tb, tm = bvh_of(target)
    inv = tm.inverted()
    side = Vector((math.cos(yaw), math.sin(yaw), 0.0))
    safe = []
    for u, z in outline:  # keep every point inside the target's silhouette
        base = Vector((pivot[0], pivot[1], 0.0)) + side * u
        top, *_ = tb.ray_cast(inv @ (base + Vector((0, 0, 60))), Vector((0, 0, -1)))
        low, *_ = tb.ray_cast(inv @ (base - Vector((0, 0, 60))), Vector((0, 0, 1)))
        if top is not None and low is not None:
            z = min(max(z, (tm @ low).z + 0.03), (tm @ top).z - 0.03)
        safe.append((u, z))
    bm = bmesh.new()
    face = bm.faces.new([bm.verts.new((u, -6.0, z)) for u, z in safe])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    if face.normal.y > 0:
        bmesh.ops.reverse_faces(bm, faces=[face])
    tri = bmesh.ops.triangulate(bm, faces=[face])
    if cuts:
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    obj = finish(name, bm, coll, mat)
    obj.location = (pivot[0], pivot[1], 0.0)
    obj.rotation_euler = (0, 0, yaw)
    sw = obj.modifiers.new("Press", "SHRINKWRAP")
    sw.target = target
    sw.wrap_method = "PROJECT"
    sw.use_project_x, sw.use_project_y, sw.use_project_z = False, True, False
    sw.use_positive_direction, sw.use_negative_direction = True, False
    sw.offset = stand
    so = obj.modifiers.new("Thick", "SOLIDIFY")
    so.thickness = thickness
    so.offset = -1.0
    return obj


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


def configure_render(w, h, samples, exposure=0.0):
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
    s.view_settings.exposure = exposure


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



def band(name, coll, mat, pts, width, target, stand=0.012, thickness=0.02, closed=True,
         centre=(0.0, 0.0)):
    """A strap or ribbon laid around a body: follows pts, hugs the target surface."""
    pts = [Vector(p) for p in pts]
    n = len(pts)
    bm = bmesh.new()
    rows = []
    for i, p in enumerate(pts):
        a = pts[(i - 1) % n] if (closed or i > 0) else p
        b = pts[(i + 1) % n] if (closed or i < n - 1) else p
        tan = (b - a).normalized()
        out = Vector((p.x - centre[0], p.y - centre[1], 0.0)).normalized()
        side = tan.cross(out).normalized() * (width / 2)
        rows.append((bm.verts.new(p - side), bm.verts.new(p), bm.verts.new(p + side)))
    pairs = list(zip(rows, rows[1:])) + ([(rows[-1], rows[0])] if closed else [])
    for a, b in pairs:
        bm.faces.new((a[0], a[1], b[1], b[0]))
        bm.faces.new((a[1], a[2], b[2], b[1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    obj = finish(name, bm, coll, mat)
    sw = obj.modifiers.new("Hug", "SHRINKWRAP")
    sw.target = target
    sw.wrap_method = "NEAREST_SURFACEPOINT"
    sw.wrap_mode = "ABOVE_SURFACE"
    sw.offset = stand
    so = obj.modifiers.new("Thick", "SOLIDIFY")
    so.thickness = thickness
    so.offset = 1.0
    return obj


def front_y(bvh, mw, x, z, yaw=0.0, pivot=(0.0, 0.0)):
    """World point where a ray from outside (direction given by yaw) meets the surface."""
    d = Vector((math.sin(yaw), -math.cos(yaw), 0.0))
    side = Vector((math.cos(yaw), math.sin(yaw), 0.0))
    origin = Vector((pivot[0], pivot[1], z)) + side * x + d * 8.0
    inv = mw.inverted()
    hit, *_ = bvh.ray_cast(inv @ origin, (inv.to_3x3() @ -d).normalized())
    return mw @ hit if hit else Vector((pivot[0], pivot[1], z)) + side * x


def new_scene(*collections):
    """Empty file with the named collections linked to the scene."""
    bpy.ops.wm.read_factory_settings(use_empty=True)
    out = []
    for name in collections:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
        out.append(c)
    return out


def look_at_camera(coll, location, target, lens=85, fstop=4.0, focus=None):
    data = bpy.data.cameras.new("Cam")
    data.lens = lens
    data.dof.use_dof = True
    data.dof.aperture_fstop = fstop
    cam = bpy.data.objects.new("Cam", data)
    link(cam, coll)
    cam.location = location
    target = Vector(target)
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    data.dof.focus_distance = focus if focus else (target - cam.location).length
    bpy.context.scene.camera = cam
    return cam
