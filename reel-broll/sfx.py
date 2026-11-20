"""Synthesise a subtle, clean SFX bed that matches the B-roll timeline (35 s, 48 kHz stereo)."""
import numpy as np, wave, sys

SR = 48000
DUR = 35.0
rng = np.random.default_rng(7)
L = np.zeros(int(SR * DUR)); R = np.zeros_like(L)


def env(n, a, d):
    """attack/decay envelope in seconds"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4))
    return e


def onepole_lp(x, fc):
    """time-varying one-pole lowpass (fc array or scalar)"""
    fc = np.broadcast_to(np.asarray(fc, float), x.shape)
    a = np.exp(-2 * np.pi * fc / SR)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a[i]) * x[i] + a[i] * s; y[i] = s
    return y


def bandnoise(n, f0, f1):
    w = rng.standard_normal(n)
    fc = np.geomspace(f0, f1, n)
    return onepole_lp(w, fc * 1.6) - onepole_lp(w, fc * .6)


def place(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR); j = min(len(L), i + len(sig)); s = sig[:j - i] * gain
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.414


def whoosh(d=.55, up=True):
    n = int(SR * d); t = np.linspace(0, 1, n)
    x = bandnoise(n, 300 if up else 2500, 2500 if up else 300)
    shape = np.sin(np.pi * t ** .7) ** 2
    return x / (np.abs(x).max() + 1e-9) * shape


def pop(f0=520, f1=160, d=.12):
    n = int(SR * d); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .002, .045)
    return x


def tap():
    n = int(SR * .06); t = np.arange(n) / SR
    click = rng.standard_normal(n) * env(n, .0005, .004)
    tone = np.sin(2 * np.pi * 2300 * t) * env(n, .0005, .012) * .5
    body = np.sin(2 * np.pi * 180 * t) * env(n, .001, .02) * .6
    return onepole_lp(click, 6000) * .8 + tone + body


def tick():
    n = int(SR * .03); return onepole_lp(rng.standard_normal(n), 4500) * env(n, .0003, .005)


def chime(base=1046.5, d=1.6):
    n = int(SR * d); t = np.arange(n) / SR; x = np.zeros(n)
    for k, (m, a) in enumerate([(1, 1), (1.5, .55), (2, .4), (3, .18), (4.01, .1)]):
        x += a * np.sin(2 * np.pi * base * m * t + k) * np.exp(-t * (2.2 + k))
    return x * env(n, .003, 10) * .5


def impact(d=1.2):
    n = int(SR * d); t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)
    nz = onepole_lp(rng.standard_normal(n), 900) * np.exp(-t * 14) * 1.5
    return sub + nz


def riser(d=1.5):
    n = int(SR * d); t = np.linspace(0, 1, n)
    x = bandnoise(n, 400, 6000); x /= np.abs(x).max()
    tone = np.sin(2 * np.pi * np.cumsum(np.geomspace(220, 880, n)) / SR) * .25
    return (x * .8 + tone) * t ** 2.2


def shimmer(d=1.0):
    n = int(SR * d); t = np.arange(n) / SR; x = np.zeros(n)
    for k in range(9):
        st = rng.uniform(0, d * .6); f = rng.uniform(2600, 5200)
        i = int(st * SR); m = n - i
        x[i:] += np.sin(2 * np.pi * f * t[:m]) * np.exp(-t[:m] * 9) * .25
    return x * np.sin(np.pi * np.linspace(0, 1, n)) ** .5


def drone(d=2.3):
    n = int(SR * d); t = np.linspace(0, 1, n)
    x = onepole_lp(rng.standard_normal(n), 380) * 3
    x += np.sin(2 * np.pi * 73 * np.arange(n) / SR) * .25
    return x * np.sin(np.pi * t) ** 1.5


# ---------------- timeline (mirrors broll.html) ----------------
place(whoosh(.7), 0.0, .35)
place(pop(380, 120, .2), 0.62, .7); place(impact(.6), 0.62, .25)
for i in range(3): place(pop(620 + i * 90, 240, .1), 1.08 + i * .22, .45, (i - 1) * .5)
place(pop(300, 110, .14), 1.95, .35)
place(impact(.9), 3.4, .22)
place(whoosh(.5), 4.85, .45)
place(drone(2.2), 5.05, .5)
place(riser(.9), 6.35, .35)
place(impact(1.2), 7.25, .55); place(chime(784, 2.0), 7.3, .55)
place(shimmer(.9), 8.9, .5)
place(whoosh(.55), 9.85, .45)
place(whoosh(.6, False), 10.05, .3)
for tt in (11.2, 12.3, 13.2, 14.2): place(tap(), tt, .7)
place(pop(700, 300, .1), 13.62, .4); place(chime(1568, .9), 14.25, .25)
place(whoosh(.5), 14.85, .45)
place(whoosh(.7), 15.25, .35, .6)
place(tap(), 15.98, .5); place(tap(), 16.32, .7)
place(whoosh(.35, False), 16.4, .3, .4)
for k in range(8): place(tick(), 16.95 + k * .1, .35)
place(pop(500, 200, .12), 17.8, .45)
for k in range(4): place(chime(1318.5 + k * 196, .7), 18.75 + k * .32, .18)
place(whoosh(.5), 19.85, .45)
place(pop(380, 120, .2), 20.45, .55)
place(shimmer(1.4), 20.9, .55)
for r in range(3):
    for c in range(3):
        place(tick(), 21.15 + (r + c) * .22 + (r * 3 + c) * .02, .5, (c - 1) * .4)
place(chime(1046.5, 1.8), 22.65, .45)
for k in range(3): place(pop(820, 380, .09), 23.2 + k * .3, .4)
place(whoosh(.5), 24.85, .45)
place(riser(1.5), 25.5, .45)
place(impact(1.4), 27.0, .7); place(shimmer(1.2), 27.0, .6)
for k in range(3): place(pop(760, 320, .1), 27.3 + k * .3, .45)
place(whoosh(.5), 29.3, .45)
place(pop(360, 110, .22), 29.55, .7); place(impact(.7), 29.55, .25)
place(shimmer(.9), 30.8, .45)
place(pop(640, 260, .1), 30.5, .35); place(pop(700, 280, .1), 30.65, .35)
place(tap(), 31.5, .8); place(chime(1318.5, 1.2), 31.55, .35)
place(tap(), 32.4, .8); place(whoosh(.4, False), 32.55, .3)
full = '@your_insta_id'
for k in range(len(full)): place(tick(), 33.1 + k * 1.1 / len(full), .4, .3)
place(tap(), 34.4, .8); place(chime(1568, 1.0), 34.45, .4)

# ---------------- light room reverb ----------------
def reverb(x, d=.9, mix=.18):
    n = int(SR * d); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6); ir = onepole_lp(ir, 5000); ir /= np.abs(ir).sum() ** .5 * 6
    m = len(x) + n - 1; N = 1 << (m - 1).bit_length()
    y = np.fft.irfft(np.fft.rfft(x, N) * np.fft.rfft(ir, N), N)[:len(x)]
    return x + y * mix

L = reverb(L); R = reverb(R)
peak = max(np.abs(L).max(), np.abs(R).max())
g = 10 ** (-6 / 20) / peak  # -6 dBFS peak so it sits under the voice
st = np.stack([L * g, R * g], 1)
pcm = (np.clip(st, -1, 1) * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'out/sfx.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', st.shape[0] / SR, 's')
