const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [,,listf,outdir,wk,nw]=process.argv;const fr=fs.readFileSync(listf,'utf8').split(',').map(Number).filter((x,i)=>i%(+nw)===(+wk));
 const br=await chromium.launch({args:['--no-sandbox','--disable-gpu']});const pg=await br.newPage({viewport:{width:1080,height:1920}});
 await pg.goto('http://127.0.0.1:8765/gfx/index.html');await pg.waitForFunction('window.READY===true');
 for(const f of fr){await pg.evaluate(t=>render(t),f/30);await pg.screenshot({path:`${outdir}/f_${String(f).padStart(5,'0')}.png`,omitBackground:true});}
 console.log('done',fr.length);await br.close();})();
