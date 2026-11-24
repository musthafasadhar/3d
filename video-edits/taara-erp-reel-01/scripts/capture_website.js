const { chromium } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('https://www.taaraerp.com/', { waitUntil: 'networkidle', timeout: 60000 });
  // scroll through to trigger lazy animations
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 400) { await p.evaluate(y => window.scrollTo(0, y), y); await p.waitForTimeout(250); }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/desktop_full.png', fullPage: true });
  await p.screenshot({ path: out + '/desktop_hero.png' });
  const txt = await p.evaluate(() => document.body.innerText);
  require('fs').writeFileSync(out + '/text.txt', txt);
  const meta = await p.evaluate(() => ({ title: document.title, h: document.body.scrollHeight,
     fonts: [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,button')].map(e => getComputedStyle(e).fontFamily))].slice(0,8),
     colors: [...new Set([...document.querySelectorAll('h1,h2,button,a')].map(e => getComputedStyle(e).color + ' | ' + getComputedStyle(e).backgroundColor + ' | ' + getComputedStyle(e).backgroundImage.slice(0,120)))].slice(0,25) }));
  console.log(JSON.stringify(meta, null, 1));
  const m = await b.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, isMobile: true });
  await m.goto('https://www.taaraerp.com/', { waitUntil: 'networkidle', timeout: 60000 });
  const H2 = await m.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H2; y += 400) { await m.evaluate(y => window.scrollTo(0, y), y); await m.waitForTimeout(200); }
  await m.evaluate(() => window.scrollTo(0, 0)); await m.waitForTimeout(1500);
  await m.screenshot({ path: out + '/mobile_full.png', fullPage: true });
  await b.close();
})();
