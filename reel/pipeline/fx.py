"""Shared drawing helpers: gold 3D text, glass cards, easing, perspective."""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

A = "/tmp/claude-0/-home-user-3d/1c527dcf-8917-51f6-8cf7-8beca887a909/scratchpad/assets/"
F_BIG = A + "Poppins-ExtraBold.ttf"
F_SEMI = A + "Poppins-SemiBold.ttf"
F_SERIF = A + "InstrumentSerif-Italic.ttf"

W, H, FPS = 1080, 1920, 30


# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0):
    return a if x < a else b if x > b else x

def ease_out_cubic(p):
    p = clamp(p); return 1 - (1 - p) ** 3

def ease_in_cubic(p):
    p = clamp(p); return p ** 3

def ease_in_out(p):
    p = clamp(p); return 3 * p * p - 2 * p * p * p

def ease_out_back(p, s=1.7):
    p = clamp(p) - 1; return 1 + (s + 1) * p ** 3 + s * p ** 2

def lerp(a, b, p):
    return a + (b - a) * p


# ---------------------------------------------------------------- gradients
def vgrad(w, h, stops):
    """stops: list of (pos 0..1, (r,g,b)). returns RGB uint8 array h x w x 3"""
    ys = np.linspace(0, 1, h)
    out = np.zeros((h, 3), np.float32)
    ps = [s[0] for s in stops]
    for c in range(3):
        out[:, c] = np.interp(ys, ps, [s[1][c] for s in stops])
    return np.repeat(out[:, None, :], w, axis=1)

GOLD = [(0.00, (255, 246, 208)), (0.22, (247, 214, 128)), (0.45, (214, 164, 58)),
        (0.55, (150, 100, 22)), (0.70, (222, 176, 72)), (0.88, (255, 228, 150)),
        (1.00, (196, 140, 40))]
CHAMPAGNE = [(0.0, (255, 248, 226)), (0.55, (238, 214, 156)), (1.0, (205, 168, 92))]


def _shift(a, dx, dy):
    out = np.zeros_like(a)
    h, w = a.shape
    xs0, xs1 = max(0, dx), min(w, w + dx)
    ys0, ys1 = max(0, dy), min(h, h + dy)
    out[ys0:ys1, xs0:xs1] = a[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


def text_mask(text, font_path, size, tracking=0.0, pad=60):
    f = ImageFont.truetype(font_path, size)
    # measure with tracking
    widths = [f.getlength(ch) for ch in text]
    total = sum(widths) + tracking * size * (len(text) - 1)
    asc, desc = f.getmetrics()
    w = int(total + 2 * pad); h = int(asc + desc + 2 * pad)
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    if tracking == 0:
        d.text((pad, pad), text, font=f, fill=255)
    else:
        x = pad
        for ch, cw in zip(text, widths):
            d.text((x, pad), ch, font=f, fill=255)
            x += cw + tracking * size
    bb = m.getbbox()
    if bb is None:
        return m
    x0, y0, x1, y1 = bb
    return m.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))


def gold_big(text, size, tracking=-0.01, extrude=None):
    """Metallic gold, beveled, extruded '3D' text sprite (RGBA)."""
    m = text_mask(text, F_BIG, size, tracking, pad=70)
    a = np.asarray(m, np.float32) / 255.0
    h, w = a.shape
    E = extrude if extrude is not None else max(3, int(size * 0.055))
    out = np.zeros((h, w, 4), np.float32)

    def over(rgb, alpha):
        # rgb: hxwx3 0..255 or tuple ; alpha hxw 0..1
        nonlocal out
        if isinstance(rgb, tuple):
            rgb = np.array(rgb, np.float32)[None, None, :]
        al = alpha[..., None]
        oa = out[..., 3:4]
        na = al + oa * (1 - al)
        out[..., :3] = np.where(na > 1e-6, (rgb * al + out[..., :3] * oa * (1 - al)) / np.maximum(na, 1e-6), 0)
        out[..., 3:4] = na

    # drop shadow
    sh = Image.fromarray((_shift(a, 0, E + 10) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(size * 0.12))
    over((0, 0, 0), np.asarray(sh, np.float32) / 255 * 0.85)
    # warm glow
    gl = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(size * 0.18))
    over((212, 160, 55), np.asarray(gl, np.float32) / 255 * 0.28)
    # extrusion (dark bronze -> near black)
    for k in range(E, 0, -1):
        c = lerp(np.array([40, 24, 4.]), np.array([120, 80, 18.]), 1 - k / E)
        over(tuple(c), _shift(a, int(round(k * 0.35)), k))
    # face
    face = vgrad(w, h, [(clamp((p * (h - 140) + 70) / h), c) for p, c in GOLD])
    over(face, a)
    # bevel: top-edge highlight, bottom-edge shade
    hi = np.clip(a - _shift(a, 0, 3), 0, 1)
    hi = np.asarray(Image.fromarray((hi * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    over((255, 252, 235), hi * a * 0.85)
    lo = np.clip(a - _shift(a, 0, -3), 0, 1)
    lo = np.asarray(Image.fromarray((lo * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    over((92, 58, 8), lo * a * 0.6)
    img = Image.fromarray(np.clip(out * [1, 1, 1, 255], 0, 255).astype(np.uint8), "RGBA")
    return img, a  # a = face mask for the shine sweep


def champagne_small(text, size):
    m = text_mask(text, F_SERIF, size, 0.0, pad=40)
    a = np.asarray(m, np.float32) / 255.0
    h, w = a.shape
    face = vgrad(w, h, [(clamp((p * (h - 80) + 40) / h), c) for p, c in CHAMPAGNE])
    sh = np.asarray(Image.fromarray((_shift(a, 0, 5) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)), np.float32) / 255
    rgb = face * a[..., None]
    alpha = a + sh * 0.75 * (1 - a)
    rgb = np.where(alpha[..., None] > 1e-6, rgb / np.maximum(alpha[..., None], 1e-6), 0)
    out = np.dstack([rgb, alpha * 255])
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA"), a


def shine(sprite, facemask, p, width=0.16, strength=0.75):
    """diagonal light sweep across the gold face; p 0..1 position."""
    if p <= 0 or p >= 1:
        return sprite
    h, w = facemask.shape
    xs = np.arange(w)[None, :] / w
    ys = np.arange(h)[:, None] / h
    pos = lerp(-0.3, 1.3, p)
    d = (xs + ys * 0.35 - pos) / width
    band = np.exp(-d * d) * facemask * strength
    arr = np.asarray(sprite, np.float32).copy()
    arr[..., :3] = arr[..., :3] + (255 - arr[..., :3]) * band[..., None]
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


# ---------------------------------------------------------------- sprite transform
def transform_sprite(img, scale=1.0, blur=0.0, alpha=1.0):
    if scale != 1.0:
        nw, nh = max(1, int(img.width * scale)), max(1, int(img.height * scale))
        img = img.resize((nw, nh), Image.BICUBIC)
    if blur > 0.3:
        pad = int(blur * 2.5)
        big = Image.new("RGBA", (img.width + 2 * pad, img.height + 2 * pad), (0, 0, 0, 0))
        big.paste(img, (pad, pad))
        img = big.filter(ImageFilter.GaussianBlur(blur))
    if alpha < 0.999:
        a = img.getchannel("A").point(lambda v: int(v * clamp(alpha)))
        img = img.copy(); img.putalpha(a)
    return img


def paste_center(canvas, img, cx, cy):
    _paste_clip(canvas, img, int(round(cx - img.width / 2)), int(round(cy - img.height / 2)))


def _paste_clip(canvas, img, x, y):
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(canvas.width, x + img.width), min(canvas.height, y + img.height)
    if x1 <= x0 or y1 <= y0:
        return
    canvas.alpha_composite(img.crop((x0 - x, y0 - y, x1 - x, y1 - y)), (x0, y0))


# ---------------------------------------------------------------- perspective (3D Y / X rotation)
def _coeffs(src, dst):
    m = []
    for (x, y), (X, Y) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -X * x, -X * y])
        m.append([0, 0, 0, x, y, 1, -Y * x, -Y * y])
    A_ = np.array(m, np.float64)
    B_ = np.array([c for p in src for c in p], np.float64)
    return np.linalg.solve(A_, B_).tolist()


def rotate3d(img, ry=0.0, rx=0.0, persp=1400.0):
    """rotate sprite around its centre (degrees). returns new RGBA sprite on bigger canvas."""
    if abs(ry) < 0.05 and abs(rx) < 0.05:
        return img
    w, h = img.size
    cx, cy = w / 2, h / 2
    ay, ax = math.radians(ry), math.radians(rx)
    pts = []
    for (x, y) in [(0, 0), (w, 0), (w, h), (0, h)]:
        X, Y, Z = x - cx, y - cy, 0.0
        # rotate around Y
        X, Z = X * math.cos(ay) + Z * math.sin(ay), -X * math.sin(ay) + Z * math.cos(ay)
        # rotate around X
        Y, Z = Y * math.cos(ax) - Z * math.sin(ax), Y * math.sin(ax) + Z * math.cos(ax)
        s = persp / (persp + Z)
        pts.append((X * s, Y * s))
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    pad = 4
    ow = int(max(xs) - min(xs)) + 2 * pad; oh = int(max(ys) - min(ys)) + 2 * pad
    ow = max(ow, 2); oh = max(oh, 2)
    # keep the centre at the centre of the output
    half_w = max(abs(min(xs)), abs(max(xs))) + pad
    half_h = max(abs(min(ys)), abs(max(ys))) + pad
    ow, oh = int(2 * half_w), int(2 * half_h)
    dst = [(p[0] + half_w, p[1] + half_h) for p in pts]
    src = [(0, 0), (w, 0), (w, h), (0, h)]
    c = _coeffs(src, dst)
    return img.transform((ow, oh), Image.PERSPECTIVE, c, Image.BICUBIC)


# ---------------------------------------------------------------- glass
def rounded_mask(w, h, r, ss=3):
    m = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * ss - 1, h * ss - 1), r * ss, fill=255)
    return m.resize((w, h), Image.LANCZOS)


def glass_card(backdrop, x, y, w, h, r, tint=(255, 255, 255), tint_a=0.10, blur=26, border=0.55, gold_border=False):
    """Frosted glass panel sprite using the frame content underneath (backdrop: RGB/RGBA full frame)."""
    pad = blur * 2
    bx0, by0 = max(0, x - pad), max(0, y - pad)
    bx1, by1 = min(backdrop.width, x + w + pad), min(backdrop.height, y + h + pad)
    region = backdrop.crop((bx0, by0, bx1, by1)).convert("RGB").filter(ImageFilter.GaussianBlur(blur))
    # place into card-size canvas
    card = Image.new("RGB", (w, h), (0, 0, 0))
    card.paste(region, (bx0 - x, by0 - y))
    arr = np.asarray(card, np.float32)
    # frosted: lift + tint + slight top-left sheen
    arr = arr * 0.9 + np.array(tint, np.float32) * tint_a + 14
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    sheen = np.clip(1 - (xx / w * 0.6 + yy / h * 0.9), 0, 1) ** 2 * 38
    arr += sheen[..., None]
    # tiny noise for real-glass texture
    arr += np.random.default_rng(7).normal(0, 2.0, arr.shape[:2])[..., None]
    arr = np.clip(arr, 0, 255)
    m = rounded_mask(w, h, r)
    out = Image.fromarray(arr.astype(np.uint8)).convert("RGBA")
    out.putalpha(m)
    # border: gradient stroke
    ss = 3
    bm = Image.new("L", (w * ss, h * ss), 0)
    ImageDraw.Draw(bm).rounded_rectangle((1, 1, w * ss - 2, h * ss - 2), r * ss, outline=255, width=int(2.2 * ss))
    bm = np.asarray(bm.resize((w, h), Image.LANCZOS), np.float32) / 255
    g = np.clip(1.0 - (xx / w * 0.5 + yy / h * 0.8), 0.12, 1.0) * border
    col = np.array((236, 200, 120) if gold_border else (255, 255, 255), np.float32)
    o = np.asarray(out, np.float32).copy()
    ba = (bm * g)[..., None]
    o[..., :3] = o[..., :3] * (1 - ba) + col * ba
    out = Image.fromarray(o.astype(np.uint8), "RGBA")
    # shadow canvas
    sp = 40
    full = Image.new("RGBA", (w + 2 * sp, h + 2 * sp), (0, 0, 0, 0))
    shm = Image.new("L", (w + 2 * sp, h + 2 * sp), 0)
    shm.paste(m, (sp, sp + 14))
    shm = shm.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.6))
    full.paste((0, 0, 0, 255), (0, 0), shm)
    full.alpha_composite(out, (sp, sp))
    return full, sp
