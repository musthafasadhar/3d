// Renders the film frame-by-frame with headless Chromium + ffmpeg.
// Usage:
//   node render.js stills out_dir 1.5 5.2 ...      -> PNG stills at given seconds
//   node render.js video out.mp4 [fps=60] [workers=4]  -> silent video
//   node render.js cues cues.json                  -> SFX cue sheet from the timeline
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const URL = 'file://' + path.join(__dirname, 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await page.goto(URL);
  await page.waitForFunction(() => window.READY || window.BUILD_ERROR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.BUILD_ERROR);
  if (err) throw new Error(err);
  return page;
}

async function stills(outDir, times) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await openPage(browser);
  for (const t of times) {
    await page.evaluate((t) => window.renderFrame(Math.round(t * 60), 60), t);
    await page.screenshot({ path: path.join(outDir, `t_${t.toFixed(2).padStart(6, '0')}.png`) });
  }
  await browser.close();
}

async function video(out, fps, workers) {
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const probe = await openPage(browser);
  const dur = await probe.evaluate(() => window.FILM.DURATION);
  await probe.close();
  const total = Math.round(dur * fps);
  const per = Math.ceil(total / workers);
  const segs = [];
  const t0 = Date.now();
  let done = 0;
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const a = w * per, b = Math.min(total, a + per);
    if (a >= b) return;
    const seg = out.replace(/\.mp4$/, `.part${w}.mp4`);
    segs[w] = seg;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-tune', 'grain',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-g', String(fps), seg], { stdio: ['pipe', 'inherit', 'inherit'] });
    const page = await openPage(browser);
    for (let f = a; f < b; f++) {
      await page.evaluate(([f, fps]) => window.renderFrame(f, fps), [f, fps]);
      const buf = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      done++;
      if (done % 200 === 0) console.log(`${done}/${total} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    await page.close();
  }));
  await browser.close();
  const list = out + '.txt';
  fs.writeFileSync(list, segs.filter(Boolean).map((s) => `file '${path.resolve(s)}'`).join('\n'));
  await new Promise((res, rej) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], { stdio: 'inherit' })
    .on('close', (c) => (c ? rej(new Error('concat failed')) : res())));
  segs.filter(Boolean).forEach((s) => fs.unlinkSync(s)); fs.unlinkSync(list);
  console.log(`video done: ${out} (${total} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}

async function cues(out) {
  const browser = await chromium.launch();
  const page = await openPage(browser);
  const data = await page.evaluate(() => ({ duration: window.FILM.DURATION, cues: window.FILM.CUES.slice().sort((a, b) => a.t - b.t) }));
  fs.writeFileSync(out, JSON.stringify(data, null, 1));
  console.log(`${data.cues.length} cues -> ${out}`);
  await browser.close();
}

(async () => {
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === 'stills') await stills(rest[0], rest.slice(1).map(Number));
  else if (mode === 'video') await video(rest[0], Number(rest[1] || 60), Number(rest[2] || 4));
  else if (mode === 'cues') await cues(rest[0]);
  else console.log('modes: stills | video | cues');
})().catch((e) => { console.error(e); process.exit(1); });
