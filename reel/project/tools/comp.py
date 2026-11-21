import numpy as np, cv2, json, subprocess, sys, os, math
from PIL import Image

S = '/tmp/claude-0/-home-user-3d/a055f276-09a0-5d02-abe8-edda36a4eaa9/scratchpad'
W, H, FPS = 1080, 1920, 30
NSRC = 1314
TOTAL = int(round(46.6 * FPS))
HT = json.load(open(f'{S}/headtrack.json'))
GRADE = ("hqdn3d=1.0:1.0:3:3,"
         "eq=contrast=1.05:saturation=1.05:gamma=1.0,"
         "colorbalance=rs=-0.015:bs=0.025:rh=0.025:gh=0.008:bh=-0.02,"
         "unsharp=5:5:0.40:5:5:0.0")

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def P(t, t0, d): return clamp((t - t0) / d)
def ioc(u): return 4*u*u*u if u < .5 else 1 - pow(-2*u + 2, 3) / 2
def oc(u): return 1 - pow(1 - u, 3)

# ---------- zoom timeline for FULL mode ----------
ZSEG = [(0.00, 0.45, 1.14, 1.00, 'ox'), (0.45, 3.12, 1.00, 1.03, 'lin'),
        (3.12, 5.95, 1.12, 1.15, 'lin'), (5.95, 9.20, 1.00, 1.035, 'lin'),
        (9.20, 21.80, 1.00, 1.00, 'lin'),
        (21.80, 24.80, 1.00, 1.035, 'lin'), (24.80, 26.72, 1.12, 1.145, 'lin'),
        (26.72, 28.20, 1.04, 1.08, 'lin'), (28.20, 32.05, 1.00, 1.00, 'lin'),
        (32.05, 34.40, 1.00, 1.03, 'lin'), (34.40, 38.40, 1.09, 1.12, 'lin'),
        (38.40, 41.70, 1.00, 1.04, 'lin'), (41.70, 47.0, 1.06, 1.10, 'lin')]
_EV = json.load(open(f'{S}/cap_events.json'))
BUMPS = sorted([e['t'] + 0.06 for e in _EV if e['k'] in ('B', 'L') and e.get('th') == 'dark'] + [39.74, 40.52, 41.24])

def zbase(t):
    for i, (a, b, z0, z1, e) in enumerate(ZSEG):
        if a <= t < b:
            u = (t - a) / (b - a)
            u = (1 - pow(2, -10 * u)) if e == 'ox' else u
            z = z0 + (z1 - z0) * u
            if i > 0:   # smooth the punch (4-5 frames) from previous segment end value
                pz = ZSEG[i - 1][3]
                if abs(pz - z0) > 1e-3 and t - a < 0.14:
                    z = pz + (z - pz) * oc((t - a) / 0.14)
            return z
    return ZSEG[-1][3]

def zoom(t):
    z = zbase(t)
    for tb in BUMPS:
        d = t - tb
        if 0 <= d < 0.4:
            z *= 1 + 0.03 * math.sin(math.pi * d / 0.4) * (1 - d / 0.4)
    return z

# ---------- PiP morph windows (start, end, direction) ----------
MORPH = [(9.15, 9.62, 'in'), (21.42, 21.80, 'out'), (28.15, 28.62, 'in'), (31.62, 32.00, 'out')]
CIRC_C, CIRC_D, SRC_S = (540, 1662), 370, 740

def pip_u(t):
    """0 = full frame, 1 = circle"""
    if t < 9.15 or t >= 32.0: return 0.0
    for a, b, d in MORPH:
        if a <= t < b:
            u = ioc((t - a) / (b - a)); return u if d == 'in' else 1 - u
    if 9.62 <= t < 21.42 or 28.62 <= t < 31.62: return 1.0
    return 0.0

def head(fi):
    fi = min(fi, NSRC - 1); return HT['cx'][fi], HT['top'][fi]

def placement(t, fi):
    u = pip_u(t)
    z = zoom(t)
    fcx, fcy = 540.0, 760.0
    sw, sh = W / z, H / z
    fcx = clamp(fcx, sw / 2, W - sw / 2); fcy = clamp(fcy, sh / 2, H - sh / 2)
    if u <= 0:
        return dict(u=0, k=z, sc=(fcx, fcy), rect=(0, 0, W, H), r=0)
    hx, ht = head(fi)
    ccx, ccy = hx, ht + 300
    k1 = CIRC_D / SRC_S
    k = math.exp(math.log(z) + (math.log(k1) - math.log(z)) * u)
    x0 = CIRC_C[0] - CIRC_D / 2; y0 = CIRC_C[1] - CIRC_D / 2
    rx = 0 + (x0 - 0) * u; ry = 0 + (y0 - 0) * u
    rw = W + (CIRC_D - W) * u; rh = H + (CIRC_D - H) * u
    scx = fcx + (ccx - fcx) * u; scy = fcy + (ccy - fcy) * u
    sw, sh = rw / k, rh / k
    scx = clamp(scx, sw / 2, W - sw / 2) if sw < W else W / 2
    scy = clamp(scy, sh / 2, H - sh / 2) if sh < H else H / 2
    r = min(rw, rh) / 2 * pow(u, 0.6)
    return dict(u=u, k=k, sc=(scx, scy), rect=(rx, ry, rw, rh), r=r)

def affine(pl):
    k = pl['k']; scx, scy = pl['sc']; rx, ry, rw, rh = pl['rect']
    # src point (scx,scy) -> dest center of rect
    dcx, dcy = rx + rw / 2, ry + rh / 2
    return np.float32([[k, 0, dcx - k * scx], [0, k, dcy - k * scy]])

def rrect_mask(rect, r, ss=2):
    rx, ry, rw, rh = rect
    m = np.zeros((H * ss // 2, W * ss // 2), np.uint8)  # half-res*ss for speed then upsample
    f = ss / 2
    x0, y0, x1, y1 = rx * f, ry * f, (rx + rw) * f, (ry + rh) * f; rr = r * f
    shift = 4; mul = 1 << shift
    def P2(x, y): return (int(round(x * mul)), int(round(y * mul)))
    if rr < 0.5:
        cv2.rectangle(m, P2(x0, y0), P2(x1, y1), 255, -1, cv2.LINE_AA, shift)
    else:
        rr = min(rr, (x1 - x0) / 2, (y1 - y0) / 2)
        cv2.rectangle(m, P2(x0 + rr, y0), P2(x1 - rr, y1), 255, -1, cv2.LINE_AA, shift)
        cv2.rectangle(m, P2(x0, y0 + rr), P2(x1, y1 - rr), 255, -1, cv2.LINE_AA, shift)
        for cx, cy in [(x0 + rr, y0 + rr), (x1 - rr, y0 + rr), (x0 + rr, y1 - rr), (x1 - rr, y1 - rr)]:
            cv2.circle(m, P2(cx, cy), int(round(rr * mul)), 255, -1, cv2.LINE_AA, shift)
    m = cv2.resize(m, (W, H), interpolation=cv2.INTER_LINEAR)
    return m.astype(np.float32) / 255.

def load_rgba(path):
    if not os.path.exists(path): return None
    a = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if a is None: return None
    if a.ndim == 2: a = cv2.cvtColor(a, cv2.COLOR_GRAY2BGR)
    if a.shape[2] == 3: a = np.dstack([a, np.full(a.shape[:2], 255, a.dtype)])
    return a[..., [2, 1, 0, 3]].astype(np.float32) / 255.

def over(base, layer):
    if layer is None: return base
    a = layer[..., 3:4]
    return base * (1 - a) + layer[..., :3] * a

VIG = None
def vignette():
    global VIG
    if VIG is None:
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.70)) ** 2)
        VIG = (1 - 0.22 * np.clip(d - 0.55, 0, 1) ** 1.4)[..., None]
    return VIG

MCACHE = {}
def pmask(fi):
    fi = min(fi, NSRC - 1)
    acc = None
    for j in (fi - 1, fi, fi + 1):
        j = min(max(j, 0), NSRC - 1)
        if j not in MCACHE:
            MCACHE[j] = cv2.imread(f'{S}/seg/m/{j:05d}.png', cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.
        w = 0.5 if j == fi else 0.25
        acc = MCACHE[j] * w if acc is None else acc + MCACHE[j] * w
    for j in list(MCACHE):
        if j < fi - 2: del MCACHE[j]
    return acc

def dim_amt(t):
    return 0.55 * P(t, 39.25, 0.35) * (1 - P(t, 41.62, 0.3))

GOLD = np.array([240, 214, 130], np.float32) / 255.

def compose(fi, t, src, ovdir):
    pl = placement(t, fi)
    M = affine(pl)
    vid = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    vid = vid * vignette()
    back = load_rgba(f'{ovdir}/back/{fi:05d}.png')
    behind = load_rgba(f'{ovdir}/behind/{fi:05d}.png')
    front = load_rgba(f'{ovdir}/front/{fi:05d}.png')
    if pl['u'] <= 0:
        canvas = vid
    else:
        canvas = back[..., :3] * back[..., 3:4] if back is not None else np.zeros((H, W, 3), np.float32)
        m = rrect_mask(pl['rect'], pl['r'])
        # soft drop shadow
        sh = cv2.GaussianBlur(np.roll(m, 22, axis=0), (0, 0), 26) * 0.42 * pl['u']
        canvas = canvas * (1 - sh[..., None])
        # ring glow (circle state)
        u = pl['u']
        if u > 0.3:
            ring = np.zeros((H, W), np.uint8)
            rx, ry, rw, rh = pl['rect']
            cx, cy, rad = rx + rw / 2, ry + rh / 2, min(rw, rh) / 2
            cv2.circle(ring, (int(cx * 16), int(cy * 16)), int((rad + 7) * 16), 255, 7, cv2.LINE_AA, 4)
            ringf = ring.astype(np.float32) / 255.
            glow = cv2.GaussianBlur(ringf, (0, 0), 16) * 2.2
            ra = clamp((u - 0.3) / 0.7)
            g = np.clip(glow * 0.55 * ra, 0, 1)[..., None]
            canvas = canvas * (1 - g) + GOLD * g
        canvas = canvas * (1 - m[..., None]) + vid * m[..., None]
        if u > 0.3:
            r1 = (ringf * ra)[..., None]
            canvas = canvas * (1 - r1) + GOLD * r1
    # statement scene: dim background + text behind subject
    da = dim_amt(t)
    if da > 0 or behind is not None:
        pm = pmask(fi)
        Mm = M.copy(); Mm[0, 0] *= 2; Mm[1, 1] *= 2
        pmw = cv2.warpAffine(pm, Mm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        pmw = cv2.GaussianBlur(pmw, (0, 0), 2.0)
        pmw = np.clip((pmw - 0.25) / 0.5, 0, 1)[..., None]
        if da > 0:
            tint = np.array([14, 30, 22], np.float32) / 255.
            k = da * (1 - pmw)
            canvas = canvas * (1 - k) + tint * k
        if behind is not None:
            a = behind[..., 3:4] * (1 - pmw)
            canvas = canvas * (1 - a) + behind[..., :3] * a
    canvas = over(canvas, front)
    return np.clip(canvas, 0, 1)

def src_reader():
    cmd = ['ffmpeg', '-v', 'error', '-i', f'{S}/src.mp4', '-vf', GRADE, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=10**8)
    N = W * H * 3; last = None
    while True:
        b = p.stdout.read(N)
        if len(b) < N: break
        last = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32) / 255.
        yield last
    while True: yield last

def grab(fi):
    t = fi / FPS
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{min(t, 43.75):.4f}', '-i', f'{S}/src.mp4', '-frames:v', '1', '-vf', GRADE,
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    b = subprocess.run(cmd, capture_output=True).stdout
    return np.frombuffer(b[:W * H * 3], np.uint8).reshape(H, W, 3).astype(np.float32) / 255.

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'test':
        ov = sys.argv[2]; out = sys.argv[3]; frames = [int(x) for x in sys.argv[4].split(',')]
        os.makedirs(out, exist_ok=True)
        for fi in frames:
            img = compose(fi, fi / FPS, grab(fi), ov)
            Image.fromarray((img * 255 + .5).astype(np.uint8)).save(f'{out}/{fi:05d}.jpg', quality=90)
        print('ok')
    elif mode == 'full':
        ov = sys.argv[2]; outfile = sys.argv[3]
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                                '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p',
                                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', outfile], stdin=subprocess.PIPE)
        rd = src_reader()
        for fi in range(TOTAL):
            src = next(rd)
            img = compose(fi, fi / FPS, src, ov)
            enc.stdin.write((img * 255 + .5).astype(np.uint8).tobytes())
            if fi % 60 == 0: print(fi, flush=True)
        enc.stdin.close(); enc.wait(); print('done')
