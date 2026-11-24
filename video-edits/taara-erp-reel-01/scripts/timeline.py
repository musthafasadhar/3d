"""Edit decision list for the Taara ERP reel.

All speech timings below are in SOURCE seconds (from the word-level transcript).
This script trims the silent gaps, remaps every event to OUTPUT time, and writes
timeline.json, which drives both the overlay renderer (HTML) and the compositor.
"""
import json, math, sys

FPS = 30
SRC_FRAMES = 1176
HOLD = 42  # extra frames after the source ends (end card hold)

# (source_in, source_out, framing)  -- cuts happen only in silences
SEGMENTS = [
    (0.20, 5.02, "hook"),
    (5.32, 11.37, "tight"),
    (11.61, 15.75, "wide"),
    (15.95, 17.99, "tight"),
    (18.20, 18.73, "wide"),
    (18.90, 25.29, "broll"),
    (25.64, 30.68, "wide_punch"),
    (30.93, 33.71, "tight"),
    (33.93, 35.86, "wide"),
    (36.11, 39.20, "end"),
]

seg_frames = []
o = 0
for (a, b, kind) in SEGMENTS:
    fa, fb = round(a * FPS), min(round(b * FPS), SRC_FRAMES)
    seg_frames.append((fa, fb, kind, o))
    o += fb - fa
N_SPEECH = o
N = N_SPEECH + HOLD


def M(t):
    """source seconds -> output seconds (times inside a removed gap snap to the next segment)."""
    f = t * FPS
    for fa, fb, kind, oo in seg_frames:
        if f < fa:
            return oo / FPS
        if f < fb:
            return (oo + f - fa) / FPS
    return N_SPEECH / FPS


def ease_out_cubic(x):
    x = min(max(x, 0), 1); return 1 - (1 - x) ** 3


def ease_in_out_cubic(x):
    x = min(max(x, 0), 1); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2


BROLL_IN, BROLL_OUT = M(18.90), M(24.00)
END_IN = M(37.27)
END_DUR = 0.6

frames = []
for i in range(N):
    t = i / FPS
    # which segment
    src = SRC_FRAMES - 1
    kind = "end"; tau = 0
    for fa, fb, k, oo in seg_frames:
        if oo <= i < oo + (fb - fa):
            src = fa + (i - oo); kind = k; tau = (i - oo) / FPS
            break
    else:
        kind = "end"; tau = (i - seg_frames[-1][3]) / FPS
    # framing (zoom anchored on the face)
    if kind == "hook":
        z = 1.12 - 0.12 * ease_out_cubic(tau / 0.55) + 0.008 * max(0, tau - 0.55)
    elif kind == "tight":
        z = 1.16 + 0.006 * tau
    elif kind == "wide":
        z = 1.0 + 0.008 * tau
    elif kind == "broll":
        tb = t - BROLL_OUT
        z = 1.12 + 0.006 * max(tb, 0) if tb > -0.4 else 1.03
    elif kind == "wide_punch":
        tp = t - M(28.55)
        z = 1.0 + 0.004 * tau + 0.13 * ease_out_cubic(tp / 0.35) if tp > 0 else 1.0 + 0.004 * tau
    else:  # end
        z = 1.12 - 0.12 * ease_in_out_cubic((t - END_IN) / END_DUR)
    card = None
    if t >= END_IN:
        p = ease_in_out_cubic((t - END_IN) / END_DUR)
        sc = 1 - (1 - 0.44) * p
        cx = 540
        cy = 960 + (1035 - 960) * p
        rad = 46 * p
        op = 1.0
        if i >= N_SPEECH:  # after speech ends: hold her smile (freeze) with a gentle drift
            sc = sc * (1 + 0.025 * ease_in_out_cubic((i - N_SPEECH) / HOLD))
        card = [cx, cy, sc, rad, op]
    broll = BROLL_IN <= t < BROLL_OUT + 0.30
    # motion-blur samples for fast-moving graphic frames
    tb_in = t - BROLL_IN
    blur = 1
    if broll and (0.2 < tb_in < 3.3):
        blur = 8 if 0.7 < tb_in < 2.4 else 5
    if END_IN - 0.02 <= t <= END_IN + END_DUR:
        blur = 3
    frames.append(dict(i=i, t=round(t, 4), src=int(src), kind=kind, zoom=round(z, 5),
                       card=card, broll=broll, blur=blur))

# ---------------------------------------------------------------- captions
# word lists: [text, source_time]. lead = small white line, big = gradient keyword, sub = small trailing line
def W(*pairs):
    return [[w, round(M(s), 3)] for (w, s) in pairs]

caps = [
    # hook: lead at chest, giant "5 MINUTES" behind the head
    dict(id="hook_lead", start=M(0.20), end=M(2.75), y=1250,
         lead=W(("Principal", 0.22), ("walks", 0.45), ("in…", 0.70)), big=[], sub=[]),
    dict(id="hook_behind", start=M(1.10), end=M(5.02) - 0.01, behind=True, y=488,
         big=W(("5", 1.16), ("MINUTES", 1.70))),
    dict(id="perf", start=M(2.80), end=M(5.02) - 0.01, y=1250,
         lead=W(("&", 2.82), ("knows", 2.90), ("the", 3.0), ("entire", 3.05), ("institute's", 3.14)),
         big=W(("Performance", 3.52)), sub=[]),
    # S2: feature pills (handled as their own element)
    dict(id="basic", start=M(11.62), end=M(15.75) - 0.01, y=1270,
         lead=W(("for", 11.80), ("basic", 12.0), ("info,", 12.4), ("you", 13.32), ("call", 13.6)),
         big=W(("Departments", 13.88)), sub=W(("one", 14.3), ("by", 14.45), ("one", 14.6))),
    dict(id="reports", start=M(15.95), end=M(17.99) - 0.01, y=1250,
         lead=W(("and", 15.95), ("ask", 16.0), ("for", 16.05)),
         big=W(("Reports", 16.10)), sub=W(("not", 17.12), ("anymore.", 17.28)), strike=M(16.92)),
    dict(id="easily", start=BROLL_OUT + 0.15, end=M(25.29) - 0.01, y=1250,
         lead=W(("see", 24.20), ("it", 24.30), ("all,", 24.40)), big=W(("Easily", 24.55)), sub=[]),
    dict(id="vis", start=M(25.64), end=M(28.10), y=1250,
         lead=W(("management", 25.84), ("gets", 26.50), ("clear", 26.74)),
         big=W(("Visibility", 26.96)), sub=[], star=M(27.1)),
    dict(id="dec", start=M(28.12), end=M(30.68) - 0.01, y=1300,
         lead=W(("and", 28.12), ("takes", 28.40)), big=W(("Decisions", 28.62)),
         sub=W(("—", 28.95), ("fast.", 29.0))),
    dict(id="data", start=M(30.93), end=M(33.71) - 0.01, y=1250,
         lead=W(("a", 31.0), ("principal's", 31.05), ("job", 31.76), ("isn't", 31.9), ("collecting", 32.0)),
         big=W(("Data", 32.20)), sub=[], strike=M(33.25)),
    dict(id="smart", start=M(33.93), end=M(35.86) - 0.01, y=1250,
         lead=W(("it's", 33.95), ("making", 34.0), ("decisions", 34.10)),
         big=W(("Smartly", 34.60)), sub=[], star=M(34.75)),
    dict(id="choose", start=M(36.11), end=END_IN + 0.10, y=1250,
         lead=W(("So,", 36.14), ("choose", 36.30)), big=W(("Taara", 36.64), ("ERP", 36.82)), sub=[]),
]

pills = dict(start=M(5.32), end=M(11.37) - 0.01, y=1095, items=[
    ["users", "Students present today", round(M(5.74), 3)],
    ["rupee", "Fees collection", round(M(7.06), 3)],
    ["chart", "Academic performance", round(M(8.12), 3)],
    ["cap", "Admission status", round(M(9.32), 3)],
    ["chat", "Parents' concerns", round(M(10.38), 3)],
])

broll = dict(t_in=round(BROLL_IN, 4), t_out=round(BROLL_OUT, 4),
             tag=round(M(19.10), 3), title1=round(M(21.80), 3), title2=round(M(23.30), 3))
endcard = dict(t_in=round(END_IN, 4), dur=END_DUR, line1=round(M(37.14), 3), line2=round(M(38.16), 3),
               speech_end=round(N_SPEECH / FPS, 4))

out = dict(fps=FPS, n=N, n_speech=N_SPEECH, frames=frames, caps=caps, pills=pills, broll=broll, endcard=endcard,
           segments=[dict(src_in=fa, src_out=fb, kind=k, out_in=oo) for fa, fb, k, oo in seg_frames],
           sfx=[round(BROLL_IN, 3), round(END_IN, 3)])
json.dump(out, open(sys.argv[1], "w"))
print("output frames", N, "=", round(N / FPS, 2), "s ; broll", round(BROLL_IN, 2), "-", round(BROLL_OUT, 2),
      "; end card", round(END_IN, 2))
for s in out["segments"]:
    print(s)
