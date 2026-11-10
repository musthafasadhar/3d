// Frame-exact renderer: node render.mjs [--scenes 1,3] [--fps 30] [--clean] [--nochars] [--stills] [--out out]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const FPS = Number(opt('fps', 30));
const CLEAN = !!opt('clean', false);
const NOCHARS = !!opt('nochars', false);
const STILLS = !!opt('stills', false);
const OUT = path.resolve(ROOT, opt('out', 'out'));
const PICK = opt('scenes', null);
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
const q = `render=1${CLEAN ? '&text=0' : ''}${NOCHARS ? '&chars=0' : ''}`;
await page.goto(`http://127.0.0.1:${port}/index.html?${q}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
const scenes = await page.evaluate(() => window.SCENES);
const list = PICK ? String(PICK).split(',').map((n) => Number(n) - 1) : scenes.map((_, i) => i);
const suffix = CLEAN ? '-clean' : '';

for (const i of list) {
  const s = scenes[i];
  if (STILLS) {
    const TIMES = opt('times', null);
    for (const t of (TIMES ? String(TIMES).split(',').map(Number) : [0.5, s.dur * 0.35, s.dur * 0.6, s.dur - 0.3])) {
      await page.evaluate(([i, t]) => window.renderFrame(i, t), [i, t]);
      await page.screenshot({ path: path.join(OUT, `still-${s.id}-${t.toFixed(1)}${suffix}.jpg`), type: 'jpeg', quality: 80 });
    }
    console.log('stills', s.id);
    continue;
  }
  const file = path.join(OUT, `${s.id}${suffix}.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(s.dur * FPS);
  const t0 = Date.now();
  for (let f = 0; f < frames; f++) {
    await page.evaluate(([i, t]) => window.renderFrame(i, t), [i, f / FPS]);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 30 === 0) process.stdout.write(`\r${s.id}: ${f}/${frames} (${((Date.now() - t0) / (f + 1)).toFixed(0)} ms/frame)   `);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  console.log(`\n✔ ${file}`);
}

await browser.close();
server.close();
