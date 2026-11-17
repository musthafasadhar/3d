"""Motion-graphics primitives: premultiplied RGBA sprites, text, easing, blitting."""
import numpy as np, cv2, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FD = __file__.rsplit("/", 1)[0] + "/fonts/"
W, H, FPS = 1080, 1920, 30

# ---------------------------------------------------------------- fonts
_fc = {}
def font(name, size, wght=None, opsz=None):
    k = (name, size, wght, opsz)
    if k in _fc: return _fc[k]
    f = ImageFont.truetype(FD + name, size, layout_engine=ImageFont.Layout.RAQM)
    if name == "Inter.ttf": f.set_variation_by_axes([opsz or 32, wght or 600])
    elif name in ("Montserrat.ttf", "Unbounded.ttf"): f.set_variation_by_axes([wght or 900])
    elif name == "BigShoulders.ttf": f.set_variation_by_axes([wght or 900, 72])
    _fc[k] = f; return f

BLACK = lambda s: font("Montserrat.ttf", s, 900)
XBOLD = lambda s: font("Montserrat.ttf", s, 800)
ANTON = lambda s: font("Anton-Regular.ttf", s)
INTER = lambda s, w=600: font("Inter.ttf", s, w)
SERIF = lambda s: font("InstrumentSerif-Italic.ttf", s)

# ---------------------------------------------------------------- colours
WHITE_G = ((255, 255, 255), (255, 233, 205))
LIME_G = ((240, 255, 130), (128, 255, 64))
LIME = (190, 255, 80)
RED = (255, 64, 64)
GOLD_G = ((255, 240, 170), (255, 190, 60))

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def prog(t, t0, d): return clamp((t - t0) / d) if d > 0 else float(t >= t0)
def e_out_cubic(x): return 1 - (1 - x) ** 3
def e_in_cubic(x): return x ** 3
def e_io_cubic(x): return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def e_out_expo(x): return 1 if x >= 1 else 1 - 2 ** (-10 * x)
def e_out_back(x, s=1.9): x -= 1; return 1 + (s + 1) * x ** 3 + s * x ** 2
def e_out_elastic(x):
    if x <= 0 or x >= 1: return x
    return 2 ** (-10 * x) * math.sin((x * 10 - .75) * 2 * math.pi / 3) + 1
def lerp(a, b, x): return a + (b - a) * x

# ---------------------------------------------------------------- sprites
class Sprite:
    """premultiplied float32 RGBA, anchor = centre."""
    def __init__(self, arr): self.a = arr.astype(np.float32)
    @property
    def w(self): return self.a.shape[1]
    @property
    def h(self): return self.a.shape[0]

def pil_to_sprite(img):
    a = np.asarray(img.convert("RGBA")).astype(np.float32) / 255
    a[..., :3] *= a[..., 3:4]
    return Sprite(a)

def grad(h, w, cols, vertical=True, stops=None):
    cols = np.array(cols, np.float32) / 255
    n = len(cols)
    x = np.linspace(0, 1, h if vertical else w)
    st = np.linspace(0, 1, n) if stops is None else np.array(stops)
    ch = [np.interp(x, st, cols[:, i]) for i in range(3)]
    g = np.stack(ch, -1)
    return np.broadcast_to(g[:, None, :] if vertical else g[None, :, :], (h, w, 3)).copy()

def text_mask(txt, f, tracking=0):
    """returns L-mode numpy mask (float 0-1), tight-ish bbox with padding."""
    pad = int(f.size * 0.5)
    if tracking == 0:
        bb = f.getbbox(txt)
        w, h = bb[2] - bb[0] + 2 * pad, bb[3] - bb[1] + 2 * pad
        im = Image.new("L", (w, h)); d = ImageDraw.Draw(im)
        d.text((pad - bb[0], pad - bb[1]), txt, font=f, fill=255)
    else:
        tr = tracking * f.size
        adv = [f.getlength(c) for c in txt]
        tw = sum(adv) + tr * (len(txt) - 1)
        bb = f.getbbox(txt)
        w, h = int(tw + 2 * pad), bb[3] - bb[1] + 2 * pad
        im = Image.new("L", (w, h)); d = ImageDraw.Draw(im); x = pad
        for c, a in zip(txt, adv):
            d.text((x, pad - bb[1]), c, font=f, fill=255); x += a + tr
    m = np.asarray(im).astype(np.float32) / 255
    ys, xs = np.where(m > 0.003)
    m = m[max(ys.min() - pad, 0):ys.max() + pad, max(xs.min() - pad, 0):xs.max() + pad]
    return m

def make_text(txt, f, fill=WHITE_G, tracking=0, shadow=0.55, shadow_blur=None, shadow_off=None,
              glow=None, glow_r=None, glow_a=0.9, stroke=0, stroke_col=(0, 0, 0), vertical=True,
              inner_y=None):
    m = text_mask(txt, f, tracking)
    h, w = m.shape
    ys, xs = np.where(m > 0.05)
    y0, y1 = ys.min(), ys.max() + 1
    if isinstance(fill[0], (tuple, list)):
        g = np.zeros((h, w, 3), np.float32)
        g[y0:y1] = grad(y1 - y0, w, fill, vertical)
        g[:y0] = g[y0]; g[y1:] = g[y1 - 1]
    else:
        g = np.broadcast_to(np.array(fill, np.float32) / 255, (h, w, 3)).copy()
    out = np.zeros((h, w, 4), np.float32)
    def over(col_rgb, alpha):
        nonlocal out
        pa = alpha[..., None]
        out[..., :3] = col_rgb * pa + out[..., :3] * (1 - pa)
        out[..., 3] = alpha + out[..., 3] * (1 - alpha)
    if glow is not None:
        r = glow_r or f.size * 0.35
        gm = cv2.GaussianBlur(m, (0, 0), r) * glow_a * 1.6
        over(np.array(glow, np.float32) / 255, np.clip(gm, 0, 1))
    if shadow:
        sb = shadow_blur or f.size * 0.08
        so = shadow_off or (0, f.size * 0.045)
        sm = cv2.GaussianBlur(m, (0, 0), sb)
        sm = np.roll(np.roll(sm, int(so[1]), 0), int(so[0]), 1)
        over(np.zeros(3, np.float32), np.clip(sm * shadow, 0, 1))
    if stroke:
        k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * stroke + 1, 2 * stroke + 1))
        over(np.array(stroke_col, np.float32) / 255, cv2.dilate(m, k))
    over(g, m)
    return Sprite(out)

def pil_canvas(w, h): return Image.new("RGBA", (w, h), (0, 0, 0, 0))

def rounded_card(w, h, r, fill=(16, 16, 20, 225), border=(255, 255, 255, 40), bw=2, shadow=True,
                 top_sheen=True):
    pad = 60 if shadow else 4
    im = pil_canvas(w + 2 * pad, h + 2 * pad)
    if shadow:
        sh = Image.new("L", im.size, 0)
        ImageDraw.Draw(sh).rounded_rectangle((pad, pad + 14, pad + w, pad + h + 14), r, fill=150)
        sh = sh.filter(ImageFilter.GaussianBlur(26))
        im.paste((0, 0, 0, 255), (0, 0), sh)
    card = pil_canvas(*im.size); d = ImageDraw.Draw(card)
    d.rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=fill, outline=border, width=bw)
    if top_sheen:
        sheen = Image.new("L", im.size, 0)
        sd = ImageDraw.Draw(sheen)
        for i in range(h // 2):
            sd.line((pad, pad + i, pad + w, pad + i), fill=int(22 * (1 - i / (h / 2))))
        mask = Image.new("L", im.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((pad, pad, pad + w, pad + h), r, fill=255)
        from PIL import ImageChops
        sheen = ImageChops.multiply(sheen, mask)
        card.paste((255, 255, 255, 255), (0, 0), sheen) if False else None
        white = Image.new("RGBA", im.size, (255, 255, 255, 0)); white.putalpha(sheen)
        card = Image.alpha_composite(card, white)
    im = Image.alpha_composite(im, card)
    return im, pad

# ---------------------------------------------------------------- blitting
def blit(canvas, spr, cx, cy, scale=1.0, opacity=1.0, rot=0.0, blur=0.0, sx=None, sy=None,
         mblur=None):
    """composite sprite (premult) over canvas (premult H,W,4) centred at (cx,cy)."""
    if opacity <= 0.003 or scale <= 0.001: return
    sx = scale if sx is None else sx; sy = scale if sy is None else sy
    h, w = spr.h, spr.w
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    M = np.array([[c * sx, -s * sy, 0], [s * sx, c * sy, 0]], np.float64)
    M[:, 2] = [cx, cy] - M[:, :2] @ np.array([w / 2, h / 2])
    corners = np.array([[0, 0, 1], [w, 0, 1], [0, h, 1], [w, h, 1]]) @ M.T
    pad = int(blur * 3 + 4)
    x0 = int(max(math.floor(corners[:, 0].min()) - pad, 0)); x1 = int(min(math.ceil(corners[:, 0].max()) + pad, canvas.shape[1]))
    y0 = int(max(math.floor(corners[:, 1].min()) - pad, 0)); y1 = int(min(math.ceil(corners[:, 1].max()) + pad, canvas.shape[0]))
    if x1 <= x0 or y1 <= y0: return
    M2 = M.copy(); M2[:, 2] -= [x0, y0]
    interp = cv2.INTER_AREA if max(sx, sy) < 0.7 else cv2.INTER_CUBIC
    p = cv2.warpAffine(spr.a, M2, (x1 - x0, y1 - y0), flags=interp, borderMode=cv2.BORDER_CONSTANT)
    if blur > 0.3: p = cv2.GaussianBlur(p, (0, 0), blur)
    if mblur:  # directional motion blur (dx,dy) in px
        dx, dy = mblur; L = int(max(abs(dx), abs(dy)))
        if L > 2:
            k = np.zeros((2 * L + 1, 2 * L + 1), np.float32)
            cv2.line(k, (L - int(dx / 2), L - int(dy / 2)), (L + int(dx / 2), L + int(dy / 2)), 1.0, 1)
            k /= k.sum(); p = cv2.filter2D(p, -1, k)
    p = np.clip(p, 0, 1) * opacity
    reg = canvas[y0:y1, x0:x1]
    reg *= (1 - p[..., 3:4]); reg += p

def new_canvas(): return np.zeros((H, W, 4), np.float32)

def over(dst, src):
    dst *= (1 - src[..., 3:4]); dst += src
