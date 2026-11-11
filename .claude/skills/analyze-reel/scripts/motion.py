import sys, glob, numpy as np
from PIL import Image
d, cuts = sys.argv[1], [0]+[float(x) for x in sys.argv[2].split()]
fs = sorted(glob.glob(d+"/*.jpg"))
prev=None; diffs=[]
for f in fs:
    a=np.asarray(Image.open(f).convert("L"),dtype=np.float32)
    diffs.append(0 if prev is None else np.abs(a-prev).mean()); prev=a
diffs=np.array(diffs); n=len(fs)
b=[int(round(c*30)) for c in cuts]+[n]
print(f"{d}: {n} frames analysed")
for i in range(len(b)-1):
    s,e=b[i],b[i+1]; seg=diffs[s+1:e] if e-s>1 else diffs[s:e]
    print(f" shot {i+1:2d}  f{s:04d}-f{e-1:04d}  {s/30:5.2f}s-{e/30:5.2f}s  len {(e-s)/30:4.2f}s  motion mean {seg.mean():5.2f} max {seg.max():5.2f}")
