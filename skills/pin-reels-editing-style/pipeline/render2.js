const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
  const [,,mode,a,b,outdir,wk,nw]=process.argv;fs.mkdirSync(outdir,{recursive:true});
  const br=await chromium.launch({args:['--no-sandbox','--disable-gpu','--force-device-scale-factor=1']});
  const pg=await br.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  pg.on('pageerror',e=>console.log('PAGEERR',e.message));pg.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
  await pg.goto('http://127.0.0.1:8765/gfx2/index.html');await pg.waitForFunction('window.READY===true',{timeout:30000});await pg.evaluate(()=>document.fonts.ready);
  let times=[];
  if(mode==='list')times=a.split(',').map(Number);
  else if(mode==='frames'){times=a.split(',').map(Number).filter((x,i)=>i%(+nw||1)===(+wk||0))}
  else{for(let f=+a+(+wk||0);f<+b;f+=(+nw||1))times.push(f)}
  const t0=Date.now();
  for(const x of times){const t=(mode==='list')?x:x/30;
    await pg.evaluate(async t=>{render(t);await window.waitImg()},t);
    const name=(mode==='list')?`t_${x.toFixed(2)}.png`:`f_${String(x).padStart(5,'0')}.png`;
    await pg.screenshot({path:`${outdir}/${name}`,type:'png'});}
  console.log('done',times.length,'in',((Date.now()-t0)/1000).toFixed(1),'s');await br.close();
})();
