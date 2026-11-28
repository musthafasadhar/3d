const CAP_Y=1292;                 // baseline centre of the keyword row
const KEY_MAX_W=940, KEY_MAX_PX=178, KEY_MIN_PX=84, SMALL_PX=54;
let CARDS=[];
function buildCards(data){
  const host=document.getElementById('cards');
  // measuring helper
  const meas=document.createElement('span');meas.className='key';meas.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:100px;font-weight:800;letter-spacing:-.035em';host.appendChild(meas);
  const pm=document.createElement('span');pm.className='pre';pm.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font-size:'+SMALL_PX+'px;font-weight:700';host.appendChild(pm);
  data.forEach((c,ci)=>{
    const el=mk(host,'card hide');
    const keyW=c.words.filter(w=>w.row==='key'), preW=c.words.filter(w=>w.row==='pre'), postW=c.words.filter(w=>w.row==='post');
    const keyTxt=keyW.map(w=>w.w).join(' ');
    meas.textContent=keyTxt; const w100=meas.getBoundingClientRect().width||1;
    let px=Math.min(KEY_MAX_PX,Math.max(KEY_MIN_PX,100*KEY_MAX_W/w100));
    const keyWs=keyW.map(w=>w.w);
    for(let it=0;it<5;it++){
      meas.style.fontSize=px+'px';
      const ws=keyWs.map(t=>{meas.textContent=t;return meas.getBoundingClientRect().width});
      const total=ws.reduce((x,y)=>x+y,0)+px*0.30*Math.max(0,ws.length-1);
      if(total<=KEY_MAX_W+1)break;
      px=Math.max(KEY_MIN_PX,px*KEY_MAX_W/total);
    }
    const keyH=px*0.78;
    const rows={pre:CAP_Y-keyH/2-SMALL_PX*0.95, key:CAP_Y, post:CAP_Y+keyH/2+SMALL_PX*0.95};
    const wordEls=[];
    ['pre','key','post'].forEach(row=>{
      const ws=c.words.filter(w=>w.row===row); if(!ws.length)return;
      const size=row==='key'?px:SMALL_PX;
      // lay words of the row centred; measure each
      const widths=ws.map(w=>{ (row==='key'?meas:pm).style.fontSize=size+'px'; (row==='key'?meas:pm).textContent=w.w; return (row==='key'?meas:pm).getBoundingClientRect().width;});
      const gap=size*(row==='key'?0.30:0.30); const total=widths.reduce((a,b)=>a+b,0)+gap*(ws.length-1);
      let x=540-total/2;
      ws.forEach((w,i)=>{
        const s=mk(el,'cw '+(row==='key'?'key':row),`font-size:${size}px;left:${x+widths[i]/2}px;top:${rows[row]-size*0.5}px;`,w.w);
        s.dataset.t=w.t; s.dataset.w=widths[i]; wordEls.push({el:s,t:w.t,row,x,wd:widths[i],size});
        x+=widths[i]+gap;
      });
    });
    // pre/post rows: slight stagger offsets like the reference (not all on one baseline)
    CARDS.push({c,el,wordEls,px,keyTxt,rows});
  });
  meas.remove();pm.remove();
}
function renderCaptions(t){
  CARDS.forEach(k=>{
    const on=t>=k.c.t0&&t<k.c.t1+0.02;
    k.el.classList.toggle('hide',!on);
    if(!on)return;
    k.wordEls.forEach(w=>{
      const p=prog(t,w.t,w.t+(w.row==='key'?0.20:0.14));
      const e=w.row==='key'?E.back(p,2.0):E.out3(p);
      const s=lerp(w.row==='key'?0.78:0.9,1,e);
      const dy=(1-E.out3(p))*(w.row==='key'?26:14);
      let ls='';
      if(w.row==='key'&&k.c.fx==='spread') ls=`${lerp(-0.035,0.10,E.inout(prog(t,w.t,w.t+0.9)))}em`;
      if(w.row==='key'&&k.c.fx==='tight') ls=`${lerp(0.06,-0.045,E.out3(prog(t,w.t,w.t+0.35)))}em`;
      if(ls) w.el.style.letterSpacing=ls;
      w.el.style.opacity=clamp(p*2.6);
      w.el.style.transform=`translate(-50%,${dy}px) scale(${s})`;
    });
  });
}
