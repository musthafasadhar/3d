import numpy as np, wave, subprocess, os, json, sys
sys.argv=[sys.argv[0]]
import timeline as TL
SR=48000
def rd(p):
    w=wave.open(p); x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
    return x.reshape(-1,w.getnchannels())
def wr(p,x):
    w=wave.open(p,"wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((np.clip(x,-1,1)*32767).astype(np.int16).tobytes());w.close()
subprocess.run(["ffmpeg","-v","error","-y","-i","src/in.mp4","-vn","-af","aresample=48000:resampler=soxr","-ac","2","-c:a","pcm_s16le","src/voice48.wav"],check=True)
voice=rd("src/voice48.wav"); n=len(voice)
BUS=0.5
os.makedirs("audio",exist_ok=True)
allsfx=np.zeros((n,2),np.float32); cues=[]
for e in TL.ELEMENTS:
    st=np.zeros((n,2),np.float32)
    for t,name,g in e["sfx"]:
        s=rd(f"sfx/{name}.wav")*g*BUS; i=int(t*SR); L=min(len(s),n-i)
        if L>0: st[i:i+L]+=s[:L]
        cues.append((round(t,2),name,e["name"]))
    if e["sfx"]: wr(f"audio/{e['name']}.wav",st)
    allsfx+=st
wr("audio/ALL_SFX_stem.wav",allsfx)
mix=voice+allsfx
pk=np.abs(mix).max(); print("voice peak",np.abs(voice).max(),"mix peak",pk)
wr("audio/final_mix_prelimit.wav",mix)
for c in sorted(cues): print(c)
# --- SFX-only ducking: voice is never altered
B=240  # 5ms blocks
nb=n//B+1
pad=lambda x: np.pad(np.abs(x).max(1),(0,nb*B-n)).reshape(nb,B).max(1)
vb,sb=pad(voice),pad(allsfx)
g=np.clip((0.985-vb)/np.maximum(sb,1e-6),0.05,1.0)
from scipy.ndimage import minimum_filter1d, uniform_filter1d
g=uniform_filter1d(minimum_filter1d(g,9),5)
gs=np.repeat(g,B)[:n][:,None]
mix=voice+allsfx*gs
over=np.abs(mix)>0.995; print("samples still over:",int(over.sum()))
mix=np.where(np.abs(voice)>0.985, voice, np.clip(mix,-0.999,0.999))
wr("audio/final_mix.wav",mix)
print("final peak",np.abs(mix).max())
