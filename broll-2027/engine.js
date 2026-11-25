// Shared look + helpers for every b-roll scene.
// Everything is drawn on one 1920x1080 canvas as a pure function of (scene, frame),
// so renders are deterministic and frame-accurate.

const W = 1920, H = 1080, FPS = 30;

const COL = {
  bg: '#060607',
  card: '#0f0d0e',
  red: '#e3262e',
  redHot: '#ff4040',
  redDeep: '#5c0a0e',
  ink: '#f2ece3',
  mute: '#9a948d',
  dim: '#3b3636',
  amber: '#ffae42',
  manila: '#241d16',
};
const F = { head: 'Bebas', cond: 'Oswald', type: 'Elite', mono: 'Plex' };

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const P = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: t => 1 - Math.pow(1 - t, 3),
  in: t => t * t * t,
  inOut: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  back: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
};
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = n => rng(Math.floor(n * 7919) + 104729)();

// ---------- text ----------
function font(o) { return `${o.weight || ''} ${o.size || 40}px ${o.font || F.head}`.trim(); }
function txt(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = font(o);
  ctx.fillStyle = o.color || COL.ink;
  ctx.globalAlpha *= o.alpha ?? 1;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.letterSpacing = (o.track || 0) + 'px';
  if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowBlur || 40; }
  if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = o.lw || 2; ctx.strokeText(s, x, y); }
  else ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(ctx, s, o = {}) {
  ctx.save(); ctx.font = font(o); ctx.letterSpacing = (o.track || 0) + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// shrink font size until the string fits maxW
function fit(ctx, s, o, maxW) {
  let size = o.size;
  while (size > 10 && measure(ctx, s, { ...o, size }) > maxW) size -= 2;
  return { ...o, size };
}
// typewriter: chars visible at time t
function typed(s, t, start, cps = 30) {
  const n = Math.floor((t - start) * cps);
  return n <= 0 ? '' : s.slice(0, n);
}
function cursorOn(t) { return Math.floor(t * 2.2) % 2 === 0; }
// draw typed text with a blinking block cursor
function typeLine(ctx, s, x, y, t, start, cps, o = {}) {
  const shown = typed(s, t, start, cps);
  if (t < start) return;
  txt(ctx, shown, x, y, o);
  const done = shown.length >= s.length;
  if (!done || (o.keepCursor && cursorOn(t))) {
    const w = measure(ctx, shown, o);
    ctx.save(); ctx.globalAlpha *= o.alpha ?? 1;
    ctx.fillStyle = o.cursorColor || COL.red;
    ctx.fillRect(x + w + 6, y - (o.size || 40) * 0.72, (o.size || 40) * 0.45, (o.size || 40) * 0.8);
    ctx.restore();
  }
}
// two-tone line: parts = [[text, color], ...] centered or left
function multi(ctx, parts, x, y, o = {}) {
  const widths = parts.map(p => measure(ctx, p[0], o));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  parts.forEach((p, i) => { txt(ctx, p[0], cx, y, { ...o, align: 'left', color: p[1] }); cx += widths[i]; });
  return total;
}

// rubber stamp that slams in. p: 0..1 progress since slam start
function stamp(ctx, s, x, y, p, o = {}) {
  if (p <= 0) return;
  const size = o.size || 80;
  const sc = lerp(2.2, 1, E.out(clamp(p * 2.2)));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(((o.rot ?? -7) * Math.PI) / 180);
  ctx.scale(sc, sc);
  ctx.globalAlpha *= clamp(p * 5) * (o.alpha ?? 1);
  ctx.font = font({ size, font: F.head });
  ctx.letterSpacing = (o.track ?? 6) + 'px';
  const w = ctx.measureText(s).width;
  const pad = size * 0.28, h = size * 0.86;
  const col = o.color || COL.red;
  ctx.strokeStyle = col; ctx.lineWidth = o.lw || Math.max(3, size * 0.07);
  ctx.strokeRect(-w / 2 - pad, -h / 2 - pad * 0.7, w + pad * 2, h + pad * 1.4);
  ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s, 3, size * 0.06);
  // worn ink speckles
  const r = rng(o.seed || s.length * 131);
  ctx.fillStyle = o.under || COL.bg;
  for (let i = 0; i < 70; i++) {
    const sx = (r() - 0.5) * (w + pad * 2), sy = (r() - 0.5) * (h + pad * 1.4);
    ctx.globalAlpha = 0.55 * clamp(p * 5);
    ctx.beginPath(); ctx.arc(sx, sy, r() * size * 0.035 + 0.6, 0, 7); ctx.fill();
  }
  ctx.restore();
}

// ---------- backgrounds ----------
function bg(ctx, t, o = {}) {
  ctx.fillStyle = o.base || COL.bg; ctx.fillRect(0, 0, W, H);
  const gx = o.gx ?? W * 0.5, gy = o.gy ?? H * 0.55;
  const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, o.gr || W * 0.65);
  const a = (o.glow ?? 0.32) * (1 + 0.06 * Math.sin(t * 2.1));
  g.addColorStop(0, `rgba(140,14,22,${a})`);
  g.addColorStop(0.55, `rgba(70,6,10,${a * 0.35})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (o.grid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.028)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 64) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += 64) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
    ctx.stroke();
  }
}

// ---------- shapes ----------
// suited silhouette, y = feet
function personPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.arc(x, y - s * 0.885, s * 0.085, 0, Math.PI * 2);
  ctx.moveTo(x - s * 0.165, y - s * 0.43);
  ctx.quadraticCurveTo(x - s * 0.18, y - s * 0.77, x - s * 0.055, y - s * 0.785);
  ctx.lineTo(x + s * 0.055, y - s * 0.785);
  ctx.quadraticCurveTo(x + s * 0.18, y - s * 0.77, x + s * 0.165, y - s * 0.43);
  ctx.lineTo(x + s * 0.115, y - s * 0.43);
  ctx.lineTo(x + s * 0.1, y);
  ctx.lineTo(x + s * 0.018, y);
  ctx.lineTo(x, y - s * 0.38);
  ctx.lineTo(x - s * 0.018, y);
  ctx.lineTo(x - s * 0.1, y);
  ctx.lineTo(x - s * 0.115, y - s * 0.43);
  ctx.closePath();
}
function pine(ctx, x, y, h) {
  const w = h * 0.42;
  ctx.beginPath();
  ctx.moveTo(x, y - h);
  for (let i = 0; i < 4; i++) {
    const yy = y - h + (h * 0.85 * (i + 1)) / 4;
    const ww = (w * (i + 1)) / 4;
    ctx.lineTo(x + ww, yy);
    ctx.lineTo(x + ww * 0.45, yy);
  }
  ctx.lineTo(x + w * 0.08, y - h * 0.15); ctx.lineTo(x + w * 0.08, y);
  ctx.lineTo(x - w * 0.08, y); ctx.lineTo(x - w * 0.08, y - h * 0.15);
  for (let i = 3; i >= 0; i--) {
    const yy = y - h + (h * 0.85 * (i + 1)) / 4;
    const ww = (w * (i + 1)) / 4;
    ctx.lineTo(x - ww * 0.45, yy);
    ctx.lineTo(x - ww, yy);
  }
  ctx.closePath();
}
function triUp(ctx, x, y, s, col) {
  ctx.fillStyle = col; ctx.beginPath();
  ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.9, y + s * 0.5); ctx.lineTo(x - s * 0.9, y + s * 0.5); ctx.closePath(); ctx.fill();
}
function pulseRings(ctx, x, y, t, o = {}) {
  const n = o.n || 3, period = o.period || 1.6, maxR = o.r || 80;
  for (let i = 0; i < n; i++) {
    const ph = ((t / period) + i / n) % 1;
    ctx.beginPath(); ctx.arc(x, y, ph * maxR, 0, 7);
    ctx.strokeStyle = o.color || COL.red; ctx.globalAlpha = (1 - ph) * (o.alpha ?? 0.8);
    ctx.lineWidth = o.lw || 2; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(x, y, o.dot || 7, 0, 7); ctx.fillStyle = o.color || COL.red;
  ctx.shadowColor = o.color || COL.red; ctx.shadowBlur = 20; ctx.fill(); ctx.shadowBlur = 0;
}

// line icons (centered at x,y, size s)
const ICON = {
  chip(ctx, x, y, s) {
    ctx.strokeRect(x - s / 2, y - s / 2, s, s);
    ctx.strokeRect(x - s * 0.22, y - s * 0.22, s * 0.44, s * 0.44);
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const o = -s * 0.36 + (i * s * 0.72) / 4;
      ctx.moveTo(x + o, y - s / 2); ctx.lineTo(x + o, y - s * 0.7);
      ctx.moveTo(x + o, y + s / 2); ctx.lineTo(x + o, y + s * 0.7);
      ctx.moveTo(x - s / 2, y + o); ctx.lineTo(x - s * 0.7, y + o);
      ctx.moveTo(x + s / 2, y + o); ctx.lineTo(x + s * 0.7, y + o);
    }
    ctx.stroke();
  },
  globe(ctx, x, y, s) {
    const r = s * 0.6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, r * 0.45, r, 0, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
    ctx.moveTo(x - r * 0.87, y - r * 0.5); ctx.lineTo(x + r * 0.87, y - r * 0.5);
    ctx.moveTo(x - r * 0.87, y + r * 0.5); ctx.lineTo(x + r * 0.87, y + r * 0.5); ctx.stroke();
  },
  cross(ctx, x, y, s) {
    const r = s * 0.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, r * 0.18, 0, 7); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r * 1.35, y); ctx.lineTo(x - r * 0.35, y);
    ctx.moveTo(x + r * 0.35, y); ctx.lineTo(x + r * 1.35, y);
    ctx.moveTo(x, y - r * 1.35); ctx.lineTo(x, y - r * 0.35);
    ctx.moveTo(x, y + r * 0.35); ctx.lineTo(x, y + r * 1.35); ctx.stroke();
  },
  trend(ctx, x, y, s) {
    const l = x - s * 0.6, r = x + s * 0.6, tp = y - s * 0.55, b = y + s * 0.55;
    ctx.beginPath(); ctx.moveTo(l, tp); ctx.lineTo(l, b); ctx.lineTo(r, b); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(l + s * 0.1, tp + s * 0.15); ctx.lineTo(x - s * 0.2, y - s * 0.1);
    ctx.lineTo(x, y - s * 0.25); ctx.lineTo(x + s * 0.18, y + s * 0.2); ctx.lineTo(r - s * 0.05, b - s * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r - s * 0.05, b - s * 0.12); ctx.lineTo(r - s * 0.25, b - s * 0.14);
    ctx.moveTo(r - s * 0.05, b - s * 0.12); ctx.lineTo(r - s * 0.1, b - s * 0.3); ctx.stroke();
  },
  flame(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.6);
    ctx.bezierCurveTo(x - s * 0.6, y + s * 0.5, x - s * 0.5, y - s * 0.1, x - s * 0.1, y - s * 0.6);
    ctx.bezierCurveTo(x - s * 0.05, y - s * 0.2, x + s * 0.2, y - s * 0.15, x + s * 0.15, y - s * 0.35);
    ctx.bezierCurveTo(x + s * 0.55, y, x + s * 0.55, y + s * 0.5, x, y + s * 0.6);
    ctx.stroke();
  },
  drop(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.6);
    ctx.bezierCurveTo(x + s * 0.5, y, x + s * 0.45, y + s * 0.55, x, y + s * 0.55);
    ctx.bezierCurveTo(x - s * 0.45, y + s * 0.55, x - s * 0.5, y, x, y - s * 0.6);
    ctx.stroke();
  },
  bank(ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y - s * 0.25); ctx.lineTo(x, y - s * 0.6); ctx.lineTo(x + s * 0.6, y - s * 0.25); ctx.closePath();
    for (let i = 0; i < 4; i++) { const cx = x - s * 0.42 + i * s * 0.28; ctx.moveTo(cx, y - s * 0.18); ctx.lineTo(cx, y + s * 0.35); }
    ctx.moveTo(x - s * 0.62, y + s * 0.45); ctx.lineTo(x + s * 0.62, y + s * 0.45);
    ctx.stroke();
  },
};

// ---------- maps ----------
let LAND, COUNTRIES;
const dotCache = {};
function initMaps() {
  LAND = topojson.feature(LAND110, LAND110.objects.land);
  COUNTRIES = topojson.feature(COUNTRIES50, COUNTRIES50.objects.countries);
}
// screen-space dot lattice of land for a given projection
function landDots(key, proj, step) {
  if (dotCache[key]) return dotCache[key];
  const out = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const ll = proj.invert([x, y]);
      if (!ll || !isFinite(ll[0])) continue;
      const back = proj(ll);
      if (!back || Math.abs(back[0] - x) > 0.5 || Math.abs(back[1] - y) > 0.5) continue;
      if (d3.geoContains(LAND, ll)) out.push({ x, y, lon: ll[0], lat: ll[1] });
    }
  }
  dotCache[key] = out;
  return out;
}
const worldProj = () => d3.geoNaturalEarth1().fitExtent([[90, 150], [1830, 990]], { type: 'Sphere' });

// ---------- post ----------
let grainTiles = [], buf, bufCtx;
function initPost() {
  for (let k = 0; k < 8; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const g = c.getContext('2d'); const id = g.createImageData(256, 256); const r = rng(1000 + k);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0); grainTiles.push(c);
  }
  buf = document.createElement('canvas'); buf.width = W; buf.height = H; bufCtx = buf.getContext('2d');
}
function sliceGlitch(ctx, amt, f) {
  bufCtx.clearRect(0, 0, W, H); bufCtx.drawImage(ctx.canvas, 0, 0);
  const r = rng(f * 977 + 13);
  const n = Math.floor(4 + amt * 14);
  for (let i = 0; i < n; i++) {
    const y = r() * H, h = 4 + r() * 70 * amt, dx = (r() - 0.5) * 160 * amt;
    ctx.drawImage(buf, 0, y, W, h, dx, y, W, h);
  }
  // red/cyan split
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.35 * amt;
  ctx.drawImage(buf, 10 * amt, 0); ctx.restore();
  // occasional red bar
  if (r() < amt) { ctx.fillStyle = `rgba(227,38,46,${0.5 * amt})`; ctx.fillRect(0, r() * H, W, 2 + r() * 8); }
}
function post(ctx, f, S) {
  const t = f / FPS;
  if (S.glitch > 0.01) sliceGlitch(ctx, S.glitch, f);
  if (S.shake) { /* handled in camera */ }
  // vignette
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.78)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  // grain (changes every 2 frames to keep it filmic and bitrate-friendly)
  const k = Math.floor(f / 2);
  const tile = grainTiles[k % grainTiles.length];
  const r = rng(k * 31 + 7);
  const ox = Math.floor(r() * 256), oy = Math.floor(r() * 256);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.07;
  for (let y = -oy; y < H; y += 256) for (let x = -ox; x < W; x += 256) ctx.drawImage(tile, x, y);
  ctx.restore();
  // flicker
  const fl = 0.04 * hash(f * 1.37) + (hash(f * 0.11) > 0.97 ? 0.08 : 0);
  ctx.fillStyle = `rgba(0,0,0,${fl})`; ctx.fillRect(0, 0, W, H);
  // HUD: case-file tag
  if (S.tag) {
    ctx.save();
    ctx.globalAlpha = 0.85 * clamp(t * 3);
    const on = Math.floor(t * 1.4) % 2 === 0;
    ctx.fillStyle = COL.red; ctx.globalAlpha *= on ? 1 : 0.25;
    ctx.beginPath(); ctx.arc(66, 64, 7, 0, 7); ctx.fill();
    ctx.restore();
    txt(ctx, 'CASE FILE 2027', 86, 72, { font: F.type, size: 24, color: COL.ink, alpha: 0.75 * clamp(t * 3), track: 2 });
    txt(ctx, S.tag, 86, 100, { font: F.mono, size: 16, color: COL.mute, alpha: 0.75 * clamp(t * 3), track: 3 });
  }
  // fade in from black (first 5 frames)
  if (f < 5) { ctx.fillStyle = `rgba(0,0,0,${1 - f / 5})`; ctx.fillRect(0, 0, W, H); }
}
