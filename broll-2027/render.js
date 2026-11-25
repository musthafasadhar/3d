// Renders scenes to MP4 (H.264, 1920x1080, 30fps) using headless Chromium + ffmpeg.
// usage: node render.js                 -> all scenes
//        node render.js 05 11           -> scenes whose id starts with 05 / 11
//        node render.js --stills 05     -> PNG stills at 25/50/75/95% for review
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'out');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2' };

const args = process.argv.slice(2);
const stills = args.includes('--stills');
const filters = args.filter(a => !a.startsWith('--'));

const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e));
  await page.goto(`http://localhost:${port}/index.html`);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  let list = await page.evaluate(() => window.SCENE_LIST);
  if (filters.length) list = list.filter(s => filters.some(f => s.id.startsWith(f)));
  fs.mkdirSync(stills ? path.join(OUT, 'stills') : OUT, { recursive: true });

  for (const { id, dur } of list) {
    const n = Math.round(dur * 30);
    const t0 = Date.now();
    if (stills) {
      for (const k of [0.25, 0.5, 0.75, 0.97]) {
        const f = Math.floor(n * k);
        const b64 = await page.evaluate(([id, f]) => frameJPEG(id, f), [id, f]);
        fs.writeFileSync(path.join(OUT, 'stills', `${id}_${String(f).padStart(3, '0')}.jpg`), Buffer.from(b64, 'base64'));
      }
      console.log('stills', id);
      continue;
    }
    const file = path.join(OUT, `${id}.mp4`);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', file]);
    ff.stderr.on('data', d => process.stderr.write(d));
    const done = new Promise(r => ff.on('close', r));
    for (let f = 0; f < n; f++) {
      const b64 = await page.evaluate(([id, f]) => frameJPEG(id, f), [id, f]);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end(); await done;
    console.log(`${id}.mp4  ${dur}s  ${(fs.statSync(file).size / 1e6).toFixed(1)} MB  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  await browser.close(); server.close();
})();
