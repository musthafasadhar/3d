"""Audio: cut speech exactly like the picture, clean the voice, add two very soft whooshes, loudness -14 LUFS.
usage: python audio.py timeline.json source.mov out.wav [sfx.wav]
"""
import json, subprocess, sys, re

tl = json.load(open(sys.argv[1])); SRC = sys.argv[2]; OUT = sys.argv[3]
fps = tl["fps"]; hold = (tl["n"] - tl["n_speech"]) / fps
parts, labels = [], []
for k, s in enumerate(tl["segments"]):
    a, b = s["src_in"] / fps, s["src_out"] / fps
    d = b - a
    parts.append(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,aresample=48000,"
                 f"afade=t=in:d=0.012,afade=t=out:st={d - 0.012:.4f}:d=0.012[s{k}]")
    labels.append(f"[s{k}]")
voice = (";".join(parts) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=0:a=1,"
         "highpass=f=80,lowpass=f=15500,deesser=i=0.35,"
         "equalizer=f=250:t=q:w=1.2:g=-1.5,equalizer=f=3800:t=q:w=1.0:g=1.8,"
         "acompressor=threshold=-22dB:ratio=2.8:attack=6:release=120:makeup=2.5:knee=4,"
         f"apad=pad_dur={hold + 0.3:.3f}[voice]")
# synthesised sound design (sfx.py) sits ~10 dB under the voice
SFX = sys.argv[4] if len(sys.argv) > 4 else None
graph = voice + ";[voice]aformat=channel_layouts=stereo[v2]"
if SFX:
    graph += ";[1:a]aresample=48000,volume=0.32[sx];[v2][sx]amix=inputs=2:normalize=0:duration=first[mix]"
else:
    graph += ";[v2]anull[mix]"


def run(extra, out):
    return subprocess.run(["ffmpeg", "-hide_banner", "-y", "-i", SRC] + (["-i", SFX] if SFX else []) + ["-filter_complex", graph + extra, "-map", "[out]",
                           "-ar", "48000", "-t", f"{tl['n'] / fps:.4f}"] + out, capture_output=True, text=True)


r = run(";[mix]loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json[out]", ["-f", "null", "-"])
m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr)[-1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
      f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
r = run(f";[mix]{ln}[out]", ["-c:a", "pcm_s24le", OUT])
print(r.stderr[-400:] if r.returncode else "audio ok", m["input_i"], "->", -14)
