import numpy as np, cv2, json, subprocess, sys, os, math
from PIL import Image

S = '/tmp/claude-0/-home-user-3d/a055f276-09a0-5d02-abe8-edda36a4eaa9/scratchpad'
V = f'{S}/v2'
W, H, FPS = 1080, 1920, 30
SRC = f'{V}/src2.mp4'          # HDR->SDR master (natural skin grade already applied)
NSRC = 1457
TOTAL = int(round(51.6 * FPS))
HT = json.load(open(f'{V}/headtrack.json'))
_EV = json.load(open(f'{V}/cap_events.json'))
GOLD = np.array([240, 214, 130], np.float32) / 255.

def clamp(x, a=0., b=1.): return max(a, min(b, x))
def P(t, t0, d): return clamp((t - t0) / d)
def ioc(u): return 4*u*u*u if u < .5 else 1 - pow(-2*u + 2, 3) / 2
def oc(u): return 1 - pow(1 - u, 3)

def head(fi):
    fi = min(max(fi, 0), NSRC - 1); return HT['cx'][fi], HT['top'][fi]

# ---------- zoom (FULL mode); 'f' = centre on face ----------
ZSEG = [(0.00, 0.45, 1.14, 1.00, 'ox', 0), (0.45, 2.05, 1.00, 1.03, 'lin', 0), (2.05, 3.94, 1.10, 1.13, 'lin', 0),
        (3.94, 6.40, 1.00, 1.04, 'lin', 0), (6.40, 18.45, 1.00, 1.00, 'lin', 0), (18.45, 22.20, 1.00, 1.04, 'lin', 0),
        (22.20, 25.90, 1.22, 1.27, 'lin', 1), (25.90, 29.55, 1.00, 1.00, 'lin', 0), (29.55, 31.48, 1.00, 1.03, 'lin', 0),
        (31.48, 33.95, 1.10, 1.13, 'lin', 0), (33.95, 36.35, 1.00, 1.03, 'lin', 0), (36.35, 38.70, 1.00, 1.04, 'lin', 0),
        (38.70, 42.10, 1.22, 1.26, 'lin', 1), (42.10, 60.0, 1.00, 1.05, 'lin', 0)]
BUMPS = sorted([e['t'] + 0.06 for e in _EV if e['k'] in ('B', 'L') and e.get('th') == 'dark'])

def zseg(t):
    for i, (a, b, z0, z1, e, f) in enumerate(ZSEG):
        if a <= t < b:
            u = (t - a) / (b - a); u = (1 - pow(2, -10 * u)) if e == 'ox' else u
            z = z0 + (z1 - z0) * u
            if i > 0:
                pz = ZSEG[i - 1][3]
                if abs(pz - z0) > 1e-3 and t - a < 0.14: z = pz + (z - pz) * oc((t - a) / 0.14)
            return z, f
    return ZSEG[-1][3], 0

def zoom(t):
    z, f = zseg(t)
    for tb in BUMPS:
        d = t - tb
        if 0 <= d < 0.4: z *= 1 + 0.03 * math.sin(math.pi * d / 0.4) * (1 - d / 0.4)
    return z, f

# ---------- layout states ----------
SPLIT = dict(rect=(60, 820, 960, 1060), r=44, k=960 / 1080, off=536)
CIRC = dict(rect=(540 - 190, 1640 - 190, 380, 380), r=190, k=380 / 740, off=300)
SEQ = [(6.40, 6.85, 'in', SPLIT), (6.85, 18.05, 'hold', SPLIT), (18.05, 18.45, 'out', SPLIT),
       (25.90, 26.35, 'in', CIRC), (26.35, 29.15, 'hold', CIRC), (29.15, 29.55, 'out', CIRC)]

def pip_state(t):
    for a, b, kind, st in SEQ:
        if a <= t < b:
            if kind == 'hold': return 1.0, st
            u = ioc((t - a) / (b - a)); return (u if kind == 'in' else 1 - u), st
    return 0.0, None

def placement(t, fi):
    u, st = pip_state(t)
    z, face = zoom(t)
    hx, ht = head(fi)
    fcx, fcy = (hx, ht + 260) if face else (540.0, 760.0)
    sw, sh = W / z, H / z
    fcx = clamp(fcx, sw / 2, W - sw / 2); fcy = clamp(fcy, sh / 2, H - sh / 2)
    if u <= 0: return dict(u=0, k=z, sc=(fcx, fcy), rect=(0, 0, W, H), r=0, face=face)
    k = math.exp(math.log(z) + (math.log(st['k']) - math.log(z)) * u)
    x0, y0, w1, h1 = st['rect']
    rx, ry = x0 * u, y0 * u; rw = W + (w1 - W) * u; rh = H + (h1 - H) * u
    scx = fcx + (hx - fcx) * u; scy = fcy + (ht + st['off'] - fcy) * u
    sw, sh = rw / k, rh / k
    scx = clamp(scx, sw / 2, W - sw / 2) if sw < W else W / 2
    scy = clamp(scy, sh / 2, H - sh / 2) if sh < H else H / 2
    r = st['r'] * pow(u, 0.6) if st is CIRC else min(st['r'], min(rw, rh) / 2) * min(1, u * 3)
    if st is CIRC: r = min(rw, rh) / 2 * pow(u, 0.6)
    return dict(u=u, k=k, sc=(scx, scy), rect=(rx, ry, rw, rh), r=r, face=0)

def affine(pl):
    k = pl['k']; scx, scy = pl['sc']; rx, ry, rw, rh = pl['rect']
    return np.float32([[k, 0, rx + rw / 2 - k * scx], [0, k, ry + rh / 2 - k * scy]])

def rrect_mask(rect, r):
    rx, ry, rw, rh = rect; m = np.zeros((H, W), np.uint8); sh = 4; mul = 1 << sh
    def Q(x, y): return (int(round(x * mul)), int(round(y * mul)))
    x0, y0, x1, y1 = rx, ry, rx + rw, ry + rh; rr = min(r, rw / 2, rh / 2)
    if rr < 0.5: cv2.rectangle(m, Q(x0, y0), Q(x1, y1), 255, -1, cv2.LINE_AA, sh)
    else:
        cv2.rectangle(m, Q(x0 + rr, y0), Q(x1 - rr, y1), 255, -1, cv2.LINE_AA, sh)
        cv2.rectangle(m, Q(x0, y0 + rr), Q(x1, y1 - rr), 255, -1, cv2.LINE_AA, sh)
        for cx, cy in [(x0 + rr, y0 + rr), (x1 - rr, y0 + rr), (x0 + rr, y1 - rr), (x1 - rr, y1 - rr)]:
            cv2.circle(m, Q(cx, cy), int(round(rr * mul)), 255, -1, cv2.LINE_AA, sh)
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
    a = layer[..., 3:4]; return base * (1 - a) + layer[..., :3] * a

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
_d = np.sqrt(((XX - W / 2) / (W * 0.75)) ** 2 + ((YY - H * 0.45) / (H * 0.70)) ** 2)
VIG = (1 - 0.10 * np.clip(_d - 0.55, 0, 1) ** 1.4)[..., None]

MC = {}
def pmask(fi):
    fi = min(max(fi, 0), NSRC - 1); acc = None
    for j, w in ((fi - 1, .25), (fi, .5), (fi + 1, .25)):
        j = min(max(j, 0), NSRC - 1)
        if j not in MC: MC[j] = cv2.imread(f'{V}/m/{j:05d}.png', cv2.IMREAD_GRAYSCALE).astype(np.float32) / 255.
        acc = MC[j] * w if acc is None else acc + MC[j] * w
    for j in list(MC):
        if j < fi - 2: del MC[j]
    return acc

DIMWIN = [(4.85, 6.40), (37.40, 38.70)]
def dim_amt(t):
    return max([0.5 * P(t, a, .25) * (1 - P(t, b - .2, .2)) for a, b in DIMWIN] + [0])

RINGWIN = [(22.20, 25.90), (38.70, 42.10)]
def ring_amt(t):
    for a, b in RINGWIN:
        if a <= t < b: return oc(P(t, a + .04, .28)) * (1 - P(t, b - .18, .18)), P(t, a + .04, .28)
    return 0, 0

BLINDS = [6.40, 22.20, 38.70]
STRIPE = ((np.arange(W) // 9) % 2).astype(np.float32)[None, :, None]
def blinds(img, t):
    for tc in BLINDS:
        d = t - tc
        if -0.14 <= d <= 0.22:
            a = (d + 0.14) / 0.14 if d < 0 else 1 - d / 0.22
            a = clamp(a) ** 1.2
            white = np.full_like(img, 0.93)
            g = 0.12 + 0.78 * STRIPE                 # alternating strong/weak stripes
            k = a * g
            img = img * (1 - k) + white * k
            if d > 0:   # slight horizontal tear on the incoming side
                sh = int(14 * (1 - d / 0.22)); img = np.where(STRIPE > 0, np.roll(img, sh, axis=1), img)
    return img

def compose(fi, t, src, ov):
    pl = placement(t, fi); M = affine(pl)
    vid = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE) * VIG
    back = load_rgba(f'{ov}/back/{fi:05d}.png'); behind = load_rgba(f'{ov}/behind/{fi:05d}.png'); front = load_rgba(f'{ov}/front/{fi:05d}.png')
    if pl['u'] <= 0:
        canvas = vid
        ra, rp = ring_amt(t)
        if ra > 0:   # ref-style glow ring around the face + darker surround
            hx, ht = head(fi); cx = M[0, 0] * hx + M[0, 2]; cy = M[1, 1] * (ht + 235) + M[1, 2]
            R = 330 * (1.25 - 0.25 * oc(rp))
            d = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2)
            outside = np.clip((d - R) / 90, 0, 1)[..., None]
            canvas = canvas * (1 - 0.42 * ra * outside)
            ring = np.clip(1 - np.abs(d - R) / 3.2, 0, 1)
            glow = cv2.GaussianBlur(ring, (0, 0), 14) * 2.4
            g = np.clip((glow * 0.5 + ring) * ra, 0, 1)[..., None]
            canvas = canvas * (1 - g) + np.array([1, .97, .9], np.float32) * g
    else:
        canvas = back[..., :3] * back[..., 3:4] if back is not None else np.zeros((H, W, 3), np.float32)
        m = rrect_mask(pl['rect'], pl['r'])
        sh = cv2.GaussianBlur(np.roll(m, 24, axis=0), (0, 0), 28) * 0.45 * pl['u']
        canvas = canvas * (1 - sh[..., None])
        u = pl['u']
        if u > 0.3:
            rx, ry, rw, rh = pl['rect']; e = 7
            m2 = rrect_mask((rx - e, ry - e, rw + 2 * e, rh + 2 * e), pl['r'] + e)
            ring = np.clip(m2 - m, 0, 1); ra = clamp((u - 0.3) / 0.7)
            glow = cv2.GaussianBlur(ring, (0, 0), 16) * 2.0
            g = np.clip(glow * 0.5 * ra, 0, 1)[..., None]
            canvas = canvas * (1 - g) + GOLD * g
        canvas = canvas * (1 - m[..., None]) + vid * m[..., None]
        if u > 0.3:
            r1 = (ring * ra)[..., None]; canvas = canvas * (1 - r1) + GOLD * r1
    da = dim_amt(t)
    if da > 0 or behind is not None:
        pm = pmask(fi); Mm = M.copy(); Mm[0, 0] *= 2; Mm[1, 1] *= 2
        pmw = cv2.warpAffine(pm, Mm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        pmw = np.clip((cv2.GaussianBlur(pmw, (0, 0), 2.0) - 0.25) / 0.5, 0, 1)[..., None]
        if da > 0:
            k = da * (1 - pmw); canvas = canvas * (1 - k) + np.array([14, 30, 22], np.float32) / 255. * k
        if behind is not None:
            a = behind[..., 3:4] * (1 - pmw); canvas = canvas * (1 - a) + behind[..., :3] * a
    canvas = over(canvas, front)
    canvas = blinds(canvas, t)
    return np.clip(canvas, 0, 1)

def src_reader():
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, bufsize=10**8)
    N = W * H * 3; last = None
    while True:
        b = p.stdout.read(N)
        if len(b) < N: break
        last = np.frombuffer(b, np.uint8).reshape(H, W, 3).astype(np.float32) / 255.; yield last
    while True: yield last

def grab(fi):
    t = min(fi, NSRC - 1) / FPS
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', SRC, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(b[:W * H * 3], np.uint8).reshape(H, W, 3).astype(np.float32) / 255.

if __name__ == '__main__':
    mode = sys.argv[1]
    if mode == 'test':
        ov, out, frames = sys.argv[2], sys.argv[3], [int(x) for x in sys.argv[4].split(',')]
        os.makedirs(out, exist_ok=True)
        for fi in frames:
            img = compose(fi, fi / FPS, grab(fi), ov)
            Image.fromarray((img * 255 + .5).astype(np.uint8)).save(f'{out}/{fi:05d}.jpg', quality=90)
        print('ok')
    else:
        ov, outfile = sys.argv[2], sys.argv[3]
        enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                                '-c:v', 'libx264', '-preset', 'slow', '-crf', '12', '-pix_fmt', 'yuv420p',
                                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', outfile], stdin=subprocess.PIPE)
        rd = src_reader()
        for fi in range(TOTAL):
            enc.stdin.write((compose(fi, fi / FPS, next(rd), ov) * 255 + .5).astype(np.uint8).tobytes())
            if fi % 100 == 0: print(fi, flush=True)
        enc.stdin.close(); enc.wait(); print('done')
