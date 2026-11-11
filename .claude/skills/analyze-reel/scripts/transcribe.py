import sys, numpy as np
from faster_whisper import WhisperModel
m = WhisperModel("base.en", device="cpu", compute_type="int8")
for p in sys.argv[1:]:
    a = np.fromfile(p, dtype=np.int16).astype(np.float32)/32768
    segs,_ = m.transcribe(a, word_timestamps=True)
    print("==", p)
    for s in segs:
        print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
