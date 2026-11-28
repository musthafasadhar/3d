import sys, json, subprocess, numpy as np
from faster_whisper import WhisperModel
src, out, model, lang = sys.argv[1:5]
aud=np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",src,"-af","highpass=f=80,loudnorm=I=-16","-ac","1","-ar","16000","-f","f32le","-"],capture_output=True).stdout,np.float32)
m = WhisperModel(model, device="cpu", compute_type="int8")
kw=dict(task=('translate' if lang=='tr' else 'transcribe'), word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
if lang not in ('auto','tr'): kw['language']=lang
if lang=='tr': kw['language']='te'
segs, info = m.transcribe(aud, **kw)
o=dict(lang=info.language, segs=[])
for s in segs:
    o['segs'].append(dict(start=s.start,end=s.end,text=s.text,words=[dict(w=w.word,s=round(w.start,2),e=round(w.end,2),p=round(w.probability,2)) for w in (s.words or [])]))
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text}", flush=True)
json.dump(o, open(out,'w'), indent=1, ensure_ascii=False)
