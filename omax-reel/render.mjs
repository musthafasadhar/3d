// Render scenes to 1080x1920 MP4 (H.264, 30fps) using headless Chromium + ffmpeg.
//
//   node render.mjs                     # all scenes, text + clean versions
//   node render.mjs s1 s4               # only some scenes
//   node render.mjs --still 2.5 s1      # quick PNG still at t=2.5s (with safe-zone guide)
//   node render.mjs --clean-only s2     # only the version without text
//
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');
const FPS = 30;
const ALL = ['s1', 's2', 's3', 's4', 's5', 's6'];

const args = process.argv.slice(2);
let still = null, cleanOnly = false, textOnly = false;
const scenes = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--still') still = parseFloat(args[++i]);
  else if (args[i] === '--clean-only') cleanOnly = true;
  else if (args[i] === '--text-only') textOnly = true;
  else scenes.push(args[i]);
}
if (!scenes.length) scenes.push(...ALL);
fs.mkdirSync(OUT, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.woff': 'font/woff', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));

async function load(scene, text, guide = false, t = 0) {
  await page.goto(`http://localhost:${port}/index.html?scene=${scene}&text=${text ? 1 : 0}&guide=${guide ? 1 : 0}&t=${t}`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
}

for (const scene of scenes) {
  if (still != null) {
    await load(scene, true, true, still);
    const f = path.join(OUT, `${scene}_t${still}.png`);
    await page.locator('#wrap').screenshot({ path: f });
    console.log('still ->', f);
    continue;
  }
  const variants = cleanOnly ? [false] : textOnly ? [true] : [true, false];
  for (const text of variants) {
    await load(scene, text);
    const dur = await page.evaluate(() => window.DURATION);
    const frames = Math.round(dur * FPS);
    const file = path.join(OUT, `${scene}_${text ? 'text' : 'clean'}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', file], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.renderAt(t), i / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 }); // viewport == 1080x1920 frame
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 30 === 0) process.stdout.write(`\r${scene} ${text ? 'text ' : 'clean'} ${i}/${frames}`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log(`\r${scene} ${text ? 'text ' : 'clean'} done in ${((Date.now() - t0) / 1000).toFixed(0)}s -> ${path.relative(ROOT, file)}`);
  }
}
await browser.close();
server.close();
