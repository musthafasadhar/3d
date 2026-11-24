// Renders the motion-graphics layers frame by frame (deterministic, 1080x1920, transparent PNG).
// usage: node render_overlays.js timeline.json outDir [frame,frame,...]   (no list = all frames)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [tlPath, outDir, list] = process.argv.slice(2);
  const tl = JSON.parse(fs.readFileSync(tlPath, 'utf8'));
  for (const d of ['over', 'behind', 'under']) fs.mkdirSync(path.join(outDir, d), { recursive: true });
  const frames = list ? list.split(',').map(Number) : tl.frames.map(f => f.i);
  const WORKERS = list ? 1 : 3;
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--force-color-profile=srgb'] });
  const html = 'file://' + path.resolve(__dirname, 'overlay.html');
  const behindIds = tl.caps.filter(c => c.behind);
  const jobs = [];
  for (const i of frames) {
    const f = tl.frames[i];
    const subs = f.blur > 1 ? Array.from({ length: f.blur }, (_, k) => -0.25 + 0.5 * k / (f.blur - 1)) : [0];
    subs.forEach((s, k) => jobs.push({ i, layer: 'over', sub: s, name: f.blur > 1 ? `${String(i).padStart(5, '0')}_${k}` : String(i).padStart(5, '0') }));
    if (behindIds.some(c => f.t >= c.start && f.t < c.end)) jobs.push({ i, layer: 'behind', sub: 0, name: String(i).padStart(5, '0') });
    if (f.card) jobs.push({ i, layer: 'under', sub: 0, name: String(i).padStart(5, '0') });
  }
  let next = 0, done = 0; const t0 = Date.now();
  async function worker() {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await page.goto(html);
    await page.evaluate(async tl => await window.init(tl), tl);
    while (next < jobs.length) {
      const j = jobs[next++];
      await page.evaluate(({ i, layer, sub }) => window.render(i, layer, sub), j);
      await page.screenshot({ path: path.join(outDir, j.layer, j.name + '.png'), omitBackground: true });
      if (++done % 100 === 0) console.log(`${done}/${jobs.length}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    await page.close();
  }
  await Promise.all(Array.from({ length: WORKERS }, worker));
  await browser.close();
  console.log('done', jobs.length, 'images');
})();
