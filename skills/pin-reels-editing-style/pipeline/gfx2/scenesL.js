const ALLSC=[];
function mkScene(theme,a,b,fadeOut,build){
  const root=mk(document.getElementById('scenes'),'scene hide');
  mk(root,theme==='light'?'bgL':'bgD');
  const deco=mk(root,'','position:absolute;inset:0');
  const content=mk(root,'','position:absolute;inset:0');
  const api=build(content,deco)||{};
  const prev=ALLSC.find(o=>Math.abs(o.t1-a)<0.01),iris=!!prev;if(prev)prev.hold=0.65;
  const s={t0:a,t1:b,root,update(t){
    const lt=t-a;
    root.style.opacity=1;
    root.style.clipPath=(iris&&t<a+0.6)?`circle(${2400*E.inout(prog(t,a,a+0.55))}px at 540px 1660px)`:'none';
    content.style.opacity=Math.min(E.out3(prog(t,a+(iris?0.3:0.22),a+(iris?0.6:0.5))),b>=47?1:1-prog(t,b-0.40,b-0.15));
    if(api.update)api.update(lt,b-a);
  }};
  ALLSC.push(s);return s;
}
function asterisk(parent,x,y,scale,rot,color,op){const d=mk(parent,'ast',`left:${x}px;top:${y}px;color:${color};opacity:${op};transform:scale(${scale}) rotate(${rot}deg)`,'<i></i><i></i><i></i>');return d}
const eyebrow=(parent,txt,y,color)=>mk(parent,'eyebrow',`top:${y}px;color:${color||'#1E4D39'}`,`<b></b>${txt}`);
const initials=(sz,t='RS')=>`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:linear-gradient(140deg,#2E9B6C,#0F5B40);display:flex;align-items:center;justify-content:center;font-family:Inter;font-weight:800;font-size:${sz*0.36}px;color:#fff;flex:none">${t}</div>`;
const field=(label,id,w,val)=>`<div style="width:${w};flex:none"><div class="lab" style="font-size:20px;margin-bottom:8px">${label}</div><div id="${id}" style="height:62px;border-radius:13px;border:1.5px solid #DCE3DA;background:#fff;font-family:Inter;font-weight:600;font-size:25px;line-height:59px;padding:0 20px;color:#14301F;white-space:nowrap;overflow:hidden">${val||''}</div></div>`;
const stat=(label,val,sub,icn)=>`<div style="flex:1;background:#fff;border-radius:18px;padding:18px 18px 16px;box-shadow:0 8px 26px rgba(26,60,42,.10),0 0 0 1px rgba(20,60,40,.05)"><div style="display:flex;align-items:center;justify-content:space-between"><div class="lab" style="font-size:16px">${label}</div><div class="ibox" style="width:34px;height:34px;border-radius:10px">${ic(icn,19,'#1E7A55',2.2)}</div></div><div class="ser" style="font-size:36px;margin-top:8px;color:#14301F">${val}</div><div class="lab" style="font-size:14px;margin-top:4px;font-weight:500">${sub}</div></div>`;

/* B2: admission form */
function sceneAdmission(){return mkScene('light',5.78,8.55,true,(c)=>{
  eyebrow(c,'Students &amp; Admissions',150);
  const card=mk(c,'ui','left:170px;top:560px;width:740px;height:830px;padding:42px 44px');
  card.innerHTML=`<div class="ser" style="font-size:40px">Enrol New Student</div><div class="lab" style="font-size:19px;margin-top:8px;font-weight:500;line-height:1.35">Complete pupil registration details to generate official roll number and portal credentials.</div>
  <div style="height:1.5px;background:#E6ECE4;margin:24px 0 22px"></div>
  <div style="margin-bottom:22px">${field('Student Full Name *','f_name','100%')}</div>
  <div style="display:flex;gap:18px;margin-bottom:22px">${field('Class Grade *','f_cls','38%')}${field('Section *','f_sec','26%')}${field('Gender *','f_gen','calc(36% - 36px)')}</div>
  <div style="display:flex;gap:18px;margin-bottom:22px">${field('Date of Birth','f_dob','50%')}${field('Blood Group','f_bg','calc(50% - 18px)')}</div>
  <div style="display:flex;gap:18px;margin-bottom:6px">${field('Guardian Name *','f_gd','50%')}${field('Relation','f_rel','calc(50% - 18px)')}</div>
  <div style="position:absolute;left:44px;right:44px;bottom:38px;display:flex;gap:16px;align-items:center;justify-content:flex-end"><div style="height:62px;padding:0 26px;border-radius:14px;border:1.5px solid #DCE3DA;font-family:Inter;font-weight:700;font-size:22px;line-height:59px;color:#14301F">Cancel</div><div id="f_btn" style="height:62px;padding:0 28px;border-radius:14px;background:#0F3F2E;color:#fff;font-family:Inter;font-weight:700;font-size:22px;line-height:62px">Confirm Enrolment &amp; Issue Credentials</div></div>`;
  const toast=mk(c,'pill','left:540px;top:520px;transform:translateX(-50%);padding:16px 30px 16px 18px;font-size:27px',`<div class="ibox" style="width:44px;height:44px;background:#0F5B40">${ic('check',26,'#fff',3.4)}</div>Student added`);
  const q=id=>card.querySelector('#'+id);
  const vals={f_cls:['Class 8-A',1.2],f_sec:['A',1.2],f_gen:['Male',1.2],f_dob:['15 Aug 2011',1.35],f_bg:['B+',1.35],f_gd:['Suresh Sharma',1.45],f_rel:['Father',1.45]};
  return {update(lt){
    const nm=typed('Rahul Sharma',lt,.3,12);const caret=(Math.floor(lt*2.4)%2===0&&lt<1.3)?'<span style="display:inline-block;width:2px;height:30px;background:#1E9A6A;vertical-align:-5px;margin-left:2px"></span>':'';
    q('f_name').innerHTML=nm+caret;
    for(const k in vals){const [v,t0]=vals[k];q(k).textContent=lt>=t0?v:'';q(k).style.opacity=E.out3(prog(lt,t0,t0+.18))}
    const press=prog(lt,1.8,1.9)-prog(lt,1.9,2.0);q('f_btn').style.transform=`scale(${1-.04*press})`;q('f_btn').style.background=lt>1.95?'#1E9A6A':'#0F3F2E';
    const p=E.back(prog(lt,1.95,2.25),1.6);st(toast,{opacity:clamp(p*3),transform:`translateX(-50%) translateY(${(1-p)*14}px) scale(${lerp(.85,1,p)})`});
  }}})}

/* B3: academics, same student */
function sceneAcademics(){return mkScene('light',9.90,11.50,true,(c)=>{
  eyebrow(c,'Academics',150);
  const rec=mk(c,'ui','left:190px;top:560px;width:700px;height:116px;padding:0 30px;display:flex;align-items:center;gap:22px;border-radius:24px',`${initials(66)}<div><div class="lab" style="font-size:16px;letter-spacing:.16em;font-weight:800">ADMISSION</div><div style="font-family:Inter;font-weight:800;font-size:30px">Rahul Sharma</div></div><div style="margin-left:auto;font-family:Inter;font-weight:700;font-size:22px;color:#6b7a70">Class 8-A</div>`);
  const line=mk(c,'','position:absolute;left:538px;top:680px;width:4px;height:96px;border-radius:2px;background:repeating-linear-gradient(180deg,#E9C36B 0 10px,transparent 10px 18px);transform-origin:50% 0');
  const tag=mk(c,'pill','left:540px;top:706px;transform:translateX(-50%);padding:10px 22px;font-size:20px;background:#F6E3A6;letter-spacing:.04em',`${ic('link',22,'#5c4310',2.4)}Same student`);
  const card=mk(c,'ui','left:130px;top:790px;width:820px;height:620px;padding:36px 40px');
  card.innerHTML=`<div style="display:flex;align-items:center;gap:16px"><div class="ibox" style="width:58px;height:58px">${ic('cap',30,'#1E7A55',2.2)}</div><div style="font-family:Inter;font-weight:800;font-size:26px;letter-spacing:.12em">ACADEMICS</div></div>
  <div style="display:flex;align-items:center;gap:24px;margin-top:34px">${initials(96)}<div><div class="ser" style="font-size:46px;line-height:1.1">Rahul Sharma</div><div class="lab" style="font-size:24px;margin-top:6px">Class 8-A · Roll No: SCH-8A-01</div></div></div>
  <div id="a_stats" style="display:flex;gap:16px;margin-top:40px">${stat('Attendance Score','70.1%','47 of 67 periods present','cal')}${stat('Term 1 Percentage','84.5%','Overall Grade: A2','award')}</div>
  <div id="a_chips" style="display:flex;gap:14px;margin-top:26px">${['Timetable','Marks','Report card'].map(t=>`<div style="display:flex;align-items:center;gap:10px;padding:13px 22px;border-radius:999px;background:#E8F1E8;font-family:Inter;font-weight:700;font-size:23px;color:#14301F">${ic('check',22,'#1E7A55',3.2)}${t}</div>`).join('')}</div>`;
  const stats=card.querySelector('#a_stats').children,chips=card.querySelector('#a_chips').children;
  return {update(lt){
    const p=E.out4(prog(lt,.0,.4));st(rec,{opacity:p,transform:`translateY(${(1-p)*-24}px)`});
    st(line,{transform:`scaleY(${E.out3(prog(lt,.2,.5))})`});
    const tg=E.back(prog(lt,.35,.6),1.6);st(tag,{opacity:clamp(tg*3),transform:`translateX(-50%) scale(${lerp(.8,1,tg)})`});
    const cp=E.out4(prog(lt,.25,.7));st(card,{opacity:cp,transform:`translateY(${(1-cp)*40}px)`});
    [...stats].forEach((s,i)=>{const q=E.back(prog(lt,.6+i*.12,.85+i*.12),1.5);st(s,{opacity:clamp(q*3),transform:`translateY(${(1-q)*16}px)`})});
    [...chips].forEach((s,i)=>{const q=E.back(prog(lt,.85+i*.1,1.05+i*.1),1.5);st(s,{opacity:clamp(q*3),transform:`scale(${lerp(.8,1,q)})`})});
  }}})}

/* B4: accounts / fees */
function sceneFees(){return mkScene('light',12.90,15.30,true,(c)=>{
  eyebrow(c,'Accounts',150);
  const rows=[['Tuition fee',.94],['Transport fee',.62],['Activity fee',.4],['Exam fee',.72]];
  const card=mk(c,'ui','left:140px;top:560px;width:800px;height:790px;padding:38px 42px');
  card.innerHTML=`<div style="display:flex;align-items:center;gap:16px"><div class="ibox" style="width:58px;height:58px">${ic('wallet',30,'#1E7A55',2.2)}</div><div style="font-family:Inter;font-weight:800;font-size:26px;letter-spacing:.12em">ACCOUNTS</div></div>
  <div style="display:flex;align-items:center;gap:20px;margin-top:30px;padding:18px 22px;border-radius:20px;background:#F4F7F1">${initials(70)}<div><div style="font-family:Inter;font-weight:800;font-size:30px">Rahul Sharma</div><div class="lab" style="font-size:21px">Class 8-A · Fee structure</div></div></div>
  <div class="ser" style="font-size:34px;margin:34px 0 22px">Fee structure</div><div id="fr"></div>
  <div id="fpill" style="position:absolute;left:42px;bottom:36px;display:flex;align-items:center;gap:12px;padding:15px 26px;border-radius:999px;background:#F6E3A6;font-family:Inter;font-weight:800;font-size:24px;color:#3d2e08">${ic('check',26,'#3d2e08',3.4)}All fees settled</div>`;
  const R=card.querySelector('#fr');
  const bars=rows.map(([n,w])=>{const r=mk(R,'','display:flex;align-items:center;gap:22px;margin-bottom:26px',`<div style="width:210px;font-family:Inter;font-weight:700;font-size:25px;color:#33463b">${n}</div><div style="flex:1;height:22px;border-radius:11px;background:#E7EEE5;overflow:hidden"><div class="fl" style="height:100%;width:0;border-radius:11px;background:linear-gradient(90deg,#2FA878,#0F6B4B)"></div></div>`);return {r,w,f:r.querySelector('.fl')}});
  const fp=card.querySelector('#fpill');
  return {update(lt){
    const p=E.out4(prog(lt,0,.45));st(card,{opacity:p,transform:`translateY(${(1-p)*44}px)`});
    bars.forEach((b,i)=>{const q=E.out3(prog(lt,.5+i*.2,1.2+i*.2));b.f.style.width=(b.w*100*q)+'%';b.r.style.opacity=clamp(prog(lt,.45+i*.2,.7+i*.2)*2)});
    const q=E.back(prog(lt,1.5,1.8),1.6);st(fp,{opacity:clamp(q*3),transform:`scale(${lerp(.85,1,q)})`});
  }}})}

/* B5: transport route */
function sceneRoute(){return mkScene('light',16.30,17.75,false,(c)=>{
  eyebrow(c,'Transport',150);
  const card=mk(c,'ui','left:130px;top:560px;width:820px;height:800px;padding:38px 42px;overflow:hidden');
  card.innerHTML=`<div style="display:flex;align-items:center;gap:16px"><div class="ibox" style="width:58px;height:58px">${ic('bus',30,'#1E7A55',2.2)}</div><div style="font-family:Inter;font-weight:800;font-size:26px;letter-spacing:.12em">TRANSPORT</div><div style="margin-left:auto;font-family:Inter;font-weight:800;font-size:21px;padding:10px 20px;border-radius:999px;background:#F6E3A6;color:#3d2e08">Route 04</div></div>
  <div style="position:absolute;left:42px;right:42px;top:128px;bottom:110px;border-radius:22px;background:#EEF2E6;overflow:hidden"><svg width="736" height="560" viewBox="0 0 736 560" style="position:absolute;left:0;top:0">
    <g stroke="#fff" stroke-width="22" stroke-linecap="round" fill="none"><path d="M-10 120 L330 120 L330 -10"/><path d="M-10 330 L746 330"/><path d="M120 -10 L120 570"/><path d="M520 570 L520 200 L746 200"/><path d="M-10 480 L400 480"/></g>
    <path id="rt0" d="M60 500 L120 500 L120 330 L330 330 L330 120 L520 120 L520 200 L690 200" fill="none" stroke="#D4DECC" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="rt" d="M60 500 L120 500 L120 330 L330 330 L330 120 L520 120 L520 200 L690 200" fill="none" stroke="#1E9A6A" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <g id="stops"></g><g id="busm"><circle r="34" fill="#1E9A6A" opacity=".22"/><circle r="22" fill="#0F5B40"/></g></svg></div>
  <div style="position:absolute;left:42px;bottom:34px;font-family:Inter;font-weight:700;font-size:24px;color:#33463b;display:flex;gap:12px;align-items:center">${ic('pin',28,'#1E7A55',2.2)}Bus Route 04 (North City)</div>`;
  const rt=card.querySelector('#rt');const L=rt.getTotalLength();rt.style.strokeDasharray=L;
  const sp=[0,.3,.58,1].map(f=>rt.getPointAtLength(L*f));card.querySelector('#stops').innerHTML=sp.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="14" fill="#fff" stroke="#0F5B40" stroke-width="6"/>`).join('');
  const bm=card.querySelector('#busm');
  return {update(lt){
    const p=E.out4(prog(lt,0,.4));st(card,{opacity:p,transform:`translateY(${(1-p)*44}px)`});
    const d=E.inout(prog(lt,.2,1.2));rt.style.strokeDashoffset=L*(1-d);const pt=rt.getPointAtLength(L*d);bm.setAttribute('transform',`translate(${pt.x},${pt.y})`);
  }}})}

/* B7: Taara reveal (cream) */
function sceneReveal(){return mkScene('light',21.10,22.45,true,(c,deco)=>{
  asterisk(deco,120,260,1.0,12,'#DCE3C8',.9);asterisk(deco,960,1250,1.3,-8,'#E3E7D0',.9);asterisk(deco,900,420,.5,30,'#DCE3C8',.8);
  const lg=mk(c,'','position:absolute;left:150px;top:760px;width:780px;height:276px;display:flex;align-items:center;justify-content:center',`<img src="logo_taara.png" style="width:780px;display:block">`);
  return {update(lt){const p=E.out4(prog(lt,.05,.55));st(lg,{opacity:p,transform:`scale(${lerp(.88,1,p)}) translateY(${(1-p)*20}px)`})}}})}

/* B9: dashboard in browser frame */
function sceneDash(){return mkScene('light',33.60,36.00,true,(c)=>{
  eyebrow(c,'Student desk · Demo campus',150);
  const card=mk(c,'ui','left:100px;top:540px;width:880px;height:740px;overflow:hidden;border-radius:30px');
  card.innerHTML=`<div style="height:60px;background:#F1F3EE;display:flex;align-items:center;gap:10px;padding:0 24px"><i style="width:13px;height:13px;border-radius:7px;background:#FF5F57;display:block"></i><i style="width:13px;height:13px;border-radius:7px;background:#FEBC2E;display:block"></i><i style="width:13px;height:13px;border-radius:7px;background:#28C840;display:block"></i><div style="margin-left:18px;flex:1;height:34px;border-radius:17px;background:#fff;font-family:Inter;font-weight:600;font-size:19px;line-height:34px;padding:0 18px;color:#52625a">taaraerp.com/app/desk</div></div>
  <div style="padding:26px 34px"><div class="lab" style="font-size:13px;letter-spacing:.14em;font-weight:800">TAARA INTERNATIONAL SCHOOL · ACADEMIC PORTAL</div><div class="ser" style="font-size:42px;margin-top:8px">Welcome back, Rahul Sharma</div><div class="lab" style="font-size:18px;margin-top:6px;font-weight:500">Class 8-A · Roll No: SCH-8A-01</div>
  <div id="d_stats" style="display:flex;gap:14px;margin-top:26px">${stat('Attendance','70.1%','47 of 67 present','cal')}${stat('Term 1','84.5%','Grade A2','award')}${stat('Fee Dues','₹0','All settled','card')}${stat('Transport','Route 04','North City','bus')}</div>
  <div style="display:flex;gap:16px;margin-top:22px"><div style="flex:1;border-radius:18px;background:#F4F7F1;height:230px;position:relative"><div class="lab" style="position:absolute;left:18px;top:14px;font-size:15px;font-weight:800">Subject proficiency</div><svg width="100%" height="230" viewBox="0 0 400 230"><polygon points="200,52 292,118 258,196 142,196 108,118" fill="rgba(30,122,85,.25)" stroke="#1E7A55" stroke-width="3"/><polygon points="200,34 310,114 268,214 132,214 90,114" fill="none" stroke="#C9D6C6" stroke-width="2"/></svg></div>
  <div style="flex:1;border-radius:18px;background:#F4F7F1;height:230px;position:relative"><div class="lab" style="position:absolute;left:18px;top:14px;font-size:15px;font-weight:800">Attendance trajectory</div><svg width="100%" height="230" viewBox="0 0 400 230"><path d="M20 150 C 80 160 110 110 170 120 S 260 150 300 100 S 360 90 380 96 L380 215 L20 215Z" fill="rgba(30,122,85,.18)"/><path d="M20 150 C 80 160 110 110 170 120 S 260 150 300 100 S 360 90 380 96" fill="none" stroke="#1E7A55" stroke-width="4"/></svg></div></div></div>`;
  const pills=mk(c,'','position:absolute;left:0;top:1336px;width:1080px;display:flex;justify-content:center;gap:14px');
  const pl=['Attendance','Results','Fees','Transport'].map(t=>mk(pills,'','padding:15px 28px;border-radius:999px;background:#0F3F2E;color:#fff;font-family:Inter;font-weight:700;font-size:25px',t));
  const stats=card.querySelector('#d_stats').children;
  return {update(lt){
    const p=E.out4(prog(lt,0,.5));st(card,{opacity:p,transform:`translateY(${(1-p)*50}px) scale(${lerp(.97,1,p)})`});
    [...stats].forEach((s,i)=>{const q=E.back(prog(lt,.45+i*.1,.7+i*.1),1.5);st(s,{opacity:clamp(q*3),transform:`translateY(${(1-q)*14}px)`})});
    pl.forEach((e,i)=>{const q=E.back(prog(lt,1.0+i*.1,1.25+i*.1),1.5);st(e,{opacity:clamp(q*3),transform:`scale(${lerp(.8,1,q)})`})});
  }}})}

/* end card */
function sceneEnd(){const s=mkScene('light',44.10,47.0,false,(c,deco)=>{
  asterisk(deco,130,230,1.0,14,'#E1E6CE',.95);asterisk(deco,930,1500,1.5,-10,'#E6E9D3',.95);asterisk(deco,960,230,.45,24,'#E1E6CE',.9);
  const lg=mk(c,'','position:absolute;left:210px;top:420px;width:660px;display:flex;justify-content:center',`<img src="logo_taara.png" style="width:660px;display:block">`);
  const h1=mk(c,'','position:absolute;left:0;width:1080px;top:690px;text-align:center;font-weight:800;font-size:102px;letter-spacing:-.05em;line-height:1.02;color:#0F3F2E','Your school.<br>One <span style="color:#1E9A6A">connected</span> ERP.');
  const sub=mk(c,'','position:absolute;left:0;width:1080px;top:960px;text-align:center;font-family:Inter;font-weight:600;font-size:27px;color:#52625a','Admissions · Attendance · Exams · Fees · Transport');
  const pill=mk(c,'pill','left:540px;top:1060px;transform:translateX(-50%);padding:20px 38px;background:#F2D27A;font-size:29px;color:#2f2306',`${ic('comment',32,'#2f2306',2.4)}Comment below · we’ll contact you`);
  const url=mk(c,'','position:absolute;left:0;width:1080px;top:1190px;text-align:center;font-weight:800;font-size:40px;letter-spacing:-.02em;color:#0F3F2E','taaraerp.com');
  const dev=mk(c,'','position:absolute;left:0;width:1080px;top:1730px;text-align:center;font-family:Inter;font-weight:700;font-size:20px;letter-spacing:.22em;color:#8a948d','DEVELOPED BY MILA INNOVATIONS');
  const els=[lg,h1,sub,pill,url,dev];
  return {update(lt){els.forEach((e,i)=>{const q=E.out4(prog(lt,i*.1,.45+i*.1));const tr=e===pill?'translateX(-50%) ':'';st(e,{opacity:q,transform:`${tr}translateY(${(1-q)*26}px)`})})}}});
  return s}
