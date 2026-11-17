import onnxruntime as ort, numpy as np, cv2, sys, time
model=sys.argv[1]; out=sys.argv[2]; dsr=float(sys.argv[3]); lim=int(sys.argv[4]) if len(sys.argv)>4 else 10**9
so=ort.SessionOptions(); so.intra_op_num_threads=4
s=ort.InferenceSession(model,so,providers=["CPUExecutionProvider"])
cap=cv2.VideoCapture("src/in.mp4")
rec=[np.zeros([1,1,1,1],np.float32)]*4; d=np.array([dsr],np.float32)
W,H=720,1280
vw=cv2.VideoWriter(out,cv2.VideoWriter_fourcc(*"FFV1"),30,(W,H),False)
i=0;t=time.time()
while i<lim:
    ok,f=cap.read()
    if not ok: break
    x=cv2.cvtColor(f,cv2.COLOR_BGR2RGB).astype(np.float32).transpose(2,0,1)[None]/255
    fgr,pha,*rec=s.run([],{"src":x,"r1i":rec[0],"r2i":rec[1],"r3i":rec[2],"r4i":rec[3],"downsample_ratio":d})
    a=(pha[0,0]*255).clip(0,255).astype(np.uint8)
    vw.write(a); i+=1
    if i%100==0: print(i,time.time()-t,flush=True)
vw.release(); print("done",i,time.time()-t)
