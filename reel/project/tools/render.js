const { chromium } = require('playwright');
const fs = require('fs');
// usage: node render.js OUTDIR FPS f0 f1 [step] [workers] [frameList]
const [OUT, FPS, F0, F1, STEP='1', WK='4', LIST=''] = process.argv.slice(2);
const fps=+FPS; let frames=[];
if (LIST) frames = LIST.split(',').map(Number); else for (let f=+F0; f<=+F1; f+=+STEP) frames.push(f);
for (const L of ['front','back','behind']) fs.mkdirSync(`${OUT}/${L}`, { recursive: true });
(async () => {
  const b = await chromium.launch();
  const nW = Math.min(+WK, frames.length);
  const chunks = [...Array(nW)].map((_, i) => frames.filter((_, j) => j % nW === i));
  await Promise.all(chunks.map(async (ch) => {
    const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })).newPage();
    await p.goto('http://127.0.0.1:8765/index.html?headtop=486', { waitUntil: 'networkidle' });
    await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    for (const f of ch) {
      const t = f / fps; const layers = await p.evaluate(t => window.layersAt(t), t);
      for (const L of layers) {
        await p.evaluate(([t, L]) => window.renderFrame(t, L), [t, L]);
        await p.screenshot({ path: `${OUT}/${L}/${String(f).padStart(5, '0')}.png`, omitBackground: true });
      }
    }
  }));
  await b.close(); console.log('rendered', frames.length);
})();
