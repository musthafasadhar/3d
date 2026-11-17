"""Edit decision list: camera, graphics elements (grouped for separate export), SFX cues."""
import json, math, numpy as np, cv2
from PIL import Image, ImageDraw, ImageFilter
from lib import *

SC = 1.5                              # source 720x1280 -> 1080x1920
N_FRAMES = 843
CUTS = [3.43, 7.43, 9.33, 13.27, 16.17, 17.10, 19.13, 21.47, 24.23, 26.77]

# ---------------------------------------------------------------- head tracking (world px)
_T = json.load(open(__file__.rsplit("/", 1)[0] + "/matte/track.json"))
_top = np.array([t["top"] for t in _T], float) * SC
_cx = np.array([t["cx"] for t in _T], float) * SC
_top = cv2.blur(_top[None], (9, 1))[0]; _cx = cv2.blur(_cx[None], (9, 1))[0]
def HT(t):  # head top (world y) at time t
    i = int(clamp(t * FPS, 0, N_FRAMES - 1)); return float(_top[i])
def HX(t):
    i = int(clamp(t * FPS, 0, N_FRAMES - 1)); return float(_cx[i])

# ---------------------------------------------------------------- camera
SEGS = [0] + CUTS + [28.1]
FOCUS = (675.0, 700.0)
PULSES = [(0.90, .030), (1.94, .040), (4.04, .025), (7.35, .070), (14.09, .03), (14.43, .045),
          (16.51, .060), (16.69, .03), (24.81, .055)]
SHAKES = [(7.35, 11, .40), (14.09, 5, .22), (16.51, 8, .32), (24.81, 5, .25)]

def _seg_zoom(t):
    if t < 3.43:
        return lerp(1.22, 1.05, e_out_cubic(prog(t, 0, .55))) + .04 * prog(t, .55, 2.88)
    if t < 7.43:  return lerp(1.20, 1.25, prog(t, 3.43, 4.0))
    if t < 9.33:  return 1.0 + .035 * prog(t, 7.43, 1.9)
    if t < 13.27:
        z = lerp(1.12, 1.15, prog(t, 9.33, 2.0))
        return lerp(z, 1.0, e_io_cubic(prog(t, 11.20, .30))) + .02 * prog(t, 11.5, 1.7)
    if t < 16.17: return lerp(1.0, 1.07, e_io_cubic(prog(t, 13.27, 2.9)))
    if t < 17.10: return 1.0 + .03 * prog(t, 16.17, .93)
    if t < 19.13: return 1.0 + .04 * prog(t, 17.10, 2.0)
    if t < 21.47: return lerp(1.10, 1.13, prog(t, 19.13, 2.3))
    if t < 24.23: return lerp(1.10, 1.13, prog(t, 21.47, 2.8))
    if t < 26.77: return 1.0 + .04 * prog(t, 24.23, 2.5)
    return lerp(1.10, 1.16, e_io_cubic(prog(t, 26.77, 1.33)))

def camera(t):
    z = _seg_zoom(t)
    for tp, a in PULSES:
        if tp - 0.05 <= t < tp + 0.6:
            x = t - tp
            z += a * (prog(x, -0.05, .07) if x < .02 else math.exp(-(x - .02) * 7))
    dx = dy = 0.0
    for ts, amp, d in SHAKES:
        if ts <= t < ts + d:
            k = 1 - (t - ts) / d; x = (t - ts) * 60
            dx += amp * k * (math.sin(x * 1.9) + .5 * math.sin(x * 3.7 + 1))
            dy += amp * k * (math.cos(x * 2.3) + .5 * math.sin(x * 4.1 + 2))
            z += .015 * k
    fx, fy = FOCUS
    M = np.array([[z, 0, (1 - z) * fx + dx], [0, z, (1 - z) * fy + dy]], np.float64)
    return M, z

# ---------------------------------------------------------------- element registry
ELEMENTS = []
def element(name, layer, t0, t1, sfx=()):
    def deco(fn):
        ELEMENTS.append(dict(name=name, layer=layer, t0=t0, t1=t1, draw=fn, sfx=list(sfx)))
        return fn
    return deco

def fit(txt, ffn, size, max_w, **kw):
    while True:
        s = make_text(txt, ffn(size), **kw)
        if s.w - size * 0.9 <= max_w or size < 30: return s
        size = int(size * 0.94)

# animation presets ---------------------------------------------------
def a_slam(t, t0, t_out=None, s0=1.9, d=.22):
    p = prog(t, t0, d)
    sc = lerp(s0, 1, e_out_expo(p)); op = prog(t, t0, .06); bl = (1 - e_out_cubic(p)) * 10
    if t_out is not None and t >= t_out:
        q = prog(t, t_out, .16); op *= 1 - q; sc *= 1 + .1 * q; bl += 14 * q
    return sc, op, bl

def a_pop(t, t0, t_out=None, d=.30):
    p = prog(t, t0, d)
    sc = lerp(.35, 1, e_out_back(p)) if p < 1 else 1; op = prog(t, t0, .08); bl = (1 - p) * 6
    if t_out is not None and t >= t_out:
        q = prog(t, t_out, .16); op *= 1 - q; sc *= 1 - .15 * q; bl += 8 * q
    return sc, op, bl

def a_blur(t, t0, t_out=None, d=.32):  # soft R1-style reveal
    p = e_out_cubic(prog(t, t0, d))
    sc = lerp(1.12, 1, p); op = p; bl = (1 - p) * 16; dy = (1 - p) * 18
    if t_out is not None and t >= t_out:
        q = e_in_cubic(prog(t, t_out, .18)); op *= 1 - q; bl += 14 * q; dy -= 14 * q
    return sc, op, bl, dy

def words_row(ws, f, fill=WHITE_G, gap=0.28, shadow=.5):
    """pre-render list of words, return sprites + x offsets (centred row)"""
    sp = [make_text(w, f, fill=fill, shadow=shadow) for w in ws]
    pad = f.size * 0.5
    widths = [s.w - 2 * pad for s in sp]
    total = sum(widths) + gap * f.size * (len(ws) - 1)
    xs, x = [], -total / 2
    for w in widths: xs.append(x + w / 2); x += w + gap * f.size
    return sp, xs

def draw_words(cv, t, sp, xs, times, cx, cy, t_out=None):
    for s, x, tt in zip(sp, xs, times):
        sc, op, bl, dy = a_blur(t, tt, t_out)
        blit(cv, s, cx + x, cy + dy, sc, op, blur=bl)

# =====================================================================
# 1. HOOK  0 - 3.43
# =====================================================================
_hook_sp, _hook_x = words_row(["want", "to", "go", "viral", "with"], INTER(50, 600))
_ai = fit("AI VIDEOS", BLACK, 190, 930, fill=WHITE_G, shadow=.6)
@element("01_hook_AI-VIDEOS_behind-head", "back", 0.0, 2.10,
         sfx=[(0.0, "whoosh_long", .30), (0.90, "punch_hit", .55)])
def _(cv, t):
    y = HT(0.9) - 20; t_out = 1.90
    draw_words(cv, t, _hook_sp, _hook_x, [0.10 + .12 * i for i in range(5)], 560, y - 140, t_out)
    sc, op, bl = a_slam(t, 0.90, t_out)
    blit(cv, _ai, 560, y, sc, op, blur=bl)

_lakhs = fit("LAKHS", BLACK, 300, 900, fill=LIME_G, shadow=.65, glow=(20, 40, 0), glow_a=.5)
_ofviews = make_text("of views?", SERIF(110), fill=WHITE_G, shadow=.6)
@element("02_LAKHS-of-views_behind-head", "back", 1.90, 3.43,
         sfx=[(1.92, "whoosh_fast", .35), (1.94, "punch_hit", .45)])
def _(cv, t):
    y = HT(2.0) - 45
    sc, op, bl = a_slam(t, 1.94, None, s0=2.3)
    blit(cv, _lakhs, 560, y, sc, op, blur=bl)
    sc, op, bl, dy = a_blur(t, 2.36)
    blit(cv, _ofviews, 790, y - 140 + dy, sc, op, blur=bl, rot=-4)

def _eye_icon(sz=64, col=(190, 255, 80)):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im); c = sz / 2
    d.ellipse((4, sz * .25, sz - 4, sz * .75), outline=col + (255,), width=5)
    d.ellipse((c - 11, c - 11, c + 11, c + 11), fill=col + (255,))
    return im
_card_views, _cvpad = rounded_card(520, 120, 60, fill=(14, 14, 18, 215))
_card_views.paste(_eye_icon(), (_cvpad + 34, _cvpad + 28), _eye_icon())
_card_views_sp = pil_to_sprite(_card_views)
_views_lbl = make_text("views", INTER(36, 500), fill=(200, 200, 205), shadow=0)
@element("03_views-counter_card", "front", 1.94, 3.43,
         sfx=[(1.96, "pop", .35)] + [(2.0 + i * .085, "click", .10 * (1 - i / 14)) for i in range(13)]
             + [(3.10, "sparkle", .30)])
def _(cv, t):
    sc, op, bl = a_pop(t, 1.96)
    bob = math.sin(t * 3) * 4
    cx, cy = 330, 1215 + bob
    blit(cv, _card_views_sp, cx, cy, sc, op, blur=bl)
    if op > .5:
        v = int(1000000 * e_out_cubic(prog(t, 2.0, 1.1)))
        s = f"{v:,}"
        # indian grouping 10,00,000
        n = str(v); s = n if len(n) <= 3 else (lambda a, b: (",".join([a[max(i - 2, 0):i] for i in range(len(a), 0, -2)][::-1]) + "," + b))(n[:-3], n[-3:])
        if v >= 1000000: s += "+"
        num = make_text(s, XBOLD(54), fill=LIME_G, shadow=0)
        blit(cv, num, cx - 145 + num.w / 2 - 27, cy, sc, op)
        blit(cv, _views_lbl, cx + 190, cy + 4, sc, op)

# =====================================================================
# 2. CLAUDE SUBSCRIPTION  3.43 - 7.43
# =====================================================================
_but_sp, _but_x = words_row(["but", "you", "think", "you", "need"], INTER(46, 600))
_claude = fit("CLAUDE", BLACK, 200, 760, fill=WHITE_G, shadow=.6)
@element("04_CLAUDE_behind-head", "back", 3.43, 5.90,
         sfx=[(3.43, "whoosh", .30), (4.04, "punch_hit", .40)])
def _(cv, t):
    y = HT(4.0) - 10
    draw_words(cv, t, _but_sp, _but_x, [3.48 + .1 * i for i in range(5)], 560, y - 150, 5.75)
    sc, op, bl = a_slam(t, 4.04, 5.75)
    blit(cv, _claude, 560, y, sc, op, blur=bl)

def _asterisk(sz, col=(255, 255, 255)):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im); c = sz / 2
    for k in range(6):
        a = k * math.pi / 6
        d.line((c - math.cos(a) * c * .62, c - math.sin(a) * c * .62, c + math.cos(a) * c * .62,
                c + math.sin(a) * c * .62), fill=col + (255,), width=max(3, sz // 11))
    return im
def _sub_card(price_col):
    im, pad = rounded_card(780, 190, 44, fill=(16, 16, 20, 228))
    d = ImageDraw.Draw(im)
    d.ellipse((pad + 34, pad + 40, pad + 144, pad + 150), fill=(217, 119, 87, 255))
    a = _asterisk(70); im.paste(a, (pad + 54, pad + 60), a)
    d.text((pad + 172, pad + 42), "Claude Pro", font=INTER(48, 700), fill=(255, 255, 255))
    d.text((pad + 172, pad + 106), "Monthly subscription", font=INTER(34, 500), fill=(170, 170, 178))
    f = XBOLD(50); txt = "$20/mo"
    d.text((pad + 780 - 36 - f.getlength(txt), pad + 66), txt, font=f, fill=price_col)
    return pil_to_sprite(im)
_sub_w, _sub_r = _sub_card((255, 255, 255)), _sub_card((255, 80, 80))
@element("05_subscription-card_strike", "front", 4.50, 7.30,
         sfx=[(4.55, "pop", .40), (5.08, "click", .25), (6.67, "glitch", .30), (7.02, "swish", .25)])
def _(cv, t):
    sc, op, bl = a_pop(t, 4.55, 7.02)
    cx, cy = 540, 1300 + math.sin(t * 2.6) * 4
    jit = 0
    if 6.67 <= t < 6.95: jit = math.sin(t * 120) * 9 * (1 - prog(t, 6.67, .28))
    red = 5.08 <= t < 5.5 or t >= 6.67
    blit(cv, _sub_r if red else _sub_w, cx + jit, cy, sc, op, blur=bl)
    if t >= 6.67 and op > 0:   # red strike line
        p = e_out_cubic(prog(t, 6.67, .2))
        x0, x1 = cx - 400, cx - 400 + 800 * p
        ln = new_canvas()[: 60, : 1080]
        cv2.line(ln, (int(x0 + jit), 30), (int(x1 + jit), 30), (1.0 * 255 / 255, .25, .25, 1), 12, cv2.LINE_AA)
        ln[..., :3] *= ln[..., 3:4]
        y0 = int(cy - 30) - 0
        reg = cv[y0:y0 + 60]; l = ln * op; reg *= 1 - l[..., 3:4]; reg += l

_free = fit("FREE", BLACK, 380, 960, fill=LIME_G, shadow=.65, glow=(10, 30, 0), glow_a=.5)
_aivid = make_text("AI videos for", SERIF(104), fill=WHITE_G, shadow=.6)
@element("06_FREE_behind-head", "back", 7.30, 9.33,
         sfx=[(6.15, "riser", .22), (7.35, "impact_boom", .70), (7.83, "pop", .25)])
def _(cv, t):
    y = HT(7.6) - 50
    sc, op, bl = a_slam(t, 7.35, None, s0=2.6, d=.2)
    blit(cv, _free, 565, y, sc, op, blur=bl)
    sc, op, bl, dy = a_blur(t, 7.80)
    blit(cv, _aivid, 330, y - 150 + dy, sc, op, blur=bl, rot=-4)

@element("07_flash_FREE", "front", 7.33, 7.65)
def _(cv, t):
    a = .6 * (1 - e_out_cubic(prog(t, 7.35, .28))) * prog(t, 7.33, .02)
    cv[...] = cv * (1 - a) + np.array([a, a, a, a], np.float32)

# =====================================================================
# 3. 5 VIDEOS DAILY  9.33 - 13.27
# =====================================================================
_wo_sp, _wo_x = words_row(["without", "paying", "monthly"], INTER(48, 600))
_zero = make_text("₹0", BLACK(190), fill=LIME_G, shadow=.6)
_month = make_text("/month", INTER(64, 700), fill=WHITE_G, shadow=.6)
@element("08_RS0-per-month_caption", "front", 9.60, 11.40,
         sfx=[(10.07, "swish", .20), (10.49, "pop", .45), (10.55, "ding", .18)])
def _(cv, t):
    cx, cy = 540, 1290
    draw_words(cv, t, _wo_sp, _wo_x, [9.75, 10.07, 10.20], cx, cy - 150, 11.20)
    sc, op, bl = a_pop(t, 10.49, 11.20)
    blit(cv, _zero, cx - 110, cy, sc, op, blur=bl)
    sc2, op2, bl2, dy = a_blur(t, 10.62, 11.20)
    blit(cv, _month, cx + 140, cy + 28 + dy, sc2, op2, blur=bl2)

_five = make_text("5", ANTON(820), fill=LIME_G, shadow=.55, glow=(20, 60, 0), glow_a=.45, glow_r=60)
_videos = fit("VIDEOS", BLACK, 130, 560, fill=WHITE_G, shadow=.6)
_daily = fit("DAILY", BLACK, 170, 560, fill=LIME_G, shadow=.6)
@element("09_5-VIDEOS-DAILY_behind-head", "back", 11.25, 13.27,
         sfx=[(11.25, "whoosh", .30), (11.33, "impact_boom", .45), (11.47, "pop", .25), (12.13, "punch_hit", .35)])
def _(cv, t):
    sc, op, bl = a_slam(t, 11.33, None, s0=2.0, d=.25)
    blit(cv, _five, 245, 560, sc, op, blur=bl, rot=-4)
    y = HT(11.6)
    sc, op, bl = a_pop(t, 11.47)
    blit(cv, _videos, 715, y - 160, sc, op, blur=bl)
    sc, op, bl = a_slam(t, 12.13, s0=1.6)
    blit(cv, _daily, 715, y - 25, sc, op, blur=bl)

# =====================================================================
# 4. SECRET TRICK  13.27 - 16.17
# =====================================================================
@element("10_dark-mood_background-dim", "back", 13.27, 16.17)
def _(cv, t):
    a = .42 * e_out_cubic(prog(t, 13.27, .35))
    cv[..., 3] = cv[..., 3] * (1 - a) + a; cv[..., :3] *= (1 - a)

def _ring_sprite(r, p, ang):
    s = int(2 * r + 120); im = np.zeros((s, s, 4), np.float32); c = s // 2
    end = 360 * e_out_cubic(p)
    lay = np.zeros((s, s), np.float32)
    cv2.ellipse(lay, (c, c), (r, r), -90, 0, end, 1.0, 5, cv2.LINE_AA)
    glow = cv2.GaussianBlur(lay, (0, 0), 14) * 2.2
    dot = np.zeros((s, s), np.float32)
    if p >= 1:
        a = math.radians(ang); cv2.circle(dot, (int(c + r * math.cos(a)), int(c + r * math.sin(a))), 11, 1.0, -1, cv2.LINE_AA)
    lime = np.array(LIME, np.float32) / 255
    ga = np.clip(glow, 0, .8)
    im[..., :3] = lime * ga[..., None]; im[..., 3] = ga
    for m, col in ((lay, np.ones(3, np.float32)), (dot, lime)):
        im[..., :3] = col * m[..., None] + im[..., :3] * (1 - m[..., None]); im[..., 3] = m + im[..., 3] * (1 - m)
    return Sprite(im)
@element("11_halo-ring_behind-head", "back", 13.50, 16.17, sfx=[(13.50, "reverse_swell", .25)])
def _(cv, t):
    p = prog(t, 13.55, .5)
    i = int(t * FPS)
    cx, cy = HX(t) + 10, HT(t) + 250
    spr = _ring_sprite(345, p, t * 160)
    blit(cv, spr, cx, cy, lerp(.85, 1, e_out_cubic(p)), min(1, p * 3))

def _rec_layer(t):
    im = pil_canvas(W, H); d = ImageDraw.Draw(im); m, L, w = 64, 90, 6; c = (255, 255, 255, 230)
    for (x, y, sx, sy) in ((m, 170, 1, 1), (W - m, 170, -1, 1), (m, H - 330, 1, -1), (W - m, H - 330, -1, -1)):
        d.line((x, y, x + sx * L, y), fill=c, width=w); d.line((x, y, x, y + sy * L), fill=c, width=w)
    if int(t * 2) % 2 == 0: d.ellipse((m + 30, 205, m + 58, 233), fill=(255, 50, 50, 255))
    d.text((m + 72, 198), "REC", font=INTER(36, 700), fill=(255, 255, 255, 240))
    fr = int(t * FPS) % FPS; s = int(t)
    tc = f"00:00:{s:02d}:{fr:02d}"
    f = INTER(32, 500); d.text((W - m - 30 - f.getlength(tc), 202), tc, font=f, fill=(255, 255, 255, 220))
    d.text((m + 30, H - 390), "ISO 800   1/60   4K", font=INTER(28, 500), fill=(255, 255, 255, 170))
    return pil_to_sprite(im)
@element("12_REC-camera-frame", "front", 13.27, 16.17, sfx=[(13.30, "shutter", .30)])
def _(cv, t):
    op = prog(t, 13.27, .12)
    blit(cv, _rec_layer(t), W / 2, H / 2, lerp(1.06, 1, e_out_cubic(prog(t, 13.27, .3))), op)

_secret = fit("SECRET", BLACK, 130, 640, fill=WHITE_G, shadow=.6, tracking=0.06)
_trick = fit("TRICK", BLACK, 250, 820, fill=LIME_G, shadow=.65, glow=(10, 30, 0), glow_a=.5)
def _tint(s, rgb):
    a = s.a.copy(); a[..., :3] = a[..., 3:4] * np.array(rgb, np.float32); return Sprite(a)
_secret_r, _secret_c = _tint(_secret, (1, .1, .2)), _tint(_secret, (.1, .9, 1))
@element("13_SECRET-TRICK_behind-head", "back", 14.05, 16.17,
         sfx=[(12.89, "riser", .30), (14.09, "glitch", .40), (14.09, "punch_hit", .35), (14.43, "impact_boom", .50)])
def _(cv, t):
    y = HT(14.3) - 40
    g = 1 - prog(t, 14.09, .3)
    op = prog(t, 14.07, .04)
    if g > 0:
        j = lambda k: math.sin(t * 97 + k) * 18 * g
        blit(cv, _secret_r, 560 + j(1), y - 195 + j(2) * .3, 1, op * .8)
        blit(cv, _secret_c, 560 - j(3), y - 195 - j(4) * .3, 1, op * .8)
    blit(cv, _secret, 560 + (math.sin(t * 61) * 10 * g), y - 195, 1, op * (1 - .4 * g))
    sc, op, bl = a_slam(t, 14.43, s0=2.2)
    blit(cv, _trick, 565, y, sc, op, blur=bl)

def _lock_icon(sz=52, col=(190, 255, 80)):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im)
    d.arc((sz * .22, 2, sz * .78, sz * .62), 180, 360, fill=col + (255,), width=6)
    d.line((sz * .22, sz * .33, sz * .22, sz * .48), fill=col + (255,), width=6)
    d.line((sz * .78 - 3, sz * .33, sz * .78 - 3, sz * .48), fill=col + (255,), width=6)
    d.rounded_rectangle((sz * .1, sz * .45, sz * .9, sz - 2), 8, fill=col + (255,))
    return im
def _pill(icon, text, w=None, f=None):
    f = f or INTER(44, 600); tw = f.getlength(text); w = w or int(tw + 150)
    im, pad = rounded_card(w, 104, 52, fill=(14, 14, 18, 222))
    d = ImageDraw.Draw(im)
    if icon is not None: im.paste(icon, (pad + 36, pad + 26), icon)
    d.text((pad + 104, pad + 26), text, font=f, fill=(255, 255, 255))
    return pil_to_sprite(im)
_nobody = _pill(_lock_icon(), "nobody tells you this")
@element("14_nobody-tells-you_pill", "front", 15.05, 16.17, sfx=[(15.09, "swish", .25), (15.12, "pop", .25)])
def _(cv, t):
    sc, op, bl = a_pop(t, 15.09)
    blit(cv, _nobody, 540, 1380 + math.sin(t * 3) * 4, sc, op, blur=bl)

# =====================================================================
# 5. BUT I'LL TELL YOU  16.17 - 17.10 (close shot)
# =====================================================================
@element("15_flash_cut", "front", 16.15, 16.45, sfx=[(16.12, "whoosh_fast", .35)])
def _(cv, t):
    a = .45 * (1 - e_out_cubic(prog(t, 16.17, .22))) * prog(t, 16.15, .02)
    cv[...] = cv * (1 - a) + np.array([a, a, a, a], np.float32)
_but2 = make_text("but", SERIF(110), fill=WHITE_G, shadow=.6)
_illtell = fit("I'LL TELL", BLACK, 170, 900, fill=LIME_G, shadow=.65)
_you = fit("YOU.", BLACK, 170, 900, fill=WHITE_G, shadow=.65)
@element("16_but-ILL-TELL-YOU_caption", "front", 16.17, 17.10,
         sfx=[(16.51, "impact_boom", .55), (16.69, "punch_hit", .40)])
def _(cv, t):
    sc, op, bl, dy = a_blur(t, 16.20)
    blit(cv, _but2, 300, 1150 + dy, sc, op, blur=bl, rot=-4)
    sc, op, bl = a_slam(t, 16.51, s0=2.2)
    blit(cv, _illtell, 540, 1290, sc, op, blur=bl)
    sc, op, bl = a_slam(t, 16.69, s0=2.0)
    blit(cv, _you, 540, 1445, sc, op, blur=bl)

# =====================================================================
# 6. FULL PROCESS / ONE REEL  17.10 - 19.13
# =====================================================================
_fp_size = 150
while BLACK(_fp_size).getlength("FULL PROCESS") > 900: _fp_size -= 4
_full = make_text("FULL", BLACK(_fp_size), fill=WHITE_G, shadow=.6)
_process = make_text("PROCESS", BLACK(_fp_size), fill=LIME_G, shadow=.6)
@element("17_FULL-PROCESS_behind-head", "back", 17.10, 19.13, sfx=[(17.10, "whoosh", .30), (17.39, "pop", .22)])
def _(cv, t):
    y = HT(17.6) - 25
    sc, op, bl, dy = a_blur(t, 17.10)
    fw = _full.w - _fp_size; pw = _process.w - _fp_size; tot = fw + pw + 36
    blit(cv, _full, 545 - tot / 2 + fw / 2, y + dy, sc, op, blur=bl)
    sc, op, bl, dy = a_blur(t, 17.39)
    blit(cv, _process, 545 + tot / 2 - pw / 2, y + dy, sc, op, blur=bl)

def _reel_icon(sz=56, col=(255, 255, 255)):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im)
    d.rounded_rectangle((3, 3, sz - 3, sz - 3), 14, outline=col + (255,), width=5)
    d.polygon([(sz * .4, sz * .3), (sz * .4, sz * .7), (sz * .72, sz * .5)], fill=col + (255,))
    return im
_reel_pill = _pill(_reel_icon(), "won't fit in 1 reel")
def _xbadge(sz=54):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im)
    d.ellipse((0, 0, sz - 1, sz - 1), fill=(255, 60, 60, 255))
    d.line((sz * .3, sz * .3, sz * .7, sz * .7), fill=(255, 255, 255, 255), width=6)
    d.line((sz * .7, sz * .3, sz * .3, sz * .7), fill=(255, 255, 255, 255), width=6)
    return pil_to_sprite(im)
_xb = _xbadge()
@element("18_wont-fit-in-1-reel_pill", "front", 18.00, 19.13,
         sfx=[(18.05, "pop", .30), (18.65, "glitch", .22), (18.66, "pop", .25)])
def _(cv, t):
    sc, op, bl = a_pop(t, 18.05)
    jit = math.sin(t * 110) * 7 * (1 - prog(t, 18.65, .25)) if t >= 18.65 else 0
    cx, cy = 540 + jit, 1360 + math.sin(t * 3) * 4
    blit(cv, _reel_pill, cx, cy, sc, op, blur=bl)
    w = _reel_pill.w - 120
    s2, o2, b2 = a_pop(t, 18.65, d=.35)
    blit(cv, _xb, cx - w / 2 + 96, cy - 34, s2 * sc, o2 * op)

# =====================================================================
# 7. STEP-BY-STEP DOCUMENT  19.13 - 23.95
# =====================================================================
def _step_tracker(t):
    s = pil_canvas(560, 140); d = ImageDraw.Draw(s)
    xs = [80, 280, 480]; y = 70; r = 46; fills = [20.09, 20.30, 20.50]
    for i in range(2):
        p = e_out_cubic(prog(t, fills[i], .2))
        d.line((xs[i] + r, y, xs[i + 1] - r, y), fill=(255, 255, 255, 90), width=5)
        if p > 0: d.line((xs[i] + r, y, xs[i] + r + (xs[i + 1] - xs[i] - 2 * r) * p, y), fill=LIME + (255,), width=5)
    for i, x in enumerate(xs):
        on = t >= fills[i]
        d.ellipse((x - r, y - r, x + r, y + r), fill=(LIME + (255,)) if on else (16, 16, 20, 200),
                  outline=(LIME + (255,)) if on else (255, 255, 255, 200), width=5)
        f = BLACK(46); txt = str(i + 1); tw = f.getlength(txt)
        d.text((x - tw / 2, y - 30), txt, font=f, fill=(10, 10, 10) if on else (255, 255, 255))
    return pil_to_sprite(s)
@element("19_step-1-2-3_tracker", "front", 19.55, 21.47,
         sfx=[(19.60, "swish", .22), (20.09, "click", .40), (20.30, "click", .40), (20.50, "click", .40), (20.52, "ding", .15)])
def _(cv, t):
    sc, op, bl = a_pop(t, 19.60)
    blit(cv, _step_tracker(t), 540, 175, sc, op, blur=bl)

_sbs = [make_text(w, BLACK(104), fill=f, shadow=.6) for w, f in (("STEP", WHITE_G), ("BY", WHITE_G), ("STEP", LIME_G))]
@element("20_STEP-BY-STEP_behind-head", "back", 20.05, 21.47, sfx=[(20.09, "pop", .2)])
def _(cv, t):
    y = HT(20.3) - 15
    ws = [s.w - 104 * .9 for s in _sbs]; tot = sum(ws) + 2 * 34; x = 545 - tot / 2
    for s, w, tt in zip(_sbs, ws, [20.09, 20.30, 20.50]):
        sc, op, bl = a_slam(t, tt, s0=1.6, d=.18)
        blit(cv, s, x + w / 2, y, sc, op, blur=bl); x += w + 34

def _doc_card():
    im, pad = rounded_card(500, 600, 44, fill=(16, 16, 20, 235))
    d = ImageDraw.Draw(im); x0, y0 = pad + 40, pad + 40
    d.rounded_rectangle((x0, y0, x0 + 86, y0 + 104), 14, fill=LIME + (255,))
    d.polygon([(x0 + 60, y0), (x0 + 86, y0 + 26), (x0 + 60, y0 + 26)], fill=(110, 170, 40, 255))
    for k in range(3): d.line((x0 + 18, y0 + 50 + k * 16, x0 + 68, y0 + 50 + k * 16), fill=(20, 20, 20, 255), width=5)
    d.text((x0 + 112, y0 + 8), "AI Video Guide", font=INTER(40, 700), fill=(255, 255, 255))
    d.text((x0 + 112, y0 + 60), "Step-by-step  ·  PDF", font=INTER(29, 500), fill=(160, 160, 168))
    d.line((x0, y0 + 140, x0 + 420, y0 + 140), fill=(255, 255, 255, 40), width=2)
    return im, pad
_doc_base, _doc_pad = _doc_card()
_rows_y = [205, 290, 375, 460]
def _doc_sprite(t):
    im = _doc_base.copy(); d = ImageDraw.Draw(im); p = _doc_pad
    for i, ry in enumerate(_rows_y):
        tt = 20.95 + i * .22
        q = e_out_cubic(prog(t, tt, .25))
        if q <= 0: continue
        y = p + ry; x = p + 40
        on = t >= tt + .3
        d.rounded_rectangle((x, y, x + 44, y + 44), 10, fill=(LIME + (255,)) if on else (40, 40, 46, 255))
        if on: d.line([(x + 10, y + 23), (x + 19, y + 32), (x + 35, y + 13)], fill=(15, 15, 15, 255), width=6)
        d.text((x + 64, y - 2), f"Step 0{i + 1}", font=INTER(30, 700), fill=(255, 255, 255, int(255 * q)))
        L = int(300 * q * (0.95 - .12 * (i % 2)))
        d.rounded_rectangle((x + 64, y + 36, x + 64 + L, y + 46), 5, fill=(255, 255, 255, 60))
    return pil_to_sprite(im)
@element("21_document-card", "front", 20.55, 24.10,
         sfx=[(20.58, "whoosh", .35), (20.95, "typing", .22)] + [(21.25 + i * .22, "pop", .15) for i in range(4)] + [(23.85, "swish", .25)])
def _(cv, t):
    p = e_out_back(prog(t, 20.63, .45), 1.4) if t < 21.08 else 1
    q = e_in_cubic(prog(t, 23.85, .25))
    y = lerp(2200, 1235, p) + 900 * q + math.sin(t * 2.2) * 6
    rot = lerp(-14, -5, p) - 8 * q
    blit(cv, _doc_sprite(t), 300, y, 1, min(1, prog(t, 20.63, .12)) * (1 - q), rot=rot)

_readthe = make_text("read the", SERIF(100), fill=WHITE_G, shadow=.6)
_fulldoc = fit("FULL DOC", BLACK, 180, 820, fill=WHITE_G, shadow=.6)
_enjoy = fit("ENJOY", BLACK, 240, 820, fill=LIME_G, shadow=.65, glow=(10, 30, 0), glow_a=.5)
_rng = np.random.default_rng(3); _spk = _rng.uniform(-1, 1, (16, 3))
def _star(sz):
    im = np.zeros((sz, sz), np.float32); c = sz // 2
    cv2.line(im, (c, 0), (c, sz - 1), 1, 2, cv2.LINE_AA); cv2.line(im, (0, c), (sz - 1, c), 1, 2, cv2.LINE_AA)
    im = np.maximum(im * (1 - np.hypot(*np.mgrid[-c:sz - c, -c:sz - c]) / c).clip(0, 1) * 1.6, cv2.GaussianBlur(im, (0, 0), 3) * 1.5).clip(0, 1)
    a = np.zeros((sz, sz, 4), np.float32); a[..., :3] = im[..., None] * (np.array(LIME) / 255 * .4 + .6); a[..., 3] = im
    return Sprite(a)
_starS = _star(64)
@element("22_read-FULL-DOC_ENJOY_behind-head", "back", 21.75, 24.23,
         sfx=[(21.97, "punch_hit", .35), (23.33, "sparkle", .40), (23.33, "pop", .25)])
def _(cv, t):
    y = HT(22.4) - 20
    sc, op, bl, dy = a_blur(t, 21.81, 23.25)
    blit(cv, _readthe, 300, y - 92 + dy, sc, op, blur=bl, rot=-5)
    sc, op, bl = a_slam(t, 21.97, 23.25)
    blit(cv, _fulldoc, 560, y, sc, op, blur=bl)
    sc, op, bl = a_slam(t, 23.33, s0=2.0)
    blit(cv, _enjoy, 560, y - 20, sc, op, blur=bl)
    if t >= 23.33:
        for k, (a, b, c) in enumerate(_spk):
            q = prog(t, 23.33 + k * .02, .7)
            if 0 < q < 1:
                blit(cv, _starS, 560 + a * 420 * (0.6 + q), y - 20 + b * 170 * (0.6 + q),
                     (1 - q) * (0.6 + .6 * abs(c)), 1 - q * q, rot=q * 90)

# =====================================================================
# 8. FOLLOW + COMMENT  24.23 - 26.77
# =====================================================================
_just = make_text("just", SERIF(100), fill=WHITE_G, shadow=.6)
_follow = fit("FOLLOW", BLACK, 230, 960, fill=LIME_G, shadow=.65, glow=(10, 30, 0), glow_a=.5)
@element("23_FOLLOW_behind-head", "back", 24.10, 26.77, sfx=[(24.75, "whoosh_fast", .3), (24.81, "impact_boom", .55)])
def _(cv, t):
    y = HT(24.9) - 25
    sc, op, bl, dy = a_blur(t, 24.15)
    blit(cv, _just, 230, y - 112 + dy, sc, op, blur=bl, rot=-5)
    sc, op, bl = a_slam(t, 24.81, s0=2.3)
    blit(cv, _follow, 560, y, sc, op, blur=bl)

_av = Image.open("/root/.claude/uploads/ecd5d5d5-925a-5ee4-bd92-f94a3e0133cd/62e9b111-image.png").convert("RGB")
_av = _av.crop((820, 330, 1520, 1030)).resize((200, 200), Image.LANCZOS)
def _avatar(sz):
    a = _av.resize((sz, sz), Image.LANCZOS).convert("RGBA")
    m = Image.new("L", (sz * 4, sz * 4)); ImageDraw.Draw(m).ellipse((0, 0, sz * 4 - 1, sz * 4 - 1), fill=255)
    a.putalpha(m.resize((sz, sz), Image.LANCZOS)); return a
def _follow_card(state):
    im, pad = rounded_card(760, 160, 40, fill=(16, 16, 20, 232)); d = ImageDraw.Draw(im)
    av = _avatar(104)
    ring = pil_canvas(118, 118); ImageDraw.Draw(ring).ellipse((0, 0, 117, 117), outline=LIME + (255,), width=5)
    im.paste(ring, (pad + 22, pad + 21), ring); im.paste(av, (pad + 29, pad + 28), av)
    d.text((pad + 168, pad + 34), "Follow me", font=INTER(44, 700), fill=(255, 255, 255))
    d.text((pad + 168, pad + 92), "for the free AI guide", font=INTER(30, 500), fill=(165, 165, 172))
    bx0, by0, bx1, by1 = pad + 530, pad + 45, pad + 730, pad + 115
    if state == 0:
        d.rounded_rectangle((bx0, by0, bx1, by1), 18, fill=(0, 149, 246, 255))
        f = INTER(36, 700); tw = f.getlength("Follow"); d.text(((bx0 + bx1) / 2 - tw / 2, by0 + 13), "Follow", font=f, fill=(255, 255, 255))
    else:
        d.rounded_rectangle((bx0, by0, bx1, by1), 18, fill=(52, 52, 58, 255))
        f = INTER(32, 700); tw = f.getlength("Following")
        d.text(((bx0 + bx1) / 2 - tw / 2 + 16, by0 + 16), "Following", font=f, fill=(255, 255, 255))
        cx = (bx0 + bx1) / 2 - tw / 2 - 12
        d.line([(cx - 12, by0 + 36), (cx - 4, by0 + 44), (cx + 10, by0 + 26)], fill=LIME + (255,), width=5)
    return pil_to_sprite(im)
_fc0, _fc1 = _follow_card(0), _follow_card(1)
def _tap(r):
    s = int(r * 2 + 8); a = np.zeros((s, s, 4), np.float32); c = s // 2
    cv2.circle(a, (c, c), max(int(r), 1), (1, 1, 1, 1), 4, cv2.LINE_AA); return Sprite(a)
_finger = np.zeros((70, 70, 4), np.float32); cv2.circle(_finger, (35, 35), 26, (1, 1, 1, 1), -1, cv2.LINE_AA)
_finger = Sprite(_finger * np.array([1, 1, 1, .85], np.float32))
@element("24_follow-button-card", "front", 24.45, 26.77,
         sfx=[(24.50, "swish", .25), (24.52, "pop", .3), (25.08, "click", .5), (25.12, "ding", .30)])
def _(cv, t):
    sc, op, bl = a_pop(t, 24.52)
    cx, cy = 540, 1215 + math.sin(t * 2.5) * 4
    blit(cv, _fc1 if t >= 25.08 else _fc0, cx, cy, sc * (1 - .04 * math.exp(-max(t - 25.08, 0) * 12) * (t >= 25.08)), op, blur=bl)
    bx, by = cx + 250, cy + 0
    if 24.80 <= t < 25.35:     # finger tap
        p = e_out_cubic(prog(t, 24.80, .25)); q = prog(t, 25.15, .2)
        blit(cv, _finger, lerp(bx + 140, bx, p), lerp(by + 190, by, p), 1 - .2 * (25.0 <= t < 25.15), (1 - q) * .9)
    if t >= 25.08:
        q = prog(t, 25.08, .35)
        if q < 1: blit(cv, _tap(20 + 70 * e_out_cubic(q)), bx, by, 1, 1 - q)

def _comment_card(txt, caret, sent):
    im, pad = rounded_card(760, 120, 60, fill=(16, 16, 20, 232)); d = ImageDraw.Draw(im)
    av = _avatar(72); im.paste(av, (pad + 26, pad + 24), av)
    f = INTER(38, 600)
    if txt: d.text((pad + 124, pad + 36), txt, font=f, fill=LIME)
    else: d.text((pad + 124, pad + 36), "Add a comment…", font=INTER(38, 500), fill=(130, 130, 138))
    if caret and txt is not None:
        x = pad + 124 + (f.getlength(txt) if txt else 0) + 4
        d.line((x, pad + 34, x, pad + 84), fill=(255, 255, 255, 230), width=3)
    c = (0, 149, 246, 255) if sent else (90, 90, 98, 255)
    x0, y0 = pad + 760 - 96, pad + 30
    d.ellipse((x0, y0, x0 + 62, y0 + 62), fill=c)
    d.polygon([(x0 + 18, y0 + 18), (x0 + 48, y0 + 31), (x0 + 18, y0 + 44), (x0 + 24, y0 + 31)], fill=(255, 255, 255, 255))
    return pil_to_sprite(im)
@element("25_comment-your-ID_card", "front", 25.40, 26.77,
         sfx=[(25.42, "pop", .28), (25.62, "typing", .28), (26.47, "pop", .35), (26.50, "swish", .2)])
def _(cv, t):
    sc, op, bl = a_pop(t, 25.42)
    full = "@your_id"
    n = int(clamp((t - 25.62) / .07, 0, len(full)))
    spr = _comment_card(full[:n], int(t * 4) % 2 == 0 and t < 26.47, t >= 26.47)
    bump = 1 + .05 * math.exp(-(t - 26.47) * 10) if t >= 26.47 else 1
    blit(cv, spr, 540, 1400 + math.sin(t * 2.5 + 1) * 4, sc * bump, op, blur=bl)

# =====================================================================
# 9. DM SEND  26.77 - 28.1
# =====================================================================
def _plane(sz=150):
    im = pil_canvas(sz, sz); d = ImageDraw.Draw(im)
    d.polygon([(8, sz * .48), (sz - 8, 10), (sz * .62, sz - 8), (sz * .45, sz * .58)], fill=LIME + (255,))
    d.polygon([(sz * .45, sz * .58), (sz - 8, 10), (sz * .5, sz * .82)], fill=(120, 190, 40, 255))
    return pil_to_sprite(im.filter(ImageFilter.SMOOTH))
_planeS = _plane()
@element("26_paper-plane_fly", "front", 27.10, 28.10, sfx=[(27.10, "whoosh_long", .40)])
def _(cv, t):
    p = e_io_cubic(prog(t, 27.15, .65))
    if p <= 0 or p >= 1: return
    P = lambda u: (lerp(140, 1000, u) + math.sin(u * math.pi) * -60, lerp(1560, 260, u) - math.sin(u * math.pi) * 260)
    for k in range(14):   # dotted trail
        u = p - k * .03
        if u <= 0: break
        x, y = P(u); cv2.circle(cv, (int(x), int(y)), 5, (.75, 1, .3, 1), -1, cv2.LINE_AA) if k % 2 else None
    x, y = P(p); x2, y2 = P(min(p + .01, 1))
    ang = math.degrees(math.atan2(y2 - y, x2 - x)) + 45
    blit(cv, _planeS, x, y, lerp(.7, 1.1, p), 1, rot=ang)

def _toast():
    im, pad = rounded_card(900, 150, 40, fill=(16, 16, 20, 238)); d = ImageDraw.Draw(im)
    d.ellipse((pad + 30, pad + 30, pad + 120, pad + 120), fill=LIME + (255,))
    d.line([(pad + 52, pad + 76), (pad + 70, pad + 94), (pad + 100, pad + 56)], fill=(15, 15, 15, 255), width=9)
    d.text((pad + 148, pad + 30), "Guide sent!", font=INTER(44, 700), fill=(255, 255, 255))
    d.text((pad + 148, pad + 88), "Directly to your DM", font=INTER(32, 500), fill=(165, 165, 172))
    d.text((pad + 900 - 110, pad + 34), "now", font=INTER(30, 500), fill=(140, 140, 148))
    return pil_to_sprite(im)
_toastS = _toast()
@element("27_DM-sent_notification", "front", 27.45, 28.10, sfx=[(27.50, "ding", .45)])
def _(cv, t):
    p = e_out_back(prog(t, 27.50, .4), 1.3)
    blit(cv, _toastS, 540, lerp(-120, 215, p), 1, prog(t, 27.48, .1))

GROUPS = ELEMENTS
