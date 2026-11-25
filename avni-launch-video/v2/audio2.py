"""v2 score + sound design (60 s, 120 BPM). Reuses the instruments from ../audio.py.

Energy map (seconds):
  0-4     hook      full groove from the first frame, chord stabs on every cut
  4-5.25  break     pad + riser, then 0.25 s of silence
  5.5-15  drop      everything in, marimba hook (logo hits on the downbeat)
  15-27.5 groove    drums, bass, plucks, 16th arp
  27.5-35.5 deep    darker filter, marimba + arp (Ask Avni, dark scene)
  35.5-42 groove
  42-46   stats     stabs on each number slam
  46-50.9 break2    felt keys + pad, riser
  51-52   suck      reverse swell into the final drop
  52-58   final     full groove
  58-60   end       final chord rings out
usage: python3 audio2.py cues.json out.wav
"""
import json, os, sys, wave
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
import audio as A
from audio import SR, BEAT, STEP, BAR, midi, tt, lp, hp, bp, sweep_filter, Bus

rng = np.random.default_rng(11)
A.rng = rng


def sec(t):
    if t < 4.0: return 'hook'
    if t < 5.25: return 'break'
    if t < 5.5: return 'gap'
    if t < 15.0: return 'drop'
    if t < 27.5: return 'groove'
    if t < 35.5: return 'deep'
    if t < 42.0: return 'groove'
    if t < 46.0: return 'stats'
    if t < 50.95: return 'break2'
    if t < 52.0: return 'suck'
    if t < 58.0: return 'final'
    return 'end'


DRUMS = {'hook', 'drop', 'groove', 'deep', 'final'}
LEAD = {'drop', 'deep', 'final'}
PLUCK = {'hook', 'drop', 'groove', 'deep', 'final'}
BASS = {'hook', 'drop', 'groove', 'deep', 'final', 'stats'}


def hum(t, ms=3):
    return t + rng.normal(0, ms / 1000)


def vel(v, s=0.1):
    return v * (1 + rng.uniform(-s, s))


def stab(notes, d=0.5, bright=3500):
    t = tt(d)
    s = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        for k in range(1, 12):
            s += np.sin(2 * np.pi * f * k * t * (1 + 0.003 * (k % 2))) / k
    s = lp(s, bright) * np.exp(-t / 0.16)
    s[:96] *= np.linspace(0, 1, 96)
    return s * 0.12


def sub808(f, d=0.6):
    t = tt(d)
    ff = f * (1 + 1.5 * np.exp(-t / 0.02))
    s = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.exp(-t / 0.4)
    return np.tanh(2.2 * s) * 0.55


def compose(dur, cut_times):
    drums, music, bassbus, send = Bus(dur), Bus(dur), Bus(dur), Bus(dur)
    kicks = []
    nbars = int(np.ceil(dur / BAR))
    for bar in range(nbars):
        t0 = bar * BAR
        pad_notes, root, arp = A.PROG[bar % 4]
        mel = (A.MELODY if bar % 2 == 0 else A.MELODY_B)[bar % 4]
        s0 = sec(t0)

        # pad (always, except gap / end handled separately)
        bright = {'break': 1000, 'break2': 1200, 'deep': 1100, 'suck': 900}.get(s0, 1900)
        L, R = A.pad_chord(pad_notes, BAR + 0.5, bright, seed=bar)
        g = 0.75 if s0 in ('break', 'break2', 'suck') else 0.5
        if s0 == 'end':
            L, R = A.pad_chord([53, 57, 60, 64, 69], 3.5, 1500, seed=77)
            g = 0.9
        music.add(t0, (L, R), g)

        for step in range(16):
            t = t0 + step * STEP
            s = sec(t)
            # ---- drums
            if s in DRUMS:
                if step % 4 == 0:
                    drums.add(t, A.kick(vel(1, 0.04)), 0.95); kicks.append(t)
                if step in (4, 12):
                    c = A.clap(vel(1, 0.08)); drums.add(hum(t, 2), c, 0.55); send.add(t, c, 0.35)
                if step % 4 == 2:
                    drums.add(hum(t), A.hat(vel(0.9), open_=(s in ('drop', 'final'))), 0.5, 0.25)
                elif step % 2 == 1:
                    drums.add(hum(t), A.hat(vel(0.55, 0.25)), 0.32, 0.3)
                drums.add(hum(t, 4), A.shaker(vel(0.7 if step % 2 else 1.0, 0.25)), 0.38, -0.35)
                if s == 'hook' and step in (7, 15):  # ghost kick push in the hook
                    drums.add(t, A.kick(0.55), 0.6); kicks.append(t)
            if s == 'stats' and step % 8 == 0:
                drums.add(t, A.kick(0.9), 0.85); kicks.append(t)
            # ---- bass
            if s in BASS and step in (0, 3, 6, 8, 11, 14):
                off = {0: 0, 3: 0, 6: 12, 8: 0, 11: 0, 14: 7}[step]
                d = 0.4 if step in (0, 8) else 0.2
                if s == 'stats' and step not in (0, 8):
                    continue
                bassbus.add(t, A.bass(midi(root + off), vel(1, 0.06), d), 0.85)
                if step in (0, 8) and s in ('drop', 'final'):
                    bassbus.add(t, sub808(midi(root - 12 if root > 40 else root), 0.5), 0.5)
            # ---- marimba lead
            if s in LEAD:
                for st, n in mel:
                    if st == step:
                        x = A.marimba(midi(n), vel(1))
                        g2 = 0.34 if s != 'deep' else 0.28
                        music.add(hum(t), x, g2, 0.15); send.add(t, x, g2 * 0.5, 0.15)
            # ---- plucks (8ths)
            if s in PLUCK and step % 2 == 0:
                order = [0, 2, 1, 3, 2, 0, 3, 1]
                n = arp[order[step // 2]]
                x = A.pluck(midi(n), vel(0.9, 0.15), 0.6, 0.9)
                gp = {'hook': 0.3, 'drop': 0.2, 'groove': 0.27, 'deep': 0.22, 'final': 0.2}[s]
                pan = -0.45 if (step // 2) % 2 else 0.45
                music.add(hum(t, 4), x, gp, pan); send.add(t, x, gp * 0.4, pan)
            # ---- 16th sparkle arp in groove / deep
            if s in ('groove', 'deep'):
                n = arp[(step * 3) % 4] + 12
                x = A.pluck(midi(n), vel(0.6, 0.2), 0.3, 2.0)
                music.add(hum(t, 2), x, 0.1 if s == 'groove' else 0.12, 0.6 if step % 2 else -0.6)
            # ---- break2 felt keys
            if s == 'break2' and step in (0, 6, 10):
                for k, n in enumerate(pad_notes if step == 0 else [arp[(step // 2) % 4]]):
                    x = A.keys(midi(n + 12), vel(0.8 if step == 0 else 0.55))
                    music.add(hum(t + k * 0.05, 6), x, 0.3, -0.3 + 0.2 * k); send.add(t, x, 0.35)
    # chord stabs on every hook cut + stat slam
    for ct in cut_times:
        if ct < 4.0 or 42.0 <= ct < 46.0:
            pn, _, _ = A.PROG[int(ct // BAR) % 4]
            x = stab([n + 12 for n in pn], 0.45)
            music.add(ct, x, 1.0); send.add(ct, x, 0.4)
    # final chord
    for i, n in enumerate([65, 69, 72, 77]):
        send.add(58.0 + i * 0.03, A.marimba(midi(n), 0.5, 2.5), 0.9, (i - 1.5) * 0.3)
    bassbus.add(58.0, A.bass(midi(41), 1, 1.6), 0.9)
    send.add(58.0, A.bell(midi(84), 0.5, 2.5), 0.5)
    # risers / reverse swells
    for (t_end, d, gg) in [(5.25, 1.25, 0.45), (15.0, 0.9, 0.22), (27.5, 0.9, 0.22), (42.0, 1.0, 0.28), (50.95, 1.6, 0.42)]:
        music.add(t_end - d, A.riser(d), gg)
        music.add(t_end - 0.8, A.rev_cymbal(0.8), gg)
    music.add(51.0, A.rev_cymbal(1.0) * 1.4, 0.5)
    music.add(51.0, A.riser(1.0), 0.35)

    # sidechain
    n = music.n
    duck = np.ones(n)
    for kt in kicks:
        i = int(kt * SR); m = min(int(0.3 * SR), n - i)
        if m <= 0: continue
        x = np.arange(m) / SR
        duck[i:i + m] = np.minimum(duck[i:i + m], 1 - 0.5 * np.exp(-x / 0.09))
    music.L *= duck; music.R *= duck
    bassbus.L *= 0.6 + 0.4 * duck; bassbus.R *= 0.6 + 0.4 * duck
    ir = A.make_ir(2.4, 5500, 3)
    wet = A.reverb(send.stereo(), ir, 0.55)
    mix = drums.stereo() * 0.9 + music.stereo() + lp(bassbus.L, 900)[None, :] * 0.95 + wet
    # hard silence in the gap before the drop (reverb tails included)
    a, b = int(5.27 * SR), int(5.5 * SR)
    ramp = int(0.02 * SR)
    mix[:, a:a + ramp] *= np.linspace(1, 0, ramp)
    mix[:, a + ramp:b] = 0
    return mix, ir


def sfx2(name, g):
    if name == 'slam':
        t = tt(0.7)
        f = 42 + 90 * np.exp(-t / 0.04)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18)
        crack = bp(rng.standard_normal(len(t)), 900, 6000) * np.exp(-t / 0.012)
        air = hp(rng.standard_normal(len(t)), 5000) * np.exp(-t / 0.08) * 0.15
        return np.tanh(1.6 * (body + 0.7 * crack)) * 0.7 + air, 0.35
    if name == 'comet':
        d = 1.0; t = tt(d)
        s = sweep_filter(rng.standard_normal(len(t)), 1800, 11000, 0.5)
        e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
        s = s * e * 0.6
        for i in range(7):
            j = int((0.1 + i * 0.11) * SR)
            b = A.bell(midi(88 + (i * 5) % 12 + 12 * (i % 2)), 0.25, 0.6)
            s[j:j + len(b)] += b[: len(s) - j]
        p = np.linspace(-0.8, 0.8, len(t))
        return (s * np.cos((p + 1) * np.pi / 4) * 1.41, s * np.sin((p + 1) * np.pi / 4) * 1.41), 0.4
    if name == 'scatter':
        t = tt(0.9)
        s = sweep_filter(rng.standard_normal(len(t)), 4000, 400, 1.0) * np.exp(-t / 0.18) * 0.8
        for i in range(8):
            j = int(rng.uniform(0.0, 0.35) * SR)
            p, _ = A.sfx('pop', 1)
            s[j:j + len(p)] += p[: len(s) - j] * rng.uniform(0.4, 0.8)
        return s * 0.8, 0.3
    if name == 'brush':
        d = 0.9; t = tt(d)
        s = sweep_filter(rng.standard_normal(len(t)), 180, 2600, 1.2)
        e = np.where(t < 0.25, (t / 0.25) ** 1.2, np.exp(-(t - 0.25) / 0.22))
        s = s * e + lp(rng.standard_normal(len(t)), 150) * e * 1.2
        p = np.linspace(-0.7, 0.7, len(t))
        return (s * np.cos((p + 1) * np.pi / 4) * 1.2, s * np.sin((p + 1) * np.pi / 4) * 1.2), 0.25
    if name == 'glint':
        t = tt(0.8)
        f = 2500 * (3.2 ** np.clip(t / 0.35, 0, 1))
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.clip(t / 0.4, 0, 1)) * 0.12
        b = A.bell(midi(100), 0.5, 0.8)
        j = int(0.3 * SR); s[j:j + len(b)] += b[: len(s) - j] * 0.6
        return s, 0.5
    if name == 'success':
        out = np.zeros(int(2.5 * SR))
        for i, n in enumerate([84, 88, 91, 96]):
            b = A.bell(midi(n), 0.75, 2.0); j = int(i * 0.07 * SR); out[j:j + len(b)] += b[: len(out) - j]
        t = tt(0.6); out[: len(t)] += np.sin(2 * np.pi * 65 * t) * np.exp(-t / 0.2) * 0.5
        return out * 0.45, 0.5
    if name == 'confetti':
        out = np.zeros(int(1.4 * SR))
        for i in range(36):
            j = int((rng.uniform(0, 1.0) ** 1.6) * SR)
            t = tt(0.03)
            c = bp(rng.standard_normal(len(t)), 3000, 10000) * np.exp(-t / 0.004) * rng.uniform(0.2, 0.7)
            out[j:j + len(c)] += c[: len(out) - j]
        return out * 0.6, 0.3
    if name == 'glass':
        t = tt(0.6)
        f0 = rng.uniform(2200, 2800)
        s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / tau) for r, a, tau in [(1, 1, 0.18), (2.32, 0.5, 0.1), (4.1, 0.25, 0.05)])
        s += hp(rng.standard_normal(len(t)), 4000) * np.exp(-t / 0.003) * 0.4
        sw, _ = A.sfx('whooshS', 1)
        L = np.zeros(int(0.6 * SR)); R = np.zeros_like(L)
        m = min(len(sw[0]), len(L)); L[:m] += sw[0][:m] * 0.35; R[:m] += sw[1][:m] * 0.35
        return (L + s * 0.2, R + s * 0.2), 0.4
    return A.sfx(name, g)


def main():
    cues_path, out = sys.argv[1], sys.argv[2]
    data = json.load(open(cues_path))
    dur = data['duration'] + 1.0
    cut_times = sorted({c['t'] for c in data['cues'] if c['name'] == 'slam'})
    mix, ir = compose(dur, cut_times)
    fx, fx_send = Bus(dur), Bus(dur)
    for c in data['cues']:
        s, send = sfx2(c['name'], c['gain'])
        t = c['t'] - (0.004 if c['name'] in ('click', 'tok', 'type') else 0)
        fx.add(t, s, c['gain'], c.get('pan', 0)); fx_send.add(t, s, c['gain'] * send, c.get('pan', 0))
    fxmix = fx.stereo() + A.reverb(fx_send.stereo(), ir, 0.6)
    full = mix * 0.6 + fxmix * 0.78
    full = np.stack([hp(full[0], 28), hp(full[1], 28)])
    end = int(data['duration'] * SR)
    fade = np.ones(full.shape[1]); fo = int(1.6 * SR)
    fade[end - fo:end] = np.linspace(1, 0, fo) ** 1.3; fade[end:] = 0
    full *= fade
    full = np.tanh(full / np.max(np.abs(full)) * 1.25) / np.tanh(1.25) * 0.89
    pcm = (full.T * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm[:end].tobytes())
    print('wrote', out, f'{end / SR:.2f}s')


if __name__ == '__main__':
    main()
