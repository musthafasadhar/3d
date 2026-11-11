// Renders the character reference set with headless Chromium (Playwright).
// Usage: node render-turnaround.mjs <character-dir> [--spin]
// Output: <dir>/views/*.png, <dir>/views/spin/*.png (with --spin)
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = resolve('.');
const dir = process.argv[2] || 'host-male';
const doSpin = process.argv.includes('--spin');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };

const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(ROOT)) throw new Error('forbidden');
    res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const port = server.address().port;

// name, view params, size
const FULL = { w: 900, h: 1350 };
const VIEWS = [
  ['01_front', { az: 0 }],
  ['02_front_3q_left', { az: 45 }],
  ['03_side_left', { az: 90 }],
  ['04_back_3q_left', { az: 135 }],
  ['05_back', { az: 180 }],
  ['06_back_3q_right', { az: 225 }],
  ['07_side_right', { az: 270 }],
  ['08_front_3q_right', { az: 315 }],
  ['09_top', { az: 20, el: 72, dist: 15 }],
  ['10_low_angle', { az: 20, el: -14, dist: 13, targetY: 2.4 }],
  ['11_face_front', { az: 0, el: 2, dist: 6.5, targetY: 3.3, fov: 30 }],
  ['12_face_3q', { az: 35, el: 4, dist: 6.5, targetY: 3.3, fov: 30 }],
  ['13_face_side', { az: 90, el: 2, dist: 6.5, targetY: 3.3, fov: 30 }],
  ['14_face_back', { az: 180, el: 6, dist: 6.5, targetY: 3.3, fov: 30 }],
];
const HERO = { w: 720, h: 1280 };

const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
async function shoot(size, list, outDir) {
  await mkdir(outDir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: size.w, height: size.h } });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => m.type() === 'error' && console.error('console', m.text()));
  await page.goto(`http://localhost:${port}/${dir}/turnaround.html`);
  await page.waitForFunction('window.ready === true', null, { timeout: 30000 });
  for (const [name, v] of list) {
    await page.evaluate((v) => window.renderView(v), v);
    await page.locator('canvas').screenshot({ path: join(outDir, name + '.png') });
    process.stdout.write('.');
  }
  await page.close();
}

const out = join(dir, 'views');
await shoot(FULL, VIEWS, out);
// Close-up in the reference reel's framing + dusk lighting
await shoot(HERO, [
  ['00_hero_reel_closeup', { az: 4, el: 2, dist: 6.3, targetY: 3.05, mode: 'dusk', fov: 34 }],
  ['00_hero_reel_wide', { az: 12, el: 4, dist: 12, targetY: 2.5, mode: 'dusk', fov: 34 }],
], out);
if (doSpin) {
  const frames = [];
  for (let i = 0; i < 120; i++) frames.push([`f${String(i).padStart(4, '0')}`, { az: i * 3 }]);
  await shoot({ w: 720, h: 1080 }, frames, join(out, 'spin'));
}
await browser.close();
server.close();
console.log('\ndone');
