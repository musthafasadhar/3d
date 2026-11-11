// Renders storyboard stills: node reels/render-stills.mjs <page> <outDir> shot1 shot2 ...
// Run from the repo root (the page imports /characters/... modules).
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = resolve('.');
const [page, outDir, ...shots] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT)) throw new Error('forbidden');
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('pageerror', (e) => console.error('pageerror', e.message));
await pg.goto(`http://localhost:${server.address().port}/${page}`);
await pg.waitForFunction('window.ready === true', null, { timeout: 60000 });
for (const s of shots) {
  await pg.evaluate((s) => window.renderShot(s), s);
  await pg.waitForTimeout(300);
  await pg.screenshot({ path: join(outDir, s + '.png') });
  process.stdout.write(s + ' ');
}
await browser.close(); server.close();
console.log('\ndone');
