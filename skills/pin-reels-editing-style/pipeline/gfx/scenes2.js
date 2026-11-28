/* ---- B6: every department keeps its own copy ---- */
function sceneDupes(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:560px;width:0;height:0');
  const D=[['userplus','Admission',-232,-196,'Aarav Sharma','Grade 6'],['cap','Academics',232,-196,'A. Sharma','6'],['wallet','Accounts',-232,196,'Aarav S.','Class VI'],['bus','Transport',232,196,'Sharma, Aarav','Gr. 6']];
  const tiles=D.map(([i_,name,x,y,nm,cl],i)=>{
    const c=mk(g,'glass',`width:430px;height:350px;left:${x-215}px;top:${y-175}px;padding:28px 30px`);
    c.innerHTML=`<div style="display:flex;align-items:center;gap:16px">${chipBox(i_,54,17)}<div class="lbl" style="font-size:22px">${name}</div><div style="margin-left:auto;opacity:.85">${ic('db',40,'#FFD36E',2)}</div></div>
    <div class="rec" style="margin-top:30px;padding:20px 22px;border-radius:22px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 2px rgba(255,255,255,.14);display:flex;align-items:center;gap:18px">${avatar(72,'')}<div><div style="font-family:Inter;font-weight:750;font-size:33px;line-height:1.15;white-space:nowrap">${nm}</div><div class="sub" style="font-size:25px">${cl}</div></div></div>
    <div style="display:flex;gap:12px;margin-top:26px"><div style="height:22px;flex:1;border-radius:11px;background:rgba(255,255,255,.10)"></div><div style="height:22px;width:90px;border-radius:11px;background:rgba(255,255,255,.07)"></div></div>`;
    return {c,rec:c.querySelector('.rec')};});
  const neq=[[0,-196],[0,196],[-232,0],[232,0]].map(([x,y])=>mk(g,'',`position:absolute;left:${x-30}px;top:${y-30}px;width:60px;height:60px;border-radius:30px;background:#2a1a5e;border:2px solid rgba(255,138,61,.85);display:flex;align-items:center;justify-content:center;font-family:Unb;font-weight:700;font-size:30px;color:#FF9B45`,'≠'));
  const label=mk(root,'','position:absolute;left:0;width:1080px;top:1010px;text-align:center',`<span class="lbl" style="font-size:24px">One student · 4 copies</span>`);
  return {t0:17.75,t1:21.10,root,grain,update(lt){
    const d=3.35;
    st(g,{transform:`rotateX(${lerp(14,20,lt/d)}deg) rotateY(${lerp(14,-12,E.inout(lt/d))}deg) rotateZ(1.2deg) scale(${lerp(.92,1.0,lt/d)})`});
    tiles.forEach((o,i)=>{enter3d(o.c,E.out4(prog(lt,i*.14,i*.14+.5)),-720,i%2?22:-6);
      const flick=lt>1.5?(0.5+0.5*Math.sin(lt*9+i*1.7)):0; o.rec.style.boxShadow=`inset 0 0 0 2px rgba(255,${lerp(255,125,flick)|0},${lerp(255,70,flick)|0},${lerp(.14,.85,flick)})`;});
    neq.forEach((m,i)=>{const p=E.back(prog(lt,1.1+i*.1,1.4+i*.1));st(m,{opacity:clamp(p*3),transform:`translateZ(60px) scale(${p})`})});
    st(label,{opacity:E.out3(prog(lt,1.0,1.4))});
  }};
}

/* ---- B7: Tara reveal (whip) ---- */
function sceneReveal(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:640px;width:0;height:0');
  const star=mk(g,'','position:absolute;left:-130px;top:-445px;width:260px;height:260px;filter:drop-shadow(0 0 50px rgba(255,160,60,.65))',starSVG(260));
  const word=mk(g,'gtext','position:absolute;left:-520px;width:1040px;text-align:center;top:-150px;font-family:Unb;font-weight:800;font-size:210px;letter-spacing:-.02em;line-height:1;background-size:250% 100%,100% 100%;background-image:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.95) 50%,transparent 60%),var(--gold)','Tara');
  const erp=mk(g,'lbl','position:absolute;left:-300px;width:600px;text-align:center;top:92px;font-size:44px;letter-spacing:.5em;padding-left:.5em','ERP');
  const rings=[0,1].map(i=>mk(g,'',`position:absolute;left:-300px;top:-300px;width:600px;height:600px;border-radius:300px;border:3px solid rgba(255,200,120,.8)`));
  return {t0:21.10,t1:22.45,root,grain,update(lt){
    const p=E.out4(prog(lt,.0,.5));
    st(g,{transform:`scale(${lerp(2.1,1,E.out4(prog(lt,0,.45)))}) rotateX(${lerp(8,0,p)}deg)`});
    st(star,{opacity:clamp(p*3),transform:`rotateY(${lerp(-260,0,E.out4(prog(lt,0,.7)))}deg) scale(${lerp(.4,1,E.back(prog(lt,0,.5),1.4))})`});
    st(word,{opacity:clamp(prog(lt,.1,.3)),backgroundPosition:`${lerp(130,-30,prog(lt,.3,1.1))}% 0,0 0`,transform:`translateY(${(1-E.out4(prog(lt,.1,.5)))*40}px)`});
    st(erp,{opacity:E.out3(prog(lt,.35,.6))});
    rings.forEach((r,i)=>{const q=prog(lt,.05+i*.18,.75+i*.18);st(r,{opacity:(1-q)*.9*(q>0?1:0),transform:`scale(${.3+1.5*E.out3(q)})`})});
  }};
}

/* ---- B8: connected hub ---- */
function sceneHub(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:560px;width:0;height:0');
  const N=[['userplus','Admission',-300,-250],['cap','Academics',300,-250],['wallet','Accounts',-300,250],['bus','Transport',300,250]];
  const svg=mk(g,'','position:absolute;left:-540px;top:-560px;width:1080px;height:1120px');
  svg.innerHTML=`<svg width="1080" height="1120" viewBox="-540 -560 1080 1120" style="position:absolute;left:0;top:0;overflow:visible"><defs><linearGradient id="hl" x1="0" x2="1"><stop offset="0" stop-color="#FFD36E"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient></defs>${N.map(([,,x,y],i)=>`<line id="hl${i}" x1="0" y1="0" x2="${x}" y2="${y}" stroke="url(#hl)" stroke-width="7" stroke-linecap="round" stroke-dasharray="500" stroke-dashoffset="500" opacity=".95"/>`).join('')}${N.map((n,i)=>`<circle id="hp${i}" r="13" fill="#fff"/><circle id="hq${i}" r="13" fill="#fff"/>`).join('')}</svg>`;
  const lines=N.map((n,i)=>svg.querySelector('#hl'+i)),pa=N.map((n,i)=>svg.querySelector('#hp'+i)),pb=N.map((n,i)=>svg.querySelector('#hq'+i));
  const nodes=N.map(([i_,name,x,y])=>{const c=mk(g,'glass',`width:230px;height:230px;left:${x-115}px;top:${y-115}px;padding:28px;text-align:center;border-radius:40px`);c.innerHTML=`<div style="display:flex;justify-content:center">${chipBox(i_,84,26)}</div><div class="lbl" style="font-size:20px;margin-top:22px">${name}</div><div style="margin-top:12px;display:flex;justify-content:center">${ic('check',30,'#FFD36E',3.4)}</div>`;return c});
  const hub=mk(g,'','position:absolute;left:-170px;top:-170px;width:340px;height:340px;border-radius:170px;background:radial-gradient(circle at 35% 30%,#7C6BFF,#3a2bc4 60%,#1a1270);box-shadow:inset 0 3px 0 rgba(255,255,255,.4),0 0 90px 20px rgba(120,100,255,.55),0 0 0 6px rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center');
  hub.innerHTML=`<div style="font-family:Unb;font-weight:700;font-size:92px;color:#fff;letter-spacing:.02em;line-height:1">AS</div><div style="font-family:Inter;font-weight:700;font-size:28px;margin-top:10px;color:rgba(255,255,255,.85)">Aarav Sharma</div>`;
  const halo=mk(g,'','position:absolute;left:-230px;top:-230px;width:460px;height:460px;border-radius:230px;border:3px solid rgba(255,190,100,.55)');
  const label=mk(root,'','position:absolute;left:0;width:1080px;top:1010px;text-align:center',`<span class="lbl" style="font-size:24px">One student record</span>`);
  return {t0:24.40,t1:27.70,root,grain,update(lt){
    const d=3.3;
    st(g,{transform:`rotateX(${lerp(18,12,lt/d)}deg) rotateY(${lerp(-14,14,E.inout(lt/d))}deg) scale(${lerp(.9,1,E.out3(prog(lt,0,1)))})`});
    enter3d(hub,E.back(prog(lt,0,.5)),-300,40);
    nodes.forEach((c,i)=>enter3d(c,E.out4(prog(lt,.2+i*.1,.7+i*.1)),-500,10));
    lines.forEach((l,i)=>{const p=E.out3(prog(lt,.45+i*.1,1.0+i*.1));l.style.strokeDashoffset=500*(1-p);
      const x2=N[i][2],y2=N[i][3];const f=((lt*.85+i*.23)%1),f2=(1-((lt*.7+i*.31)%1));
      const on=prog(lt,1.0+i*.1,1.1+i*.1);
      pa[i].setAttribute('cx',x2*f);pa[i].setAttribute('cy',y2*f);pa[i].setAttribute('opacity',on*Math.sin(Math.PI*f));
      pb[i].setAttribute('cx',x2*f2);pb[i].setAttribute('cy',y2*f2);pb[i].setAttribute('opacity',on*Math.sin(Math.PI*f2)*.8);});
    const ph=(lt*.9)%1;st(halo,{opacity:(1-ph)*.7,transform:`scale(${1+.5*ph})`});
    st(label,{opacity:E.out3(prog(lt,.5,.9))});
  }};
}

/* ---- B9: one record everywhere ---- */
function sceneEverywhere(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:590px;width:0;height:0');
  const card=mk(g,'glass','width:380px;height:520px;left:-500px;top:-260px;padding:36px;text-align:center');
  card.innerHTML=`<div style="display:flex;justify-content:center;margin-top:18px">${avatar(170)}</div><div style="font-family:Inter;font-weight:800;font-size:44px;margin-top:30px">Aarav Sharma</div><div class="sub" style="font-size:30px;margin-top:8px">Grade 6</div><div class="tag" style="display:inline-block;margin-top:34px;font-size:17px;padding:10px 20px">ONE RECORD</div>`;
  const D=[['userplus','Admission'],['cap','Academics'],['wallet','Accounts'],['bus','Transport']];
  const rows=D.map(([i_,n],i)=>{const y=-330+i*170;const c=mk(g,'glass',`width:500px;height:140px;left:-10px;top:${y}px;padding:0 30px;border-radius:30px;display:flex;align-items:center;gap:20px`);c.innerHTML=`${chipBox(i_,66,20)}<div class="lbl" style="font-size:23px">${n}</div><div class="upd" style="margin-left:auto;display:flex;align-items:center;gap:10px;font-family:Inter;font-weight:700;font-size:25px;color:#FFD36E;opacity:0">${ic('check',30,'#FFD36E',3.4)}Updated</div>`;return {c,upd:c.querySelector('.upd'),y}});
  const svg=mk(g,'','position:absolute;left:-540px;top:-560px;width:1080px;height:1120px');
  svg.innerHTML=`<svg width="1080" height="1120" viewBox="-540 -560 1080 1120" style="position:absolute;overflow:visible"><defs><linearGradient id="el" x1="0" x2="1"><stop offset="0" stop-color="#FFD36E"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient></defs>${D.map((d,i)=>{const y=-330+i*170+70;return `<path id="ep${i}" d="M-118 0 C -70 0, -60 ${y}, -10 ${y}" fill="none" stroke="url(#el)" stroke-width="6" stroke-linecap="round" stroke-dasharray="600" stroke-dashoffset="600"/><circle id="ec${i}" r="11" fill="#fff"/>`}).join('')}</svg>`;
  const P=D.map((d,i)=>svg.querySelector('#ep'+i)),C=D.map((d,i)=>svg.querySelector('#ec'+i));
  return {t0:33.60,t1:36.00,root,grain,update(lt){
    st(g,{transform:`rotateX(${lerp(9,5,lt/2.4)}deg) rotateY(${lerp(-16,-4,E.inout(lt/2.4))}deg)`});
    enter3d(card,E.out4(prog(lt,0,.5)),-500,0);
    rows.forEach((r,i)=>{enter3d(r.c,E.out4(prog(lt,.15+i*.09,.65+i*.09)),-450,0);const u=prog(lt,.9+i*.22,1.05+i*.22);r.upd.style.opacity=u;r.upd.style.transform=`translateX(${(1-E.out3(u))*20}px)`});
    P.forEach((p,i)=>{const q=E.out3(prog(lt,.45+i*.08,.95+i*.08));p.style.strokeDashoffset=600*(1-q);
      const f=((lt*1.1+i*.2)%1);const L=p.getTotalLength();const pt=p.getPointAtLength(L*f);C[i].setAttribute('cx',pt.x);C[i].setAttribute('cy',pt.y);C[i].setAttribute('opacity',prog(lt,.95,1.05)*Math.sin(Math.PI*f));});
  }};
}

/* ---- end card ---- */
function sceneEnd(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:830px;width:0;height:0');
  const glow=mk(root,'','position:absolute;left:140px;top:380px;width:800px;height:800px;border-radius:400px;background:radial-gradient(circle,rgba(255,150,60,.42),transparent 65%)');
  const star=mk(g,'','position:absolute;left:-95px;top:-330px;width:190px;height:190px;filter:drop-shadow(0 0 44px rgba(255,160,60,.6))',starSVG(190));
  const word=mk(g,'gtext','position:absolute;left:-520px;width:1040px;text-align:center;top:-110px;font-family:Unb;font-weight:800;font-size:150px;letter-spacing:-.02em;line-height:1;background-size:250% 100%,100% 100%;background-image:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.95) 50%,transparent 60%),var(--gold)','Tara ERP');
  const rule=mk(g,'','position:absolute;left:-120px;top:100px;width:240px;height:4px;border-radius:2px;background:var(--goldh)');
  const tl=mk(g,'lbl','position:absolute;left:-480px;width:960px;text-align:center;top:140px;font-size:26px;letter-spacing:.3em;padding-left:.3em','One connected system');
  return {t0:44.10,t1:60,root,grain,update(lt){
    const p=E.out4(prog(lt,0,.55));
    st(g,{transform:`scale(${lerp(1.18,1,p)}) rotateX(${lerp(10,0,p)}deg)`});
    st(star,{opacity:clamp(p*3),transform:`rotateY(${lerp(-200,0,E.out4(prog(lt,0,.7)))}deg)`});
    st(word,{opacity:clamp(prog(lt,.08,.3)),backgroundPosition:`${lerp(130,-30,prog(lt,.25,1.2))}% 0,0 0`,transform:`translateY(${(1-E.out4(prog(lt,.08,.5)))*36}px)`});
    st(rule,{transform:`scaleX(${E.out3(prog(lt,.3,.7))})`});
    st(tl,{opacity:E.out3(prog(lt,.4,.8))});
    st(glow,{opacity:.6+.25*Math.sin(lt*2.4)});
  }};
}
