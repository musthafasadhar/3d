function darkDeco(deco){asterisk(deco,120,330,1.05,8,'#2B6B4E',.55);asterisk(deco,1000,780,1.5,-12,'#2B6B4E',.5);asterisk(deco,170,1480,1.25,22,'#2B6B4E',.5);asterisk(deco,930,1560,.6,-6,'#2B6B4E',.55)}
const node=(parent,icn,label,x,y,d)=>{const w=mk(parent,'','position:absolute;left:'+(x-d/2)+'px;top:'+(y-d/2)+'px;width:'+d+'px;height:'+d+'px');
  mk(w,'','position:absolute;inset:0;border-radius:50%;background:#FAF8EF;box-shadow:0 0 0 7px rgba(233,195,107,.22),0 14px 40px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center',ic(icn,d*0.44,'#14503A',2.1));
  const l=mk(w,'','position:absolute;left:50%;top:'+(d+14)+'px;transform:translateX(-50%);white-space:nowrap;font-family:Inter;font-weight:800;font-size:30px;color:#fff;text-align:center;line-height:1.15',label);return {w,l}};

/* B1: four separate departments */
function sceneSilos(){return mkScene('dark',1.55,3.55,true,(c,deco)=>{
  darkDeco(deco);eyebrow(c,'Four departments',150,'#EDE9D0');
  const P=[['userplus','Admission',300,800],['cap','Academics',780,800],['wallet','Accounts',300,1170],['bus','Transport',780,1170]];
  const ns=P.map(([i,l,x,y])=>{const n=node(c,i,l,x,y,176);const lk=mk(n.w,'','position:absolute;right:-6px;top:-6px;width:56px;height:56px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,.3)',ic('lock',28,'#3d2e08',2.4));return {...n,lk,y}});
  const M=[[540,800],[540,1170],[300,985],[780,985]].map(([x,y])=>mk(c,'','position:absolute;left:'+(x-26)+'px;top:'+(y-26)+'px;width:52px;height:52px;border-radius:50%;border:3px dashed rgba(233,195,107,.8);display:flex;align-items:center;justify-content:center',ic('x',22,'#E9C36B',3)));
  return {update(lt){
    ns.forEach((n,i)=>{const q=E.back(prog(lt,.25+i*.1,.6+i*.1),1.5);st(n.w,{opacity:clamp(q*3),transform:`translateY(${Math.sin(lt*2.2+i)*5+(1-q)*30}px) scale(${lerp(.7,1,q)})`});const lq=E.back(prog(lt,.8+i*.1,1.05+i*.1),1.8);st(n.lk,{transform:`scale(${lq})`})});
    M.forEach((m,i)=>{const q=E.back(prog(lt,1.0+i*.08,1.25+i*.08),1.6);st(m,{opacity:clamp(q*3),transform:`scale(${q})`})});
  }}})}

/* B6: four copies of one student */
function sceneDupes(){return mkScene('dark',17.75,21.10,false,(c,deco)=>{
  darkDeco(deco);eyebrow(c,'Four copies of one student',150,'#EDE9D0');
  const D=[['userplus','Admission','Rahul Sharma','Class 8-A',130,560,-2],['cap','Academics','R. Sharma','8A',570,560,2],['wallet','Accounts','Rahul S.','Class VIII',130,900,2.4],['bus','Transport','Sharma, Rahul','8th A',570,900,-2.2]];
  const cs=D.map(([i,dep,nm,cl,x,y,rot])=>{const e=mk(c,'ui',`left:${x}px;top:${y}px;width:380px;height:270px;padding:26px 28px;border-radius:26px`,`<div style="display:flex;align-items:center;gap:12px"><div class="ibox" style="width:46px;height:46px">${ic(i,24,'#1E7A55',2.2)}</div><div style="font-family:Inter;font-weight:800;font-size:19px;letter-spacing:.12em">${dep.toUpperCase()}</div></div><div class="ser" style="font-size:40px;margin-top:30px;line-height:1.1">${nm}</div><div class="lab" style="font-size:25px;margin-top:10px">${cl}</div><div style="height:12px;border-radius:6px;background:#E7EEE5;margin-top:28px;width:70%"></div>`);return {e,rot}});
  const N=[[540,695],[540,1035],[320,865],[760,865]].map(([x,y])=>mk(c,'','position:absolute;left:'+(x-34)+'px;top:'+(y-34)+'px;width:68px;height:68px;border-radius:50%;background:var(--gold);display:flex;align-items:center;justify-content:center;font-family:Inter;font-weight:800;font-size:36px;color:#3d2e08;box-shadow:0 8px 24px rgba(0,0,0,.28)','≠'));
  const note=mk(c,'pill','left:540px;top:1280px;transform:translateX(-50%);padding:18px 32px;font-size:27px;background:rgba(255,255,255,.96)',`Same student · 4 different records`);
  return {update(lt){
    cs.forEach((o,i)=>{const q=E.out4(prog(lt,i*.14,.5+i*.14));st(o.e,{opacity:q,transform:`translateY(${(1-q)*40}px) rotate(${o.rot*q}deg)`})});
    N.forEach((m,i)=>{const q=E.back(prog(lt,1.0+i*.1,1.3+i*.1),1.7);st(m,{opacity:clamp(q*3),transform:`scale(${q})`})});
    const q=E.back(prog(lt,1.7,2.0),1.5);st(note,{opacity:clamp(q*3),transform:`translateX(-50%) scale(${lerp(.9,1,q)})`});
  }}})}

/* B8: one connected profile hub */
function sceneHub(){return mkScene('dark',24.40,27.70,true,(c,deco)=>{
  darkDeco(deco);eyebrow(c,'One connected profile',150,'#EDE9D0');
  const cx=540,cy=940;
  const N=[['rupee','Fees',540,610,0],['clip','Exams',865,830,0],['trend','Academic<br>performance',742,1230,0],['users','Parent<br>information',338,1230,0],['bus','Transport',215,830,0]];
  const svg=mk(c,'','position:absolute;left:0;top:0;width:1080px;height:1920px');
  svg.innerHTML=`<svg width="1080" height="1920" viewBox="0 0 1080 1920" style="position:absolute">${N.map(([,,x,y],i)=>`<line id="hl${i}" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E9C36B" stroke-width="5" stroke-dasharray="3 14" stroke-linecap="round" opacity="0"/>`).join('')}${N.map((n,i)=>`<circle id="hp${i}" r="9" fill="#FFF3C4"/>`).join('')}</svg>`;
  const rings=[0,1].map(i=>mk(c,'',`position:absolute;left:${cx-130-i*34}px;top:${cy-130-i*34}px;width:${260+i*68}px;height:${260+i*68}px;border-radius:50%;border:3px solid rgba(233,195,107,${.55-i*.2})`));
  const hub=mk(c,'',`position:absolute;left:${cx-95}px;top:${cy-95}px;width:190px;height:190px;border-radius:50%;background:#FAF8EF;box-shadow:0 0 0 8px rgba(233,195,107,.3),0 18px 50px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center`,ic('user',100,'#14503A',1.9));
  const hp=mk(c,'',`position:absolute;left:${cx}px;top:${cy+128}px;transform:translateX(-50%);padding:14px 30px;border-radius:999px;background:#F2D27A;font-family:Inter;font-weight:800;font-size:29px;color:#2f2306;white-space:nowrap;box-shadow:0 8px 22px rgba(0,0,0,.25)`,'Student profile');
  const ns=N.map(([i,l,x,y])=>{const n=node(c,i==='rupee'?'wallet':i,l,x,y,128);if(i==='rupee')n.w.firstChild.innerHTML='<div style="font-family:Inter;font-weight:700;font-size:64px;color:#14503A;line-height:1">₹</div>';return n});
  const lines=N.map((n,i)=>svg.querySelector('#hl'+i)),dots=N.map((n,i)=>svg.querySelector('#hp'+i));
  return {update(lt){
    const hq=E.back(prog(lt,.05,.45),1.5);st(hub,{opacity:clamp(hq*3),transform:`scale(${lerp(.6,1,hq)})`});st(hp,{opacity:E.out3(prog(lt,.3,.6)),transform:`translateX(-50%) translateY(${(1-E.out3(prog(lt,.3,.6)))*10}px)`});
    ns.forEach((n,i)=>{const q=E.back(prog(lt,.3+i*.18,.65+i*.18),1.5);st(n.w,{opacity:clamp(q*3),transform:`scale(${lerp(.6,1,q)})`});
      lines[i].setAttribute('opacity',E.out3(prog(lt,.45+i*.18,.8+i*.18)));
      const f=((lt*.9+i*.21)%1),on=prog(lt,.9+i*.18,1.0+i*.18);dots[i].setAttribute('cx',cx+(N[i][2]-cx)*f);dots[i].setAttribute('cy',cy+(N[i][3]-cy)*f);dots[i].setAttribute('opacity',on*Math.sin(Math.PI*f))});
    rings.forEach((r,i)=>{const ph=(lt*.8+i*.4)%1;st(r,{opacity:prog(lt,1.3,1.6)*(1-ph)*.9,transform:`scale(${1+.35*ph})`})});
  }}})}
