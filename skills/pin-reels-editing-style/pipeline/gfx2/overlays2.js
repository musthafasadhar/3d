const OVR=()=>document.getElementById('over');
function mkOv(t0,t1,build){const root=mk(OVR(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');const api=build(root)||{};return {t0,t1,root,update(t){api.update&&api.update(t-t0,t1-t0)}}}
const pillIc=(icn,label,sz=34)=>`<div class="ibox" style="width:${sz+14}px;height:${sz+14}px;background:#E4EFE5">${ic(icn,sz*0.62,'#1E7A55',2.3)}</div>${label}`;
function logoBadge(){return mkOv(0.0,1.5,root=>{const p=mk(root,'pill','left:540px;top:112px;transform:translateX(-50%);padding:14px 30px;border-radius:22px',`<img src="logo_taara.png" style="height:62px;display:block">`);
  return {update(lt,d){const a=E.out4(prog(lt,.12,.45)),b=1-prog(lt,d-.28,d);st(p,{opacity:a*b,transform:`translateX(-50%) translateY(${(1-a)*-24}px) scale(${lerp(.92,1,a)})`})}}})}
function timeline(t0,t1,aIc,aLab,bIc,bLab){return mkOv(t0,t1,root=>{
  const trk=mk(root,'','position:absolute;left:130px;top:296px;width:820px;height:8px;border-radius:4px;background:repeating-linear-gradient(90deg,rgba(255,255,255,.7) 0 6px,transparent 6px 20px);opacity:.9;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))');
  const fill=mk(root,'','position:absolute;left:130px;top:296px;height:8px;border-radius:4px;background:#F2D27A;filter:drop-shadow(0 2px 6px rgba(0,0,0,.35));width:0');
  const knob=mk(root,'','position:absolute;top:286px;width:28px;height:28px;border-radius:50%;background:#F2D27A;box-shadow:0 0 0 6px rgba(242,210,122,.35),0 4px 12px rgba(0,0,0,.35)');
  const A=mk(root,'pill','left:70px;top:350px;padding:12px 26px 12px 12px;font-size:28px',pillIc(aIc,aLab+' '));
  const B=mk(root,'pill','right:70px;top:350px;padding:12px 26px 12px 12px;font-size:28px',pillIc(bIc,bLab));
  return {update(lt,d){const a=E.back(prog(lt,0,.3),1.5),pr=E.inout(prog(lt,.25,d-.35)),out=1-prog(lt,d-.2,d);
    st(A,{opacity:clamp(a*3)*out,transform:`scale(${lerp(.85,1,a)})`});
    const bb=E.back(prog(lt,d-.55,d-.3),1.5);st(B,{opacity:clamp(bb*3)*out,transform:`scale(${lerp(.85,1,bb)})`});
    st(trk,{opacity:a*out});st(fill,{width:(820*pr)+'px',opacity:a*out});st(knob,{left:(130+820*pr-14)+'px',opacity:a*out})}}})}
function deptPills(){return mkOv(22.45,24.40,root=>{
  const P=[['building','Admissions office','left:70px;top:120px',0],['wallet','Accounts','right:70px;top:128px',1],['clip','Exam cell','left:150px;top:236px',2],['bus','Transport desk','right:120px;top:244px',3]];
  const es=P.map(([i,l,pos,n])=>mk(root,'pill',pos+';padding:11px 26px 11px 11px;font-size:27px',pillIc(i,l)));
  return {update(lt,d){es.forEach((e,i)=>{const a=E.back(prog(lt,.15+i*.12,.45+i*.12),1.6),out=1-prog(lt,d-.2,d);st(e,{opacity:clamp(a*3)*out,transform:`translateY(${Math.sin(lt*2.4+i*1.3)*4}px) scale(${lerp(.8,1,a)}) rotate(${(i%2?1:-1)*(1-a)*5}deg)`})})}}})}
function enterOnce(){return mkOv(27.80,31.40,root=>{
  const p=mk(root,'pill','left:540px;top:150px;transform:translateX(-50%);padding:14px 34px 14px 14px;font-size:32px',`<div class="ibox" style="width:50px;height:50px;background:#0F5B40">${ic('check',30,'#fff',3.4)}</div>Enter once`);
  return {update(lt,d){const a=E.back(prog(lt,.1,.4),1.6),out=1-prog(lt,d-.2,d);st(p,{opacity:clamp(a*3)*out,transform:`translateX(-50%) scale(${lerp(.85,1,a)})`})}}})}
function dimTitle(){return mkOv(35.95,38.25,root=>{
  const d=mk(root,'','position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse 360px 430px at 540px 790px,rgba(22,20,10,0) 55%,rgba(22,20,10,.52) 100%)');
  return {update(lt){d.style.opacity=prog(lt,0,.25)*(1-prog(lt,1.98,2.3))}}})}
function ctaPills(){return mkOv(41.60,44.10,root=>{
  const p=mk(root,'pill','left:540px;top:150px;transform:translateX(-50%);padding:14px 34px 14px 14px;font-size:32px','');
  return {update(lt,d){const sw=lt>=1.0;p.innerHTML=sw?`<div class="ibox" style="width:50px;height:50px;background:#0F5B40">${ic('check',30,'#fff',3.4)}</div>We’ll contact you`:`<div class="ibox" style="width:50px;height:50px;background:#E4EFE5">${ic('comment',28,'#1E7A55',2.3)}</div>Comment below`;
    const a=E.back(prog(lt,sw?1.0:.0,sw?1.3:.3),1.6),out=1-prog(lt,d-.2,d);st(p,{opacity:clamp(a*3)*out,transform:`translateX(-50%) scale(${lerp(.88,1,a)})`})}}})}
function creamWipe(){const el=mk(document.getElementById('fx'),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px;background:#F7F5EF');
  return {t0:43.78,t1:44.12,root:el,update(t){el.style.opacity=E.inout(prog(t,43.78,44.08))}}}
