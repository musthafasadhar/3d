/* overlays that sit ON TOP of the speaker (transparent background) */
const FX=()=>document.getElementById('fx');
function chipOverlay(t0,t1,icn,label){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const c=mk(r,'','position:absolute;left:540px;top:260px;transform-origin:50% 50%;display:flex;align-items:center;gap:20px;padding:14px 38px 14px 14px;border-radius:999px;background:linear-gradient(150deg,rgba(255,255,255,.18),rgba(255,255,255,.06)),rgba(20,14,66,.78);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.4),inset 0 0 0 1.5px rgba(255,255,255,.12),0 24px 60px rgba(4,2,30,.55)',`${chipBox(icn,84,42)}<div class="lbl" style="font-size:34px;letter-spacing:.12em">${label}</div>`);
  return {t0,t1,root:r,update(lt){const p=E.back(prog(lt,0,.3),1.6),q=prog(lt,t1-t0-.15,t1-t0);st(c,{opacity:clamp(p*3)*(1-q),transform:`translate(-50%,-50%) scale(${lerp(.6,1,p)}) rotate(${lerp(-4,0,E.out3(prog(lt,0,.4)))}deg)`})}};
}
function overlayEnterOnce(){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const tag=mk(r,'tag','position:absolute;left:540px;top:150px;transform:translateX(-50%);white-space:nowrap','ENTER IT ONCE');
  const four=mk(r,'','position:absolute;left:250px;top:300px;transform:translate(-50%,-50%);font-family:Unb;font-weight:800;font-size:132px;color:rgba(255,255,255,.62);text-shadow:0 6px 30px rgba(8,6,30,.7)','4×');
  const strike=mk(r,'','position:absolute;left:130px;top:296px;height:12px;width:240px;border-radius:6px;background:linear-gradient(90deg,#FF6A3D,#FF3D5A);box-shadow:0 0 24px rgba(255,80,60,.8);transform-origin:0 50%;rotate:-6deg');
  const arrow=mk(r,'','position:absolute;left:470px;top:300px;transform:translate(-50%,-50%)',`<svg width="110" height="60" viewBox="0 0 110 60" fill="none" stroke="#FFD36E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M8 30h88M70 8l28 22-28 22"/></svg>`);
  const one=mk(r,'gtext','position:absolute;left:760px;top:300px;transform:translate(-50%,-50%);font-family:Unb;font-weight:800;font-size:230px;line-height:1;filter:drop-shadow(0 8px 0 rgba(110,30,6,.4)) drop-shadow(0 0 40px rgba(255,140,60,.5))','1×');
  return {t0:27.80,t1:31.40,root:r,update(lt){
    st(tag,{opacity:E.out3(prog(lt,0,.3))});
    const a=E.back(prog(lt,.05,.35),1.8);st(four,{opacity:clamp(a*3),transform:`translate(-50%,-50%) scale(${lerp(.7,1,a)})`});
    st(strike,{transform:`scaleX(${E.out4(prog(lt,.9,1.2))})`,opacity:prog(lt,.9,.95)});
    st(arrow,{opacity:E.out3(prog(lt,1.15,1.4)),transform:`translate(calc(-50% + ${(1-E.out3(prog(lt,1.15,1.5)))*-30}px),-50%)`});
    const o=E.back(prog(lt,1.35,1.75),1.9);st(one,{opacity:clamp(o*3),transform:`translate(-50%,-50%) scale(${lerp(.5,1,o)})`});
    st(r,{opacity:1-prog(lt,3.45,3.6)});
  }};
}
function overlayDeptRow(){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const D=[['userplus',150],['cap',410],['wallet',670],['bus',930]];
  const svg=mk(r,'','position:absolute;left:0;top:0;width:1080px;height:400px');
  svg.innerHTML=`<svg width="1080" height="400" viewBox="0 0 1080 400" style="position:absolute"><defs><linearGradient id="dl" x1="0" x2="1"><stop offset="0" stop-color="#FFD36E"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient></defs>${[0,1,2].map(i=>`<line id="dg${i}" x1="${D[i][1]+66}" y1="270" x2="${D[i+1][1]-66}" y2="270" stroke="rgba(255,255,255,.55)" stroke-width="5" stroke-dasharray="3 14" stroke-linecap="round"/><line id="dl${i}" x1="${D[i][1]+66}" y1="270" x2="${D[i+1][1]-66}" y2="270" stroke="url(#dl)" stroke-width="8" stroke-linecap="round" stroke-dasharray="130" stroke-dashoffset="130"/>`).join('')}</svg>`;
  const n=D.map(([i_,x])=>mk(r,'',`position:absolute;left:${x}px;top:270px;width:132px;height:132px;margin:-66px 0 0 -66px;border-radius:66px;background:linear-gradient(150deg,rgba(255,255,255,.18),rgba(255,255,255,.06)),rgba(20,14,66,.8);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.4),0 20px 50px rgba(4,2,30,.55);display:flex;align-items:center;justify-content:center`,ic(i_,60,'#FFD36E',2.2)));
  return {t0:31.60,t1:33.55,root:r,update(lt){
    n.forEach((e,i)=>{const p=E.back(prog(lt,i*.08,.3+i*.08),1.6);const sh=prog(lt,.45,1.2)<1?Math.sin(lt*22+i*2)*(1-prog(lt,.3,1.2))*3:0;st(e,{opacity:clamp(p*3),transform:`translate(${sh}px,0) scale(${lerp(.6,1,p)})`})});
    [0,1,2].forEach(i=>{const l=r.querySelector('#dl'+i);l.style.strokeDashoffset=130*(1-E.out3(prog(lt,1.15+i*.1,1.5+i*.1)));r.querySelector('#dg'+i).style.opacity=1-prog(lt,1.1,1.5);});
    st(r,{opacity:1-prog(lt,1.8,1.95)});
  }};
}
function overlayBigIdea(){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const tag=mk(r,'tag','position:absolute;left:540px;top:250px;transform:translate(-50%,-50%);white-space:nowrap;font-size:30px;padding:18px 40px','THE BIG IDEA');
  const lock=mk(r,'','position:absolute;left:540px;top:250px;transform:translate(-50%,-50%);display:flex;align-items:center;gap:22px;white-space:nowrap');
  lock.innerHTML=`<div style="filter:drop-shadow(0 0 28px rgba(255,160,60,.7))">${starSVG(112)}</div><div class="gtext" style="font-family:Unb;font-weight:800;font-size:120px;letter-spacing:-.02em;line-height:1;filter:drop-shadow(0 6px 0 rgba(110,30,6,.4)) drop-shadow(0 0 34px rgba(255,140,60,.45))">Tara ERP</div>`;
  return {t0:36.05,t1:39.20,root:r,update(lt){
    const a=E.back(prog(lt,0,.3),1.6),swap=prog(lt,1.85,1.97);
    st(tag,{opacity:clamp(a*3)*(1-swap),transform:`translate(-50%,-50%) scale(${lerp(.6,1,a)})`});
    const b=E.out4(prog(lt,1.88,2.2));
    st(lock,{opacity:clamp(b*3),transform:`translate(-50%,-50%) scale(${lerp(2.0,1,b)}) rotate(${lerp(-6,0,b)}deg)`,filter:`blur(${(1-b)*10}px)`});
    st(r,{opacity:1-prog(lt,3.0,3.15)});
  }};
}
function overlayCTA(){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const sc=mk(r,'','position:absolute;left:0;top:0;width:1080px;height:520px;perspective:1100px');
  const bub=mk(sc,'','position:absolute;left:210px;top:140px;width:260px;height:190px;transform-style:preserve-3d');
  bub.innerHTML=`<div style="position:absolute;inset:0;border-radius:62px;background:var(--gold);box-shadow:inset 0 4px 0 rgba(255,255,255,.7),inset 0 -10px 0 rgba(200,70,20,.35),0 30px 60px rgba(4,2,30,.6),0 0 60px rgba(255,150,60,.5)"></div><div style="position:absolute;left:34px;bottom:-30px;width:60px;height:60px;background:#FF8A3D;border-radius:8px;transform:rotate(45deg) skew(8deg,8deg)"></div><div id="dots" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:20px"><i style="display:block;width:30px;height:30px;border-radius:15px;background:#1a1033"></i><i style="display:block;width:30px;height:30px;border-radius:15px;background:#1a1033"></i><i style="display:block;width:30px;height:30px;border-radius:15px;background:#1a1033"></i></div>`;
  const dots=bub.querySelectorAll('#dots i');
  const pill=mk(r,'','position:absolute;left:760px;top:235px;transform:translate(-50%,-50%);white-space:nowrap;display:flex;align-items:center;gap:16px;padding:20px 38px;border-radius:999px;background:linear-gradient(150deg,rgba(255,255,255,.2),rgba(255,255,255,.07)),rgba(20,14,66,.82);box-shadow:inset 0 1.5px 0 rgba(255,255,255,.4),inset 0 0 0 1.5px rgba(255,255,255,.14),0 24px 60px rgba(4,2,30,.55);font-family:Unb;font-weight:700;font-size:28px;letter-spacing:.1em');
  return {t0:39.40,t1:44.10,root:r,update(lt){
    const a=E.back(prog(lt,0,.4),1.5);
    st(bub,{opacity:clamp(a*3),transform:`translateZ(0) rotateY(${Math.sin(lt*2.1)*24}deg) rotateX(${Math.cos(lt*1.7)*8}deg) scale(${lerp(.5,1,a)})`});
    dots.forEach((d,i)=>{const y=Math.sin(lt*7-i*.9);d.style.transform=`translateY(${-Math.max(0,y)*14}px)`});
    const p1=E.back(prog(lt,2.1,2.4),1.5), swap=lt>=3.15;
    pill.innerHTML=swap?`${ic('check',36,'#FFD36E',3.4)}We’ll contact you`:`${ic('comment',36,'#FFD36E',2.4)}Comment below`;
    const pop=swap?E.back(prog(lt,3.15,3.45),1.6):p1;
    st(pill,{opacity:clamp(pop*3),transform:`translate(-50%,-50%) scale(${lerp(.7,1,pop)})`});
  }};
}
function overlayRing(){
  const r=mk(FX(),'hide','position:absolute;left:0;top:0;width:1080px;height:1920px');
  const ring=mk(r,'','position:absolute;border-radius:50%;border:5px solid rgba(255,255,255,.92);box-shadow:0 0 40px rgba(255,200,120,.55),inset 0 0 40px rgba(255,200,120,.25)');
  return {t0:3.55,t1:4.30,root:r,update(lt){
    const z=1+punchAmt(lt+3.55,3.55,.30,.45);const rad=330*z;
    st(ring,{left:(540-rad)+'px',top:(790-rad)+'px',width:rad*2+'px',height:rad*2+'px',opacity:1-prog(lt,.45,.75)});
  }};
}
// light flashes + stripe glitch
function makeFlashes(list){
  const el=mk(FX(),'flash hide','background:radial-gradient(circle at 50% 58%,#fff 0%,#FFE9BF 34%,rgba(255,150,70,.65) 72%,rgba(255,120,60,.25) 100%);mix-blend-mode:normal');
  const stripes=mk(FX(),'flash hide','background:repeating-linear-gradient(90deg,#fff 0 7px,transparent 7px 14px)');
  const wash=mk(FX(),'flash hide','background:linear-gradient(180deg,#fff,#FFD9A0)');
  return t=>{
    let o=0;
    list.forEach(([tc,k])=>{const d=t-tc;const a=d<0?prog(d,-.07,0):1-prog(d,0,.14);o=Math.max(o,(d>-.07&&d<.14)?a*k:0)});
    el.classList.toggle('hide',o<=0.005);el.style.opacity=o;
    // venetian stripe glitch at the "But in Tara" pivot
    const sd=t-21.0;const so=(sd>0&&sd<.27)?Math.sin(Math.PI*sd/.27):0;
    stripes.classList.toggle('hide',so<=0.01);stripes.style.opacity=so*.95;
    wash.classList.toggle('hide',so<=0.01);wash.style.opacity=so*.55;
    wash.style.zIndex=1;stripes.style.zIndex=2;
  };
}
function punchAmt(t,t0,amp,dur){const d=(t-t0)/dur;return(d<0||d>1)?0:amp*Math.pow(1-d,2)}
