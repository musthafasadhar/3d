# Builds voice.wav + timeline.json for a reel from script.json.
# - one TTS clip per line (Edge neural voices, see tts.py), silence-trimmed
# - lines sequenced with short gaps (+ optional pre/post beats)
# - whole track time-stretched (pitch preserved) to fit the target length
# - per-frame (30 fps) mouth envelope from the voice RMS
# Usage: python3 build_audio.py <script.json> <out_dir> [target_seconds | xSPEED]
import json, os, subprocess, sys, wave, re
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR, FPS, GAP = 48000, 30, 0.08


def sh(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def read_wav(p):
    with wave.open(p) as w:
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_wav(p, x):
    with wave.open(p, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())


def trim(x, thr=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0: return x
    a, b = max(0, idx[0] - int(pad * SR)), min(len(x), idx[-1] + int(pad * SR))
    return x[a:b]


def chunks(text, max_words=6):
    # split caption at pauses (…, ., ?, ,) then into <= max_words pieces
    parts = [p.strip() for p in re.split(r'(?<=[…\.\?,!])\s+', text) if p.strip()]
    out = []
    for p in parts:
        w = p.split()
        while len(w) > max_words:
            out.append(' '.join(w[:max_words])); w = w[max_words:]
        if w: out.append(' '.join(w))
    # merge tiny tails (1 word) into previous chunk when short enough
    merged = []
    for c in out:
        if merged and len(c.split()) == 1 and len(merged[-1].split()) < max_words and not re.search(r'[\?…]$', merged[-1]):
            merged[-1] += ' ' + c
        else:
            merged.append(c)
    return merged


def main():
    script_p, out_dir = sys.argv[1], sys.argv[2]
    # third arg: target length in seconds (e.g. 60) or a fixed speed (e.g. x1.3)
    arg = sys.argv[3] if len(sys.argv) > 3 else '60'
    fixed = float(arg[1:]) if arg.startswith('x') else None
    target = None if fixed else float(arg)
    S = json.load(open(script_p))
    os.makedirs(f'{out_dir}/clips', exist_ok=True)
    clips = []
    for i, L in enumerate(S['lines']):
        v = S['voices'][L['who']]
        mp3, wav = f'{out_dir}/clips/{i:02d}.mp3', f'{out_dir}/clips/{i:02d}.wav'
        if not os.path.exists(mp3):
            sh('python3', f'{HERE}/tts.py', v['voice'], v['rate'], v['pitch'], L['te'], mp3)
        sh('ffmpeg', '-y', '-i', mp3, '-ac', '1', '-ar', str(SR), wav)
        clips.append(trim(read_wav(wav)))

    # sequence
    parts, events, t = [], [], 0.0
    def silence(d):
        nonlocal t
        parts.append(np.zeros(int(d * SR), np.float32)); t += d
    for i, (L, x) in enumerate(zip(S['lines'], clips)):
        if L.get('pre'):
            events.append({'kind': 'beat', 'shot': L.get('preShot', L['shot']), 'start': t, 'end': t + L['pre'], 'line': i})
            silence(L['pre'])
        start = t
        parts.append(x); t += len(x) / SR
        events.append({'kind': 'line', 'line': i, 'start': start, 'end': t})
        if L.get('post'):
            events.append({'kind': 'beat', 'shot': L.get('postShot', L['shot']), 'start': t, 'end': t + L['post'], 'line': i})
            silence(L['post'])
        silence(GAP)
    voice = np.concatenate(parts)
    raw_len = len(voice) / SR
    end_card = S.get('endCard', 1.5)
    # fit: speech part must end at target - end_card
    factor = fixed if fixed else max(1.0, raw_len / (target - end_card))
    write_wav(f'{out_dir}/voice_raw.wav', voice)
    if factor > 1.0001:
        tempo = []
        f = factor
        while f > 2.0: tempo.append('atempo=2.0'); f /= 2.0
        tempo.append(f'atempo={f:.5f}')
        sh('ffmpeg', '-y', '-i', f'{out_dir}/voice_raw.wav', '-af', ','.join(tempo), '-ar', str(SR), f'{out_dir}/voice_fit.wav')
        voice = read_wav(f'{out_dir}/voice_fit.wav')
        for e in events: e['start'] /= factor; e['end'] /= factor
    total = len(voice) / SR + end_card
    voice = np.concatenate([voice, np.zeros(int((total * SR) - len(voice)), np.float32)])
    write_wav(f'{out_dir}/voice.wav', voice)

    # mouth envelope (per frame RMS, normalised per line)
    nF = int(round(total * FPS))
    hop = SR // FPS
    rms = np.array([np.sqrt(np.mean(voice[k * hop:(k + 1) * hop] ** 2) + 1e-9) for k in range(nF)])
    amp = np.zeros(nF)
    for e in events:
        if e['kind'] != 'line': continue
        a, b = int(e['start'] * FPS), min(nF, int(np.ceil(e['end'] * FPS)))
        seg = rms[a:b]
        if len(seg):
            amp[a:b] = np.clip(seg / (np.percentile(seg, 90) + 1e-6), 0, 1.2)
    amp = np.convolve(amp, [0.25, 0.5, 0.25], mode='same')  # soften jitter

    # captions (chunked, timed by characters)
    for e in events:
        if e['kind'] != 'line': continue
        cs = chunks(S['lines'][e['line']]['cap'])
        tot = sum(len(c) for c in cs)
        t0, dur = e['start'], e['end'] - e['start']
        e['captions'] = []
        for c in cs:
            d = dur * len(c) / tot
            e['captions'].append({'text': c, 'start': round(t0, 3), 'end': round(t0 + d, 3)}); t0 += d
    timeline = {
        'fps': FPS, 'frames': nF, 'duration': round(total, 3), 'speed': round(factor, 4), 'endCardStart': round(total - end_card, 3),
        'lines': S['lines'], 'events': [{**e, 'start': round(e['start'], 3), 'end': round(e['end'], 3)} for e in events],
        'amp': [round(float(v), 3) for v in amp],
    }
    json.dump(timeline, open(f'{out_dir}/timeline.json', 'w'), ensure_ascii=False)
    print(f'raw speech {raw_len:.2f}s -> speed x{factor:.3f} -> total {total:.2f}s ({nF} frames)')


if __name__ == '__main__':
    main()
