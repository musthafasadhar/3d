const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await (await b.newContext({viewport:{width:1080,height:1920}})).newPage();
 await p.goto('http://127.0.0.1:8765/'+(process.env.PAGE||'index.html?headtop=486')+'',{waitUntil:'networkidle'}); await p.waitForFunction(()=>window.READY===true);
 console.log(JSON.stringify(await p.evaluate(()=>window.capEvents()))); await b.close(); })();
