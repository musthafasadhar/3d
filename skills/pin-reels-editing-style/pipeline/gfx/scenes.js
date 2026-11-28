const SCENES=[];
function shell(){
  const root=mk(document.getElementById('scenes'),'scene hide');
  mk(root,'bg');mk(root,'grid');
  const stage=mk(root,'stage3d');
  const grain=mk(root,'grain');mk(root,'vig');
  return {root,stage,grain};
}
const chipBox=(icn,size=58,r=18)=>`<div style="width:${size}px;height:${size}px;border-radius:${r}px;background:var(--goldh);display:flex;align-items:center;justify-content:center;flex:none">${ic(icn,size*0.55,'#1a1033',2.4)}</div>`;
const avatar=(size,txt='AS')=>`<div style="width:${size}px;height:${size}px;border-radius:${size}px;background:linear-gradient(140deg,#6A5BFF,#B07CFF);display:flex;align-items:center;justify-content:center;font-family:Unb;font-weight:700;font-size:${size*0.34}px;color:#fff;box-shadow:inset 0 2px 0 rgba(255,255,255,.4),0 10px 30px rgba(60,40,200,.5);flex:none">${txt}</div>`;
const skel=(w,a=.13,h=20,mb=22)=>`<div style="height:${h}px;width:${w}%;border-radius:${h/2}px;background:rgba(255,255,255,${a});margin-bottom:${mb}px"></div>`;
function enter3d(el,p,z0=-600,z1=0){st(el,{opacity:clamp(p*2.2),transform:`translateZ(${lerp(z0,z1,p)}px)`})}

/* ---- B1: four separate silos ---- */
function sceneSilos(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:560px;width:0;height:0');
  const D=[['userplus','Admission',-232,-196],['cap','Academics',232,-196],['wallet','Accounts',-232,196],['bus','Transport',232,196]];
  const cards=D.map(([i_,name,x,y],i)=>{
    const c=mk(g,'glass',`width:430px;height:350px;left:${x-215}px;top:${y-175}px;padding:30px;`);
    c.innerHTML=`<div style="display:flex;align-items:center;gap:16px">${chipBox(i_)}<div class="lbl">${name}</div><div style="margin-left:auto;opacity:.75">${ic('lock',30,'#fff',2)}</div></div>
    <div style="margin-top:36px">${skel(78,.30)}${skel(58)}${skel(88)}</div>
    <div style="display:flex;gap:12px"><div style="height:44px;width:44px;border-radius:22px;background:rgba(255,255,255,.10)"></div><div style="flex:1;height:44px;border-radius:22px;background:rgba(255,255,255,.07)"></div></div>`;
    return c;});
  const gaps=[[0,-196],[0,196],[-232,0],[232,0]].map(([x,y])=>mk(g,'',`position:absolute;left:${x-26}px;top:${y-26}px;width:52px;height:52px;border-radius:26px;background:rgba(255,106,61,.20);border:2px solid rgba(255,138,61,.75);display:flex;align-items:center;justify-content:center`,ic('x',24,'#FF9B45',2.8)));
  const label=mk(root,'','position:absolute;left:0;width:1080px;top:1010px;text-align:center',`<span class="lbl" style="font-size:24px;opacity:.92">4 departments · 4 separate systems</span>`);
  return {t0:1.0,t1:3.55,root,grain,update(lt){
    const d=2.55;
    st(g,{transform:`rotateX(${lerp(21,13,lt/d)}deg) rotateY(${lerp(-18,10,E.inout(lt/d))}deg) rotateZ(-1.5deg) scale(${lerp(.9,1.0,lt/d)})`});
    cards.forEach((c,i)=>enter3d(c,E.out4(prog(lt,i*.11,i*.11+.5)),-720,i%2?24:-8));
    gaps.forEach((m,i)=>{const p=E.back(prog(lt,1.0+i*.1,1.28+i*.1));st(m,{opacity:clamp(p*3),transform:`translateZ(50px) scale(${p})`})});
    st(label,{opacity:E.out3(prog(lt,.95,1.35))});
  }};
}

/* ---- B2: admission adds a student ---- */
function sceneAdmission(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:610px;width:0;height:0');
  const P=mk(g,'glass','width:840px;height:710px;left:-420px;top:-355px;padding:46px 50px');
  P.innerHTML=`<div style="display:flex;align-items:center;gap:18px">${chipBox('userplus',64,20)}<div class="lbl" style="font-size:28px">Admission</div><div class="tag" style="margin-left:auto;font-size:18px;padding:10px 20px">NEW STUDENT</div></div>
  <div style="display:flex;align-items:center;gap:30px;margin-top:40px"><div id="b2av">${avatar(128,'')}</div><div style="flex:1"><div class="sub" style="font-size:24px;margin-bottom:10px">Student name</div><div id="b2name" style="height:78px;border-radius:20px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);font-family:Inter;font-weight:650;font-size:38px;line-height:78px;padding:0 26px;color:#fff;white-space:nowrap"></div></div></div>
  <div style="display:flex;gap:26px;margin-top:34px"><div style="flex:1"><div class="sub" style="font-size:24px;margin-bottom:10px">Class</div><div id="b2cls" style="height:78px;border-radius:20px;background:rgba(255,255,255,.08);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.18);font-family:Inter;font-weight:650;font-size:38px;line-height:78px;padding:0 26px;white-space:nowrap"></div></div><div style="flex:1"><div class="sub" style="font-size:24px;margin-bottom:10px">Guardian</div><div style="height:78px;border-radius:20px;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.12);padding:28px 26px">${skel(62,.18,16,0)}</div></div></div>
  <div style="position:absolute;left:50px;right:50px;bottom:46px;height:104px">
    <div id="b2btn" style="position:absolute;inset:0;border-radius:28px;background:var(--goldh);display:flex;align-items:center;justify-content:center;gap:16px;font-family:Unb;font-weight:700;font-size:28px;letter-spacing:.08em;color:#1a1033;box-shadow:0 18px 50px rgba(255,140,60,.40),inset 0 2px 0 rgba(255,255,255,.55)">${ic('plus',34,'#1a1033',3)}ADD STUDENT</div>
    <div id="b2ok" style="position:absolute;inset:0;border-radius:28px;background:linear-gradient(135deg,#FFF1C9,#FFD36E);display:flex;align-items:center;justify-content:center;gap:16px;font-family:Unb;font-weight:700;font-size:28px;letter-spacing:.08em;color:#1a1033;box-shadow:0 18px 60px rgba(255,200,110,.55)"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a1033" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path id="b2chk" d="M5 12.5l4.5 4.5L19 7.5" stroke-dasharray="20" stroke-dashoffset="20"/></svg>STUDENT ADDED</div>
    <div id="b2rip" style="position:absolute;inset:0;border-radius:28px;border:3px solid rgba(255,211,110,.9)"></div></div>`;
  const q=(s)=>P.querySelector(s);
  const av=q('#b2av'),nm=q('#b2name'),cl=q('#b2cls'),bt=q('#b2btn'),ok=q('#b2ok'),rip=q('#b2rip'),chk=q('#b2chk');
  const avHTML0=avatar(128,'A'),avHTML1=avatar(128,'AS');
  return {t0:5.78,t1:8.50,root,grain,update(lt){
    const p=E.out4(prog(lt,0,.5));
    st(g,{transform:`rotateX(${lerp(12,6,lt/2.7)}deg) rotateY(${lerp(-12,6,E.inout(lt/2.7))}deg) scale(${lerp(.94,1.0,lt/2.7)})`});
    enter3d(P,p,-520,0);
    const name=typed('Aarav Sharma',lt,.3,12),cls=typed('Grade 6',lt,1.3,10);
    const caret=(Math.floor(lt*2.4)%2===0)?'<span style="display:inline-block;width:3px;height:40px;background:#FFD36E;vertical-align:-6px;margin-left:3px"></span>':'<span style="display:inline-block;width:3px;height:40px;margin-left:3px"></span>';
    nm.innerHTML=name+(lt<1.3?caret:'');cl.innerHTML=cls+((lt>=1.3&&lt<1.75)?caret:'');
    av.innerHTML=name.length>=7?avHTML1:(name.length>=1?avHTML0:avatar(128,''));
    const press=prog(lt,1.72,1.82)-prog(lt,1.82,1.95);
    const done=prog(lt,1.93,2.05);
    st(bt,{opacity:1-done,transform:`scale(${1-.045*press})`});
    st(ok,{opacity:done,transform:`scale(${lerp(.96,1,E.back(done))})`});
    chk.style.strokeDashoffset=20*(1-E.out3(prog(lt,1.98,2.3)));
    const rp=prog(lt,1.93,2.55);st(rip,{opacity:(1-rp)*(lt>1.9?1:0),transform:`scale(${1+.16*E.out3(rp)})`});
  }};
}

/* ---- B3: academics works with the same student ---- */
function sceneAcademics(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:600px;width:0;height:0');
  const mini=mk(g,'glass','width:640px;height:132px;left:-320px;top:-430px;padding:24px 30px;border-radius:30px');
  mini.innerHTML=`<div style="display:flex;align-items:center;gap:22px">${ic('userplus',38,'#FFD36E',2.4)}${avatar(84)}<div><div class="sub" style="font-size:21px;letter-spacing:.12em;font-family:Unb;font-weight:600">ADMISSION</div><div style="font-family:Inter;font-weight:700;font-size:34px">Aarav Sharma</div></div></div>`;
  const beam=mk(g,'','position:absolute;left:-3px;top:-298px;width:6px;height:200px;border-radius:3px;background:linear-gradient(180deg,rgba(255,211,110,.0),#FFD36E 30%,#FF8A3D 70%,rgba(255,138,61,0));box-shadow:0 0 30px rgba(255,160,60,.7);transform-origin:50% 0');
  const dot=mk(g,'','position:absolute;left:-14px;width:28px;height:28px;border-radius:14px;background:#fff;box-shadow:0 0 30px 10px rgba(255,190,90,.8)');
  const tag=mk(g,'tag','position:absolute;left:-150px;width:300px;text-align:center;top:-226px;font-size:19px;padding:11px 0','SAME STUDENT');
  const P=mk(g,'glass','width:840px;height:500px;left:-420px;top:-70px;padding:44px 50px');
  P.innerHTML=`<div style="display:flex;align-items:center;gap:18px">${chipBox('cap',64,20)}<div class="lbl" style="font-size:28px">Academics</div></div>
  <div style="display:flex;align-items:center;gap:26px;margin-top:40px">${avatar(120)}<div><div style="font-family:Inter;font-weight:750;font-size:48px;line-height:1.1">Aarav Sharma</div><div class="sub" style="font-size:30px;margin-top:6px">Grade 6</div></div></div>
  <div id="b3chips" style="display:flex;flex-wrap:wrap;gap:16px;margin-top:44px"></div>`;
  const chips=['Timetable','Attendance','Marks'].map(s=>mk(P.querySelector('#b3chips'),'',`display:flex;align-items:center;gap:12px;padding:16px 26px;border-radius:999px;background:rgba(255,255,255,.09);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.2);font-family:Inter;font-weight:650;font-size:28px`,`${ic('check',28,'#FFD36E',3.2)}${s}`));
  return {t0:9.90,t1:11.50,root,grain,update(lt){
    enter3d(mini,E.out4(prog(lt,0,.35)),-300,0);
    const bp=E.out3(prog(lt,.12,.5));st(beam,{transform:`scaleY(${bp})`,opacity:bp});
    st(dot,{top:`${lerp(-300,-110,E.inout(prog(lt,.15,.65)))}px`,opacity:prog(lt,.15,.25)*(1-prog(lt,.62,.7))});
    st(tag,{opacity:E.out3(prog(lt,.3,.55)),transform:`translateZ(40px) scale(${lerp(.8,1,E.back(prog(lt,.3,.55)))})`});
    enter3d(P,E.out4(prog(lt,.2,.7)),-500,0);
    chips.forEach((c,i)=>{const p=E.back(prog(lt,.75+i*.12,.98+i*.12));st(c,{opacity:clamp(p*3),transform:`scale(${lerp(.7,1,p)})`})});
    st(g,{transform:`rotateX(${lerp(8,3,lt/1.6)}deg) rotateY(${lerp(8,-4,lt/1.6)}deg)`});
  }};
}

/* ---- B4: accounts / fee structure ---- */
function sceneFees(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:590px;width:0;height:0');
  const P=mk(g,'glass','width:850px;height:610px;left:-425px;top:-305px;padding:44px 50px');
  const rows=[['Tuition',.92],['Transport',.55],['Activities',.38],['Exams',.66]];
  P.innerHTML=`<div style="display:flex;align-items:center;gap:18px">${chipBox('wallet',64,20)}<div class="lbl" style="font-size:28px">Accounts</div></div>
  <div style="display:flex;align-items:center;gap:20px;margin-top:34px;padding:18px 22px;border-radius:24px;background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.14)">${avatar(76)}<div><div style="font-family:Inter;font-weight:750;font-size:34px">Aarav Sharma</div><div class="sub" style="font-size:24px">Grade 6 · Fee structure</div></div></div>
  <div id="b4rows" style="margin-top:36px"></div>`;
  const R=P.querySelector('#b4rows');
  const bars=rows.map(([n,w])=>{const r=mk(R,'','display:flex;align-items:center;gap:22px;margin-bottom:34px',`<div style="width:210px;font-family:Inter;font-weight:650;font-size:30px;color:rgba(255,255,255,.88)">${n}</div><div style="flex:1;height:26px;border-radius:13px;background:rgba(255,255,255,.10);overflow:hidden"><div class="fill" style="height:100%;width:0;border-radius:13px;background:var(--goldh);box-shadow:0 0 24px rgba(255,150,60,.6)"></div></div>`);return {r,w,f:r.querySelector('.fill')}});
  return {t0:12.90,t1:15.30,root,grain,update(lt){
    enter3d(P,E.out4(prog(lt,0,.5)),-520,0);
    st(g,{transform:`rotateX(${lerp(10,4,lt/2.4)}deg) rotateY(${lerp(10,-6,E.inout(lt/2.4))}deg)`});
    bars.forEach((b,i)=>{const p=E.out3(prog(lt,.45+i*.22,1.25+i*.22));b.f.style.width=(b.w*100*p)+'%';st(b.r,{opacity:clamp(prog(lt,.35+i*.22,.6+i*.22)*2)})});
  }};
}

/* ---- B5: transport route ---- */
function sceneRoute(){
  const {root,stage,grain}=shell();
  const g=mk(stage,'p3','position:absolute;left:540px;top:600px;width:0;height:0');
  const P=mk(g,'glass','width:880px;height:760px;left:-440px;top:-380px;overflow:hidden;padding:44px 50px');
  P.innerHTML=`<div style="display:flex;align-items:center;gap:18px">${chipBox('bus',64,20)}<div class="lbl" style="font-size:28px">Transport</div><div class="tag" style="margin-left:auto;font-size:18px;padding:10px 20px">ROUTE 3</div></div>
  <svg id="b5svg" width="780" height="560" viewBox="0 0 780 560" style="position:absolute;left:50px;top:170px;overflow:visible">
    <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="#FFD36E"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient></defs>
    <path id="b5path0" d="M40 470 C 200 470, 120 300, 300 300 S 440 140, 600 150 S 720 90, 740 60" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="18" stroke-linecap="round"/>
    <path id="b5path" d="M40 470 C 200 470, 120 300, 300 300 S 440 140, 600 150 S 720 90, 740 60" fill="none" stroke="url(#rg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="1400" stroke-dashoffset="1400"/>
    <g id="b5stops"></g><g id="b5bus"></g>
  </svg>`;
  const path=P.querySelector('#b5path'),stops=P.querySelector('#b5stops'),bus=P.querySelector('#b5bus');
  const L=path.getTotalLength(); path.style.strokeDasharray=L; 
  const sp=[.0,.34,.62,1.0].map(f=>path.getPointAtLength(L*f));
  stops.innerHTML=sp.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="17" fill="#15103F" stroke="#fff" stroke-width="5"/>`).join('');
  bus.innerHTML=`<g class="bb"><circle r="40" fill="#FFD36E" opacity=".25"/><rect x="-30" y="-24" width="60" height="48" rx="14" fill="url(#rg)"/><rect x="-21" y="-14" width="42" height="14" rx="4" fill="#15103F"/></g>`;
  const bb=bus.querySelector('.bb');
  const pill=mk(P,'','position:absolute;right:56px;top:210px;display:flex;align-items:center;gap:14px;padding:16px 26px;border-radius:999px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.25);font-family:Inter;font-weight:700;font-size:28px',`${ic('pin',30,'#FFD36E',2.4)}Aarav Sharma · Stop 3`);
  return {t0:16.30,t1:17.75,root,grain,update(lt){
    enter3d(P,E.out4(prog(lt,0,.4)),-420,0);
    st(g,{transform:`rotateX(${lerp(9,5,lt/1.45)}deg) rotateY(${lerp(8,-5,lt/1.45)}deg)`});
    const dp=E.inout(prog(lt,.18,1.1)); path.style.strokeDashoffset=L*(1-dp);
    const pt=path.getPointAtLength(L*dp);bb.setAttribute('transform',`translate(${pt.x},${pt.y})`);
    st(pill,{opacity:E.out3(prog(lt,.95,1.2)),transform:`translateY(${(1-E.out3(prog(lt,.95,1.2)))*16}px)`});
  }};
}
