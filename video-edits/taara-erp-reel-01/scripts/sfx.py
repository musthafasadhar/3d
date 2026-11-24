"""Synthesised, royalty-free sound design for the reel (pops, ticks, whooshes, hit, swipe, chime).
usage: python sfx.py timeline.json out_sfx.wav
"""
import json, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)
tl = json.load(open(sys.argv[1]))
N = int(tl["n"] / tl["fps"] * SR) + SR


def env(n, a, d):  # attack (s) + exponential decay time-constant (s)
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d)


def sweep_sine(f0, f1, dur, curve=3.0):
    t = np.arange(int(dur * SR)) / SR
    f = f1 + (f0 - f1) * np.exp(-curve * t / dur)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def band_noise(dur, f_lo, f_hi, amp_env):
    """noise whose band centre moves from f_lo to f_hi over the sound (STFT masking)."""
    n = int(dur * SR); x = rng.standard_normal(n + 2048)
    hop, win = 256, np.hanning(1024)
    out = np.zeros(n + 2048); frames = (n) // hop
    freqs = np.fft.rfftfreq(1024, 1 / SR)
    for k in range(frames):
        seg = x[k * hop:k * hop + 1024] * win
        p = k / max(1, frames - 1)
        fc = f_lo * (f_hi / f_lo) ** p
        mask = np.exp(-0.5 * (np.log2(np.maximum(freqs, 20) / fc) / 0.9) ** 2)
        out[k * hop:k * hop + 1024] += np.fft.irfft(np.fft.rfft(seg) * mask) * win
    out = out[:n]
    return out / (np.abs(out).max() + 1e-9) * amp_env(n)


def room(x, wet=0.18, t60=0.35):
    n = int(t60 * SR); ir = rng.standard_normal(n) * np.exp(-6.9 * np.arange(n) / n)
    ir[:int(0.004 * SR)] = 0
    y = np.convolve(x, ir)[:len(x) + n] * (wet / np.sqrt(np.sum(ir ** 2)))
    y[:len(x)] += x
    return y


def pop():
    d = 0.12; s = sweep_sine(1100, 420, d, 5) * env(int(d * SR), 0.002, 0.03)
    click = rng.standard_normal(int(0.006 * SR)) * env(int(0.006 * SR), 0.0005, 0.0015) * 0.25
    s[:len(click)] += click
    return room(s * 0.55, 0.12, 0.25)


def tick():
    d = 0.05; s = (np.sin(2 * np.pi * 2900 * np.arange(int(d * SR)) / SR) * 0.6 +
                   np.sin(2 * np.pi * 4350 * np.arange(int(d * SR)) / SR) * 0.25) * env(int(d * SR), 0.001, 0.009)
    return room(s * 0.35, 0.1, 0.2)


def whoosh(rev=False):
    d = 0.55
    e = lambda n: np.sin(np.pi * (np.arange(n) / n) ** (0.75 if not rev else 1.6)) ** 2
    s = band_noise(d, 300, 4200, e) if not rev else band_noise(d, 3800, 350, e)
    return room(s * 0.30, 0.15, 0.3)


def hit():
    d = 0.7; body = sweep_sine(120, 46, d, 6) * env(int(d * SR), 0.003, 0.18)
    n = int(0.04 * SR); trans = rng.standard_normal(n) * env(n, 0.001, 0.01)
    trans = np.convolve(trans, np.ones(12) / 12, "same")  # soften
    body[:n] += trans * 0.5
    return room(body * 0.75, 0.2, 0.6)


def swipe():
    e = lambda n: np.sin(np.pi * np.arange(n) / n) ** 1.5
    return room(band_noise(0.24, 1800, 6500, e) * 0.22, 0.12, 0.25)


def chime():
    d = 1.6; t = np.arange(int(d * SR)) / SR; s = np.zeros_like(t)
    for f0, st in [(1046.5, 0.0), (1568.0, 0.09)]:
        tt = np.maximum(0, t - st)
        for mult, amp, dec in [(1, 1, 0.55), (2.0, 0.35, 0.3), (3.0, 0.12, 0.18), (4.2, 0.06, 0.1)]:
            s += amp * np.sin(2 * np.pi * f0 * mult * tt) * np.exp(-tt / dec) * (t >= st) * np.minimum(1, tt / 0.002)
    return room(s / np.abs(s).max() * 0.28, 0.3, 0.9)


BANK = {"pop": pop, "tick": tick, "whoosh": whoosh, "whoosh_out": lambda: whoosh(True), "hit": hit, "swipe": swipe, "chime": chime}
GAIN = {"pop": 0.75, "tick": 0.8, "whoosh": 1.9, "whoosh_out": 1.5, "hit": 0.9, "swipe": 0.8, "chime": 0.8}
def type_click():
    n = int(0.035 * SR); x = rng.standard_normal(n) * env(n, 0.0005, 0.004)
    x = np.diff(np.concatenate([[0], x]))  # brighten
    body = np.sin(2 * np.pi * 1800 * np.arange(n) / SR) * env(n, 0.0005, 0.006) * 0.4
    return room((x * 0.5 + body) * 0.45, 0.08, 0.15)


def riser():
    d = 0.62
    e = lambda n: (np.arange(n) / n) ** 2.2
    s = band_noise(d, 400, 7000, e) * 0.35
    s += sweep_sine(220, 880, d, -2.5) * e(int(d * SR)) * 0.08
    return room(s, 0.15, 0.3)


def clock():
    d = 0.06; t = np.arange(int(d * SR)) / SR
    s = (np.sin(2 * np.pi * 3600 * t) * 0.5 + np.sin(2 * np.pi * 5200 * t) * 0.3) * env(len(t), 0.0005, 0.006)
    return room(s * 0.35, 0.12, 0.2)


def shimmer():
    d = 0.7; t = np.arange(int(d * SR)) / SR; s = np.zeros_like(t)
    for k in range(9):
        st = k * 0.045; f = 2600 + 380 * k
        tt = np.maximum(0, t - st); s += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.12) * (t >= st) * 0.5
    return room(s / np.abs(s).max() * 0.18, 0.35, 0.6)


def swish():
    e = lambda n: np.sin(np.pi * (np.arange(n) / n) ** 0.8) ** 2
    return room(band_noise(0.26, 600, 5000, e) * 0.32, 0.1, 0.2)


def coin():
    d = 0.9; t = np.arange(int(d * SR)) / SR; s = np.zeros_like(t)
    for st, f0 in [(0, 1975.5), (0.07, 2637.0)]:
        tt = np.maximum(0, t - st)
        for m, a, dc in [(1, 1, 0.22), (2.76, 0.4, 0.08), (5.4, 0.2, 0.04)]:
            s += a * np.sin(2 * np.pi * f0 * m * tt) * np.exp(-tt / dc) * (t >= st)
    n = int(0.01 * SR); s[:n] += rng.standard_normal(n) * env(n, 0.0005, 0.002) * 0.6
    return room(s / np.abs(s).max() * 0.3, 0.2, 0.5)


def blip(k):
    d = 0.09; f = 523.25 * (2 ** ((k * 2) / 12)); t = np.arange(int(d * SR)) / SR
    s = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * env(len(t), 0.002, 0.03)
    return room(s * 0.28, 0.12, 0.2)


def stamp():
    d = 0.45; body = sweep_sine(160, 55, d, 7) * env(int(d * SR), 0.001, 0.07)
    n = int(0.05 * SR); thud = rng.standard_normal(n) * env(n, 0.0005, 0.012)
    thud = np.convolve(thud, np.ones(6) / 6, "same"); body[:n] += thud * 0.9
    return room(body * 0.8, 0.12, 0.25)


def ping():
    d = 0.5; t = np.arange(int(d * SR)) / SR; s = np.zeros_like(t)
    for st, f in [(0, 1318.5), (0.06, 1760.0)]:
        tt = np.maximum(0, t - st); s += np.sin(2 * np.pi * f * tt) * np.exp(-tt / 0.12) * (t >= st) * np.minimum(1, tt / 0.002)
    return room(s / np.abs(s).max() * 0.24, 0.2, 0.35)


BANK.update({"type": type_click, "riser": riser, "clock": clock, "shimmer": shimmer, "swish": swish, "coin": coin,
             "stamp": stamp, "ping": ping, **{f"blip{k}": (lambda k=k: blip(k)) for k in range(6)}})
GAIN.update({"type": 0.3, "riser": 1.4, "clock": 0.7, "shimmer": 1.0, "swish": 1.6, "coin": 1.0, "stamp": 0.6, "ping": 0.9,
             **{f"blip{k}": 0.9 for k in range(6)}})

L = np.zeros(N); R = np.zeros(N)
for k, (kind, t) in enumerate(tl["sfx"]):
    s = BANK[kind]() * GAIN[kind]
    i0 = int(max(0, t) * SR); i1 = min(N, i0 + len(s))
    pan = {"tick": 0.15 * (1 if k % 2 else -1), "type": 0.1 * (1 if k % 2 else -1)}.get(kind, 0.0)
    L[i0:i1] += s[:i1 - i0] * (1 - pan); R[i0:i1] += s[:i1 - i0] * (1 + pan)
st = np.stack([L, R], 1)[:int(tl["n"] / tl["fps"] * SR)]
st = np.clip(st, -0.98, 0.98)
w = wave.open(sys.argv[2], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
print("sfx cues:", len(tl["sfx"]), "peak", round(float(np.abs(st).max()), 3))
