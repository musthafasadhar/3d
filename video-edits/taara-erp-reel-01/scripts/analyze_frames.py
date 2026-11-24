import cv2, numpy as np, glob, sys, json
d = sys.argv[1]
files = sorted(glob.glob(d + "/f*.jpg"))
prev=None; rows=[]
for i,f in enumerate(files):
    im = cv2.imread(f); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hist = cv2.calcHist([hsv],[0,1],None,[30,32],[0,180,0,256]); cv2.normalize(hist,hist)
    diff = 0; hd = 0; flow = 0
    if prev is not None:
        diff = float(np.mean(np.abs(g-prev[0])))
        hd = float(cv2.compareHist(prev[1],hist,cv2.HISTCMP_BHATTACHARYYA))
    rows.append(dict(i=i+1,t=round(i/30,3),luma=round(float(g.mean()),1),sat=round(float(hsv[...,1].mean()),1),diff=round(diff,2),hd=round(hd,3)))
    prev=(g,hist)
cuts=[r for r in rows if r['hd']>0.35 and r['diff']>18]
print(d.split('/')[-1], "frames", len(rows))
print("cuts (frame, t, histdist, diff):", [(r['i'],r['t'],r['hd'],r['diff']) for r in cuts])
# motion summary per second
for s in range(0, len(rows)//30+1):
    seg=rows[s*30:(s+1)*30]
    if not seg: continue
    print(f"  {s:3d}s luma={np.mean([r['luma'] for r in seg]):5.1f} sat={np.mean([r['sat'] for r in seg]):5.1f} motion={np.mean([r['diff'] for r in seg]):5.2f} maxhd={max(r['hd'] for r in seg):.2f}")
json.dump(rows, open(d+"/metrics.json","w"))
