import numpy as np, subprocess, sys
S = '/tmp/claude-0/-home-user-3d/a055f276-09a0-5d02-abe8-edda36a4eaa9/scratchpad'
SR = 48000; DUR = 46.6; N = int(SR * DUR)
rng = np.random.default_rng(7)

def wav_write(path, x):
    x = np.clip(x, -1, 1)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', path],
                   input=x.astype(np.float32).T.copy().tobytes() if x.ndim == 2 else np.repeat(x[:, None], 2, 1).astype(np.float32).tobytes())

def read(path):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(b, np.float32).reshape(-1, 2).T.copy()

def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    # vectorised via lfilter-like loop in chunks (numpy only)
    from itertools import accumulate
    out = np.empty_like(x); z = 0.0
    for i in range(0, len(x), 4096):
        seg = x[i:i + 4096]
        o = np.empty_like(seg)
        for j, v in enumerate(seg):
            z = (1 - a) * v + a * z; o[j] = z
        out[i:i + 4096] = o
    return out

def lp_fft(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / fc) ** (2 * order)); return np.fft.irfft(X * H, len(x))
def hp_fft(x, fc, order=2):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); f[0] = 1e-6
    H = 1 / np.sqrt(1 + (fc / f) ** (2 * order)); return np.fft.irfft(X * H, len(x))
def bp_fft(x, f0, q):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    H = np.exp(-0.5 * ((np.log2(np.maximum(f, 1)) - np.log2(f0)) * q) ** 2); return np.fft.irfft(X * H, len(x))

def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def env_adsr(n, a, d, s, r, sus_len):
    A = int(a * SR); D = int(d * SR); R = int(r * SR); Sl = max(0, int(sus_len * SR) - A - D)
    e = np.concatenate([np.linspace(0, 1, A, endpoint=False), np.linspace(1, s, D, endpoint=False), np.full(Sl, s), np.linspace(s, 0, R)])
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))

# ---------------- MUSIC ----------------
BPM = 96; beat = 60 / BPM; bar = 4 * beat   # 2.5 s
# warm progression (F major): Fmaj9 - Am7 - Dm9 - Bbmaj9
CH = [[53, 57, 60, 64, 67], [57, 60, 64, 67, 71], [50, 57, 60, 64, 65], [46, 53, 57, 60, 62]]
ROOT = [41, 45, 38, 46 - 12]
mus = np.zeros((2, N))
t = np.arange(N) / SR

def add(buf, sig, start, pan=0.0, g=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if j <= i or i >= N: return
    L = np.cos((pan + 1) * np.pi / 4); R = np.sin((pan + 1) * np.pi / 4)
    buf[0, i:j] += sig[:j - i] * g * L * 1.414; buf[1, i:j] += sig[:j - i] * g * R * 1.414

def pad_note(f, dur):
    n = int((dur + 1.2) * SR); tt = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.12, 0.0, 0.11):
        ff = f * 2 ** (det / 12)
        ph = 2 * np.pi * ff * tt
        s += np.sin(ph) + 0.30 * np.sin(2 * ph + 0.3) + 0.12 * np.sin(3 * ph + 1.1)
    s *= env_adsr(n, 0.9, 0.6, 0.75, 1.2, dur)
    return s / 3

def ep_note(f, dur=1.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    mod = np.sin(2 * np.pi * f * 2 * tt) * 1.2 * np.exp(-tt * 9)
    s = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 3.2) + 0.25 * np.sin(2 * np.pi * f * 4 * tt) * np.exp(-tt * 12)
    s *= (1 + 0.08 * np.sin(2 * np.pi * 5 * tt))
    a = int(0.004 * SR); s[:a] *= np.linspace(0, 1, a)
    return s

def kick():
    n = int(0.45 * SR); tt = np.arange(n) / SR
    f = 48 + 90 * np.exp(-tt * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-tt * 7.5)

def shaker():
    n = int(0.09 * SR); tt = np.arange(n) / SR
    s = hp_fft(rng.standard_normal(n), 6500) * np.exp(-tt * 55); return s

start_music = 0.0; end_music = 46.6
nbars = int(np.ceil(DUR / bar)) + 1
pad = np.zeros(N); keys = np.zeros((2, N)); bass = np.zeros(N); drums = np.zeros((2, N))
for b in range(nbars):
    t0 = b * bar; c = CH[b % 4]
    for k, m in enumerate(c):
        sig = pad_note(mtof(m), bar)
        i = int(t0 * SR); j = min(N, i + len(sig))
        if i < N: pad[i:j] += sig[:j - i] * 0.16
    # bass: root on beat 1 and 3 (soft)
    for bt in (0, 2.5):
        st = t0 + bt * beat
        n = int(beat * 1.9 * SR); tt = np.arange(n) / SR
        sg = (np.sin(2 * np.pi * mtof(ROOT[b % 4]) * tt) + 0.2 * np.sin(4 * np.pi * mtof(ROOT[b % 4]) * tt)) * env_adsr(n, 0.01, 0.3, 0.6, 0.25, beat * 1.6)
        i = int(st * SR); j = min(N, i + n)
        if i < N: bass[i:j] += sg[:j - i] * 0.22
    # electric piano arpeggio (8ths, sparse pattern)
    pat = [0, 2, 4, 3, 1, 3, 4, 2]
    for s8 in range(8):
        if s8 in (3, 7) and b % 2 == 1: continue
        st = t0 + s8 * beat / 2
        m = c[pat[s8] % len(c)] + 12
        add(keys, ep_note(mtof(m), 1.1), st, pan=(-0.35 if s8 % 2 else 0.35), g=0.055)
    # drums
    for bt in range(4):
        st = t0 + bt * beat
        if bt in (0, 2): add(drums, kick(), st, 0, 0.30)
        add(drums, shaker(), st + beat / 2, 0.25, 0.05)
        add(drums, shaker(), st, -0.25, 0.028)

pad = lp_fft(pad, 1400)
mus[0] += pad; mus[1] += pad
mus += keys
b2 = lp_fft(bass, 220); mus[0] += b2; mus[1] += b2
# drums: in from 0.0, out during statement 38.45-41.7 and fade at end card tail
dg = np.ones(N)
def ramp(a, b, v0, v1):
    i, j = int(a * SR), int(b * SR); dg[i:j] = np.linspace(v0, v1, j - i)
dg[int(38.45 * SR):int(41.7 * SR)] = 0; ramp(38.2, 38.45, 1, 0); ramp(41.7, 43.3, 0, 1)
mus += drums * dg
# riser into end card
n = int(1.7 * SR); tt = np.arange(n) / SR
rs = bp_fft(rng.standard_normal(n), 2500, 1.2) * (tt / tt[-1]) ** 2.2 * 0.12
add(mus, rs, 41.62, 0, 1.0)
# master music fades
fade = np.ones(N); fi = int(0.25 * SR); fade[:fi] = np.linspace(0, 1, fi)
fo0 = int(45.4 * SR); fade[fo0:] = np.linspace(1, 0, N - fo0) ** 1.5
mus *= fade

# ---------------- SFX ----------------
import json
sfx = np.zeros((2, N))
EV = json.load(open(f'{S}/cap_events.json'))
def nz(n): return rng.standard_normal(n)
def whoosh(d=0.45, f0=600, f1=4200, g=0.22):
    n = int(d * SR); tt = np.arange(n) / SR; u = tt / d
    x = nz(n); out = np.zeros(n)
    centers = np.geomspace(min(f0, f1) * 0.8, max(f0, f1) * 1.2, 7)
    pos = np.log2(f0) + (np.log2(f1) - np.log2(f0)) * np.sin(np.pi * u / 2) ** 1.2
    for c in centers:
        out += bp_fft(x, c, 2.2) * np.exp(-0.5 * ((np.log2(c) - pos) / 0.55) ** 2)
    e = np.sin(np.pi * np.clip(u, 0, 1)) ** 1.6
    return lp_fft(out * e, 9000) * g / 1.5
def airin(d=0.24, g=0.10):           # short rising air that lands on the hit
    n = int(d * SR); tt = np.arange(n) / SR; u = tt / d
    x = whoosh(d, 900, 6500, 1.0); e = u ** 2.2
    return x / (np.abs(x).max() + 1e-9) * e * g
def thump(f0=160, f1=55, d=0.22, g=0.25):
    n = int(d * SR); tt = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-tt * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14) * g
def click(g=0.18, hp=2500):
    n = int(0.025 * SR); tt = np.arange(n) / SR
    return hp_fft(nz(n), hp) * np.exp(-tt * 300) * g
def pop(f=880, g=0.16, d=0.09):
    n = int(d * SR); tt = np.arange(n) / SR
    ff = f * (1 + 0.7 * np.exp(-tt * 70)); ph = 2 * np.pi * np.cumsum(ff) / SR
    return np.sin(ph) * np.exp(-tt * 40) * g
def hit(g=1.0, bright=1.0):          # keyword impact: thump + click + pop
    a = thump(170, 52, 0.26, 0.30 * g); b = np.zeros_like(a)
    c = click(0.16 * g * bright); b[:len(c)] += c
    p = pop(1250, 0.10 * g * bright, 0.08); b[:len(p)] += p
    return a + b
def tick(f=2400, g=0.06):
    n = int(0.03 * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) * np.exp(-tt * 160) * 0.7 + hp_fft(nz(n), 4000) * np.exp(-tt * 400) * 0.5) * g
def sparkle(g=0.06):
    n = int(0.7 * SR); tt = np.arange(n) / SR; s_ = np.zeros(n)
    for k, m in enumerate([96, 100, 103, 108]):
        on = k * 0.05; e = np.clip((tt - on) * 200, 0, 1) * np.exp(-np.maximum(0, tt - on) * 7)
        s_ += np.sin(2 * np.pi * mtof(m) * tt) * e
    return s_ / 4 * g
def shimmer(g=0.12):
    n = int(1.4 * SR); tt = np.arange(n) / SR; s_ = np.zeros(n)
    for k, m in enumerate([84, 88, 91, 96, 100]):
        s_ += np.sin(2 * np.pi * mtof(m) * tt + k) * np.exp(-tt * (2.2 + k * 0.4)) * np.clip((tt - k * 0.045) * 60, 0, 1)
    return s_ / 5 * g
def boom(g=0.35):
    n = int(0.9 * SR); tt = np.arange(n) / SR
    f = 38 + 60 * np.exp(-tt * 9); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 4.5) * g
def riser(d=0.5, g=0.08):
    n = int(d * SR); tt = np.arange(n) / SR; u = tt / d
    return whoosh(d, 500, 7000, 1.0) / 0.2 * u ** 3 * g
def swipe(g=0.12):
    n = int(0.22 * SR); tt = np.arange(n) / SR
    return bp_fft(nz(n), 3200, 1.0) * np.sin(np.pi * tt / tt[-1]) * g
def paper(g=0.08):
    n = int(0.12 * SR); tt = np.arange(n) / SR
    return bp_fft(nz(n), 2200, 0.8) * np.exp(-tt * 30) * g

# --- text-driven sound effects (from caption timeline) ---
for e in EV:
    t0, k = e['t'], e['k']; pan = float(rng.uniform(-.25, .25))
    if k == 's':
        add(sfx, tick(float(rng.uniform(2100, 2900)), 0.055), t0, pan)
    elif k == 'B':
        add(sfx, airin(0.22, 0.09), t0 - 0.20, 0)
        add(sfx, hit(0.9 if e['th'] == 'dark' else 0.75), t0 + 0.05, 0)
        add(sfx, sparkle(0.035), t0 + 0.38, pan)
    elif k == 'L':
        add(sfx, airin(0.26, 0.10), t0 - 0.24, 0); add(sfx, hit(1.0), t0 + 0.04, 0)
        add(sfx, boom(0.22), t0 + 0.04, 0); add(sfx, shimmer(0.12), t0 + 0.05, 0)
    elif k == 'strike':
        add(sfx, swipe(0.14), t0 - 0.02, 0); add(sfx, thump(120, 60, 0.2, 0.16), t0 + 0.12, 0)
# --- scene transitions ---
for tt0 in [9.12, 12.58, 21.40, 28.12, 31.60]:
    add(sfx, riser(0.42, 0.06), tt0 - 0.42, 0)
    add(sfx, whoosh(0.5, 500, 4500, 0.26), tt0 - 0.05, -0.2); add(sfx, whoosh(0.5, 600, 5200, 0.20), tt0, 0.2)
    add(sfx, boom(0.16), tt0 + 0.12, 0)
add(sfx, riser(1.2, 0.07), 42.1, 0)
add(sfx, whoosh(0.6, 400, 3000, 0.28), 43.22, 0); add(sfx, boom(0.30), 43.36, 0); add(sfx, shimmer(0.12), 43.62, 0)
for k, tt0 in enumerate([43.88, 44.05, 44.32, 44.52, 44.72, 44.92]): add(sfx, tick(1800 + 150 * k, 0.07), tt0, 0)
# --- graphics ---
add(sfx, pop(700, 0.10), 0.14, 0); add(sfx, airin(0.2, 0.06), -0.0, 0)          # intro logo chip
add(sfx, pop(520, 0.10), 3.18, -.3); add(sfx, pop(990, 0.11), 4.92, .3)          # journey chips
add(sfx, whoosh(1.5, 300, 900, 0.05), 3.3, 0)                                     # journey line travel
for k, tt0 in enumerate([7.04, 7.22, 7.40, 7.58]): add(sfx, paper(0.10), tt0, [-.5, .5, -.4, .4][k]); add(sfx, pop(760 + k * 90, 0.08), tt0, 0)
add(sfx, whoosh(0.35, 800, 3000, 0.10), 8.50, 0)                                  # cards converge
add(sfx, click(0.24), 11.64, 0.2); add(sfx, shimmer(0.10), 12.0, 0)               # confirm click / profile
PENTA = [65, 67, 69, 72, 74]
for k, tt0 in enumerate([13.64, 14.18, 14.84, 15.88, 16.92]):
    add(sfx, pop(mtof(PENTA[k] + 12), 0.15, 0.12), tt0, [0, .5, .3, -.3, -.5][k]); add(sfx, thump(140, 70, 0.12, 0.10), tt0, 0)
add(sfx, pop(520, 0.12), 12.72, 0)
add(sfx, boom(0.18), 20.80, 0); add(sfx, shimmer(0.08), 20.78, 0)                 # hub "connects" pulse
for k, tt0 in enumerate([22.60, 22.84, 23.08, 23.32]): add(sfx, pop(700 + k * 80, 0.09), tt0, [-.4, .4, -.4, .4][k]); add(sfx, paper(0.06), tt0, 0)
add(sfx, whoosh(1.0, 700, 2200, 0.06), 22.70, 0)
for k, tt0 in enumerate([29.70, 29.86, 30.02, 30.18]): add(sfx, tick(2000 + k * 200, 0.07), tt0, 0)
for k, tt0 in enumerate([35.36, 35.90, 36.44]): add(sfx, thump(150, 60, 0.18, 0.14), tt0 + 0.14, [-.4, 0, .4][k]); add(sfx, paper(0.10), tt0 + 0.12, [-.4, 0, .4][k])
for k in range(3): add(sfx, pop(1100, 0.08), 37.32 + k * 0.07, [-.4, 0, .4][k])
add(sfx, whoosh(0.5, 900, 200, 0.14), 37.62, 0)
for tt0 in [39.68, 40.46, 41.18]: add(sfx, hit(1.0), tt0 + 0.05, 0); add(sfx, airin(0.2, 0.08), tt0 - 0.18, 0)
add(sfx, sparkle(0.05), 41.6, 0)
# --- light reverb on the SFX bus ---
irn = int(0.5 * SR); ir = rng.standard_normal(irn) * np.exp(-np.arange(irn) / SR * 9); ir = lp_fft(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
for ch in range(2):
    wet = np.fft.irfft(np.fft.rfft(sfx[ch], N + irn) * np.fft.rfft(ir, N + irn), N + irn)[:N]
    sfx[ch] = sfx[ch] + 0.22 * wet
sfx *= 1.25

# ---------------- VOICE ----------------
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{S}/src.mp4', '-vn', '-af',
                'highpass=f=85,afftdn=nf=-28:nr=10,equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3400:t=q:w=1.0:g=2.5,'
                'equalizer=f=10000:t=q:w=0.8:g=1.5,acompressor=threshold=-22dB:ratio=3:attack=6:release=90:makeup=3,'
                'loudnorm=I=-15:TP=-2:LRA=7', '-ar', str(SR), '-ac', '2', f'{S}/voice.wav'])
v = read(f'{S}/voice.wav'); v = v[:, :N] if v.shape[1] >= N else np.pad(v, ((0, 0), (0, N - v.shape[1])))
# fade voice tail at 43.7 (source ends) to avoid click
fo = int(43.55 * SR); v[:, fo:] *= np.clip(1 - (np.arange(N - fo) / (0.2 * SR)), 0, 1)

# duck music under voice
vm = np.abs(v).mean(0); hop = 480
envv = np.sqrt(np.convolve(vm ** 2, np.ones(hop) / hop, 'same'))
# smooth (attack fast / release slow)
sm = np.zeros_like(envv); z = 0
for i in range(0, N, hop):
    x = envv[i]; z = x if x > z else z * 0.93 + x * 0.07; sm[i:i + hop] = z
duck = 1 - 0.55 * np.clip(sm / (np.percentile(sm, 90) + 1e-9), 0, 1)

def rms(x): return np.sqrt(np.mean(x ** 2))
mus_n = mus / (rms(mus) + 1e-9) * rms(v) * 0.17
mg = np.ones(N); i0, i1 = int(43.15 * SR), int(43.7 * SR); mg[i0:i1] = np.linspace(1, 3.8, i1 - i0); mg[i1:] = 3.8
mix = v + mus_n * duck * mg + sfx
nomusic = v + sfx
for name, x in [('mix_full', mix), ('mix_nomusic', nomusic), ('music_only', mus_n)]:
    x = x / max(1.0, np.abs(x).max() / 0.98)
    wav_write(f'{S}/{name}_raw.wav', x)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{S}/{name}_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=9', '-ar', '48000', f'{S}/{name}.wav'])
print('audio done')
