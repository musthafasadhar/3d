// usage: node render.js out.mp4 [start] [end] [fps]  |  node render.js --stills t1,t2,...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
(async () => {
  const args = process.argv.slice(2);
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  pg.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await pg.goto('file://' + path.join(__dirname, 'broll.html'));
  await pg.evaluate(async src => { await document.fonts.load('900 100px "Inter Display"'); await document.fonts.load('800 50px "Inter Display"'); await window.setAvatar(src); },
    'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'assets/avatar.png')).toString('base64'));
  const grab = async t => Buffer.from(await pg.evaluate(t => { renderFrame(t); return document.getElementById('c').toDataURL('image/jpeg', .96).split(',')[1]; }, t), 'base64');
  if (args[0] === '--stills') {
    fs.mkdirSync('stills', { recursive: true });
    for (const t of args[1].split(',').map(Number)) fs.writeFileSync(`stills/t${t.toFixed(2)}.jpg`, await grab(t));
  } else {
    const out = args[0], st = +(args[1] ?? 0), en = +(args[2] ?? 35), fps = +(args[3] ?? 30);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((en - st) * fps);
    for (let i = 0; i < n; i++) { const buf = await grab(st + i / fps); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 150 === 0) console.log('frame', i, '/', n); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
