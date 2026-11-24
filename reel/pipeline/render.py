"""Frame renderer for the B&W + gold glassmorphism reel.
usage: python3 render.py <worker_k> <n_workers> [frame list...]"""
import sys, os, math, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fx import *

WORK = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(WORK, "out")
os.makedirs(OUT, exist_ok=True)
NFR = 896
LOGO_MODE = os.environ.get("LOGO_MODE", "brand")  # brand | gold

# ============================================================== layout constants
PERSON_SCALE = 1.2          # source 720x1280 -> 864x1536
CAP_Y = 1470                # caption block centre
TOP_Y = 400                 # element row centre

# ============================================================== assets
def load_logo(name):
    return Image.open(os.path.join(A, name)).convert("RGBA")

def goldify(img):
    """Recolor a logo with the gold gradient (keeps alpha)."""
    a = np.asarray(img.getchannel("A"), np.float32) / 255
    h, w = a.shape
    g = vgrad(w, h, GOLD)
    return Image.fromarray(np.dstack([g, a * 255]).astype(np.uint8), "RGBA")

def make_logos():
    L = {}
    am = np.asarray(load_logo("amazon_raw.png"), np.float32).copy()
    dark = (am[..., :3].max(-1) < 90) & (am[..., 3] > 0)
    am[dark, :3] = 255  # black "a" -> white for dark glass
    L["amazon"] = Image.fromarray(am.astype(np.uint8), "RGBA").crop(Image.fromarray(am.astype(np.uint8), "RGBA").getbbox())
    tw = load_logo("twitter_raw.png"); L["twitter"] = tw.crop(tw.getbbox())
    # flipkart: yellow bag with blue "f" (fill interior holes blue)
    fk = load_logo("flipkart_bag.png")
    a = np.asarray(fk.getchannel("A")) > 100
    from scipy import ndimage
    filled = ndimage.binary_fill_holes(a)
    # the "f" is open at the bottom; close it by filling the bag body box
    body = np.zeros_like(a)
    ys, xs = np.where(a)
    body_top = int(np.percentile(ys, 18))
    rows = np.arange(a.shape[0])[:, None]
    body[(rows >= body_top) & (np.arange(a.shape[1])[None, :] >= xs.min() + 2) & (np.arange(a.shape[1])[None, :] <= xs.max() - 2)] = True
    body &= ndimage.binary_closing(a | body, iterations=1)
    holes = (filled | body) & ~a
    arr = np.asarray(fk, np.float32).copy()
    arr[holes] = [40, 116, 240, 255]
    L["flipkart"] = Image.fromarray(arr.astype(np.uint8), "RGBA")
    L["flipkart"] = L["flipkart"].crop(L["flipkart"].getbbox())
    if LOGO_MODE == "gold":
        L = {k: goldify(v) for k, v in L.items()}
    return L

LOGOS = make_logos()

# ============================================================== background (dark liquid flow)
BG_W, BG_H = 270, 480
_yy, _xx = np.mgrid[0:BG_H, 0:BG_W].astype(np.float32)
_xx /= BG_W; _yy /= BG_H

def background(t):
    x, y = _xx * 3.0, _yy * 5.3
    # domain-warped silk flow
    wx = x + 0.55 * np.sin(y * 1.3 + t * 0.35) + 0.3 * np.sin(y * 2.7 - t * 0.5)
    wy = y + 0.45 * np.sin(x * 1.7 - t * 0.28)
    v = np.sin(wx * 1.6 + wy * 0.9 + t * 0.4) * 0.5 + np.sin(wy * 1.25 - wx * 0.6 - t * 0.31) * 0.5
    v = np.clip(v * 0.5 + 0.5, 0, 1) ** 2.6          # thin bright ribbons
    glow = np.exp(-(((_xx - 0.5) / 0.55) ** 2 + ((_yy - 0.38) / 0.42) ** 2))  # soft key behind subject
    lum = 5 + v * 58 * (0.35 + 0.65 * glow) + glow * 14
    img = Image.fromarray(np.clip(lum, 0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return img

# gold dust particles
_rng = np.random.default_rng(3)
NP = 30
P_X = _rng.uniform(0, W, NP); P_Y = _rng.uniform(0, H, NP)
P_V = _rng.uniform(8, 26, NP); P_S = _rng.uniform(1.2, 3.6, NP); P_PH = _rng.uniform(0, 6.28, NP)

def dust(canvas, t, boost=0.0):
    d = ImageDraw.Draw(canvas, "RGBA")
    for i in range(NP):
        x = (P_X[i] + 18 * math.sin(t * 0.4 + P_PH[i])) % W
        y = (P_Y[i] - P_V[i] * t) % H
        tw = 0.5 + 0.5 * math.sin(t * 2.2 + P_PH[i] * 3)
        a = int((30 + 80 * tw) * (0.5 + boost))
        r = P_S[i]
        d.ellipse((x - r * 2.2, y - r * 2.2, x + r * 2.2, y + r * 2.2), fill=(230, 180, 80, a // 5))
        d.ellipse((x - r, y - r, x + r, y + r), fill=(255, 222, 150, min(255, a)))

# ============================================================== person
VIG = None
def vignette():
    global VIG
    if VIG is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = ((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.45) / (H * 0.62)) ** 2
        VIG = np.clip(1.0 - 0.55 * d, 0.25, 1.0).astype(np.float32)
    return VIG

def load_mask(i):
    i = min(max(i, 1), NFR)
    a = np.asarray(Image.open(os.path.join(WORK, "mmc", f"{i:04d}.png")), np.float32) / 255
    b = np.asarray(Image.open(os.path.join(WORK, "mss", f"{i:04d}.png")), np.float32) / 255
    v = 0.55 * a + 0.45 * b
    return np.clip((v - 0.32) / 0.42, 0, 1)

EDGE = None
GAIN = json.load(open(os.path.join(WORK, "gain.json")))
def person_layer(i, zoom):
    """returns (RGB full-frame person image, alpha full-frame) on the 1080x1920 canvas"""
    global EDGE
    fr = Image.open(os.path.join(WORK, "fr2", f"{i:04d}.jpg")).convert("RGB")
    # temporal mask smoothing
    m = load_mask(i - 1) * 0.25 + load_mask(i) * 0.5 + load_mask(i + 1) * 0.25
    mi = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.6))
    m = np.asarray(mi, np.float32) / 255
    if EDGE is None:
        yy, xx = np.mgrid[0:1280, 0:720].astype(np.float32)
        side = np.clip(np.minimum(xx, 719 - xx) / 70.0, 0, 1)
        bottom = np.clip((1279 - yy) / 260.0, 0, 1)
        top = np.clip(yy / 90.0, 0, 1)
        EDGE = (side * bottom * top) ** 1.2
    m = m * EDGE
    # B&W grade
    a = np.asarray(fr, np.float32)
    lum = a[..., 0] * 0.30 + a[..., 1] * 0.59 + a[..., 2] * 0.11
    lum = lum / 255.0
    g_ = GAIN[i - 1]
    lum = 1 - (1 - np.clip(lum, 0, 1)) ** g_ if g_ > 1 else lum * g_   # shadow-weighted lift
    # filmic S-curve, lifted shadows for dark skin detail, tamed highlights (white tee)
    lum = np.clip((lum - 0.02) / 0.9, 0, 1)
    lum = lum ** 0.82
    lum = 0.5 + (lum - 0.5) * 1.18
    lum = np.clip(lum, 0, 1)
    lum = np.where(lum > 0.72, 0.72 + (lum - 0.72) * 0.45, lum)  # highlight roll-off
    li = Image.fromarray((lum * 255).astype(np.uint8))
    li = li.filter(ImageFilter.UnsharpMask(radius=2, percent=40, threshold=3))
    # rim light from matte edge
    er = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(11)).filter(ImageFilter.GaussianBlur(4))
    rim = np.clip(m - np.asarray(er, np.float32) / 255, 0, 1)
    lumf = np.asarray(li, np.float32) / 255
    bl = np.asarray(Image.fromarray((np.clip(lumf - 0.45, 0, 1) * 255 / 0.55).astype(np.uint8)).filter(ImageFilter.GaussianBlur(14)), np.float32) / 255
    lumf = 1 - (1 - lumf) * (1 - bl * 0.22)   # screen-blend soft bloom
    lumf = lumf * 0.82 + rim * 0.18
    s = PERSON_SCALE * zoom
    pw, ph = int(720 * s), int(1280 * s)
    lum_img = Image.fromarray(np.clip(lumf * 255, 0, 255).astype(np.uint8)).resize((pw, ph), Image.BICUBIC)
    m_img = Image.fromarray((m * 255).astype(np.uint8)).resize((pw, ph), Image.BICUBIC)
    # anchor: bottom-centre, slightly above bottom so the fade lives in the caption zone
    ox = (W - pw) // 2
    oy = H - ph + int(40 * (zoom - 1) * 10)
    P = Image.new("L", (W, H), 0); M = Image.new("L", (W, H), 0)
    P.paste(lum_img, (ox, oy)); M.paste(m_img, (ox, oy))
    return P, M

BOTTOM_FADE = None
def bottom_fade():
    global BOTTOM_FADE
    if BOTTOM_FADE is None:
        y = np.arange(H, dtype=np.float32)
        f = 1 - np.clip((y - 1240) / 520.0, 0, 1) ** 1.3 * 0.93
        BOTTOM_FADE = np.repeat(f[:, None], W, axis=1)
    return BOTTOM_FADE

# ============================================================== captions
WORDS = json.load(open(os.path.join(WORK, "groups.json")))
SPR = {}
def sprite(text, kind, size):
    k = (text, kind, size)
    if k not in SPR:
        SPR[k] = gold_big(text, size) if kind == "b" else champagne_small(text, size)
    return SPR[k]

def fit_size(text, kind, base):
    if kind != "b":
        return base
    f = ImageFont.truetype(F_BIG, base)
    w = f.getlength(text)
    maxw = 900
    return int(base * min(1.0, maxw / w))

def group_layout(g):
    """compute (sprite, facemask, cx, cy, t_in, kind) for each line of group g"""
    sc = g.get("scale", 1.0)
    lines = []
    for ln in g["lines"]:
        kind = ln["k"]
        base = int((150 if kind == "b" else 80) * sc * ln.get("s", 1.0))
        size = fit_size(ln["t"], kind, base)
        spr, fm = sprite(ln["t"], kind, size)
        lines.append([spr, fm, ln, size])
    # stack: use font-size based advance (sprites have padding)
    heights = []
    for spr, fm, ln, size in lines:
        heights.append(size * (0.86 if ln["k"] == "b" else 0.9))
    total = sum(heights)
    y = g.get("y", CAP_Y) - total / 2
    out = []
    for (spr, fm, ln, size), hgt in zip(lines, heights):
        out.append((spr, fm, W / 2 + ln.get("dx", 0), y + hgt / 2, ln["at"], ln["k"]))
        y += hgt
    return out

LAYOUT = {}
def draw_captions(canvas, t):
    for gi, g in enumerate(WORDS):
        t0, t1 = g["lines"][0]["at"], g["end"]
        if t < t0 - 0.05 or t > t1 + 0.3:
            continue
        if gi not in LAYOUT:
            LAYOUT[gi] = group_layout(g)
        ex = clamp((t - t1) / 0.22)  # exit progress
        for spr, fm, cx, cy, at, kind in LAYOUT[gi]:
            if t < at:
                continue
            p = (t - at) / (0.30 if kind == "b" else 0.26)
            pe = ease_out_cubic(p)
            if kind == "b":
                sc = lerp(1.32, 1.0, ease_out_back(p, 1.4))
                blur = 16 * (1 - pe)
                dy = 0
                # gold shine sweep after landing
                sp = (t - at - 0.28) / 0.75
                img = shine(spr, fm, sp) if 0 < sp < 1 else spr
            else:
                sc = lerp(1.08, 1.0, pe)
                blur = 10 * (1 - pe)
                dy = 22 * (1 - pe)
                img = spr
            alpha = pe
            if ex > 0:
                e = ease_in_cubic(ex)
                blur += 14 * e; alpha *= (1 - e); sc *= 1 + 0.06 * e; dy -= 18 * e
            if alpha <= 0.01:
                continue
            paste_center(canvas, transform_sprite(img, sc, blur, alpha), cx, cy + dy)

# ============================================================== elements
SANS = lambda s: ImageFont.truetype(F_SEMI, s)
BIGF = lambda s: ImageFont.truetype(F_BIG, s)

def logo_tile(backdrop, logo, size, cx, cy, gold_border=False):
    x, y = int(cx - size / 2), int(cy - size / 2)
    card, sp = glass_card(backdrop, x, y, size, size, int(size * 0.25), gold_border=gold_border)
    lg = logo.copy(); lg.thumbnail((int(size * 0.6), int(size * 0.6)), Image.LANCZOS)
    # small soft shadow under logo
    sh = Image.new("RGBA", lg.size, (0, 0, 0, 0)); sh.putalpha(lg.getchannel("A").point(lambda v: v * 0.55))
    sh = transform_sprite(sh, 1.0, 6, 1.0)
    paste_center(card, sh, card.width / 2, card.height / 2 + 8)
    paste_center(card, lg, card.width / 2, card.height / 2)
    return card

def avatar_tile(backdrop, size, cx, cy, gold=False):
    x, y = int(cx - size / 2), int(cy - size / 2)
    card, sp = glass_card(backdrop, x, y, size, size, size // 2, gold_border=gold)
    ss = 3
    m = Image.new("L", (size * ss, size * ss), 0)
    d = ImageDraw.Draw(m)
    s = size * ss
    d.ellipse((s * 0.36, s * 0.2, s * 0.64, s * 0.48), fill=255)
    d.ellipse((s * 0.2, s * 0.54, s * 0.8, s * 1.05), fill=255)
    circ = Image.new("L", (s, s), 0); ImageDraw.Draw(circ).ellipse((6, 6, s - 6, s - 6), fill=255)
    from PIL import ImageChops
    m = ImageChops.multiply(m, circ).resize((size, size), Image.LANCZOS)
    col = (240, 205, 130) if gold else (235, 235, 235)
    ic = Image.new("RGBA", (size, size), col + (0,)); ic.putalpha(m.point(lambda v: int(v * 0.85)))
    card.alpha_composite(ic, (sp, sp))
    return card

def notif_card(backdrop, cx, cy):
    w, h = 860, 172
    x, y = int(cx - w / 2), int(cy - h / 2)
    card, sp = glass_card(backdrop, x, y, w, h, 46)
    d = ImageDraw.Draw(card)
    # app icon
    ic = 112
    icon = Image.new("RGBA", (ic, ic), (0, 0, 0, 0))
    icm = rounded_mask(ic, ic, 28)
    base = Image.new("RGBA", (ic, ic), (24, 24, 26, 255)); base.putalpha(icm)
    icon.alpha_composite(base)
    lg = LOGOS["amazon"].copy(); lg.thumbnail((76, 76), Image.LANCZOS)
    paste_center(icon, lg, ic / 2, ic / 2 + 2)
    card.alpha_composite(icon, (sp + 30, sp + (h - ic) // 2))
    tx = sp + 30 + ic + 28
    d.text((tx, sp + 34), "Amazon", font=SANS(38), fill=(255, 255, 255, 245))
    d.text((sp + w - 30, sp + 38), "now", font=SANS(30), fill=(255, 255, 255, 150), anchor="ra")
    d.text((tx, sp + 92), "Your order is on the way", font=SANS(33), fill=(255, 255, 255, 190))
    return card

def bubble(backdrop, text, cx, cy, side, gold=False, typing_t=None):
    f = SANS(36)
    tw = int(f.getlength(text)) if text else 120
    w, h = tw + 76, 100
    x, y = int(cx - w / 2), int(cy - h / 2)
    if gold:
        card = Image.new("RGBA", (w + 80, h + 80), (0, 0, 0, 0))
        g = vgrad(w, h, [(0, (250, 226, 160)), (0.5, (222, 176, 80)), (1, (176, 124, 34))])
        gi = Image.fromarray(g.astype(np.uint8)).convert("RGBA"); gi.putalpha(rounded_mask(w, h, 46))
        shm = Image.new("L", card.size, 0); shm.paste(rounded_mask(w, h, 46), (40, 54)); shm = shm.filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(v * .6))
        card.paste((0, 0, 0, 255), (0, 0), shm)
        card.alpha_composite(gi, (40, 40)); sp = 40
        ImageDraw.Draw(card).text((sp + 38, sp + h / 2), text, font=f, fill=(36, 24, 6, 255), anchor="lm")
    else:
        card, sp = glass_card(backdrop, x, y, w, h, 46)
        d = ImageDraw.Draw(card)
        if typing_t is not None:
            for k in range(3):
                a = 0.35 + 0.65 * max(0, math.sin(typing_t * 7 - k * 0.9))
                cxk = sp + w / 2 + (k - 1) * 30
                d.ellipse((cxk - 9, sp + h / 2 - 9, cxk + 9, sp + h / 2 + 9), fill=(255, 255, 255, int(255 * a)))
        else:
            d.text((sp + 38, sp + h / 2), text, font=f, fill=(255, 255, 255, 235), anchor="lm")
    return card

def anim_in_out(t, t_in, t_out, din=0.42, dout=0.26):
    """returns (state progress in 0..1, exit 0..1) or None if invisible"""
    if t < t_in or t > t_out + dout:
        return None
    return clamp((t - t_in) / din), clamp((t - t_out) / dout)

def place(canvas, card, cx, cy, pin, pout, mode="flip", float_t=None):
    pe = ease_out_cubic(pin)
    if mode == "flip":
        ry = lerp(78, 0, ease_out_back(pin, 1.2)); rx = lerp(-18, 0, pe)
        sc = lerp(0.78, 1.0, ease_out_back(pin, 1.5))
    elif mode == "drop":
        ry = 0; rx = lerp(40, 0, pe); sc = lerp(0.92, 1.0, pe); cy = cy - 90 * (1 - ease_out_back(pin, 1.3))
    else:  # pop
        ry = 0; rx = 0; sc = lerp(0.6, 1.0, ease_out_back(pin, 2.2))
    blur = 12 * (1 - pe)
    alpha = pe
    if pout > 0:
        e = ease_in_cubic(pout)
        blur += 16 * e; alpha *= 1 - e; sc *= 1 - 0.12 * e; cy -= 40 * e
    if float_t is not None:
        cy += 7 * math.sin(float_t * 1.9)
        ry += 4 * math.sin(float_t * 1.3)
    if alpha < 0.01:
        return
    img = rotate3d(card, ry, rx) if (abs(ry) > 0.3 or abs(rx) > 0.3) else card
    paste_center(canvas, transform_sprite(img, sc, blur, alpha), cx, cy)

def gold_line(canvas, x0, y0, x1, y1, p, width=5):
    """animated gold line drawn from (x0,y0) toward (x1,y1)"""
    if p <= 0:
        return
    x1p, y1p = lerp(x0, x1, p), lerp(y0, y1, p)
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    d.line((x0, y0, x1p, y1p), fill=(232, 186, 92, 255), width=width)
    glow = lay.filter(ImageFilter.GaussianBlur(7))
    canvas.alpha_composite(glow); canvas.alpha_composite(lay)
    d2 = ImageDraw.Draw(canvas)
    d2.ellipse((x1p - 7, y1p - 7, x1p + 7, y1p + 7), fill=(255, 240, 200, 255))

def draw_elements(canvas, t):
    bd = canvas  # backdrop for glass = current composite
    # ---- E1: three app tiles 5.84 -> 8.95
    xs = [270, 540, 810]
    for name, tin, x in [("amazon", 5.84, xs[0]), ("flipkart", 6.54, xs[1]), ("twitter", 7.74, xs[2])]:
        st = anim_in_out(t, tin, 8.95)
        if st:
            place(canvas, logo_tile(bd, LOGOS[name], 230, x, TOP_Y), x, TOP_Y, *st, mode="flip", float_t=t + x)
    # ---- E2: Amazon spotlight 9.42 -> 12.45, then notification 12.56 -> 14.95
    st = anim_in_out(t, 9.42, 12.4)
    if st:
        place(canvas, logo_tile(bd, LOGOS["amazon"], 290, 540, TOP_Y, gold_border=True), 540, TOP_Y, *st, mode="flip", float_t=t)
    st = anim_in_out(t, 12.56, 14.95, din=0.5)
    if st:
        place(canvas, notif_card(bd, 540, 330), 540, 330, *st, mode="drop")
    # avatars "to everyone" 13.78
    for k in range(5):
        tin = 13.78 + k * 0.07
        st = anim_in_out(t, tin, 14.95)
        if st:
            x = 540 + (k - 2) * 138
            place(canvas, avatar_tile(bd, 112, x, 530), x, 530, *st, mode="pop")
    # ---- E3: Flipkart = parallel to Amazon 15.18 -> 17.6
    st = anim_in_out(t, 15.18, 17.55)
    if st:
        place(canvas, logo_tile(bd, LOGOS["flipkart"], 250, 760, TOP_Y), 760, TOP_Y, *st, mode="flip", float_t=t)
    st = anim_in_out(t, 15.45, 17.55)
    if st:
        place(canvas, logo_tile(bd, LOGOS["amazon"], 250, 320, TOP_Y), 320, TOP_Y, *st, mode="flip", float_t=t + 2)
    if 16.5 <= t <= 17.8:
        pl = ease_out_cubic((t - 16.56) / 0.4) * (1 - ease_in_cubic((t - 17.55) / 0.25))
        if pl > 0:
            gold_line(canvas, 465, TOP_Y - 16, 615, TOP_Y - 16, pl, 6)
            gold_line(canvas, 465, TOP_Y + 16, 615, TOP_Y + 16, pl, 6)
    # ---- E4: Twitter hero 18.76 -> 21.2
    st = anim_in_out(t, 18.76, 21.2)
    if st:
        bump = 1 + 0.08 * max(0, 1 - abs(t - 19.42) / 0.12) if 19.3 < t < 19.6 else 1
        card = logo_tile(bd, LOGOS["twitter"], int(300 * bump), 540, TOP_Y, gold_border=True)
        place(canvas, card, 540, TOP_Y, *st, mode="flip", float_t=t)
    # ---- E5: connect network 21.38 -> 23.6, then one-to-one 23.66 -> 24.5
    net = [(540, 300), (240, 420), (840, 420), (330, 640), (750, 640)]
    if 21.3 <= t <= 24.8:
        fade_net = ease_in_cubic(clamp((t - 23.5) / 0.25))
        for k in range(1, 5):
            p = clamp((t - (21.55 + k * 0.12)) / 0.35)
            if p > 0 and fade_net < 1:
                lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                gold_line(lay, net[0][0], net[0][1], net[k][0], net[k][1], ease_out_cubic(p), 4)
                if fade_net > 0:
                    lay.putalpha(lay.getchannel("A").point(lambda v: int(v * (1 - fade_net))))
                canvas.alpha_composite(lay)
        for k, (x, y) in enumerate(net):
            tin = 21.38 + (0 if k == 0 else 0.1 + k * 0.08)
            st = anim_in_out(t, tin, 23.5 if k else 23.5)
            if st:
                place(canvas, avatar_tile(bd, 128 if k == 0 else 108, x, y, gold=(k == 0)), x, y, *st, mode="pop")
    # one-to-one
    st = anim_in_out(t, 23.66, 24.5)
    if st:
        pin = st[0]
        lx, rx_ = 330, 750
        pl = ease_out_cubic(clamp((t - 23.85) / 0.35)) * (1 - ease_in_cubic(st[1]))
        if pl > 0:
            gold_line(canvas, lx + 72, TOP_Y, rx_ - 72, TOP_Y, pl, 5)
        place(canvas, avatar_tile(bd, 140, lx, TOP_Y, gold=True), lx, TOP_Y, *st, mode="pop")
        place(canvas, avatar_tile(bd, 140, rx_, TOP_Y), rx_, TOP_Y, *st, mode="pop")
    # ---- E6: Twitter again 25.18 -> 26.5
    st = anim_in_out(t, 25.18, 26.45)
    if st:
        place(canvas, logo_tile(bd, LOGOS["twitter"], 240, 540, TOP_Y), 540, TOP_Y, *st, mode="flip", float_t=t)
    # ---- E7: chat with experts 26.68 -> 28.9
    st = anim_in_out(t, 26.62, 28.85)
    if st:
        place(canvas, bubble(bd, "Hey! Can I ask you something?", 470, 270, "l"), 470, 270, *st, mode="pop")
    st = anim_in_out(t, 27.36, 28.85)
    if st:
        place(canvas, bubble(bd, "Sure, ask away!", 690, 400, "r", gold=True), 690, 400, *st, mode="pop")
    st = anim_in_out(t, 27.9, 28.85)
    if st:
        place(canvas, bubble(bd, "", 270, 530, "l", typing_t=t), 270, 530, *st, mode="pop")

# ============================================================== camera moves
def zoom_at(t):
    z = 1.0 + 0.035 * (t / 30.0)          # slow push-in
    for tp in [5.84, 9.42, 15.18, 18.76, 23.66, 29.0]:  # punch-ins on key beats
        d = t - tp
        if 0 <= d < 0.8:
            z += 0.035 * math.sin(math.pi * clamp(d / 0.8)) ** 1.0 * (1 - d / 0.8) * 2
    return z

# ============================================================== frame
GRAIN = np.random.default_rng(11)
def render(i):
    t = (i - 1) / FPS
    bg = background(t).convert("RGBA")
    dust(bg, t, 0.6 if t > 29.0 else 0.0)
    P, M = person_layer(i, zoom_at(t))
    bgf = np.asarray(bg.convert("RGB"), np.float32)
    pf3 = None
    pf = np.asarray(P, np.float32)[..., None]
    mf = (np.asarray(M, np.float32) / 255)[..., None]
    comp = bgf * (1 - mf) + pf * mf
    comp *= bottom_fade()[..., None]
    comp *= vignette()[..., None]
    # intro fade from black
    comp *= ease_out_cubic(t / 0.5)
    canvas = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8)).convert("RGBA")
    draw_elements(canvas, t)
    draw_captions(canvas, t)
    # film grain (luma only)
    arr = np.asarray(canvas.convert("RGB"), np.int16)
    g = np.random.default_rng(1000 + i).normal(0, 4.2, (H // 2, W // 2)).astype(np.float32)
    g = np.asarray(Image.fromarray(np.clip(g * 10 + 128, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32)
    g = (g - 128) / 10
    arr = np.clip(arr + g[..., None], 0, 255).astype(np.uint8)
    # outro: fade to black over last 0.25s
    tail = clamp((t - (NFR - 1) / FPS + 0.25) / 0.25)
    if tail > 0:
        arr = (arr * (1 - tail)).astype(np.uint8)
    return Image.fromarray(arr)


if __name__ == "__main__":
    k, n = int(sys.argv[1]), int(sys.argv[2])
    frames = [int(x) for x in sys.argv[3:]] or list(range(1, NFR + 1))
    sub = os.environ.get("OUTDIR", OUT)
    os.makedirs(sub, exist_ok=True)
    for idx, i in enumerate(frames):
        if idx % n != k:
            continue
        render(i).save(os.path.join(sub, f"{i:04d}.png"), compress_level=1)
