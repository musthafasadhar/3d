const AV={x:345,y:1465,d:390};
const BWIN=[[1.55,3.55],[5.78,8.55],[9.90,11.50],[12.90,15.30],[16.30,22.45],[24.40,27.70],[33.60,36.00]];
const PUNCH=[[3.55,.12,.45],[22.45,.10,.40],[27.70,.08,.40],[31.67,.10,.40],[36.00,.08,.40],[39.40,.08,.40],[41.60,.07,.40]];
const FOC={x:540,y:800};
function morphAt(t){for(const [a,b] of BWIN){if(t>=a-0.001&&t<=b+0.001){return Math.min(E.inout(prog(t,a,a+0.34)),1-E.inout(prog(t,b-0.34,b)))}}return 0}
function zoomAt(t){let z=1+0.03*t/46;for(const [t0,a,d] of PUNCH){const q=(t-t0)/d;if(q>=0&&q<=1)z+=a*Math.pow(1-q,2)}return z}
const spkEl=()=>document.getElementById('spk'),spkImg=()=>document.getElementById('spkimg'),ringEl=()=>document.getElementById('ring');
let NFR=1326;
function renderSpeaker(t){
  const m=morphAt(t),z=zoomAt(t);
  const s=lerp(z,AV.d/640,m),dfx=lerp(540,AV.d/2,m),dfy=lerp(800,AV.d*0.43,m);
  const x=lerp(0,AV.x,m),y=lerp(0,AV.y,m),w=lerp(1080,AV.d,m),h=lerp(1920,AV.d,m),r=lerp(0,AV.d/2,m);
  const c=spkEl(),im=spkImg();
  st(c,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',borderRadius:r+'px',boxShadow:m>0.02?`0 ${22*m}px ${60*m}px rgba(10,40,28,${.28*m})`:'none'});
  st(im,{width:1080*s+'px',height:1920*s+'px',left:(dfx-FOC.x*s)+'px',top:(dfy-FOC.y*s)+'px'});
  const fr=Math.max(0,Math.min(NFR-1,Math.floor(t*30+1e-6)));
  const src='src/'+String(fr+1).padStart(5,'0')+'.jpg'; if(im.dataset.src!==src){im.dataset.src=src;im.src=src}
  const rg=ringEl(),a=prog(m,0.35,1);
  if(a>0.01){st(rg,{display:'block',left:(x-10)+'px',top:(y-10)+'px',width:(w+20)+'px',height:(h+20)+'px',borderRadius:(r+10)+'px',border:'10px solid #E9C36B',opacity:a,boxShadow:`0 0 40px rgba(233,195,107,${.55*a}),inset 0 0 0 2px rgba(255,248,220,.55)`})}else rg.style.display='none';
  return m;
}
window.waitImg=()=>{const im=spkImg();return im.decode?im.decode().catch(()=>{}):Promise.resolve()};
