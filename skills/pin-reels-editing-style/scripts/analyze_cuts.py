import sys, glob, json, numpy as np
from PIL import Image
d, fps = sys.argv[1], 12
files = sorted(glob.glob(d+'/*.jpg'))
prev=None; rows=[]
for i,f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((72,128))
    a = np.asarray(im).astype(float)
    g = a.mean(axis=2)
    diff = None if prev is None else float(np.abs(g-prev).mean())
    # frame-wide hist distance
    prev = g
    rows.append((i/fps, float(g.mean()), diff))
diffs = np.array([r[2] for r in rows[1:]])
thr = max(18, diffs.mean()+3*diffs.std())
cuts = [round(rows[i+1][0],2) for i,v in enumerate(diffs) if v>thr]
print(d, 'frames', len(files), 'diff mean %.2f p95 %.2f thr %.1f'%(diffs.mean(), np.percentile(diffs,95), thr))
print('cuts', cuts)
cl = [cuts[0]] + [b-a for a,b in zip(cuts,cuts[1:])] if cuts else []
print('shot lengths', [round(x,2) for x in cl], 'avg %.2f'%(np.mean(cl) if cl else 0))
print('brightness mean %.0f'%np.mean([r[1] for r in rows]))
# palette
px=[]
for f in files[::6]:
    px.append(np.asarray(Image.open(f).convert('RGB').resize((40,70))).reshape(-1,3))
px=np.concatenate(px)
q=(px//32)*32+16
vals,counts=np.unique(q,axis=0,return_counts=True)
o=np.argsort(-counts)[:10]
print('palette', [('#%02x%02x%02x'%tuple(vals[i]), round(counts[i]/len(q)*100,1)) for i in o])
