import cv2, numpy as np, sys, json
path, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS)
prev=None; prevh=None; rows=[]
i=0
while True:
    ok, f = cap.read()
    if not ok: break
    small = cv2.resize(f, (90,160)); g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv],[0,1],None,[16,8],[0,180,0,256]); h=cv2.normalize(h,h).flatten()
    cut = 0 if prevh is None else float(cv2.compareHist(prevh,h,cv2.HISTCMP_BHATTACHARYYA))
    mot = 0 if prev is None else float(np.mean(np.abs(g-prev)))
    rows.append(dict(f=i,t=round(i/fps,3),bright=round(float(g.mean()),1),sat=round(float(hsv[...,1].mean()),1),motion=round(mot,2),cut=round(cut,3)))
    prev=g; prevh=h; i+=1
json.dump(dict(fps=fps,n=i,rows=rows),open(out,'w'))
cuts=[r for r in rows if r['cut']>0.35]
print(path.split('/')[-1], 'frames',i,'fps',round(fps,2),'cuts(>0.35):',[(r['f'],r['t'],r['cut']) for r in cuts])
m=np.array([r['motion'] for r in rows]); print('  motion mean %.2f max %.2f  bright mean %.1f'%(m.mean(),m.max(),np.mean([r['bright'] for r in rows])))
