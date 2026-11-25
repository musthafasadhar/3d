"""Original score + sound design for the Avni launch film.

Everything here is synthesised from scratch (no samples, no third-party music):
  * 120 BPM, F major, progression Fmaj7 - Am7 - Dm7 - Bbmaj7 (I - iii - vi - IV)
  * marimba lead, soft plucks, warm pad, round bass, kick / clap / hats / shaker
  * humanised timing + velocity on every played note
  * SFX are generated per cue exported from the animation timeline (cues.json),
    so every whoosh / click / pop lands on the exact frame it belongs to.

usage: python3 audio.py cues.json out.wav
"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 120
BEAT = 60 / BPM            # 0.5 s
STEP = BEAT / 4            # 16th note
BAR = BEAT * 4             # 2 s
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    e = np.exp(-t / d_tau)
    na = max(1, int(a * SR))
    e[:na] *= np.linspace(0, 1, na)
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, min(hi, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)


def sweep_filter(x, f0, f1, q_width=0.9, chunks=48, kind='band'):
    """Piecewise band/low-pass whose centre moves f0 -> f1 (log). Crossfaded chunks."""
    n = len(x)
    out = np.zeros(n)
    edges = np.linspace(0, n, chunks + 1).astype(int)
    win_pad = int(0.01 * SR)
    for i in range(chunks):
        a, b = edges[i], edges[i + 1]
        fc = f0 * (f1 / f0) ** ((a + b) / 2 / n)
        aa, bb = max(0, a - win_pad), min(n, b + win_pad)
        seg = x[aa:bb]
        if kind == 'band':
            y = bp(seg, max(40, fc * (1 - q_width / 2)), fc * (1 + q_width / 2))
        else:
            y = lp(seg, fc)
        w = np.ones(bb - aa)
        if aa < a:
            w[: a - aa] = np.linspace(0, 1, a - aa)
        if bb > b:
            w[-(bb - b):] = np.linspace(1, 0, bb - b)
        out[aa:bb] += y * w
    return out


class Bus:
    def __init__(self, dur):
        self.n = int(dur * SR)
        self.L = np.zeros(self.n)
        self.R = np.zeros(self.n)

    def add(self, t, sig, gain=1.0, pan=0.0):
        """sig: mono array or (L,R) tuple. Equal-power pan."""
        i = int(round(t * SR))
        if i >= self.n:
            return
        if isinstance(sig, tuple):
            l, r = sig
        else:
            l = r = sig
        th = (pan + 1) * np.pi / 4
        gl, gr = np.cos(th) * np.sqrt(2), np.sin(th) * np.sqrt(2)
        if i < 0:
            l, r, i = l[-i:], r[-i:], 0
        m = min(len(l), self.n - i)
        self.L[i:i + m] += l[:m] * gain * gl
        self.R[i:i + m] += r[:m] * gain * gr

    def stereo(self):
        return np.stack([self.L, self.R])


# ---------------------------------------------------------------- instruments
def marimba(f, vel=1.0, d=1.4):
    t = tt(d)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.55)
         + 0.28 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t / 0.09)
         + 0.06 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t / 0.03))
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.003) * 0.15
    s = s + click
    s[:96] *= np.linspace(0, 1, 96)
    return s * vel


def pluck(f, vel=1.0, d=0.9, bright=1.0):
    t = tt(d)
    s = np.zeros_like(t)
    for k in range(1, 14):
        if f * k > 16000:
            break
        s += (1 / k) * np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (2.6 + k * 2.2 / bright))
    s[:48] *= np.linspace(0, 1, 48)
    return s * vel * 0.5


def keys(f, vel=1.0, d=2.6):
    """soft electric-piano / felt keys"""
    t = tt(d)
    s = (np.sin(2 * np.pi * f * t + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.4)) * np.exp(-t / 1.1)
         + 0.2 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t / 0.35))
    s[:240] *= np.linspace(0, 1, 240)
    return s * vel * 0.6


def bell(f, vel=1.0, d=2.2):
    t = tt(d)
    s = np.zeros_like(t)
    for ratio, amp, tau in [(1, 1, 0.9), (2.0, 0.35, 0.5), (2.76, 0.25, 0.35), (5.4, 0.12, 0.15), (8.9, 0.05, 0.06)]:
        s += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t / tau)
    s[:48] *= np.linspace(0, 1, 48)
    return s * vel * 0.5


def pad_chord(notes, d, bright=1600, seed=0):
    r = np.random.default_rng(seed)
    t = tt(d)
    L = np.zeros_like(t); R = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for det, side in [(-0.0045, 0), (0.0, 2), (0.0045, 1)]:
            ff = f * (1 + det)
            ph = r.uniform(0, 2 * np.pi)
            v = np.zeros_like(t)
            for k in range(1, 18):
                if ff * k > 9000:
                    break
                v += np.sin(2 * np.pi * ff * k * t + ph * k) / k
            if side == 0:
                L += v
            elif side == 1:
                R += v
            else:
                L += 0.7 * v; R += 0.7 * v
    L, R = lp(L, bright), lp(R, bright)
    e = np.ones_like(t)
    a, rl = int(0.35 * SR), int(0.45 * SR)
    e[:a] = np.linspace(0, 1, a) ** 1.5
    e[-rl:] *= np.linspace(1, 0, rl)
    return L * e * 0.06, R * e * 0.06


def bass(f, vel=1.0, d=0.42):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    e = np.exp(-t / 0.28)
    e[:96] *= np.linspace(0, 1, 96)
    rel = int(0.03 * SR)
    e[-rel:] *= np.linspace(1, 0, rel)
    return np.tanh(1.6 * s * e) * vel * 0.55


def kick(vel=1.0):
    t = tt(0.5)
    f = 48 + 95 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.2)
    s += lp(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.004) * 0.25
    return np.tanh(1.4 * s) * vel


def clap(vel=1.0):
    t = tt(0.35)
    n = rng.standard_normal(len(t))
    e = np.zeros_like(t)
    for off in (0.0, 0.009, 0.018):
        i = int(off * SR)
        e[i:] += np.exp(-(t[: len(t) - i]) / 0.006)
    e += 0.6 * np.exp(-np.maximum(0, t - 0.022) / 0.09) * (t > 0.022)
    return bp(n * e, 900, 3200) * vel * 0.9


def snare(vel=1.0):
    t = tt(0.25)
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04)
    nz = bp(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.07)
    return (0.5 * body + nz) * vel * 0.7


def hat(vel=1.0, open_=False):
    t = tt(0.3 if open_ else 0.06)
    s = hp(rng.standard_normal(len(t)), 7500, 4) * np.exp(-t / (0.09 if open_ else 0.014))
    return s * vel * 0.5


def shaker(vel=1.0):
    t = tt(0.08)
    e = np.sin(np.pi * np.clip(t / 0.06, 0, 1)) ** 2
    return bp(rng.standard_normal(len(t)), 4500, 11000) * e * vel * 0.3


def riser(d, f0=300, f1=6000):
    t = tt(d)
    n = rng.standard_normal(len(t))
    s = sweep_filter(n, f0, f1, 0.6)
    tone = np.sin(2 * np.pi * np.cumsum(220 * (4 ** (t / d))) / SR) * 0.15
    e = (t / d) ** 2.2
    return (s * 0.8 + tone) * e


def rev_cymbal(d):
    t = tt(d)
    s = hp(rng.standard_normal(len(t)), 5000) * np.exp(-(d - t) / (d * 0.35))
    return s * ((t / d) ** 1.5)


# ---------------------------------------------------------------- reverb
def make_ir(dur=2.2, tone=5000, seed=1):
    r = np.random.default_rng(seed)
    t = tt(dur)
    e = np.exp(-t / (dur / 6.5))
    L = lp(r.standard_normal(len(t)) * e, tone)
    R = lp(r.standard_normal(len(t)) * e, tone)
    pre = int(0.018 * SR)
    L[:pre] = 0; R[:pre] = 0
    return L / np.sqrt(np.sum(L ** 2)), R / np.sqrt(np.sum(R ** 2))


def reverb(st, ir, wet=0.25):
    L = fftconvolve(st[0], ir[0])[: st.shape[1]]
    R = fftconvolve(st[1], ir[1])[: st.shape[1]]
    return np.stack([L, R]) * wet


# ---------------------------------------------------------------- score
PROG = [  # (pad voicing, bass root, chord tones for arps)
    ([53, 57, 60, 64], 41, [65, 69, 72, 76]),   # Fmaj7
    ([52, 55, 57, 60], 45, [64, 67, 69, 72]),   # Am7
    ([53, 57, 60, 62], 38, [62, 65, 69, 72]),   # Dm7
    ([53, 57, 58, 62], 46, [62, 65, 69, 70]),   # Bbmaj7
]
MELODY = [  # (16th step, midi) per chord, 3-3-2 syncopation
    [(0, 72), (3, 69), (6, 72), (8, 77), (11, 76), (14, 72)],
    [(0, 76), (3, 72), (6, 76), (8, 79), (11, 76), (14, 74)],
    [(0, 77), (3, 74), (6, 77), (8, 81), (11, 79), (14, 77)],
    [(0, 74), (3, 77), (6, 81), (8, 79), (10, 77), (12, 74), (14, 72)],
]
MELODY_B = [  # answer phrase for alternating bars
    [(0, 81), (2, 79), (3, 77), (6, 76), (8, 77), (12, 72)],
    [(0, 79), (2, 77), (3, 76), (6, 72), (8, 74), (12, 76)],
    [(0, 81), (2, 79), (3, 77), (6, 74), (8, 77), (12, 81)],
    [(0, 82), (2, 81), (3, 79), (6, 77), (8, 74), (11, 72), (14, 70)],
]

# section map in bars (each bar = 2 s)
#  0-1 intro | 2-4 verse | 5-7 verse+clap | 8 fill+break | 9-20 chorus | 21-23 hospitals (arp)
#  24-25 stats | 26-27 breakdown | 28-29 finale | 30-31 outro | 32 final chord
def section(bar):
    if bar < 2: return 'intro'
    if bar < 5: return 'verse'
    if bar < 8: return 'verse2'
    if bar == 8: return 'fill'
    if bar < 21: return 'chorus'
    if bar < 24: return 'arp'
    if bar < 26: return 'chorus'
    if bar < 28: return 'break'
    if bar < 30: return 'chorus'
    if bar < 32: return 'outro'
    return 'end'


def hum(t, ms=4):
    return t + rng.normal(0, ms / 1000)


def vel(v, spread=0.1):
    return v * (1 + rng.uniform(-spread, spread))


def compose(dur):
    drums, music, bassbus, verb_send = Bus(dur), Bus(dur), Bus(dur), Bus(dur)
    kicks = []
    nbars = 33
    for bar in range(nbars):
        sec = section(bar)
        t0 = bar * BAR
        pad_notes, root, arp = PROG[bar % 4]
        mel = (MELODY if bar % 2 == 0 else MELODY_B)[bar % 4]

        # ---- pad (all sections except the 0.5 s break at the end of the fill)
        if sec != 'end':
            d = BAR + 0.5
            bright = {'intro': 900, 'break': 1100, 'outro': 1300}.get(sec, 1800)
            if sec == 'fill':
                d = 1.5
            L, R = pad_chord(pad_notes, d, bright, seed=bar)
            g = 0.75 if sec in ('intro', 'break', 'outro') else 0.55
            if sec == 'intro':
                g *= min(1, 0.4 + bar * 0.6)
            music.add(t0, (L, R), g)
        else:
            L, R = pad_chord([53, 57, 60, 64, 69], 4.0, 1400, seed=99)
            music.add(t0, (L, R), 0.9)

        # ---- final chord + bell
        if sec == 'end':
            for i, n in enumerate([65, 69, 72, 77]):
                verb_send.add(t0 + i * 0.03, marimba(midi(n), 0.5, 2.5), 0.9, (i - 1.5) * 0.3)
            bassbus.add(t0, bass(midi(41), 1, 1.6), 0.9)
            verb_send.add(t0, bell(midi(84), 0.5, 3), 0.5)
            continue

        # ---- marimba lead
        if sec in ('chorus', 'arp', 'outro', 'break', 'verse2'):
            g = {'chorus': 0.36, 'arp': 0.30, 'outro': 0.30, 'break': 0.22, 'verse2': 0.22}[sec]
            for step, n in mel:
                if sec == 'break' and step % 4 != 0 and step != 6:
                    continue
                tn = hum(t0 + step * STEP, 3)
                if sec == 'fill' and tn > 17.4:
                    continue
                s = marimba(midi(n), vel(1))
                music.add(tn, s, g, 0.15)
                verb_send.add(tn, s, g * 0.5, 0.15)
        if sec == 'intro':
            for k, n in enumerate(arp):
                tn = hum(t0 + k * BEAT, 3)
                s = marimba(midi(n), vel(0.8))
                music.add(tn, s, 0.22, -0.2 + 0.13 * k)
                verb_send.add(tn, s, 0.25)

        # ---- plucks: 8th-note arpeggio
        if sec in ('verse', 'verse2', 'chorus', 'arp', 'fill', 'outro'):
            order = [0, 2, 1, 3, 2, 0, 3, 1]
            for k in range(8):
                tn = hum(t0 + k * 2 * STEP, 4)
                if sec == 'fill' and tn > 17.45:
                    continue
                n = arp[order[k]] + (12 if sec == 'arp' and k % 2 else 0)
                s = pluck(midi(n), vel(0.9, 0.15), 0.7, 1.2 if sec == 'arp' else 0.8)
                pan = -0.45 if k % 2 else 0.45
                g = {'verse': 0.30, 'verse2': 0.27, 'chorus': 0.20, 'arp': 0.24, 'fill': 0.25, 'outro': 0.18}[sec]
                music.add(tn, s, g, pan)
                verb_send.add(tn, s, g * 0.4, pan)
        if sec == 'arp':  # extra 16th sparkle arp for the hospitals scene
            for k in range(16):
                n = arp[(k * 3) % 4] + 12
                tn = hum(t0 + k * STEP, 2)
                s = pluck(midi(n), vel(0.6, 0.2), 0.35, 2.0)
                music.add(tn, s, 0.11, 0.6 if k % 2 else -0.6)

        # ---- break-down keys
        if sec == 'break':
            for k, n in enumerate(pad_notes):
                tn = hum(t0 + k * 0.06, 6)
                s = keys(midi(n + 12), vel(0.8))
                music.add(tn, s, 0.30, -0.3 + 0.2 * k)
                verb_send.add(tn, s, 0.35)
            for b in (1, 2, 3):
                tn = hum(t0 + b * BEAT + STEP * 2, 6)
                s = keys(midi(arp[b % 4] + 12), vel(0.5))
                music.add(tn, s, 0.22, 0.3)
                verb_send.add(tn, s, 0.3)

        # ---- bass
        if sec in ('verse', 'verse2', 'chorus', 'arp', 'fill', 'outro'):
            pat = [(0, 0, 0.42), (3, 0, 0.2), (6, 12, 0.2), (8, 0, 0.36), (11, 0, 0.2), (14, 7, 0.2)]
            if sec == 'outro':
                pat = [(0, 0, 1.0), (8, 0, 0.9)]
            for step, off, d in pat:
                tn = t0 + step * STEP
                if sec == 'fill' and tn > 17.4:
                    continue
                bassbus.add(tn, bass(midi(root + off), vel(1, 0.06), d), 0.85)

        # ---- drums
        if sec in ('verse', 'verse2', 'chorus', 'arp', 'fill'):
            for b in range(4):
                tn = t0 + b * BEAT
                if sec == 'fill' and tn >= 17.5:
                    continue
                drums.add(tn, kick(vel(1, 0.04)), 0.95)
                kicks.append(tn)
            if sec in ('verse2', 'chorus', 'arp'):
                for b in (1, 3):
                    c = clap(vel(1, 0.08))
                    drums.add(hum(t0 + b * BEAT, 2), c, 0.55)
                    verb_send.add(t0 + b * BEAT, c, 0.35)
            for k in range(16):
                tn = hum(t0 + k * STEP, 4)
                if sec == 'fill' and tn > 17.45:
                    continue
                if k % 4 == 2:
                    drums.add(tn, hat(vel(0.9), open_=(sec in ('chorus', 'arp'))), 0.5, 0.25)
                elif sec in ('chorus', 'arp', 'verse2') and k % 2 == 1:
                    drums.add(tn, hat(vel(0.55, 0.25)), 0.35, 0.3)
                drums.add(tn, shaker(vel(0.7 if k % 2 else 1.0, 0.25)), 0.4, -0.35)
            if sec == 'fill':  # snare roll into the break
                for k in range(8):
                    tn = 16.5 + k * STEP / 1.0 * (1 if k < 4 else 0.5) + (0 if k < 4 else 0.25)
                    if tn < 17.45:
                        s = snare(0.3 + k * 0.08)
                        drums.add(tn, s, 0.5)
                        verb_send.add(tn, s, 0.3)
        if sec == 'outro':
            for k in range(16):
                drums.add(hum(t0 + k * STEP, 4), shaker(vel(0.6, 0.3)), 0.3, -0.3)
            if bar == 30:
                drums.add(t0, kick(0.8), 0.7); kicks.append(t0)

    # ---- risers / reverse cymbals into section changes
    for (t_end, d, g) in [(4.0, 1.6, 0.35), (18.0, 1.6, 0.42), (36.0, 1.0, 0.25), (42.0, 1.0, 0.28), (56.0, 2.0, 0.45), (64.0, 1.5, 0.25)]:
        r = riser(d)
        music.add(t_end - d - (0.5 if t_end == 18.0 else 0), r, g)
        music.add(t_end - 0.9, rev_cymbal(0.9), g * 0.9)

    # ---- sidechain (kick ducks pad, plucks, bass)
    n = music.n
    duck = np.ones(n)
    for kt in kicks:
        i = int(kt * SR)
        m = min(int(0.32 * SR), n - i)
        if m <= 0:
            continue
        x = np.arange(m) / SR
        duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.5 * np.exp(-x / 0.09))
    music.L *= duck; music.R *= duck
    bassbus.L *= 0.6 + 0.4 * duck; bassbus.R *= 0.6 + 0.4 * duck

    ir = make_ir(2.4, 5500, 3)
    wet = reverb(verb_send.stereo(), ir, 0.55)
    mix = drums.stereo() * 0.9 + music.stereo() + lp(bassbus.L, 900)[None, :] * np.array([[1], [1]]) * 0.95 + wet
    return mix, ir


# ---------------------------------------------------------------- SFX
def sfx(name, g):
    if name == 'tok':
        t = tt(0.09)
        f = 1450 + rng.uniform(-120, 120)
        s = np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012) + 0.5 * np.sin(2 * np.pi * f * 0.5 * t) * np.exp(-t / 0.02)
        s += bp(rng.standard_normal(len(t)), 2000, 6000) * np.exp(-t / 0.002) * 0.4
        return s * 0.35, 0.18
    if name == 'pop':
        t = tt(0.16)
        f = 320 + 900 * (1 - np.exp(-t / 0.02))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045)
        return s * 0.55, 0.22
    if name == 'click':
        t = tt(0.06)
        s = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.0015)
        s2 = np.sin(2 * np.pi * 3100 * t) * np.exp(-t / 0.006) * 0.5
        rel = np.zeros_like(t); i = int(0.045 * SR)
        rel[i:] = hp(rng.standard_normal(len(t) - i), 3000) * np.exp(-(t[i:] - t[i]) / 0.001) * 0.4
        return (s + s2 + rel) * 0.6, 0.12
    if name == 'tick':
        t = tt(0.22)
        s = np.where(t < 0.05, np.sin(2 * np.pi * 1320 * t), np.sin(2 * np.pi * 1760 * t)) * np.exp(-t / 0.07)
        s[:48] *= np.linspace(0, 1, 48)
        return s * 0.28, 0.3
    if name == 'type':
        t = tt(0.05)
        s = bp(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t / 0.004) * rng.uniform(0.7, 1.1)
        s += np.sin(2 * np.pi * rng.uniform(170, 240) * t) * np.exp(-t / 0.012) * 0.35
        return s * 0.5, 0.05
    if name in ('whoosh', 'whooshS', 'swipe', 'wave', 'suck'):
        d = {'whoosh': 0.75, 'whooshS': 0.45, 'swipe': 0.35, 'wave': 1.1, 'suck': 0.55}[name]
        f0, f1 = {'whoosh': (250, 2600), 'whooshS': (500, 4200), 'swipe': (1500, 9000), 'wave': (150, 1400), 'suck': (3000, 300)}[name]
        t = tt(d)
        n = rng.standard_normal(len(t))
        s = sweep_filter(n, f0, f1, 1.0)
        if name == 'suck':
            e = (t / d) ** 2.5 * (t < d * 0.97)
        else:
            pk = 0.42 if name != 'wave' else 0.55
            e = np.where(t < d * pk, (t / (d * pk)) ** 1.6, np.exp(-(t - d * pk) / (d * 0.18)))
        s = s * e
        if name == 'wave':
            s += lp(rng.standard_normal(len(t)), 120) * e * 1.5
        # stereo movement L -> R
        p = np.linspace(-0.7, 0.7, len(t))
        L, R = s * np.cos((p + 1) * np.pi / 4) * 1.41, s * np.sin((p + 1) * np.pi / 4) * 1.41
        k = {'whoosh': 0.75, 'whooshS': 0.6, 'swipe': 0.45, 'wave': 0.8, 'suck': 0.7}[name]
        return (L * k, R * k), 0.15
    if name == 'shimmer':
        out = np.zeros(int(2.4 * SR))
        for i, n in enumerate([84, 88, 91, 96, 100]):
            b = bell(midi(n), 0.7 - i * 0.08, 1.8)
            j = int(i * 0.055 * SR)
            out[j:j + len(b)] += b[: len(out) - j]
        return out * 0.32, 0.55
    if name == 'toggle':
        t = tt(0.12)
        s = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t / 0.002) * 0.5
        s += np.sin(2 * np.pi * 980 * t) * np.exp(-t / 0.03) * 0.6
        return s * 0.45, 0.15
    if name in ('impact', 'impactS', 'logo'):
        d = 2.2
        t = tt(d)
        f = 38 + 70 * np.exp(-t / 0.08)
        boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (0.6 if name != 'impactS' else 0.3))
        thud = lp(rng.standard_normal(len(t)), 900) * np.exp(-t / 0.05) * 0.6
        air = hp(rng.standard_normal(len(t)), 6000) * np.exp(-t / 0.25) * 0.08
        s = np.tanh(1.5 * (boom + thud)) + air
        if name == 'logo':
            for i, n in enumerate([65, 69, 72, 77, 81]):
                b = bell(midi(n + 12), 0.5, 2.2)
                j = int(i * 0.025 * SR)
                s[j:j + len(b)] += b[: len(s) - j] * 0.55
            s *= 0.85
        k = {'impact': 0.85, 'impactS': 0.45, 'logo': 0.8}[name]
        return s * k, 0.45
    if name == 'bubble':
        t = tt(0.2)
        f = np.where(t < 0.06, 520 + 6000 * t, 900 + 5000 * (t - 0.06))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.05)
        s[:48] *= np.linspace(0, 1, 48)
        return s * 0.45, 0.25
    if name == 'select':
        t = tt(0.7)
        f = 420 * 3 ** (t / 0.7)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.7) ** 2
        s += bp(rng.standard_normal(len(t)), 3000, 9000) * np.sin(np.pi * t / 0.7) ** 2 * 0.25
        return s * 0.18, 0.35
    if name == 'ding':
        s = bell(midi(88), 0.8, 1.6)
        b2 = bell(midi(95), 0.6, 1.6)
        j = int(0.08 * SR)
        s[j:] += b2[: len(s) - j]
        return s * 0.4, 0.45
    if name == 'blip':
        t = tt(0.5)
        s = np.sin(2 * np.pi * 70 * t) * np.exp(-t / 0.05)
        j = int(0.17 * SR)
        s[j:] += np.sin(2 * np.pi * 62 * t[: len(t) - j]) * np.exp(-t[: len(t) - j] / 0.06) * 0.8
        s += np.sin(2 * np.pi * 1046 * t) * np.exp(-t / 0.08) * 0.25
        return s * 0.6, 0.25
    if name == 'count':
        t = tt(0.05)
        f = 1900 * (0.9 + 0.25 * g)
        s = np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t / 0.008)
        return lp(s, 6000) * 0.12, 0.15
    raise ValueError(name)


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    data = json.load(open(cues_path))
    dur = data['duration'] + 1.0
    mix, ir = compose(dur)
    fx, fx_send = Bus(dur), Bus(dur)
    for c in data['cues']:
        s, send = sfx(c['name'], c['gain'])
        g = c['gain']
        t = c['t'] - (0.004 if c['name'] in ('click', 'tok', 'type') else 0)  # transient on the frame
        fx.add(t, s, g, c.get('pan', 0))
        fx_send.add(t, s, g * send, c.get('pan', 0))
    fxmix = fx.stereo() + reverb(fx_send.stereo(), ir, 0.6)
    full = mix * 0.62 + fxmix * 0.75
    # gentle master: low cut, soft clip, fade out
    full = np.stack([hp(full[0], 28), hp(full[1], 28)])
    n = full.shape[1]
    fo = int(2.2 * SR)
    end = int((data['duration']) * SR)
    fade = np.ones(n)
    fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.3
    fade[end:] = 0
    full *= fade
    peak = np.max(np.abs(full))
    full = np.tanh(full / peak * 1.2) / np.tanh(1.2) * 0.89
    pcm = (full.T * 32767).astype(np.int16)
    import wave
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm[: end].tobytes())
    print('wrote', out, f'{end / SR:.2f}s')


if __name__ == '__main__':
    main()
