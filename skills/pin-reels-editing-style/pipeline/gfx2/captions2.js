const KEY_MAX_W=960;
let CARDS=[],THEMES=[];
function themeAt(t){for(const [a,b,k] of THEMES){if(t>=a-0.02&&t<b+0.02)return k}return 'spk'}
function buildCards(data){
  const host=document.getElementById('cards');
  const shade=mk(host,'','position:absolute;left:0;top:0;width:1080px;height:1920px;background:radial-gradient(ellipse 640px 270px at 540px 1478px,rgba(34,18,8,.36),rgba(34,18,8,0) 74%);opacity:0');shade.id='shade';
  const meas=document.createElement('span');meas.className='key';meas.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;font-weight:800;letter-spacing:-.055em;background:none;color:#000';host.appendChild(meas);
  const pm=document.createElement('span');pm.className='pre';pm.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-weight:800;letter-spacing:-.025em';host.appendChild(pm);
  data.forEach(c=>{
    const th=themeAt((c.t0+c.t1)/2);
    const hero=c.words.some(w=>w.row==='key'&&w.w==='biggest');
    const logo=c.words.some(w=>w.row==='key'&&w.w==='Taara')&&c.words.some(w=>w.w==='ERP.');
    const top=(th!=='spk')||hero;
    const el=mk(host,'card hide');
    const keyW=c.words.filter(w=>w.row==='key');
    const keyMax=top?(hero?230:215):205, keyMin=84;
    meas.textContent=keyW.map(w=>w.w).join(' ');meas.style.fontSize='100px';
    let px=Math.min(keyMax,Math.max(keyMin,100*KEY_MAX_W/(meas.getBoundingClientRect().width||1)));
    for(let it=0;it<5;it++){meas.style.fontSize=px+'px';const ws=keyW.map(w=>{meas.textContent=w.w;return meas.getBoundingClientRect().width});const tot=ws.reduce((a,b)=>a+b,0)+px*0.27*Math.max(0,ws.length-1);if(tot<=KEY_MAX_W+1)break;px=Math.max(keyMin,px*KEY_MAX_W/tot)}
    const SMALL=top&&!hero?54:50;
    const rowY=top&&!hero?{pre:228,key:340,post:468}:hero?{pre:1452,key:330,post:1560}:{pre:1352,key:1462,post:1572};
    const kcls=th==='light'?'k-green':(hero?'k-white':(th==='dark'?'k-gold':'k-gold k-spk')), ccls=th==='light'?'c-light':(th==='dark'?'c-dark':'c-spk');
    const wordEls=[];
    ['pre','key','post'].forEach(row=>{
      const ws=c.words.filter(w=>w.row===row);if(!ws.length)return;
      if(row==='key'&&logo){
        const L=mk(el,'cw','left:540px;top:'+(rowY.key-80)+'px;width:600px;height:160px;border-radius:34px;background:#fff;box-shadow:0 22px 60px rgba(0,0,0,.30);display:flex;align-items:center;justify-content:center',`<img src="logo_taara.png" style="height:104px;display:block">`);
        wordEls.push({el:L,t:ws[0].t,row:'logo',wd:600,size:160});return;}
      const size=row==='key'?px:SMALL,mm=row==='key'?meas:pm;mm.style.fontSize=size+'px';
      const widths=ws.map(w=>{mm.textContent=w.w;return mm.getBoundingClientRect().width});
      const gap=size*(row==='key'?0.27:0.26),total=widths.reduce((a,b)=>a+b,0)+gap*(ws.length-1);let x=540-total/2;
      ws.forEach((w,i)=>{
        const s=mk(el,'cw '+(row==='key'?'key '+kcls:'pre '+ccls),`font-size:${size}px;left:${x+widths[i]/2}px;top:${rowY[row]-size*0.5}px;`,w.w);
        wordEls.push({el:s,t:w.t,row,wd:widths[i],size});x+=widths[i]+gap;});
    });
    if(hero){const eb=mk(el,'eyebrow c-dark','top:196px;color:#EDE9D0','<b></b>The big idea');wordEls.push({el:eb,t:c.t0,row:'eb'})}
    CARDS.push({c,el,wordEls,th,top,hero});
  });
  meas.remove();pm.remove();
}
function renderCaptions(t){
  let shadeOn=0;
  CARDS.forEach(k=>{
    const on=t>=k.c.t0&&t<k.c.t1+0.02;k.el.classList.toggle('hide',!on);if(!on)return;
    if(!k.top)shadeOn=1;
    k.wordEls.forEach(w=>{
      if(w.row==='key'){
        const p=prog(t,w.t,w.t+0.30),e=E.out3(p);
        const edge=lerp(-18,125,e);
        const mk_=`linear-gradient(90deg,#000 ${edge-14}%,rgba(0,0,0,0) ${edge+8}%)`;
        w.el.style.webkitMaskImage=p>=1?'none':mk_;w.el.style.maskImage=p>=1?'none':mk_;
        w.el.style.opacity=p>0?1:0;
        w.el.style.transform=`translate(-50%,${(1-e)*8}px) scale(${lerp(.97,1,e)})`;
      }else if(w.row==='logo'){
        const p=E.back(prog(t,w.t,w.t+.30),1.5);w.el.style.opacity=clamp(p*3);w.el.style.transform=`translate(-50%,0) scale(${lerp(.8,1,p)})`;
      }else if(w.row==='eb'){w.el.style.opacity=E.out3(prog(t,w.t,w.t+.25))}
      else{
        const p=E.out3(prog(t,w.t,w.t+0.14));
        w.el.style.opacity=p;w.el.style.transform=`translate(-50%,${(1-p)*10}px)`;
      }
    });
  });
  const sh=document.getElementById('shade');sh.style.opacity=shadeOn*(1-morphAt(t));
}
