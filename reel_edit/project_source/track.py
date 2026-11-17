import cv2,numpy as np,json
cap=cv2.VideoCapture("matte/alpha.avi"); T=[]
while True:
    ok,f=cap.read()
    if not ok:break
    a=f[...,0]>128
    rows=np.where(a[:, 150:650].sum(1)>8)[0]   # ignore raised hands at edges
    top=int(rows[0]) if len(rows) else 300
    band=a[top:top+330, :]
    xs=np.where(band.any(0))[0]
    cols=band.sum(0); cx=float((cols*np.arange(720)).sum()/max(cols.sum(),1))
    T.append(dict(top=top,cx=cx,l=int(xs[0]) if len(xs) else 200,r=int(xs[-1]) if len(xs) else 520))
json.dump(T,open("matte/track.json","w"))
tops=[t['top'] for t in T]; cxs=[t['cx'] for t in T]
for i in range(0,len(T),30): print(i//30, T[i])
