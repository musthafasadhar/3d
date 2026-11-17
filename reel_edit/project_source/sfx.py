import numpy as np, wave
SR=48000
rng=np.random.default_rng(7)
def save(n,x,st=True):
    x=x/ (np.abs(x).max()+1e-9)*0.89
    if st and x.ndim==1: x=np.stack([x,x],1)
    w=wave.open(f"sfx/{n}.wav","wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((x*32767).astype(np.int16).tobytes());w.close()
def t(d): return np.arange(int(SR*d))/SR
def onepole_lp(x,fc):
    # time-varying one pole LP, fc array or scalar
    fc=np.broadcast_to(np.asarray(fc,float),x.shape)
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0.0
    for i in range(len(x)): s=(1-a[i])*x[i]+a[i]*s; y[i]=s
    return y
def bp(x,fc,q=1.0):
    lo=onepole_lp(x,fc*(1+0.5/q)); lo2=onepole_lp(lo,fc*(1+0.5/q))
    hi=x-onepole_lp(x,fc/(1+0.5/q))
    return onepole_lp(hi,fc*(1+0.5/q))
def env(n,a,r,shape=2.0):
    e=np.ones(n); ai=int(a*SR); ri=int(r*SR)
    e[:ai]=np.linspace(0,1,ai)**shape if ai else 1
    if ri: e[-ri:]*=np.linspace(1,0,ri)**shape
    return e
def pan(x,p):  # p array -1..1
    l=np.sqrt((1-p)/2); r=np.sqrt((1+p)/2); return np.stack([x*l,x*r],1)
# WHOOSH (airy sweep up then down)
def whoosh(d=0.55,f0=400,f1=4000,name="whoosh"):
    n=int(SR*d); x=rng.standard_normal(n); tt=np.linspace(0,1,n)
    fc=f0+(f1-f0)*np.sin(np.pi*tt)**1.5
    y=bp(x,fc,0.8)*np.sin(np.pi*tt)**2.2
    y+=0.3*onepole_lp(x,fc*0.3)*np.sin(np.pi*tt)**3
    save(name,pan(y,np.linspace(-0.7,0.7,n)))
whoosh(); whoosh(0.35,800,6000,"whoosh_fast"); whoosh(0.9,200,2500,"whoosh_long")
# SUB BOOM / impact
n=int(SR*1.6); tt=t(1.6); f=45+120*np.exp(-tt*9)
ph=2*np.pi*np.cumsum(f)/SR; y=np.sin(ph)*np.exp(-tt*2.6)
y+=0.6*onepole_lp(rng.standard_normal(n),900)*np.exp(-tt*18)
y=np.tanh(2.2*y); save("impact_boom",y)
# HIT punch (short)
tt=t(0.45); f=70+260*np.exp(-tt*30); y=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)
y+=0.5*bp(rng.standard_normal(len(tt)),2500,1)*np.exp(-tt*40); save("punch_hit",np.tanh(2*y))
# POP (bubbly text pop)
tt=t(0.12); f=600+900*np.exp(-tt*60); y=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*45)*env(len(tt),0.002,0.02,1)
save("pop",y)
# CLICK / tick
tt=t(0.04); y=rng.standard_normal(len(tt))*np.exp(-tt*300)+0.5*np.sin(2*np.pi*3000*tt)*np.exp(-tt*200); save("click",bp(y,3500,1))
# DING / notification (bell-ish)
tt=t(1.2); y=sum(a*np.sin(2*np.pi*f*tt)*np.exp(-tt*k) for f,a,k in [(1318,1,3.5),(2637,0.4,6),(3951,0.2,9),(1975,0.25,5)])
y*=env(len(tt),0.003,0.05,1); save("ding",y)
# RISER (noise + rising tone, 1.2s)
d=1.2; n=int(SR*d); tt=np.linspace(0,1,n); fc=300+6000*tt**2
y=bp(rng.standard_normal(n),fc,1.2)*tt**2.5; y+=0.25*np.sin(2*np.pi*np.cumsum(200+1200*tt**2)/SR)*tt**3
save("riser",y)
# SWIPE / short swish
whoosh(0.22,1500,9000,"swish")
# GLITCH (bitcrushed bursts)
d=0.35; n=int(SR*d); y=np.zeros(n)
for k in range(6):
    s=rng.integers(0,n-3000); L=rng.integers(800,3000); seg=np.sign(np.sin(2*np.pi*rng.uniform(200,1500)*t(L/SR)))*rng.uniform(.4,1)
    y[s:s+L]+=seg
y=np.round(y*4)/4; save("glitch",y*env(n,0.001,0.05,1))
# CAMERA SHUTTER
tt=t(0.25); x=rng.standard_normal(len(tt)); y=bp(x,4000,1)*(np.exp(-tt*80)+0.7*np.exp(-np.maximum(tt-0.09,0)*90)*(tt>0.09)); save("shutter",y)
# TYPE (keyboard taps) 1.0s
n=int(SR*1.0); y=np.zeros(n)
for s in np.arange(0.0,0.95,0.085)+rng.uniform(-.015,.015,12):
    i=int(max(s,0)*SR); L=int(0.03*SR); y[i:i+L]+=bp(rng.standard_normal(L),rng.uniform(2500,4500),1)*np.exp(-np.arange(L)/SR*180)
save("typing",y)
# SPARKLE shimmer
tt=t(0.9); y=np.zeros(len(tt))
for k in range(14):
    s=rng.uniform(0,0.6); f=rng.uniform(3000,7000); m=tt>s
    y[m]+=np.sin(2*np.pi*f*(tt[m]-s))*np.exp(-(tt[m]-s)*14)*rng.uniform(.3,1)
save("sparkle",y)
# REVERSE swell (reverse cymbal-ish)
tt=t(0.8); y=bp(rng.standard_normal(len(tt)),6000,0.7)*np.exp(-tt*5); y=y[::-1]; save("reverse_swell",y)
print("ok")
