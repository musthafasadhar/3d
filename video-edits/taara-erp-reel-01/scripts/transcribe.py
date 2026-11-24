import sys, json, wave, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8", cpu_threads=4)
w=wave.open(sys.argv[1]); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
segs, info = m.transcribe(a, task="transcribe", language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False, vad_filter=False,
    initial_prompt="Tenglish school ERP reel: principal, institute, 5 minutes, fees collection, academic performance, admission status, parents concern, reports, Taara dashboard, single view, management, clear visibility, decisions, smart.")
out=[]
for s in segs:
    for x in s.words: out.append({"w":x.word.strip(),"s":round(x.start,2),"e":round(x.end,2),"p":round(x.probability,2)})
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
json.dump(out, open(sys.argv[2],"w"), indent=0)
print(" ".join(f"{o['w']}@{o['s']}" for o in out))
