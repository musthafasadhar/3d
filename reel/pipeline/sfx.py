"""Synthesised premium SFX bed, time-aligned to the edit. Writes sfx.wav (48k stereo)."""
import json, numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 29.87
N = int(SR * DUR)
out = np.zeros((N, 2), np.float32)
rng = np.random.default_rng(5)

def db(x): return 10 ** (x / 20)

def add(sig, t, gain_db=0.0, pan=0.0):
    """sig mono or stereo; pan -1..1"""
    if sig.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l * 1.414, sig * r * 1.414], 1)
    i0 = int(t * SR)
    if i0 < 0:
        sig = sig[-i0:]; i0 = 0
    i1 = min(N, i0 + len(sig))
    out[i0:i1] += sig[:i1 - i0] * db(gain_db)

def env_adsr(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / d_tau)
    return e

def sweep_bp(noise, f0, f1, q=1.2, curve=1.0):
    n = len(noise); blk = 256
    y = np.zeros(n)
    zi = None
    for s in range(0, n, blk):
        p = (s / n) ** curve
        fc = f0 * (f1 / f0) ** p
        lo, hi = fc / (1 + 1 / (2 * q)), min(fc * (1 + 1 / (2 * q)), SR / 2 - 100)
        sos = signal.butter(2, [lo, hi], btype="band", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y[s:s + blk], zi = signal.sosfilt(sos, noise[s:s + blk], zi=zi)
    return y

def whoosh(dur=0.5, f0=250, f1=4200, peak=0.72):
    n = int(dur * SR)
    nz = rng.normal(0, 1, n)
    y = sweep_bp(nz, f0, f1, q=0.9, curve=0.8)
    t = np.linspace(0, 1, n)
    e = np.where(t < peak, (t / peak) ** 2.2, np.exp(-(t - peak) / (1 - peak) * 4.5))
    y = y * e
    y /= np.abs(y).max() + 1e-9
    # stereo sweep L->R
    pan = np.linspace(-0.6, 0.6, n)
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([y * l, y * r], 1) * 1.3

def ting(f=1900, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    parts = [(1.0, 1.0, 1.1), (2.32, 0.45, 0.7), (4.25, 0.25, 0.45), (6.63, 0.12, 0.25), (1.004, 0.6, 1.0)]
    y = sum(a * np.sin(2 * np.pi * f * m * t + rng.uniform(0, 6)) * np.exp(-t / d) for m, a, d in parts)
    y *= np.minimum(1, t / 0.002)
    click = rng.normal(0, 1, n) * np.exp(-t / 0.003)
    click = signal.sosfilt(signal.butter(2, 3000, "high", fs=SR, output="sos"), click)
    y = y + click * 0.4
    return y / np.abs(y).max()

def pop(f0=900, f1=240, dur=0.12):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.018)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) * np.exp(-t / 0.035)
    nz = signal.sosfilt(signal.butter(2, 2500, "high", fs=SR, output="sos"), rng.normal(0, 1, n)) * np.exp(-t / 0.004)
    y = y + 0.35 * nz
    return y / np.abs(y).max()

def boom(dur=1.6, f0=72, f1=36):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.12)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.55) * np.minimum(1, t / 0.004)
    th = signal.sosfilt(signal.butter(2, 180, "low", fs=SR, output="sos"), rng.normal(0, 1, n)) * np.exp(-t / 0.06)
    y = np.tanh((y + th * 2.0) * 1.6)
    return y / np.abs(y).max()

def riser(dur=0.85):
    n = int(dur * SR)
    y = sweep_bp(rng.normal(0, 1, n), 300, 6000, q=1.5, curve=1.6)
    t = np.linspace(0, 1, n)
    y *= t ** 2.5
    y[-int(0.01 * SR):] *= np.linspace(1, 0, int(0.01 * SR))
    return y / np.abs(y).max()

def ping():
    n = int(0.9 * SR); t = np.arange(n) / SR
    def tone(f, t0):
        tt = np.maximum(0, t - t0)
        return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt / 0.22) * (t >= t0) * np.minimum(1, tt / 0.003)
    y = tone(1318.5, 0) + 0.9 * tone(1760, 0.11)
    return y / np.abs(y).max()

def shimmer(dur=1.4, density=60):
    n = int(dur * SR); y = np.zeros(n)
    for _ in range(int(density * dur)):
        t0 = rng.uniform(0, dur * 0.75); f = rng.uniform(2800, 8500); d = rng.uniform(0.04, 0.25)
        m = int(min(n - int(t0 * SR), d * 5 * SR)); tt = np.arange(m) / SR
        y[int(t0 * SR):int(t0 * SR) + m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) * rng.uniform(0.3, 1)
    y *= np.linspace(1, 0.2, n)
    return y / np.abs(y).max()

def ticks(dur=0.9):
    n = int(dur * SR); y = np.zeros(n); t = 0.0
    while t < dur - 0.05:
        m = int(0.02 * SR); tt = np.arange(m) / SR
        c = rng.normal(0, 1, m) * np.exp(-tt / 0.0025)
        c = signal.sosfilt(signal.butter(2, [1800, 6000], "band", fs=SR, output="sos"), c)
        i = int(t * SR); y[i:i + m] += c[:n - i] * rng.uniform(0.5, 1)
        t += rng.uniform(0.07, 0.14)
    return y / np.abs(y).max()

# ------------------------------------------------------------------ cue sheet
G = json.load(open("groups.json"))
# whoosh into each big-word landing (peak lands on the word)
for g in G:
    for ln in g["lines"]:
        if ln["k"] == "b":
            w = whoosh(0.42, f0=rng.uniform(200, 320), f1=rng.uniform(3200, 5200))
            add(w, ln["at"] - 0.42 * 0.72, -27)

# intro
add(boom(), 0.02, -17)
add(shimmer(1.2, 40), 0.05, -33)
# logo trio
add(riser(0.8), 5.84 - 0.8, -26)
add(boom(), 5.84, -15)
for t, f, p in [(5.84, 1760, -0.5), (6.54, 1975, 0.0), (7.74, 2217, 0.5)]:
    add(ting(f), t, -24, p)
    add(whoosh(0.35, 400, 5000), t - 0.25, -27, p)
add(whoosh(0.4, 3000, 300, 0.3), 8.95, -29)   # tiles leave
# Amazon spotlight
add(ting(1568), 9.42, -23); add(boom(1.2, 60, 34), 9.42, -20)
add(whoosh(0.35, 3000, 400, 0.3), 12.40, -30)
add(ping(), 12.62, -17)
for k in range(5):
    add(pop(700 + k * 120, 220 + k * 30), 13.78 + k * 0.07 + 0.04, -27, (k - 2) * 0.35)
# Flipkart parallel Amazon
add(ting(1975), 15.18, -24, 0.4); add(ting(1760), 15.45, -25, -0.4); add(boom(1.2, 60, 34), 15.18, -20)
add(whoosh(0.5, 2000, 7000, 0.85), 16.50, -30); add(shimmer(0.7, 50), 16.56, -32)
# Twitter hero
add(riser(0.6), 18.76 - 0.6, -28)
add(boom(), 18.76, -16); add(ting(2349), 18.76, -23)
add(pop(1100, 400), 19.36, -30)
# network
add(pop(800, 260), 21.42, -25)
for k in range(1, 5):
    add(pop(900 + k * 90, 300), 21.38 + 0.1 + k * 0.08 + 0.05, -29, (-1) ** k * 0.5)
    add(whoosh(0.25, 1500, 6000, 0.6), 21.55 + k * 0.12, -36, (-1) ** k * 0.6)
# one-to-one
add(pop(700, 240), 23.70, -25, -0.5); add(pop(760, 260), 23.73, -25, 0.5)
add(whoosh(0.4, 600, 5000, 0.8), 23.85, -31); add(boom(1.0, 64, 40), 23.66, -22)
# Twitter again
add(ting(2349), 25.18, -24); add(whoosh(0.35, 3000, 400, 0.3), 26.42, -31)
# chat
add(ping(), 26.66, -21)
add(pop(1300, 500, 0.1), 27.40, -24, 0.4); add(whoosh(0.22, 1200, 6000, 0.6), 27.22, -32, 0.4)
add(ticks(0.85), 27.95, -30, -0.4)
# thank you
add(riser(0.7), 29.0 - 0.7, -27)
add(boom(), 29.0, -14); add(shimmer(1.0, 80), 29.0, -27)

# ------------------------------------------------------------------ space: short stereo reverb
ir_n = int(1.3 * SR); tt = np.arange(ir_n) / SR
irl = rng.normal(0, 1, ir_n) * np.exp(-tt / 0.32); irr = rng.normal(0, 1, ir_n) * np.exp(-tt / 0.32)
irl = signal.sosfilt(signal.butter(2, 5000, "low", fs=SR, output="sos"), irl)
irr = signal.sosfilt(signal.butter(2, 5000, "low", fs=SR, output="sos"), irr)
wet = np.stack([signal.fftconvolve(out[:, 0], irl)[:N], signal.fftconvolve(out[:, 1], irr)[:N]], 1)
wet *= np.abs(out).max() / (np.abs(wet).max() + 1e-9) * 0.35
mix = out + wet
peak = np.abs(mix).max()
print("sfx peak dBFS", 20 * np.log10(peak))
if peak > 0.89:
    mix *= 0.89 / peak
wavfile.write("sfx.wav", SR, mix.astype(np.float32))
