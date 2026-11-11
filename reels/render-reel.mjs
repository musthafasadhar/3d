// Renders every frame of a reel page (window.renderFrame(n)) with headless Chromium.
// Usage (repo root): node reels/render-reel.mjs <page> <outDir> <workers> [from] [to]
// Frames are written as outDir/f00000.jpg (q95). Already-rendered frames are skipped,
// so an interrupted render can simply be restarted.
import { createServer } from 'node:http';
import { readFile, mkdir, access } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = resolve('.');
const [page, outDir, workersArg, fromArg, toArg] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT)) throw new Error('forbidden');
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const url = `http://localhost:${server.address().port}/${page}`;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function openPage() {
  const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', (e) => console.error('pageerror', e.message));
  await pg.goto(url);
  await pg.waitForFunction('window.ready === true', null, { timeout: 120000 });
  return pg;
}
const probe = await openPage();
const total = await probe.evaluate(() => window.TOTAL_FRAMES);
await probe.close();
const from = fromArg ? +fromArg : 0, to = toArg ? +toArg : total;
const W = +workersArg || 2;
const exists = async (f) => access(f).then(() => true, () => false);
let next = from, done = 0;
const t0 = Date.now();
async function worker() {
  const pg = await openPage();
  for (;;) {
    const n = next++;
    if (n >= to) break;
    const file = join(outDir, `f${String(n).padStart(5, '0')}.jpg`);
    if (await exists(file)) { done++; continue; }
    await pg.evaluate((n) => window.renderFrame(n), n);
    await pg.screenshot({ path: file, type: 'jpeg', quality: 95 });
    done++;
    if (done % 50 === 0) {
      const s = (Date.now() - t0) / 1000;
      console.log(`${done}/${to - from} frames  ${(s / done).toFixed(2)} s/frame  ETA ${((to - from - done) * s / done / 60).toFixed(1)} min`);
    }
  }
  await pg.close();
}
await Promise.all(Array.from({ length: W }, worker));
await browser.close(); server.close();
console.log(`done ${to - from} frames in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
