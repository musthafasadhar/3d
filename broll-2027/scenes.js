// The b-roll scenes. Each: { dur (s), tag, draw(ctx, t, f, S) }.
// S.glitch (0..1) can be raised by a scene for a glitch hit; S.shake for camera shake.

const glitchHit = (S, t, at, len = 0.18, amt = 0.8) => {
  if (t >= at && t < at + len) S.glitch = Math.max(S.glitch, amt * (1 - (t - at) / len));
};

const SCENES = {};

// 01 ── "This looks like a normal poster... but it's a prophecy of 2027"
SCENES['01_world_ahead_2027'] = {
  dur: 6, tag: 'EXHIBIT 01 · THE COVER',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 560, gy: 540, glow: 0.4, grid: true });
    const px = 330, py = 190, pw = 500, ph = 700;
    // poster frame
    ctx.fillStyle = '#0c0a0b'; ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = 'rgba(242,236,227,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(px, py, pw, ph);
    const scan = lerp(py, py + ph, E.inOut(P(t, 0.3, 2.8)));
    // line-art "cover" revealed by the scan beam
    ctx.save();
    ctx.beginPath(); ctx.rect(px, py, pw, scan - py); ctx.clip();
    ctx.strokeStyle = 'rgba(227,38,46,0.85)'; ctx.fillStyle = 'rgba(227,38,46,0.85)'; ctx.lineWidth = 2.5;
    for (let i = 0; i < 7; i++) { personPath(ctx, px + 70 + i * 60, py + 190, 130); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(px + 30, py + 192); ctx.lineTo(px + pw - 30, py + 192); ctx.stroke();
    ctx.lineWidth = 2;
    ICON.globe(ctx, px + pw / 2, py + 370, 230);
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 3; i++) ICON.flame(ctx, px + 70 + i * 38, py + 560 - (i % 2) * 20, 70);
    ICON.bank(ctx, px + pw - 110, py + 545, 140);
    ctx.beginPath(); ctx.moveTo(px + 30, py + 650); ctx.lineTo(px + 230, py + 650);
    ctx.moveTo(px + 260, py + 650); ctx.lineTo(px + pw - 30, py + 650); ctx.lineWidth = 10; ctx.stroke();
    ctx.lineWidth = 2;
    txt(ctx, '?', px + pw / 2, py + 400, { size: 120, color: COL.ink, align: 'center', alpha: 0.9 });
    ctx.restore();
    // beam
    if (t > 0.3 && t < 3.0) {
      const g = ctx.createLinearGradient(0, scan - 120, 0, scan);
      g.addColorStop(0, 'rgba(227,38,46,0)'); g.addColorStop(1, 'rgba(227,38,46,0.35)');
      ctx.fillStyle = g; ctx.fillRect(px, Math.max(py, scan - 120), pw, Math.min(120, scan - py));
      ctx.fillStyle = COL.redHot; ctx.shadowColor = COL.red; ctx.shadowBlur = 30;
      ctx.fillRect(px - 20, scan - 1.5, pw + 40, 3); ctx.shadowBlur = 0;
    }
    // right-side title
    const a1 = E.out(P(t, 1.2, 1.9));
    txt(ctx, 'THE WORLD AHEAD', 960, 400 + (1 - a1) * 30, { size: 130, alpha: a1, track: 4 });
    const a2 = P(t, 2.3, 2.5);
    if (a2 > 0) {
      const sc = lerp(1.35, 1, E.out(P(t, 2.3, 2.6)));
      ctx.save(); ctx.translate(960, 700); ctx.scale(sc, sc);
      txt(ctx, '2027', 0, 0, { size: 360, color: COL.red, alpha: a2, glow: 'rgba(227,38,46,0.7)', glowBlur: 60, track: 10 });
      ctx.restore();
    }
    glitchHit(S, t, 2.3, 0.2, 1);
    typeLine(ctx, 'A MAGAZINE COVER — OR A PROPHECY?', 966, 790, t, 3.2, 26, { font: F.mono, size: 32, color: COL.ink, alpha: 0.85, track: 2, keepCursor: true });
  },
};

// 02 ── "they've done this every November for the last 40 years"
SCENES['02_every_november_40_years'] = {
  dur: 5.5, tag: 'EXHIBIT 02 · THE TRADITION',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.28 });
    const cw = 120, chh = 160, gap = 24, x0 = (W - (10 * cw + 9 * gap)) / 2, y0 = 184;
    const p = E.inOut(P(t, 0.3, 3.4));
    const year = Math.round(lerp(1987, 2027, p));
    for (let i = 0; i < 40; i++) {
      const cx = x0 + (i % 10) * (cw + gap), cy = y0 + Math.floor(i / 10) * (chh + gap);
      const yr = 1987 + i, lit = yr <= year;
      ctx.fillStyle = lit ? 'rgba(227,38,46,0.10)' : 'rgba(255,255,255,0.015)';
      ctx.fillRect(cx, cy, cw, chh);
      ctx.strokeStyle = lit ? 'rgba(227,38,46,0.45)' : 'rgba(242,236,227,0.07)'; ctx.lineWidth = 1.5;
      ctx.strokeRect(cx + 0.5, cy + 0.5, cw, chh);
      txt(ctx, String(yr), cx + cw / 2, cy + chh - 14, { font: F.mono, size: 16, align: 'center', color: lit ? COL.ink : COL.dim, alpha: lit ? 0.6 : 0.5 });
    }
    // dark band behind counter
    const band = ctx.createLinearGradient(0, 330, 0, 760);
    band.addColorStop(0, 'rgba(6,6,7,0)'); band.addColorStop(0.25, 'rgba(6,6,7,0.88)');
    band.addColorStop(0.75, 'rgba(6,6,7,0.88)'); band.addColorStop(1, 'rgba(6,6,7,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 330, W, 430);
    const final = year === 2027 && t > 3.4;
    txt(ctx, 'EVERY NOVEMBER', W / 2, 420, { font: F.mono, size: 30, align: 'center', track: 14, color: COL.mute });
    txt(ctx, String(year), W / 2, 680, {
      size: 300, align: 'center', track: 12, color: final ? COL.red : COL.ink,
      glow: final ? 'rgba(227,38,46,0.75)' : null, glowBlur: 70,
    });
    glitchHit(S, t, 3.4, 0.2, 0.9);
    const a = E.out(P(t, 3.7, 4.3));
    txt(ctx, 'FOR 40 YEARS. ONE COVER. THE NEXT YEAR — PREDICTED.', W / 2, 760 + (1 - a) * 20, { font: F.type, size: 38, align: 'center', alpha: a });
  },
};

// 03 ── "tech, geopolitics, any war situations, finance"
SCENES['03_what_they_predict'] = {
  dur: 4.5, tag: 'EXHIBIT 03 · THE SCOPE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.25, grid: true });
    txt(ctx, 'WHAT THEY PREDICT', W / 2, 175, { font: F.mono, size: 28, align: 'center', track: 12, color: COL.mute, alpha: P(t, 0.1, 0.5) });
    const items = [['TECHNOLOGY', 'chip'], ['GEOPOLITICS', 'globe'], ['WAR', 'cross'], ['FINANCE', 'trend']];
    const cw = 380, ch = 540, gap = 40, x0 = (W - (4 * cw + 3 * gap)) / 2, y0 = 255;
    items.forEach(([label, ic], i) => {
      const st = 0.3 + i * 0.35, p = E.out(P(t, st, st + 0.55));
      if (p <= 0) return;
      const x = x0 + i * (cw + gap), y = y0 + (1 - p) * 70;
      ctx.save(); ctx.globalAlpha = p;
      ctx.fillStyle = COL.card; ctx.fillRect(x, y, cw, ch);
      ctx.strokeStyle = 'rgba(242,236,227,0.12)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cw, ch);
      ctx.fillStyle = COL.red; ctx.fillRect(x, y, cw * E.out(P(t, st + 0.2, st + 0.8)), 5);
      txt(ctx, '0' + (i + 1), x + 26, y + 52, { font: F.mono, size: 22, color: COL.red });
      ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(227,38,46,0.6)'; ctx.shadowBlur = 18;
      ICON[ic](ctx, x + cw / 2, y + 230, 150);
      ctx.shadowBlur = 0;
      txt(ctx, label, x + cw / 2, y + 450, fit(ctx, label, { size: 92, align: 'center', track: 3 }, cw - 50));
      ctx.restore();
      glitchHit(S, t, st, 0.1, 0.4);
    });
  },
};

// 04 ── "the 2026 cover already predicted Nepal floods, USA–Iran war, FIFA, IPL ... pre-planned?"
SCENES['04_the_2026_cover'] = {
  dur: 6.5, tag: 'EXHIBIT 04 · LAST YEAR',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 400, glow: 0.25 });
    txt(ctx, 'EXHIBIT: THE WORLD AHEAD 2026', 200, 170, { font: F.mono, size: 22, color: COL.mute, track: 4, alpha: P(t, 0, 0.4) });
    txt(ctx, 'ON THE 2026 COVER', 200, 250, { size: 80, track: 3, alpha: E.out(P(t, 0.1, 0.6)) });
    const rows = ['NEPAL FLOODS', 'USA — IRAN WAR', 'FIFA WORLD CUP', 'IPL'];
    rows.forEach((r, i) => {
      const st = 0.6 + i * 0.45, a = E.out(P(t, st, st + 0.4)), y = 380 + i * 120;
      if (a <= 0) return;
      txt(ctx, '0' + (i + 1), 200, y, { font: F.mono, size: 24, color: COL.red, alpha: a });
      txt(ctx, r, 270 + (1 - a) * 40, y + 8, { size: 84, alpha: a, track: 2 });
      // dotted leader
      const lw = measure(ctx, r, { size: 84, track: 2 });
      const lp = P(t, st + 0.4, st + 1.0);
      ctx.save(); ctx.setLineDash([3, 12]); ctx.strokeStyle = 'rgba(242,236,227,0.3)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(290 + lw, y - 18); ctx.lineTo(lerp(290 + lw, 1260, lp), y - 18); ctx.stroke(); ctx.restore();
      stamp(ctx, 'IT HAPPENED', 1450, y - 20, P(t, 2.5 + i * 0.3, 2.9 + i * 0.3), { size: 58, rot: -5 + i * 2, seed: 40 + i });
    });
    const a1 = E.out(P(t, 4.3, 4.8));
    txt(ctx, 'COINCIDENCE...', W / 2, 960, { font: F.type, size: 54, align: 'center', alpha: a1 * (t > 5.1 ? 0 : 1) });
    if (t > 5.1) {
      txt(ctx, 'OR PRE-PLANNED?', W / 2, 985, { size: 120, align: 'center', color: COL.red, track: 6, glow: 'rgba(227,38,46,0.6)' });
    }
    glitchHit(S, t, 5.1, 0.22, 1);
  },
};

// 05 ── "The Economist is a British company, started in London... 1843... 180 years"
SCENES['05_london_1843'] = {
  dur: 6.5, tag: 'EXHIBIT 05 · THE PUBLISHER',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.12 });
    const z = E.inOut(P(t, 0, 4.5));
    const proj = d3.geoMercator().center([-0.12, 51.5]).scale(lerp(1100, 5200, z)).translate([560, 560]);
    const path = d3.geoPath(proj, ctx);
    ctx.beginPath(); path(d3.geoGraticule10()); ctx.strokeStyle = 'rgba(242,236,227,0.05)'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); path(COUNTRIES); ctx.fillStyle = '#15121300'; ctx.fillStyle = '#161314'; ctx.fill();
    ctx.strokeStyle = 'rgba(242,236,227,0.16)'; ctx.lineWidth = 1; ctx.stroke();
    // UK highlight
    const uk = COUNTRIES.features.find(c => c.properties.name === 'United Kingdom');
    if (uk) { ctx.beginPath(); path(uk); ctx.fillStyle = `rgba(227,38,46,${0.25 * P(t, 0.8, 1.6)})`; ctx.fill(); ctx.strokeStyle = `rgba(227,38,46,${0.7 * P(t, 0.8, 1.6)})`; ctx.stroke(); }
    const [lx, ly] = proj([-0.12, 51.5]);
    const dp = E.out(P(t, 1.2, 1.6));
    if (dp > 0) {
      pulseRings(ctx, lx, ly, t, { r: 110 });
      // pin
      const py = ly - 60 - (1 - dp) * 80;
      ctx.globalAlpha = dp; ctx.fillStyle = COL.red; ctx.shadowColor = COL.red; ctx.shadowBlur = 25;
      ctx.beginPath(); ctx.arc(lx, py, 22, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(lx, py + 58); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = COL.bg; ctx.beginPath(); ctx.arc(lx, py, 8, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
      txt(ctx, 'LONDON', lx + 34, ly + 8, { font: F.mono, size: 26, track: 6, alpha: dp });
    }
    // dossier card
    const cp = E.out(P(t, 0.9, 1.5));
    const cx = 1060 + (1 - cp) * 120, cy = 210, cw = 720, chh = 680;
    ctx.save(); ctx.globalAlpha = cp;
    ctx.fillStyle = 'rgba(14,12,13,0.94)'; ctx.fillRect(cx, cy, cw, chh);
    ctx.strokeStyle = 'rgba(242,236,227,0.18)'; ctx.lineWidth = 1.5; ctx.strokeRect(cx, cy, cw, chh);
    ctx.fillStyle = COL.red; ctx.fillRect(cx, cy, 6, chh);
    txt(ctx, 'SUBJECT FILE', cx + 50, cy + 70, { font: F.mono, size: 22, color: COL.red, track: 8 });
    txt(ctx, 'THE ECONOMIST', cx + 50, cy + 170, { size: 100, track: 3 });
    ctx.fillStyle = 'rgba(242,236,227,0.15)'; ctx.fillRect(cx + 50, cy + 200, cw - 100, 1.5);
    const lines = [['FOUNDED', '1843'], ['BASE', 'LONDON, UK'], ['AGE', '180+ YEARS'], ['PUBLISHES', 'EVERY WEEK'], ['EVERY NOVEMBER', '"THE WORLD AHEAD"']];
    let tt = 1.7;
    lines.forEach(([k, v], i) => {
      const y = cy + 280 + i * 78;
      const kk = typed(k, t, tt, 40); tt += k.length / 40 + 0.05;
      const vv = typed(v, t, tt, 40); tt += v.length / 40 + 0.15;
      txt(ctx, kk, cx + 50, y, { font: F.type, size: 34, color: COL.mute });
      if (vv) {
        const kw = measure(ctx, k, { font: F.type, size: 34 }), vw = measure(ctx, v, { font: F.type, size: 34 });
        ctx.save(); ctx.setLineDash([2, 8]); ctx.strokeStyle = 'rgba(242,236,227,0.25)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx + 60 + kw, y - 8); ctx.lineTo(cx + cw - 60 - vw, y - 8); ctx.stroke(); ctx.restore();
        txt(ctx, vv, cx + cw - 50, y, { font: F.type, size: 34, align: 'right', color: i === 0 ? COL.red : COL.ink });
      }
    });
    ctx.restore();
  },
};

// 06 ── "world leaders standing at the top... a summit? or a New World Order?"
SCENES['06_summit_or_new_order'] = {
  dur: 6, tag: 'EXHIBIT 06 · THE LEADERS',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gy: 700, glow: 0.3 });
    const floorY = 900;
    // floor
    const fg = ctx.createLinearGradient(0, floorY, 0, H);
    fg.addColorStop(0, 'rgba(227,38,46,0.18)'); fg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fg; ctx.fillRect(0, floorY, W, H - floorY);
    const order = [3, 2, 4, 1, 5, 0, 6];
    for (let i = 0; i < 7; i++) {
      const x = W / 2 + (i - 3) * 205;
      const on = 0.4 + order.indexOf(i) * 0.22;
      let a = P(t, on, on + 0.08);
      if (t > on && t < on + 0.35) a *= hash(f * 3 + i) > 0.4 ? 1 : 0.2; // flicker on
      if (a > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const cg = ctx.createLinearGradient(0, 0, 0, floorY);
        cg.addColorStop(0, `rgba(255,235,220,${0.02 * a})`); cg.addColorStop(1, `rgba(255,220,200,${0.13 * a})`);
        ctx.fillStyle = cg; ctx.beginPath();
        ctx.moveTo(x - 18, 0); ctx.lineTo(x + 18, 0); ctx.lineTo(x + 120, floorY); ctx.lineTo(x - 120, floorY); ctx.closePath(); ctx.fill();
        ctx.fillStyle = `rgba(255,225,210,${0.10 * a})`;
        ctx.beginPath(); ctx.ellipse(x, floorY + 5, 130, 22, 0, 0, 7); ctx.fill();
        ctx.restore();
      }
      const hv = rng(i * 17 + 3); const ph = 400 + hv() * 60;
      ctx.save(); ctx.translate(x, 0); ctx.scale(0.9 + hv() * 0.25, 1); personPath(ctx, 0, floorY + 8, ph); ctx.restore();
      ctx.fillStyle = '#030303'; ctx.fill();
      ctx.strokeStyle = `rgba(255,120,110,${0.25 * a})`; ctx.lineWidth = 1.5; ctx.stroke();
    }
    if (t > 2.6 && t < 3.8) txt(ctx, 'A SUMMIT?', W / 2, 230, { size: 150, align: 'center', track: 8, alpha: E.out(P(t, 2.6, 2.9)) });
    if (t >= 3.8) {
      txt(ctx, 'OR A', W / 2, 150, { font: F.type, size: 48, align: 'center', color: COL.ink });
      txt(ctx, 'NEW WORLD ORDER?', W / 2, 300, { size: 160, align: 'center', track: 8, color: COL.red, glow: 'rgba(227,38,46,0.65)' });
    }
    glitchHit(S, t, 3.8, 0.25, 1);
  },
};

// 07 ── tents: "the world is being divided"
SCENES['07_world_divided'] = {
  dur: 5.5, tag: 'EXHIBIT 07 · THE DIVIDE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.15 });
    const proj = worldProj();
    const dots = landDots('world', proj, 11);
    // crack path
    const r = rng(77), crack = [];
    for (let y = 100; y <= 1000; y += 30) crack.push([W / 2 + 10 + (r() - 0.5) * 90, y]);
    const crackX = y => { const i = clamp(Math.floor((y - 100) / 30), 0, crack.length - 2); const k = (y - crack[i][1]) / 30; return lerp(crack[i][0], crack[i + 1][0], clamp(k)); };
    const cp = E.inOut(P(t, 0.7, 1.9));
    const sep = 70 * E.out(P(t, 2.0, 3.6));
    if (t > 1.9 && t < 2.3) S.shake = 10 * (1 - P(t, 1.9, 2.3));
    // glow in the gap
    if (sep > 0) {
      const g = ctx.createLinearGradient(W / 2 - 160, 0, W / 2 + 160, 0);
      g.addColorStop(0, 'rgba(227,38,46,0)'); g.addColorStop(0.5, `rgba(227,38,46,${0.35 * sep / 70})`); g.addColorStop(1, 'rgba(227,38,46,0)');
      ctx.fillStyle = g; ctx.fillRect(W / 2 - 160, 0, 320, H);
    }
    for (const d of dots) {
      const cxk = crackX(d.y), left = d.x < cxk;
      const dx = left ? -sep : sep;
      const near = Math.abs(d.x - cxk) < 40 && cp > (d.y - 100) / 900;
      ctx.fillStyle = near ? 'rgba(227,38,46,0.9)' : (left ? 'rgba(242,236,227,0.38)' : 'rgba(242,236,227,0.38)');
      ctx.fillRect(d.x + dx - 2, d.y - 2, 4, 4);
    }
    // crack line
    if (cp > 0) {
      ctx.save(); ctx.strokeStyle = COL.redHot; ctx.lineWidth = 3; ctx.shadowColor = COL.red; ctx.shadowBlur = 25;
      const n = Math.floor(cp * (crack.length - 1));
      for (const side of sep > 0 ? [-1, 1] : [0]) {
        ctx.beginPath();
        for (let i = 0; i <= n; i++) { const [x, y] = crack[i]; i ? ctx.lineTo(x + side * sep, y) : ctx.moveTo(x + side * sep, y); }
        ctx.globalAlpha = sep > 0 ? 0.6 : 1; ctx.stroke();
      }
      ctx.restore();
    }
    const a = E.out(P(t, 2.6, 3.2));
    ctx.fillStyle = `rgba(6,6,7,${0.75 * a})`; ctx.fillRect(0, 890, W, 190);
    txt(ctx, 'THE WORLD IS BEING DIVIDED', W / 2, 1010, { size: 110, align: 'center', track: 8, alpha: a });
    glitchHit(S, t, 1.9, 0.2, 0.7);
  },
};

// 08 ── "America is at war with Iran, Houthis attacking Saudi, Russia–Ukraine, civil wars"
SCENES['08_conflict_map'] = {
  dur: 7, tag: 'EXHIBIT 08 · THE FRONTS',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.12 });
    const proj = worldProj();
    const dots = landDots('world', proj, 11);
    ctx.fillStyle = 'rgba(242,236,227,0.26)';
    for (const d of dots) ctx.fillRect(d.x - 2, d.y - 2, 4, 4);
    const pt = ll => proj(ll);
    const label = (s, x, y, a, align = 'left') => {
      if (a <= 0) return;
      const w = measure(ctx, s, { font: F.mono, size: 24, track: 3 });
      const bx = align === 'left' ? x : x - w - 24;
      ctx.fillStyle = `rgba(6,6,7,${0.85 * a})`; ctx.fillRect(bx - 4, y - 30, w + 32, 44);
      ctx.fillStyle = `rgba(227,38,46,${a})`; ctx.fillRect(bx - 4, y - 30, 4, 44);
      txt(ctx, s, bx + 12, y, { font: F.mono, size: 24, track: 3, alpha: a });
    };
    const arc = (a, b, p, lift, flowT) => {
      const [x1, y1] = pt(a), [x2, y2] = pt(b);
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - lift;
      ctx.save(); ctx.strokeStyle = COL.red; ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -flowT * 60;
      ctx.shadowColor = COL.red; ctx.shadowBlur = 15;
      ctx.beginPath(); ctx.moveTo(x1, y1);
      const N = 40, n = Math.floor(N * p);
      for (let i = 1; i <= n; i++) { const k = i / N; const x = (1 - k) * (1 - k) * x1 + 2 * (1 - k) * k * mx + k * k * x2; const y = (1 - k) * (1 - k) * y1 + 2 * (1 - k) * k * my + k * k * y2; ctx.lineTo(x, y); }
      ctx.stroke(); ctx.restore();
      return [mx, my];
    };
    const US = [-98, 39], IR = [53, 32.5], YE = [47.5, 15.5], SA = [45, 24], RU = [37.6, 55.7], UA = [31.5, 49], SD = [30, 13.5], MM = [96, 21];
    // USA <-> Iran
    if (t > 0.4) {
      pulseRings(ctx, ...pt(US), t, { r: 70 }); pulseRings(ctx, ...pt(IR), t + 0.4, { r: 70 });
      const [mx, my] = arc(US, IR, E.inOut(P(t, 0.4, 1.6)), 220, t);
      label('USA  ⇄  IRAN', mx - 110, my + 70, E.out(P(t, 1.2, 1.6)));
    }
    if (t > 1.8) {
      pulseRings(ctx, ...pt(YE), t, { r: 55 }); arc(YE, SA, E.inOut(P(t, 1.8, 2.4)), 40, t);
      const [x, y] = pt(YE); label('HOUTHI ATTACKS', x + 30, y + 70, E.out(P(t, 2.1, 2.5)));
    }
    if (t > 2.8) {
      pulseRings(ctx, ...pt(UA), t, { r: 60 }); pulseRings(ctx, ...pt(RU), t + 0.3, { r: 50, dot: 5 });
      const [x, y] = pt(RU); label('RUSSIA — UKRAINE', x + 40, y - 30, E.out(P(t, 2.9, 3.3)));
    }
    if (t > 3.7) {
      pulseRings(ctx, ...pt(SD), t, { r: 45, dot: 5 }); pulseRings(ctx, ...pt(MM), t + 0.5, { r: 45, dot: 5 });
      const [x, y] = pt(SD); label('CIVIL WARS', x - 30, y + 80, E.out(P(t, 3.8, 4.2)), 'right');
      const [x2, y2] = pt(MM); label('CIVIL WARS', x2 + 30, y2 + 60, E.out(P(t, 4.0, 4.4)));
    }
    txt(ctx, 'THE WORLD RIGHT NOW', 1840, 90, { size: 72, align: 'right', track: 4, alpha: P(t, 0, 0.5) });
    txt(ctx, 'ACTIVE CONFLICTS · 2026', 1840, 125, { font: F.mono, size: 22, align: 'right', color: COL.red, track: 5, alpha: P(t, 0.2, 0.7) });
    const a = E.out(P(t, 5.0, 5.5));
    ctx.fillStyle = `rgba(6,6,7,${0.8 * a})`; ctx.fillRect(0, 930, W, 150);
    txt(ctx, 'IS SOMETHING BIGGER COMING?', W / 2, 1030, { size: 96, align: 'center', track: 6, color: COL.ink, alpha: a });
    glitchHit(S, t, 5.0, 0.2, 0.6);
  },
};

// 09 ── burning trees, wildfires, super El Niño 2027, hottest in 100 years
SCENES['09_wildfire_el_nino'] = {
  dur: 6.5, tag: 'EXHIBIT 09 · THE HEAT',
  draw(ctx, t, f, S) {
    const heat = E.inOut(P(t, 0, 4.5));
    ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#060607');
    sky.addColorStop(0.55, `rgba(${lerp(40, 120, heat)},${lerp(6, 22, heat)},10,1)`);
    sky.addColorStop(1, `rgba(${lerp(90, 255, heat)},${lerp(20, 90, heat)},20,1)`);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // smoke
    for (let i = 0; i < 10; i++) {
      const r = rng(500 + i); const x = r() * W + Math.sin(t * 0.3 + i) * 60, y = 200 + r() * 400 - t * 15;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 300 + r() * 200);
      g.addColorStop(0, `rgba(10,6,6,${0.35 * heat})`); g.addColorStop(1, 'rgba(10,6,6,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    // tree layers
    const layers = [[0.55, '#2a0806', 110, 1], [0.75, '#150404', 170, 2], [1, '#000', 260, 3]];
    layers.forEach(([depth, col, hh, seed]) => {
      const r = rng(seed * 99);
      ctx.fillStyle = col;
      const base = H - 40 * (1 - depth) - 60 * (1 - depth);
      ctx.fillRect(0, base - 5, W, H - base + 5);
      for (let x = -40; x < W + 60; x += 34 + r() * 40) { pine(ctx, x, base, hh * (0.7 + r() * 0.6)); ctx.fill(); }
      // flames along this layer
      if (depth >= 0.75) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const rf = rng(seed * 7);
        for (let i = 0; i < 46; i++) {
          const x = rf() * W, hgt = (40 + rf() * 110) * heat * (0.8 + 0.3 * Math.sin(t * 9 + i * 1.7)) * (depth === 1 ? 1.4 : 0.8);
          const w = 18 + rf() * 26;
          const fg = ctx.createLinearGradient(0, base, 0, base - hgt);
          fg.addColorStop(0, `rgba(255,170,60,${0.55 * heat})`); fg.addColorStop(0.6, `rgba(227,38,46,${0.35 * heat})`); fg.addColorStop(1, 'rgba(227,38,46,0)');
          ctx.fillStyle = fg; ctx.beginPath();
          const sway = Math.sin(t * 6 + i) * 10;
          ctx.moveTo(x - w, base); ctx.quadraticCurveTo(x - w * 0.6, base - hgt * 0.5, x + sway, base - hgt);
          ctx.quadraticCurveTo(x + w * 0.6, base - hgt * 0.5, x + w, base); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
    });
    // embers
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const re = rng(4242);
    for (let i = 0; i < 160; i++) {
      const sp = 60 + re() * 160, x0 = re() * W, ph = re() * 20, sz = 1 + re() * 3;
      const y = H - (((t + ph) * sp) % (H * 1.1));
      const x = x0 + Math.sin((t + ph) * 2 + i) * 30;
      ctx.fillStyle = `rgba(255,${120 + re() * 100},60,${(0.3 + re() * 0.7) * heat})`;
      ctx.beginPath(); ctx.arc(x, y, sz, 0, 7); ctx.fill();
    }
    ctx.restore();
    // left: thermometer + title
    const tx = 200, ttop = 230, tbot = 640;
    ctx.fillStyle = 'rgba(6,6,7,0.65)'; ctx.fillRect(120, 160, 1000, 560);
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(tx - 20, ttop, 40, tbot - ttop + 20, 20); ctx.stroke();
    ctx.beginPath(); ctx.arc(tx, tbot + 50, 40, 0, 7); ctx.stroke();
    ctx.fillStyle = COL.red; ctx.shadowColor = COL.red; ctx.shadowBlur = 25;
    ctx.beginPath(); ctx.arc(tx, tbot + 50, 30, 0, 7); ctx.fill();
    const lvl = lerp(tbot, ttop + 14, heat);
    ctx.fillRect(tx - 10, lvl, 20, tbot + 30 - lvl); ctx.shadowBlur = 0;
    for (let i = 0; i < 9; i++) { const y = ttop + 20 + i * 46; ctx.fillStyle = 'rgba(242,236,227,0.5)'; ctx.fillRect(tx + 30, y, i % 2 ? 12 : 22, 2); }
    const a1 = E.out(P(t, 0.8, 1.3));
    txt(ctx, 'SUPER EL NIÑO', 300, 380, { size: 150, track: 4, alpha: a1 });
    if (t > 1.7) txt(ctx, '2027?', 300, 580, { size: 210, color: COL.red, track: 8, glow: 'rgba(255,60,40,0.7)' });
    glitchHit(S, t, 1.7, 0.18, 0.8);
    typeLine(ctx, 'HOTTEST IN 100+ YEARS?', 306, 670, t, 2.5, 22, { font: F.mono, size: 34, track: 3 });
  },
};

// 10 ── "4 people coming down from a building... stock exchange... investors pulling money out"
SCENES['10_investors_exit'] = {
  dur: 6, tag: 'EXHIBIT 10 · THE EXIT',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 1350, gy: 450, glow: 0.35 });
    // facade line art
    ctx.save(); ctx.strokeStyle = 'rgba(242,236,227,0.13)'; ctx.lineWidth = 3;
    const fx = 980, fw = 820, top = 170;
    ctx.beginPath(); ctx.moveTo(fx, top + 170); ctx.lineTo(fx + fw / 2, top); ctx.lineTo(fx + fw, top + 170); ctx.closePath(); ctx.stroke();
    ctx.strokeRect(fx, top + 170, fw, 40);
    for (let i = 0; i < 6; i++) { const cx = fx + 70 + i * ((fw - 140) / 5); ctx.strokeRect(cx - 28, top + 220, 56, 520); ctx.beginPath(); for (let k = -14; k <= 14; k += 14) { ctx.moveTo(cx + k, top + 230); ctx.lineTo(cx + k, top + 730); } ctx.stroke(); }
    for (let s = 0; s < 4; s++) ctx.strokeRect(fx - 40 - s * 30, top + 740 + s * 28, fw + 80 + s * 60, 28);
    ctx.restore();
    // four figures walking down & out
    for (let i = 0; i < 4; i++) {
      const p = P(t, 0.2 + i * 0.25, 6);
      const x = 1240 + i * 110 + p * 520, y = 900 + Math.min(p * 3, 1) * 70;
      personPath(ctx, x, y + Math.abs(Math.sin(t * 7 + i)) * -4, 150);
      ctx.fillStyle = '#020202'; ctx.fill(); ctx.strokeStyle = 'rgba(227,38,46,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    // candles
    const cx0 = 110, cw = 24, gap = 10, n = 34, chTop = 220, chBot = 820;
    const r = rng(11); let v = 0.45; const data = [];
    for (let i = 0; i < n; i++) {
      const o = v; let c;
      if (i < 24) c = o + (r() - 0.38) * 0.06; else c = o - (0.03 + r() * 0.06);
      const hi = Math.max(o, c) + r() * 0.02, lo = Math.min(o, c) - r() * 0.02; data.push([o, c, hi, lo]); v = c;
    }
    const max = Math.max(...data.map(d => d[2])), min = Math.min(...data.map(d => d[3]));
    const Y = val => lerp(chBot, chTop, (val - min) / (max - min));
    ctx.strokeStyle = 'rgba(242,236,227,0.06)'; ctx.lineWidth = 1;
    for (let k = 0; k <= 6; k++) { const y = lerp(chTop, chBot, k / 6); ctx.beginPath(); ctx.moveTo(cx0, y); ctx.lineTo(cx0 + n * (cw + gap), y); ctx.stroke(); }
    let last = null;
    data.forEach(([o, c, hi, lo], i) => {
      const at = 0.2 + i * 0.1; const a = P(t, at, at + 0.12);
      if (a <= 0) return;
      const x = cx0 + i * (cw + gap), up = c >= o;
      const col = up ? 'rgba(170,165,160,0.9)' : COL.red;
      ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(x + cw / 2 - 1, Y(hi), 2, Y(lo) - Y(hi));
      const yy = Math.min(Y(o), Y(c)), hh = Math.max(3, Math.abs(Y(o) - Y(c)) * a);
      if (!up) { ctx.shadowColor = COL.red; ctx.shadowBlur = 14; }
      ctx.fillRect(x, yy, cw, hh); ctx.shadowBlur = 0; ctx.globalAlpha = 1;
      last = [x + cw, Y(c), up];
    });
    if (last) {
      ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = last[2] ? 'rgba(242,236,227,0.4)' : COL.red; ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(last[0] + 90, last[1]); ctx.stroke(); ctx.restore();
      triUp(ctx, last[0] + 110, last[1], 12, last[2] ? COL.mute : COL.red);
    }
    if (t > 2.6 && t < 3.0) S.shake = 6;
    glitchHit(S, t, 2.6, 0.15, 0.5);
    const a = E.out(P(t, 3.8, 4.3));
    ctx.fillStyle = `rgba(6,6,7,${0.8 * a})`; ctx.fillRect(0, 880, 1240, 200);
    ctx.save(); ctx.globalAlpha = a;
    multi(ctx, [['INVESTORS HEADING FOR THE ', COL.ink], ['EXIT?', COL.red]], 110, 1010, { size: 100, track: 4 });
    ctx.restore();
  },
};

// 11 ── "bank building, AI robot with a sack, vault with binary codes... the AI bubble is going to burst"
SCENES['11_ai_bubble'] = {
  dur: 6.5, tag: 'EXHIBIT 11 · THE BUBBLE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.3, grid: true });
    const cx = W / 2, cy = 560, popT = 4.6;
    txt(ctx, 'THE AI BUBBLE', W / 2, 140, { font: F.mono, size: 32, align: 'center', track: 16, color: COL.mute, alpha: P(t, 0.1, 0.6) });
    if (t < popT) {
      const grow = E.out(P(t, 0, 4.2));
      let R = lerp(130, 330, grow) * (1 + 0.015 * Math.sin(t * 6));
      const shake = P(t, 3.6, popT) * 8;
      const sx = cx + (hash(f) - 0.5) * shake, sy = cy + (hash(f + 0.5) - 0.5) * shake;
      // body
      const g = ctx.createRadialGradient(sx - R * 0.3, sy - R * 0.3, R * 0.1, sx, sy, R);
      g.addColorStop(0, 'rgba(227,38,46,0.04)'); g.addColorStop(0.8, 'rgba(227,38,46,0.10)'); g.addColorStop(1, 'rgba(227,38,46,0.32)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(242,236,227,0.55)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(sx, sy, R * 0.82, Math.PI * 1.1, Math.PI * 1.35); ctx.stroke();
      // binary swirling inside
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R - 4, 0, 7); ctx.clip();
      const r = rng(5);
      for (let i = 0; i < 150; i++) {
        const rr = Math.sqrt(r()) * R * 0.92, a0 = r() * 7, sp = (0.2 + r() * 0.6) * (r() < 0.5 ? 1 : -1);
        const ang = a0 + t * sp;
        txt(ctx, r() < 0.5 ? '0' : '1', sx + Math.cos(ang) * rr, sy + Math.sin(ang) * rr, { font: F.mono, size: 20, align: 'center', color: r() < 0.25 ? COL.red : COL.ink, alpha: 0.35 });
      }
      ctx.restore();
      txt(ctx, 'AI', sx, sy + 70, { size: 220, align: 'center', color: COL.ink, glow: 'rgba(227,38,46,0.6)', track: 10 });
      // cracks
      const cp = P(t, 3.9, popT);
      if (cp > 0) {
        ctx.save(); ctx.strokeStyle = COL.redHot; ctx.lineWidth = 2.5; ctx.shadowColor = COL.red; ctx.shadowBlur = 12;
        const rc = rng(9);
        for (let k = 0; k < 6; k++) {
          const a = rc() * 7; let x = sx + Math.cos(a) * R, y = sy + Math.sin(a) * R; let dir = a + Math.PI;
          ctx.beginPath(); ctx.moveTo(x, y);
          const steps = Math.floor(8 * cp);
          for (let s = 0; s < steps; s++) { dir += (rc() - 0.5) * 1.2; x += Math.cos(dir) * 26; y += Math.sin(dir) * 26; ctx.lineTo(x, y); }
          ctx.stroke();
        }
        ctx.restore();
      }
    } else {
      const k = t - popT;
      const fl = clamp(1 - k / 0.3);
      ctx.fillStyle = `rgba(255,230,220,${0.6 * fl})`; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = `rgba(227,38,46,${clamp(1 - k / 0.8)})`; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, 330 + k * 900, 0, 7); ctx.stroke();
      const r = rng(21);
      for (let i = 0; i < 120; i++) {
        const a = r() * 7, v = 300 + r() * 900, d = 200 + k * v, rot = (r() - 0.5) * k * 10;
        const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d + k * k * 200;
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
        txt(ctx, r() < 0.5 ? '0' : '1', 0, 0, { font: F.mono, size: 26 + r() * 20, align: 'center', color: r() < 0.4 ? COL.red : COL.ink, alpha: clamp(1 - k / 1.4) });
        ctx.restore();
      }
      const a = E.out(P(t, popT + 0.35, popT + 0.8));
      txt(ctx, 'BURST IN 2027?', W / 2, 620, { size: 190, align: 'center', color: COL.red, track: 8, alpha: a, glow: 'rgba(227,38,46,0.7)' });
    }
    glitchHit(S, t, popT, 0.3, 1);
    if (t > popT && t < popT + 0.35) S.shake = 18 * (1 - (t - popT) / 0.35);
  },
};

// 12 ── Tricolor & First Brands (Sep 2025), JPMorgan $170M, regional banks (Oct 2025)
SCENES['12_first_cracks_2025'] = {
  dur: 7.5, tag: 'EXHIBIT 12 · THE FIRST CRACKS',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 960, gy: 300, glow: 0.22, grid: true });
    txt(ctx, 'US CREDIT MARKETS · 2025', 140, 150, { font: F.mono, size: 22, color: COL.red, track: 6, alpha: P(t, 0, 0.4) });
    txt(ctx, 'THE FIRST CRACKS', 140, 232, { size: 90, track: 4, alpha: E.out(P(t, 0.1, 0.6)) });
    const lp = E.inOut(P(t, 0.4, 1.4));
    ctx.fillStyle = 'rgba(242,236,227,0.3)'; ctx.fillRect(140, 290, (1780 - 140) * lp, 2);
    const cards = [
      ['SEP 2025', 'TRICOLOR', 'Subprime auto lender\ncollapses suddenly', 'BANKRUPT'],
      ['SEP 2025', 'FIRST BRANDS', 'Auto-parts giant\nfiles for bankruptcy', 'BANKRUPT'],
      ['OCT 2025', 'JPMORGAN', 'Writes off ~$170M\nlinked to Tricolor', '−$170M'],
      ['OCT 2025', 'REGIONAL BANKS', 'Loan losses tied to\nalleged fraud', 'FRAUD'],
    ];
    const cw = 380, gap = 40, x0 = 140, y0 = 370, chh = 470;
    cards.forEach(([d, name, desc, st], i) => {
      const s0 = 0.9 + i * 0.85, p = E.out(P(t, s0, s0 + 0.45));
      const x = x0 + i * (cw + gap);
      // node on timeline
      if (lp * (1780 - 140) + 140 > x + 30) {
        ctx.fillStyle = p > 0 ? COL.red : COL.dim; ctx.beginPath(); ctx.arc(x + 30, 291, 8, 0, 7); ctx.fill();
        txt(ctx, d, x + 50, 300, { font: F.mono, size: 20, color: p > 0 ? COL.ink : COL.dim, track: 3 });
      }
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = p;
      ctx.strokeStyle = 'rgba(227,38,46,0.5)'; ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.moveTo(x + 30, 300); ctx.lineTo(x + 30, y0 + (1 - p) * 40); ctx.stroke(); ctx.setLineDash([]);
      const y = y0 + (1 - p) * 40;
      ctx.fillStyle = COL.card; ctx.fillRect(x, y, cw, chh);
      ctx.strokeStyle = 'rgba(242,236,227,0.13)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, cw, chh);
      txt(ctx, 'CASE 0' + (i + 1), x + 30, y + 50, { font: F.mono, size: 18, color: COL.mute, track: 4 });
      txt(ctx, name, x + 30, y + 130, fit(ctx, name, { size: 80, track: 2 }, cw - 60));
      desc.split('\n').forEach((ln, k) => txt(ctx, ln, x + 30, y + 190 + k * 40, { font: F.type, size: 28, color: COL.mute }));
      ctx.restore();
      stamp(ctx, st, x + cw / 2, y0 + 370, P(t, s0 + 0.45, s0 + 0.75), { size: st.length > 6 ? 62 : 68, rot: -8 + i * 3, under: COL.card, seed: 7 + i });
      glitchHit(S, t, s0 + 0.5, 0.08, 0.35);
    });
  },
};

// 13 ── Jamie Dimon: "when you see one cockroach, there are probably more"
SCENES['13_one_cockroach'] = {
  dur: 7, tag: 'EXHIBIT 13 · THE WARNING SIGN',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 960, gy: 900, glow: 0.3 });
    // floor spotlight
    const sp = ctx.createRadialGradient(960, 960, 0, 960, 960, 900);
    sp.addColorStop(0, 'rgba(255,225,205,0.07)'); sp.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sp; ctx.fillRect(0, 0, W, H);
    txt(ctx, '“', 170, 470, { font: F.cond, weight: 700, size: 360, color: COL.red, alpha: E.out(P(t, 0, 0.4)) });
    typeLine(ctx, 'When you see one cockroach,', 330, 400, t, 0.4, 24, { font: F.type, size: 76 });
    typeLine(ctx, 'there are probably more.', 330, 500, t, 0.4 + 27 / 24 + 0.2, 24, { font: F.type, size: 76, color: COL.red, keepCursor: false });
    const a = E.out(P(t, 3.2, 3.7));
    ctx.fillStyle = `rgba(227,38,46,${a})`; ctx.fillRect(334, 580, 60 * a, 4);
    txt(ctx, 'JAMIE DIMON', 410, 600, { size: 60, track: 4, alpha: a });
    txt(ctx, 'CEO, JPMORGAN CHASE  ·  OCT 2025', 412, 640, { font: F.mono, size: 22, color: COL.mute, track: 4, alpha: a });
    // roaches
    const roach = (x, y, ang, s, ph) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
      ctx.strokeStyle = '#3a1c10'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      for (let k = -1; k <= 1; k++) for (const side of [-1, 1]) {
        const sw = Math.sin(ph * 18 + k * 2 + (side > 0 ? 0 : Math.PI)) * 6;
        ctx.beginPath(); ctx.moveTo(k * 10, 0); ctx.lineTo(k * 10 + sw, side * 16); ctx.lineTo(k * 14 + sw * 1.4, side * 28); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(22, -3); ctx.quadraticCurveTo(45, -12, 62, -22 + Math.sin(ph * 5) * 4);
      ctx.moveTo(22, 3); ctx.quadraticCurveTo(45, 12, 62, 22 + Math.cos(ph * 5) * 4); ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = '#2a120a'; ctx.beginPath(); ctx.ellipse(-4, 0, 26, 13, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,190,160,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(18, 0); ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.stroke();
      ctx.fillStyle = '#1d0c06'; ctx.beginPath(); ctx.ellipse(22, 0, 7, 8, 0, 0, 7); ctx.fill();
      ctx.restore();
    };
    const crawl = (start, x0, y0, x1, y1, s, wiggle) => {
      if (t < start) return;
      const k = (t - start) / 3.2; if (k > 1.1) return;
      const x = lerp(x0, x1, k) + Math.sin(k * 20) * wiggle, y = lerp(y0, y1, k) + Math.cos(k * 17) * wiggle;
      const ang = Math.atan2(y1 - y0, x1 - x0) + Math.cos(k * 20) * 0.15;
      roach(x, y, ang, s, t);
    };
    crawl(2.4, 2000, 900, 1100, 760, 2.0, 8);
    crawl(3.9, -80, 1000, 700, 820, 1.6, 6);
    crawl(4.2, 1500, 1150, 1300, 840, 1.5, 10);
    crawl(4.5, 2000, 1050, 1500, 920, 1.7, 5);
    crawl(4.8, 400, 1150, 600, 920, 1.4, 7);
  },
};

// 14 ── personal data leaks / bank security issues
SCENES['14_data_leak'] = {
  dur: 5.5, tag: 'EXHIBIT 14 · THE LEAK',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.2 });
    const on = Math.floor(t * 3) % 2 === 0;
    txt(ctx, '● BREACH DETECTED', 140, 168, { font: F.mono, weight: 700, size: 30, color: COL.red, track: 6, alpha: on ? 1 : 0.4 });
    const scanned = Math.floor(lerp(0, 9_874_210, E.inOut(P(t, 0, 5))));
    txt(ctx, 'RECORDS SCANNED  ' + scanned.toLocaleString('en-US'), 1780, 168, { font: F.mono, size: 26, color: COL.mute, align: 'right', track: 3 });
    const cols = [140, 330, 720, 1080, 1480];
    const heads = ['ID', 'NAME', 'PHONE', 'ACCOUNT', 'STATUS'];
    heads.forEach((h, i) => txt(ctx, h, cols[i], 220, { font: F.mono, size: 20, color: COL.mute, track: 5 }));
    ctx.fillStyle = 'rgba(242,236,227,0.2)'; ctx.fillRect(140, 238, 1640, 1.5);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 250, W, 760); ctx.clip();
    const rowH = 58, scroll = t * 150;
    const first = Math.floor(scroll / rowH);
    for (let k = first; k < first + 16; k++) {
      const y = 300 + k * rowH - scroll;
      const r = rng(k * 13 + 1);
      const hot = Math.abs(y - 640) < 30;
      if (hot) { ctx.fillStyle = 'rgba(227,38,46,0.16)'; ctx.fillRect(130, y - 38, 1660, rowH - 6); }
      txt(ctx, '#' + String(100000 + Math.floor(r() * 899999)), cols[0], y, { font: F.mono, size: 24, color: COL.mute });
      let nx = cols[1];
      for (let w = 0; w < 2; w++) { const len = 70 + r() * 110; ctx.fillStyle = hot ? COL.red : 'rgba(242,236,227,0.75)'; ctx.fillRect(nx, y - 20, len, 22); nx += len + 14; }
      txt(ctx, '+91 9' + Math.floor(r() * 9) + '•••• ••' + String(Math.floor(r() * 900) + 100), cols[2], y, { font: F.mono, size: 24 });
      txt(ctx, 'XXXX XXXX ' + String(Math.floor(r() * 9000) + 1000), cols[3], y, { font: F.mono, size: 24 });
      txt(ctx, r() < 0.6 ? 'EXPOSED' : 'COPIED', cols[4], y, { font: F.mono, weight: 700, size: 24, color: COL.red, track: 3 });
    }
    ctx.restore();
    const fade = ctx.createLinearGradient(0, 250, 0, 1010);
    fade.addColorStop(0, 'rgba(6,6,7,1)'); fade.addColorStop(0.12, 'rgba(6,6,7,0)'); fade.addColorStop(0.88, 'rgba(6,6,7,0)'); fade.addColorStop(1, 'rgba(6,6,7,1)');
    ctx.fillStyle = fade; ctx.fillRect(0, 250, W, 760);
    ctx.fillStyle = 'rgba(227,38,46,0.6)'; ctx.fillRect(130, 640, 1660, 1.5);
    stamp(ctx, 'DATA LEAKED', W / 2, 600, P(t, 2.6, 3.0), { size: 170, rot: -6, track: 10, seed: 3 });
    glitchHit(S, t, 2.6, 0.2, 0.9);
  },
};

// 15 ── "Microsoft $4T, Nvidia the first $5T company — literally equal to the Indian economy"
SCENES['15_five_trillion'] = {
  dur: 6.5, tag: 'EXHIBIT 15 · THE SCALE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gx: 700, glow: 0.25, grid: true });
    txt(ctx, 'MARKET VALUE vs. A NATION\'S ECONOMY', 140, 150, { font: F.mono, size: 24, color: COL.red, track: 5, alpha: P(t, 0, 0.4) });
    txt(ctx, 'A $5 TRILLION CHIP COMPANY', 140, 240, { size: 100, track: 3, alpha: E.out(P(t, 0.1, 0.6)) });
    const bars = [['NVIDIA', 5.0, COL.red, 'MARKET VALUE · OCT 2025'], ['MICROSOFT', 4.0, 'rgba(242,236,227,0.45)', 'MARKET VALUE · JUL 2025'], ['INDIA', 4.1, COL.ink, 'ENTIRE GDP · 2025 (IMF EST.)']];
    const bx = 560, maxW = 1050;
    bars.forEach(([name, v, col, note], i) => {
      const y = 380 + i * 175, st = 0.6 + i * 0.5, p = E.out(P(t, st, st + 1.1));
      if (P(t, st - 0.2, st) <= 0) return;
      txt(ctx, name, 140, y + 50, { size: 76, track: 3, alpha: P(t, st - 0.2, st) });
      txt(ctx, note, 140, y + 90, { font: F.mono, size: 19, color: COL.mute, track: 3, alpha: P(t, st - 0.2, st) });
      ctx.fillStyle = 'rgba(242,236,227,0.06)'; ctx.fillRect(bx, y, maxW, 70);
      const w = (maxW * v / 5) * p;
      ctx.fillStyle = col; if (i === 0) { ctx.shadowColor = COL.red; ctx.shadowBlur = 30; }
      ctx.fillRect(bx, y, w, 70); ctx.shadowBlur = 0;
      txt(ctx, '$' + (v * p).toFixed(1) + 'T', bx + w + 24, y + 58, { size: 70, color: i === 0 ? COL.red : COL.ink, alpha: p > 0 ? 1 : 0 });
    });
    const a = E.out(P(t, 4.2, 4.7));
    ctx.fillStyle = `rgba(6,6,7,${0.85 * a})`; ctx.fillRect(0, 900, W, 180);
    ctx.save(); ctx.globalAlpha = a;
    multi(ctx, [['WORTH MORE THAN ', COL.ink], ["INDIA'S ENTIRE ECONOMY", COL.red]], W / 2, 1000, { size: 90, track: 4, align: 'center' });
    ctx.restore();
    glitchHit(S, t, 4.2, 0.15, 0.5);
  },
};

// 16 ── Nvidia → OpenAI → Oracle → Nvidia: circular money
const CIRCLE_DEALS = ['UP TO $100B INVESTMENT', '$300B CLOUD DEAL', 'BUYS NVIDIA CHIPS'];
SCENES['16_circular_money'] = {
  dur: 8.5, tag: 'EXHIBIT 16 · THE LOOP',
  draw(ctx, t, f, S) {
    bg(ctx, t, { gy: 540, glow: 0.35 });
    const cx = W / 2, cy = 545, R = 300, nr = 100;
    const nodes = [['NVIDIA', -90], ['OPENAI', 30], ['ORACLE', 150]];
    const pos = ang => [cx + Math.cos(ang * Math.PI / 180) * R, cy + Math.sin(ang * Math.PI / 180) * R];
    // arcs
    const off = 24;
    nodes.forEach(([, a0], i) => {
      const a1 = a0 + 120, st = 0.7 + i * 0.9, p = E.inOut(P(t, st, st + 0.8));
      if (p <= 0) return;
      const s = (a0 + off) * Math.PI / 180, e = lerp(a0 + off, a1 - off, p) * Math.PI / 180;
      ctx.save(); ctx.strokeStyle = COL.red; ctx.lineWidth = 4; ctx.shadowColor = COL.red; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(cx, cy, R, s, e); ctx.stroke();
      // arrow head
      const hx = cx + Math.cos(e) * R, hy = cy + Math.sin(e) * R, tang = e + Math.PI / 2;
      ctx.fillStyle = COL.red; ctx.beginPath();
      ctx.moveTo(hx + Math.cos(tang) * 18, hy + Math.sin(tang) * 18);
      ctx.lineTo(hx + Math.cos(tang + 2.5) * 16, hy + Math.sin(tang + 2.5) * 16);
      ctx.lineTo(hx + Math.cos(tang - 2.5) * 16, hy + Math.sin(tang - 2.5) * 16); ctx.closePath(); ctx.fill();
      ctx.restore();
      const mid = (a0 + 60) * Math.PI / 180;
      const lx = cx + Math.cos(mid) * (R + 70), ly = cy + Math.sin(mid) * (R + 70);
      const la = E.out(P(t, st + 0.5, st + 0.9));
      const align = Math.cos(mid) > 0.3 ? 'left' : Math.cos(mid) < -0.3 ? 'right' : 'center';
      txt(ctx, CIRCLE_DEALS[i], lx, ly + 10, { font: F.mono, weight: 700, size: 28, track: 3, align, alpha: la });
    });
    // money flowing
    if (t > 3.4) {
      const speed = lerp(0.25, 1.4, E.in(P(t, 3.4, 8.5)));
      const base = (t - 3.4) * speed * 2.2;
      for (let k = 0; k < 9; k++) {
        const ang = base + k * (Math.PI * 2 / 9) - Math.PI / 2;
        const x = cx + Math.cos(ang) * R, y = cy + Math.sin(ang) * R;
        txt(ctx, '$', x, y + 14, { size: 46, align: 'center', color: COL.amber, glow: 'rgba(255,174,66,0.9)', glowBlur: 25, alpha: P(t, 3.4, 3.8) });
      }
    }
    // nodes
    nodes.forEach(([name, a], i) => {
      const [x, y] = pos(a), p = E.back(P(t, 0.1 + i * 0.2, 0.6 + i * 0.2));
      if (p <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      ctx.fillStyle = '#0c0a0b'; ctx.beginPath(); ctx.arc(0, 0, nr, 0, 7); ctx.fill();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.stroke();
      txt(ctx, name, 0, 22, { size: 62, align: 'center', track: 3 });
      ctx.restore();
    });
    const ca = E.out(P(t, 3.8, 4.3));
    txt(ctx, 'CIRCULAR', cx, cy - 5, { size: 92, align: 'center', track: 6, alpha: ca });
    txt(ctx, 'MONEY', cx, cy + 80, { size: 92, align: 'center', track: 10, color: COL.red, alpha: ca, glow: 'rgba(227,38,46,0.6)' });
    const ba = E.out(P(t, 5.6, 6.1));
    txt(ctx, 'LOOKS LIKE PROFIT OUTSIDE. HOLLOW INSIDE?', W / 2, 1010, { font: F.type, size: 46, align: 'center', alpha: ba });
    glitchHit(S, t, 3.8, 0.15, 0.6);
  },
};

// 17 ── Bank of England + IMF warn about AI shares
SCENES['17_official_warning'] = {
  dur: 5.5, tag: 'EXHIBIT 17 · THE ALARM',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.3 });
    const strobe = Math.max(0, Math.sin(t * Math.PI * 2 * 1.2)) ** 3;
    ctx.fillStyle = `rgba(227,38,46,${0.12 * strobe})`; ctx.fillRect(0, 0, W, H);
    // hazard tape
    for (const [y, dir] of [[150, 1], [900, -1]]) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, y, W, 56); ctx.clip();
      ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, y, W, 56);
      ctx.fillStyle = COL.red;
      const off = (t * 120 * dir) % 80;
      for (let x = -160; x < W + 160; x += 80) { ctx.beginPath(); ctx.moveTo(x + off, y + 56); ctx.lineTo(x + off + 40, y); ctx.lineTo(x + off + 80, y); ctx.lineTo(x + off + 40, y + 56); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
    // warning triangle + word
    const fl = hash(f * 2.3) > 0.12 ? 1 : 0.35;
    ctx.save(); ctx.globalAlpha = fl; ctx.strokeStyle = COL.red; ctx.lineWidth = 10; ctx.lineJoin = 'round';
    ctx.shadowColor = COL.red; ctx.shadowBlur = 40;
    ctx.beginPath(); ctx.moveTo(470, 300); ctx.lineTo(560, 460); ctx.lineTo(380, 460); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = COL.red; ctx.fillRect(465, 350, 10, 60); ctx.fillRect(465, 422, 10, 12);
    ctx.restore();
    txt(ctx, 'WARNING', 620, 470, { size: 230, color: COL.red, track: 16, glow: 'rgba(227,38,46,0.8)', glowBlur: 50, alpha: fl });
    // the two institutions
    ['BANK OF ENGLAND', 'IMF'].forEach((n, i) => {
      const p = E.out(P(t, 0.6 + i * 0.3, 1.1 + i * 0.3));
      const x = 380 + i * 620, y = 560;
      ctx.save(); ctx.globalAlpha = p;
      ctx.fillStyle = COL.card; ctx.fillRect(x, y + (1 - p) * 30, 540, 120);
      ctx.strokeStyle = 'rgba(242,236,227,0.2)'; ctx.lineWidth = 1.5; ctx.strokeRect(x, y + (1 - p) * 30, 540, 120);
      txt(ctx, n, x + 270, y + 75 + (1 - p) * 30, { size: 66, align: 'center', track: 5 });
      ctx.restore();
    });
    txt(ctx, 'OCT 2025', W / 2, 735, { font: F.mono, size: 22, align: 'center', color: COL.mute, track: 6, alpha: P(t, 1.2, 1.6) });
    typeLine(ctx, 'AI STOCKS LOOK STRETCHED — RISK OF A SHARP CORRECTION', 230, 830, t, 1.6, 34, { font: F.mono, weight: 700, size: 36, track: 1, keepCursor: true });
  },
};

// 18 ── the robot: jobs, crypto, data
SCENES['18_jobs_crypto_data'] = {
  dur: 6.5, tag: 'EXHIBIT 18 · THE ROBBERY',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.22, grid: true });
    ctx.save(); ctx.globalAlpha = E.out(P(t, 0, 0.5));
    multi(ctx, [['WHAT IS THE ', COL.ink], ['ROBOT', COL.red], [' STEALING?', COL.ink]], W / 2, 200, { size: 104, track: 5, align: 'center' });
    ctx.restore();
    const folders = [
      ['01', 'JOBS', 'Entry-level work,\nreplaced by AI', 'AT RISK'],
      ['02', 'CRYPTO', '~$1.5B stolen from one\nexchange in a single hack', 'STOLEN'],
      ['03', 'DATA', 'The fuel of AI —\ntraded in the dark', 'FOR SALE'],
    ];
    const fw = 490, gap = 55, x0 = (W - (3 * fw + 2 * gap)) / 2, y0 = 300, fh = 560;
    folders.forEach(([n, title, desc, st], i) => {
      const s0 = 0.5 + i * 0.5, p = E.out(P(t, s0, s0 + 0.5));
      if (p <= 0) return;
      const x = x0 + i * (fw + gap), y = y0 + (1 - p) * 120;
      ctx.save(); ctx.globalAlpha = p;
      ctx.fillStyle = COL.manila;
      ctx.beginPath(); ctx.moveTo(x, y + 44); ctx.lineTo(x + 20, y); ctx.lineTo(x + 190, y); ctx.lineTo(x + 210, y + 44); ctx.lineTo(x + fw, y + 44); ctx.lineTo(x + fw, y + 44 + fh); ctx.lineTo(x, y + 44 + fh); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(242,220,190,0.18)'; ctx.lineWidth = 1.5; ctx.stroke();
      txt(ctx, 'FILE ' + n, x + 34, y + 32, { font: F.mono, size: 18, color: 'rgba(242,220,190,0.6)', track: 4 });
      txt(ctx, n, x + 40, y + 140, { font: F.mono, weight: 700, size: 34, color: COL.red });
      txt(ctx, title, x + 40, y + 270, { size: 150, track: 4, color: '#efe2cf' });
      desc.split('\n').forEach((ln, k) => txt(ctx, ln, x + 40, y + 340 + k * 42, { font: F.type, size: 30, color: 'rgba(239,226,207,0.7)' }));
      ctx.restore();
      stamp(ctx, st, x + fw / 2, y0 + 510, P(t, 2.4 + i * 0.45, 2.8 + i * 0.45), { size: 76, rot: -9 + i * 4, under: COL.manila, seed: 30 + i });
      glitchHit(S, t, 2.45 + i * 0.45, 0.08, 0.35);
    });
  },
};

// 19 ── "there's definitely a message in those binary codes"
SCENES['19_hidden_message'] = {
  dur: 5.5, tag: 'EXHIBIT 19 · THE CODE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.18 });
    // binary rain
    const r0 = rng(3);
    for (let c = 0; c < 64; c++) {
      const x = c * 30 + 12, sp = 120 + r0() * 260, ph = r0() * 2000, len = 10 + Math.floor(r0() * 18);
      const head = ((t * sp + ph) % (H + len * 28));
      for (let k = 0; k < len; k++) {
        const y = head - k * 28; if (y < 0 || y > H) continue;
        const bit = hash(c * 131 + k * 7 + Math.floor(t * 8)) > 0.5 ? '1' : '0';
        txt(ctx, bit, x, y, { font: F.mono, size: 22, color: k === 0 ? COL.ink : COL.red, alpha: (k === 0 ? 0.7 : 0.35) * (1 - k / len) });
      }
    }
    // band
    ctx.fillStyle = 'rgba(6,6,7,0.92)'; ctx.fillRect(0, 300, W, 520);
    ctx.fillStyle = 'rgba(227,38,46,0.6)'; ctx.fillRect(0, 300, W, 2); ctx.fillRect(0, 818, W, 2);
    txt(ctx, 'A HIDDEN MESSAGE?', W / 2, 380, { font: F.mono, size: 30, align: 'center', track: 16, color: COL.mute });
    const bytes = ['00110010', '00110000', '00110010', '00110111'], chars = ['2', '0', '2', '7'];
    const bw = 360, gx = 60, bx0 = (W - (4 * bw + 3 * gx)) / 2;
    bytes.forEach((b, i) => {
      const x = bx0 + i * (bw + gx);
      let s = '';
      for (let k = 0; k < 8; k++) {
        const lockAt = 0.6 + (i * 8 + k) * 0.05;
        s += t >= lockAt ? b[k] : (hash(f * 17 + i * 8 + k) > 0.5 ? '1' : '0');
      }
      const locked = t >= 0.6 + (i * 8 + 7) * 0.05;
      txt(ctx, s, x + bw / 2, 500, { font: F.mono, weight: 700, size: 56, align: 'center', track: 4, color: locked ? COL.ink : COL.mute });
      const dp = E.out(P(t, 2.6 + i * 0.25, 3.0 + i * 0.25));
      if (dp > 0) {
        ctx.strokeStyle = `rgba(227,38,46,${dp})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 20, 530); ctx.lineTo(x + 20, 545); ctx.lineTo(x + bw - 20, 545); ctx.lineTo(x + bw - 20, 530); ctx.moveTo(x + bw / 2, 545); ctx.lineTo(x + bw / 2, 545 + 30 * dp); ctx.stroke();
        txt(ctx, chars[i], x + bw / 2, 770, { size: 220 * lerp(1.3, 1, dp), align: 'center', color: COL.red, alpha: dp, glow: 'rgba(227,38,46,0.7)' });
      }
      glitchHit(S, t, 2.6 + i * 0.25, 0.08, 0.4);
    });
  },
};

// 20 ── oil pipeline breaks → crude up → petrol, diesel, CNG up
SCENES['20_oil_pipeline'] = {
  dur: 7.5, tag: 'EXHIBIT 20 · THE LIFELINE',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.1 });
    const z = E.inOut(P(t, 0, 7.5));
    const proj = d3.geoMercator().center([48.5, 25]).scale(lerp(2500, 2850, z)).translate([700, 590]);
    const path = d3.geoPath(proj, ctx);
    ctx.beginPath(); path(COUNTRIES); ctx.fillStyle = '#171314'; ctx.fill();
    ctx.strokeStyle = 'rgba(242,236,227,0.18)'; ctx.lineWidth = 1.2; ctx.stroke();
    const names = [['SAUDI ARABIA', [44.5, 22]], ['IRAN', [55, 31]], ['IRAQ', [43.5, 33]], ['UAE', [54.3, 23.6]], ['OMAN', [57, 20.5]], ['YEMEN', [47.5, 15.6]], ['QATAR', [51.2, 25.1]]];
    names.forEach(([n, ll]) => { const [x, y] = proj(ll); txt(ctx, n, x, y, { font: F.mono, size: 18, color: COL.mute, align: 'center', track: 4, alpha: 0.6 }); });
    // tanker route through Hormuz
    const route = [[50.5, 27.6], [53.5, 26.3], [56.3, 26.5], [58.5, 24.5], [61.5, 22]].map(ll => proj(ll));
    ctx.save(); ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = 'rgba(242,236,227,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); route.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    const [hx, hy] = proj([56.4, 26.6]);
    pulseRings(ctx, hx, hy, t, { r: 60, color: COL.amber, dot: 5 });
    txt(ctx, 'STRAIT OF HORMUZ', hx - 10, hy - 48, { font: F.mono, size: 20, color: COL.amber, track: 3, align: 'center' });
    // East–West pipeline (Abqaiq → Yanbu)
    const pipe = [[49.7, 25.9], [47.2, 24.9], [44.3, 24.4], [41, 24.2], [38.1, 24.1]].map(ll => proj(ll));
    const lens = []; let total = 0;
    for (let i = 1; i < pipe.length; i++) { const d = Math.hypot(pipe[i][0] - pipe[i - 1][0], pipe[i][1] - pipe[i - 1][1]); lens.push(d); total += d; }
    const pointAt = s => { let acc = 0; for (let i = 0; i < lens.length; i++) { if (acc + lens[i] >= s) { const k = (s - acc) / lens[i]; return [lerp(pipe[i][0], pipe[i + 1][0], k), lerp(pipe[i][1], pipe[i + 1][1], k)]; } acc += lens[i]; } return pipe[pipe.length - 1]; };
    const drawSeg = (s0, s1, style) => {
      ctx.beginPath(); const N = 50;
      for (let k = 0; k <= N; k++) { const [x, y] = pointAt(lerp(s0, s1, k / N)); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      style(); ctx.stroke();
    };
    const grow = E.inOut(P(t, 0.3, 1.7)) * total, breakS = total * 0.48, broken = t > 2.6;
    const pipeStyle = () => { ctx.strokeStyle = COL.amber; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.shadowColor = COL.amber; ctx.shadowBlur = 16; };
    ctx.save();
    if (!broken) drawSeg(0, grow, pipeStyle);
    else { drawSeg(0, breakS - 14, pipeStyle); drawSeg(breakS + 14, total, () => { pipeStyle(); ctx.strokeStyle = 'rgba(255,174,66,0.3)'; ctx.shadowBlur = 0; }); }
    ctx.restore();
    txt(ctx, 'EAST–WEST PIPELINE', pipe[0][0] - 40, pipe[0][1] - 40, { font: F.mono, size: 20, color: COL.amber, track: 3, alpha: P(t, 1.2, 1.6), align: 'right' });
    if (broken) {
      const [bxp, byp] = pointAt(breakS), k = t - 2.6;
      // spill
      ctx.fillStyle = 'rgba(20,4,4,0.9)'; ctx.beginPath();
      const rs = rng(8);
      for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2, rr = (30 + rs() * 30) * E.out(clamp(k / 2)); const x = bxp + Math.cos(a) * rr * 1.5, y = byp + Math.sin(a) * rr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath(); ctx.fill(); ctx.strokeStyle = 'rgba(227,38,46,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = `rgba(255,240,220,${clamp(1 - k / 0.25)})`; ctx.beginPath(); ctx.arc(bxp, byp, 60 * clamp(k / 0.25) + 10, 0, 7); ctx.fill();
      pulseRings(ctx, bxp, byp, t, { r: 120 });
      txt(ctx, 'SUPPLY CUT', bxp, byp + 90, { font: F.mono, weight: 700, size: 26, color: COL.red, align: 'center', track: 6 });
    }
    glitchHit(S, t, 2.6, 0.22, 1);
    if (t > 2.6 && t < 2.9) S.shake = 14;
    // headline
    txt(ctx, 'IF THE OIL STOPS...', 120, 225, { size: 96, track: 5, alpha: E.out(P(t, 0.2, 0.7)) });
    // right panel
    ctx.fillStyle = 'rgba(10,8,9,0.92)'; ctx.fillRect(1340, 0, 580, H);
    ctx.fillStyle = 'rgba(227,38,46,0.6)'; ctx.fillRect(1340, 0, 2, H);
    const pa = E.out(P(t, 3.0, 3.5));
    txt(ctx, 'CRUDE OIL', 1410, 250, { size: 90, track: 4, alpha: pa });
    if (pa > 0) {
      const rise = E.out(P(t, 3.1, 4.4));
      ctx.save(); ctx.globalAlpha = pa; ctx.fillStyle = COL.red; ctx.shadowColor = COL.red; ctx.shadowBlur = 30;
      const ax = 1780, ay = 230, ah = 140 * rise;
      ctx.fillRect(ax - 12, ay - ah + 30, 24, ah); triUp(ctx, ax, ay - ah + 10, 36, COL.red);
      ctx.restore();
    }
    txt(ctx, 'SUPPLY ▼  PRICE ▲', 1410, 310, { font: F.mono, size: 26, color: COL.mute, track: 2, alpha: P(t, 3.6, 4.0) });
    ['PETROL', 'DIESEL', 'CNG'].forEach((n, i) => {
      const st = 4.2 + i * 0.4, a = E.out(P(t, st, st + 0.35)), y = 500 + i * 150;
      if (a <= 0) return;
      ctx.fillStyle = `rgba(242,236,227,${0.08 * a})`; ctx.fillRect(1410, y - 80, 430, 110);
      txt(ctx, n, 1440 + (1 - a) * 30, y, { size: 88, track: 4, alpha: a });
      triUp(ctx, 1780, y - 30, 26 * a, COL.red);
    });
  },
};

// 21 ── outro: "something big will happen in 2027 — let's stay prepared"
SCENES['21_stay_prepared'] = {
  dur: 6, tag: 'EXHIBIT 21 · WHAT COMES NEXT',
  draw(ctx, t, f, S) {
    bg(ctx, t, { glow: 0.45 * (0.85 + 0.15 * Math.sin(t * 5)) });
    // orbiting motifs
    const icons = ['globe', 'flame', 'trend', 'chip', 'cross', 'bank', 'drop'];
    ctx.save(); ctx.strokeStyle = 'rgba(227,38,46,0.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    icons.forEach((ic, i) => {
      const a = t * 0.25 + (i / icons.length) * Math.PI * 2;
      const x = W / 2 + Math.cos(a) * 700, y = 500 + Math.sin(a) * 330;
      ctx.globalAlpha = 0.6 * P(t, 0.1 + i * 0.08, 0.5 + i * 0.08);
      ICON[ic](ctx, x, y, 90);
    });
    ctx.restore();
    const beat = 1 + 0.025 * Math.max(0, Math.sin(t * Math.PI * 2 * 1.1)) ** 8;
    if (t > 0.6) {
      ctx.save(); ctx.translate(W / 2, 560); ctx.scale(beat, beat);
      txt(ctx, '2027', 0, 0, { size: 440, align: 'center', color: COL.red, track: 20, glow: 'rgba(227,38,46,0.8)', glowBlur: 80 });
      ctx.restore();
    }
    glitchHit(S, t, 0.6, 0.35, 1);
    typeLine(ctx, 'SOMETHING BIG IS COMING?', W / 2 - measure(ctx, 'SOMETHING BIG IS COMING?', { font: F.type, size: 50 }) / 2, 700, t, 2.0, 22, { font: F.type, size: 50, color: COL.mute });
    const a = E.out(P(t, 3.6, 4.1));
    txt(ctx, 'STAY PREPARED.', W / 2, 880, { size: 140, align: 'center', track: 18, alpha: a });
    glitchHit(S, t, 3.6, 0.15, 0.6);
  },
};
