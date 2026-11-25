/* Avni Health ERP — launch film v2 (60 s, 120 BPM, retention cut).
   Hook (0–15 s): a cut every 0.5–1.5 s, 3D healthcare elements, comets, neon lines.
   Deterministic: renderFrame(f, fps) seeks GSAP + redraws procedural layers. */
(function () {
  const DURATION = 60.0;
  const T = gsap.timeline({ paused: true });
  const CUES = [], DYN = [];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const cue = (t, name, gain = 1, pan = 0) => CUES.push({ t: +t.toFixed(4), name, gain, pan });
  const ease = (n) => gsap.parseEase(n);
  const seg = (t, a, b, e = 'none') => ease(e)(Math.min(1, Math.max(0, (t - a) / (b - a))));
  const lerp = (a, b, k) => a + (b - a) * k;

  /* ---------- tween helpers (immediateRender only on the first tween per element+prop) ---------- */
  const seen = new Map();
  function ft(targets, from, to, pos) {
    const els = gsap.utils.toArray(targets);
    const props = Object.keys(from).map((p) => (p === 'autoAlpha' ? 'opacity' : p));
    let first = true;
    els.forEach((e) => { const s = seen.get(e) || new Set(); props.forEach((p) => { if (s.has(p)) first = false; s.add(p); }); seen.set(e, s); });
    T.fromTo(els, from, Object.assign({}, to, { immediateRender: first }), pos);
  }
  const show = (sel, t0, t1) => { T.set(sel, { visibility: 'visible' }, t0); if (t1 != null) T.set(sel, { visibility: 'hidden' }, t1); };
  // opacity "switch" for background layers: tiny tweens, scheduled strictly in time order
  const fade = (sel, v, t, d = 0.01, e = 'power1.inOut') => T.to(sel, { opacity: v, duration: d, ease: e }, t);

  function splitWords(root) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.tagName !== 'IMG' && n.tagName !== 'svg') walk(n);
      });
    };
    walk(root); return out;
  }
  function splitChars(root) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            if (ch === '\n') return;
            const s = document.createElement('span'); s.className = 'c';
            s.innerHTML = ch === ' ' ? '&nbsp;' : ch; frag.appendChild(s); out.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(root); return out;
  }
  // background-clip:text does not survive transformed inline-block children: give every piece its own slice of the gradient
  function fixGrad(scope) {
    scope.querySelectorAll('.grad,.gradL').forEach((g) => {
      const pr = g.getBoundingClientRect();
      const bg = getComputedStyle(g).backgroundImage;
      const pieces = g.querySelectorAll('.wi,.c');
      if (!pieces.length) return;
      pieces.forEach((p) => {
        const r = p.getBoundingClientRect();
        Object.assign(p.style, {
          backgroundImage: bg, backgroundSize: `${pr.width}px ${pr.height}px`,
          backgroundPosition: `${-(r.left - pr.left)}px ${-(r.top - pr.top)}px`,
          webkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        });
      });
      g.style.background = 'none'; g.style.color = 'inherit';
    });
  }
  const rect = (el) => { const r = (typeof el === 'string' ? $(el) : el).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height }; };

  const rise = (els, t, stagger = 0.06, dur = 0.75) => ft(els, { yPercent: 115, opacity: 0 }, { yPercent: 0, opacity: 1, duration: dur, ease: 'expo.out', stagger }, t);
  const blurIn = (els, t, stagger = 0.08, dur = 0.7, y = 24) => ft(els, { opacity: 0, y, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'power3.out', stagger }, t);
  const pop = (els, t, stagger = 0.1, dur = 0.7, s = 0.4) => ft(els, { opacity: 0, scale: s }, { opacity: 1, scale: 1, duration: dur, ease: 'back.out(2.2)', stagger }, t);
  const flyIn = (el, t, dx, dy, rot = 30, dur = 0.8) => ft(el, { x: dx, y: dy, rotate: rot, scale: 0.4, opacity: 0, filter: 'blur(12px)' }, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: 'blur(0px)', duration: dur, ease: 'expo.out' }, t);
  const slam = (el, t, from = 1.4) => ft(el, { scale: from, opacity: 0, filter: 'blur(16px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.28, ease: 'power3.out' }, t);
  const exitUp = (els, t, stagger = 0.025, dur = 0.38) => T.to(els, { yPercent: -115, opacity: 0, duration: dur, ease: 'power3.in', stagger }, t);

  /* cursor */
  const HX = 9.4, HY = 5.2;
  let curStarted = false;
  function cursorIn(t, fx, fy, tx, ty, dur = 0.6) {
    if (!curStarted) { ft('#cursor', { x: fx - HX, y: fy - HY, opacity: 0 }, { x: tx - HX, y: ty - HY, opacity: 1, duration: dur, ease: 'power3.out' }, t); curStarted = true; }
    else { T.set('#cursor', { x: fx - HX, y: fy - HY }, t); T.to('#cursor', { x: tx - HX, y: ty - HY, opacity: 1, duration: dur, ease: 'power3.out' }, t); }
  }
  const cursorOut = (t, dx = 240, dy = 220) => T.to('#cursor', { x: `+=${dx}`, y: `+=${dy}`, opacity: 0, duration: 0.5, ease: 'power2.in' }, t);
  function click(t, x, y) {
    T.to('#cursor', { scale: 0.8, transformOrigin: '19% 10%', duration: 0.08, yoyo: true, repeat: 1 }, t);
    T.set('#clickRing', { x, y, scale: 0.2, opacity: 0.9 }, t);
    T.to('#clickRing', { scale: 1.4, opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 0.001);
    cue(t, 'click', 1);
  }

  /* ---------- procedural FX: comets + neon lines ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const STAR = 'M0 -38 C4 -10 10 -4 38 0 C10 4 4 10 0 38 C-4 10 -10 4 -38 0 C-10 -4 -4 -10 0 -38Z';
  function comet(t0, dur, d, { width = 10, trail = 520, size = 1, color = '#32d58b' } = {}) {
    const g = document.createElementNS(NS, 'g');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color); p.setAttribute('stroke-width', width);
    p.setAttribute('stroke-linecap', 'round'); p.setAttribute('filter', 'url(#glow)');
    const s = document.createElementNS(NS, 'path'); s.setAttribute('d', STAR); s.setAttribute('fill', '#eafff4'); s.setAttribute('filter', 'url(#glowBig)');
    const s2 = document.createElementNS(NS, 'path'); s2.setAttribute('d', STAR); s2.setAttribute('fill', color); s2.setAttribute('transform', 'scale(.55)');
    const sg = document.createElementNS(NS, 'g'); sg.appendChild(s); sg.appendChild(s2);
    g.appendChild(p); g.appendChild(sg); $('#comets').appendChild(g);
    const L = p.getTotalLength();
    DYN.push((t) => {
      const k = (t - t0) / dur;
      if (k < 0 || k > 1.35) { g.style.display = 'none'; return; }
      g.style.display = '';
      const e = ease('power2.inOut')(Math.min(1, k));
      const head = e * L;
      const tl = Math.min(trail, head);
      p.setAttribute('stroke-dasharray', `${tl} ${L + trail}`);
      p.setAttribute('stroke-dashoffset', `${-(head - tl)}`);
      const fadeOut = k > 1 ? 1 - (k - 1) / 0.35 : 1;
      p.style.opacity = (0.9 * fadeOut).toFixed(3);
      const pt = p.getPointAtLength(Math.min(head, L));
      const sc = size * (0.6 + 0.4 * Math.sin(Math.min(1, k) * Math.PI)) * fadeOut;
      sg.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(t * 220).toFixed(1)}) scale(${Math.max(0, sc).toFixed(3)})`);
    });
  }
  function neon(t0, dur, pts, { color = '#32d58b', seglen = 420, width = 3 } = {}) {
    const p = document.createElementNS(NS, 'polyline');
    p.setAttribute('points', pts); p.setAttribute('fill', 'none'); p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', width); p.setAttribute('stroke-linejoin', 'round'); p.setAttribute('stroke-linecap', 'round');
    $('#neon').appendChild(p);
    const L = p.getTotalLength();
    DYN.push((t) => {
      const k = (t - t0) / dur;
      if (k < 0 || k > 1) { p.style.display = 'none'; return; }
      p.style.display = '';
      const e = ease('power2.inOut')(k);
      p.setAttribute('stroke-dasharray', `${seglen} ${L + seglen}`);
      p.setAttribute('stroke-dashoffset', `${seglen - e * (L + seglen)}`);
    });
  }
  // gentle idle float for 3D elements (CSS translate/rotate compose with GSAP transforms)
  function floaty(els, amp = 14, rot = 5) {
    els.forEach((el, i) => DYN.push((t) => {
      el.style.translate = `${(Math.sin(t * 0.9 + i * 1.7) * amp * 0.5).toFixed(2)}px ${(Math.sin(t * 1.3 + i * 2.3) * amp).toFixed(2)}px`;
      el.style.rotate = `${(Math.sin(t * 0.8 + i) * rot).toFixed(2)}deg`;
    }));
  }

  /* ================================================================== */
  function build() {
    // ---- split text first, then fix gradients, then measure
    const h1c = splitChars($('#h1t'));
    const h2c = splitChars($('#h2t'));
    const h4c = splitChars($('#h4t'));
    const h6w = splitWords($('#h6t'));
    const h7w = splitWords($('#h7t'));
    const f1w = splitWords($('#f1h'));
    const f2w = splitWords($('#f2h'));
    const f3w = splitWords($('#f3h'));
    const f4w = splitWords($('#f4h'));
    const f4w2 = splitWords($('#f4h2'));
    const c1w = splitWords($('#c1h'));
    const c2w = splitWords($('#c2tag'));
    const bbw = splitWords($('#bb'));
    // scenes are hidden but laid out: fixGrad measures natural positions
    fixGrad(document.body);
    const P = { neha: rect('#dB'), wed: rect('#dW'), btn: rect('#c2btn') };

    /* ---------- background system ---------- */
    DYN.push((t) => {
      const b = [['#b1', 0.31, 0.23, 160, 110], ['#b2', 0.27, 0.35, 180, 120], ['#b3', 0.4, 0.29, 150, 140], ['#b4', 0.22, 0.31, 170, 90]];
      b.forEach(([s, a, c, ax, ay], i) => { $(s).style.translate = `${(Math.sin(t * a + i) * ax).toFixed(1)}px ${(Math.cos(t * c + i * 2) * ay).toFixed(1)}px`; });
    });
    // dark / colour layers — strictly ordered switches
    fade('#darkbg', 1, 2.5); fade('#darkbg', 0, 3.0);
    fade('#colorbg', 1, 3.5); fade('#colorbg', 0, 4.0);
    fade('#darkbg', 1, 4.0); fade('#darkbg', 0, 7.95, 0.05);
    fade('#horizon', 1, 5.5, 0.7, 'power2.out'); fade('#horizon', 0, 7.7, 0.25);
    fade('#darkbg', 1, 27.25, 0.25); fade('#darkbg', 0, 35.35, 0.3);
    fade('#darkbg', 1, 42.0); fade('#darkbg', 0, 45.85, 0.15);
    fade('#horizon', 0.75, 51.8, 1.2, 'power2.out');

    /* ====== H1 · "Your health" (0–1.5) ====== */
    show('#h1', 0, 1.5);
    ft(h1c, { yPercent: 120, opacity: 0, rotate: 8 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 0.6, ease: 'expo.out', stagger: 0.035 }, 0.02);
    ft('#h1t', { scale: 1.12 }, { scale: 1, duration: 1.5, ease: 'power2.out' }, 0);
    cue(0.0, 'slam', 0.9);
    flyIn('#h1e1', 0.12, -420, 120, -40);
    flyIn('#h1e2', 0.28, 380, 260, 35);
    flyIn('#h1e3', 0.42, 300, -260, 50, 0.7);
    flyIn('#h1e4', 0.55, -320, 260, -50, 0.7);
    [0.12, 0.28, 0.42, 0.55].forEach((t, i) => cue(t, 'pop', 0.55, i % 2 ? 0.5 : -0.5));
    floaty($$('#h1 .el'), 12, 6);
    comet(0.15, 1.05, 'M -120 860 C 420 760, 820 330, 2080 220', { size: 1.1 });
    cue(0.15, 'comet', 0.8);
    neon(0.05, 0.9, '-50,180 380,180 520,40 900,40');
    neon(0.2, 0.9, '1980,900 1500,900 1360,1030 1000,1030');
    neon(0.35, 1.0, '1980,120 1700,120 1600,260 1300,260');

    /* ====== H2 · "is scattered." (1.5–2.5) ====== */
    show('#h2', 1.5, 2.5);
    ft(h2c, { opacity: 0, y: 60, rotate: (i) => ((i * 37) % 21) - 10 }, { opacity: 1, y: 0, rotate: 0, duration: 0.4, ease: 'back.out(2)', stagger: 0.018 }, 1.5);
    $$('#h2 .el').forEach((el, i) => {
      const x = +el.dataset.x, y = +el.dataset.y, r = +el.dataset.r;
      el.style.left = x + 'px'; el.style.top = y + 'px';
      const w = el.classList.contains('s') ? 150 : 200;
      ft(el, { x: 960 - x - w / 2, y: 540 - y - w / 2, scale: 0.15, rotate: 0, opacity: 0, filter: 'blur(14px)' },
        { x: 0, y: 0, scale: 1, rotate: r, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'expo.out' }, 1.52 + i * 0.025);
    });
    floaty($$('#h2 .el'), 10, 8);
    cue(1.5, 'scatter', 1);
    ft('#h2t', { scale: 1 }, { scale: 1.07, duration: 1.0, ease: 'none' }, 1.5);
    T.to(h2c.slice(3), { y: (i) => ((i * 53) % 40) - 20, rotate: (i) => ((i * 29) % 30) - 15, duration: 0.3, ease: 'power2.out' }, 2.15);

    /* ====== H3 · slams (2.5–4.0) ====== */
    show('#h3', 2.5, 4.0);
    [['#h3a', '#h3ea', 2.5], ['#h3b', '#h3eb', 3.0], ['#h3c', '#h3ec', 3.5]].forEach(([s, e, t], i) => {
      show(s, t, t + 0.5); show(e, t, t + 0.5);
      slam(s, t);
      T.to(s, { scale: 1.06, duration: 0.25, ease: 'none' }, t + 0.25);
      ft(e, { scale: 0.2, rotate: -40, opacity: 0 }, { scale: 1, rotate: i % 2 ? 12 : -12, opacity: 1, duration: 0.4, ease: 'back.out(2.5)' }, t + 0.04);
      cue(t, 'slam', 0.85); cue(t + 0.04, 'pop', 0.5, i % 2 ? -0.5 : 0.5);
    });
    T.set('#h3ea,#h3eb,#h3ec', { visibility: 'hidden' }, 0);

    /* ====== H4 · "Not anymore." (4.0–5.5) ====== */
    show('#h4', 4.0, 5.5);
    const sw = $('#swoosh'); const SL = sw.getTotalLength();
    ft(sw, { strokeDasharray: SL, strokeDashoffset: SL }, { strokeDasharray: SL, strokeDashoffset: 0, duration: 0.7, ease: 'power3.out' }, 4.0);
    cue(4.0, 'brush', 1);
    ft(h4c, { x: 140, opacity: 0, filter: 'blur(10px)' }, { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out', stagger: 0.025 }, 4.1);
    cue(4.1, 'slam', 0.6);
    T.to('#h4t', { x: -360, opacity: 0, filter: 'blur(14px)', duration: 0.32, ease: 'power3.in' }, 5.15);
    T.to(sw, { opacity: 0, duration: 0.3 }, 5.15);

    /* ====== H5 · logo on the green horizon (5.5–8.0) ====== */
    show('#h5', 5.5, 8.0);
    cue(5.5, 'impact', 1);
    ft('#m5', { scale: 0.3, opacity: 0, rotate: -25, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: 'expo.out' }, 5.5);
    ft('#m5a', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, 5.62);
    ft('#m5h', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 5.72);
    ft('#m5c', { scale: 0, rotate: -90, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(2.5)' }, 5.8);
    $$('#h5 .lring').forEach((r, i) => ft(r, { scale: 0.6, opacity: 0.9 }, { scale: 3.4, opacity: 0, duration: 1.4, ease: 'power2.out' }, 5.5 + i * 0.22));
    ft('#wm5r', { attr: { width: 0 } }, { attr: { width: 200 }, duration: 0.7, ease: 'expo.out' }, 6.0);
    ft('#t5', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 6.0);
    ft('#s5', { opacity: 0, attr: { 'letter-spacing': 12 } }, { opacity: 1, attr: { 'letter-spacing': 4 }, duration: 0.9, ease: 'expo.out' }, 6.2);
    ft('#l5', { scale: 0, rotate: -70, transformOrigin: '0% 100%' }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)' }, 6.5);
    cue(6.0, 'whooshS', 0.5); cue(6.5, 'shimmer', 0.7);
    ft('#logo5', { scale: 1 }, { scale: 1.08, duration: 2.0, ease: 'none' }, 5.7);
    comet(6.55, 1.0, 'M -100 300 C 500 120, 1300 700, 2050 520', { size: 0.9, color: '#b6df7e' });
    cue(6.55, 'comet', 0.6);
    neon(5.55, 0.8, '-40,700 600,700 700,820 1100,820');
    neon(5.65, 0.8, '1960,380 1400,380 1300,250 900,250');
    T.to('#logo5', { scale: 0.75, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power3.in' }, 7.7);
    ft('#flash', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.in' }, 7.75);
    T.to('#flash', { opacity: 0, duration: 0.45, ease: 'power2.out' }, 8.0);
    cue(7.75, 'swipe', 0.8);

    /* ====== H6 · Healthcare that moves with you (8.0–11.0) ====== */
    show('#h6', 8.0, 11.1);
    rise(h6w.slice(0, 1), 8.05); rise(h6w.slice(1, 3), 8.4, 0.08); rise(h6w.slice(3), 8.8, 0.08);
    cue(8.05, 'tok', 0.6); cue(8.4, 'tok', 0.6); cue(8.8, 'tok', 0.6);
    ft('#phone', { y: 520, rotateY: -38, rotateX: 24, opacity: 0, transformPerspective: 1600 }, { y: 0, rotateY: -16, rotateX: 6, opacity: 1, transformPerspective: 1600, duration: 1.1, ease: 'expo.out' }, 8.1);
    cue(8.1, 'whoosh', 0.7);
    blurIn($$('.ph-in > *:not(.notch)'), 8.5, 0.07, 0.5, 18);
    DYN.push((t) => { $('#phone').style.translate = `0 ${(Math.sin(t * 1.4) * 10).toFixed(2)}px`; });
    // orbiting 3D elements around the phone
    const orb = ['stethoscope', 'red_heart', 'spiral_calendar', 'speech_balloon', 'pill', 'dna'].map((n, i) => {
      const im = document.createElement('img'); im.src = `el/${n}.png`; im.className = 'el s'; im.style.left = '0px'; im.style.top = '0px';
      $('#h6').appendChild(im); return im;
    });
    $('#phone').style.zIndex = 5;
    DYN.push((t) => {
      const grow = seg(t, 8.3, 9.4, 'expo.out');
      orb.forEach((im, i) => {
        const a = i * (Math.PI * 2 / orb.length) + t * 0.95;
        const x = 1410 + Math.cos(a) * 360 * grow, y = 545 + Math.sin(a) * 140 * grow - Math.cos(a) * 60 * grow;
        const depth = Math.sin(a);
        const s = (0.72 + 0.28 * (depth + 1) / 2) * grow;
        im.style.transform = `translate(${(x - 75).toFixed(1)}px, ${(y - 75).toFixed(1)}px) scale(${s.toFixed(3)}) rotate(${(Math.cos(a) * 14).toFixed(1)}deg)`;
        im.style.zIndex = depth > 0 ? 6 : 4;
        im.style.opacity = grow.toFixed(3);
      });
    });
    T.to('#h6', { scale: 1.12, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power3.in' }, 10.8);
    cue(10.8, 'whooshS', 0.7);

    /* ====== H7 · Your health, in one place (11.0–15.0) ====== */
    show('#h7', 10.95, 15.05);
    ft('#h7', { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' }, 10.95);
    rise(h7w.slice(0, 2), 11.05, 0.1); rise(h7w.slice(2), 11.5, 0.1);
    cue(11.05, 'tok', 0.6); cue(11.5, 'slam', 0.55);
    const chipFrom = [[-700, -300], [700, -300], [-700, 300], [700, 300]];
    ['#c1', '#c2', '#c3', '#c4'].forEach((c, i) => {
      ft(c, { x: chipFrom[i][0], y: chipFrom[i][1], opacity: 0, rotate: i % 2 ? 12 : -12, filter: 'blur(14px)' },
        { x: 0, y: 0, opacity: 1, rotate: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }, 12.0 + i * 0.25);
      cue(12.0 + i * 0.25, 'glass', 0.7, i % 2 ? 0.5 : -0.5);
    });
    floaty($$('#h7 .chip'), 8, 1.5);
    const h7svg = $('#h7lines'); const h7c = { x: 960, y: 540 };
    const chipPos = [[420, 210], [1500, 210], [440, 880], [1480, 880]];
    const h7p = [];
    chipPos.forEach(([x, y], i) => {
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', x); ln.setAttribute('y1', y); ln.setAttribute('x2', h7c.x); ln.setAttribute('y2', h7c.y);
      ln.setAttribute('stroke', 'rgba(11,167,126,.45)'); ln.setAttribute('stroke-width', '2.5'); ln.setAttribute('stroke-dasharray', '6 10');
      h7svg.appendChild(ln);
      ft(ln, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 13.0 + i * 0.08);
      const pd = document.createElement('div'); pd.className = 'pulse'; $('#h7').appendChild(pd); h7p.push([pd, x, y, i]);
    });
    cue(13.0, 'blip', 0.5);
    DYN.push((t) => h7p.forEach(([pd, x, y, i]) => {
      const k = (t - 13.4 - i * 0.12) % 0.9 / 0.9;
      if (t < 13.4 + i * 0.12 || t > 14.5) { pd.style.opacity = 0; return; }
      const e = ease('power1.in')(k);
      pd.style.opacity = Math.sin(k * Math.PI).toFixed(3);
      pd.style.left = `${lerp(x, h7c.x, e)}px`; pd.style.top = `${lerp(y, h7c.y, e)}px`;
    }));
    ['#c1', '#c2', '#c3', '#c4'].forEach((c, i) => T.to(c, { x: 960 - chipPos[i][0], y: 540 - chipPos[i][1], scale: 0.2, opacity: 0, duration: 0.4, ease: 'power3.in' }, 14.5 + i * 0.03));
    T.to('#h7t', { scale: 0.85, opacity: 0, filter: 'blur(10px)', duration: 0.4, ease: 'power3.in' }, 14.55);
    T.to('#h7lines', { opacity: 0, duration: 0.2 }, 14.5);
    cue(14.5, 'suck', 0.8);
    ft('#flash', { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'power2.in' }, 14.85);
    T.to('#flash', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 15.0);

    /* ====== F1 · records (15.0–21.5) ====== */
    show('#f1', 15.0, 21.55);
    pop('#f1l', 15.1, 0, 0.5, 0.7); cue(15.1, 'tick', 0.4);
    rise(f1w.slice(0, 1), 15.2); rise(f1w.slice(1), 15.45);
    cue(15.2, 'tok', 0.6); cue(15.45, 'slam', 0.55);
    ft('#rec', { x: 360, rotateY: -42, rotateX: 18, opacity: 0, transformPerspective: 1800 }, { x: 0, rotateY: -16, rotateX: 6, opacity: 1, transformPerspective: 1800, duration: 1.0, ease: 'expo.out' }, 15.6);
    cue(15.6, 'whoosh', 0.7);
    T.to('#rec', { rotateY: -8, rotateX: 3, duration: 4.0, ease: 'sine.inOut' }, 16.6);
    blurIn(['#rec .rh', '#rec .rt'], 16.0, 0.1, 0.5, 14);
    ft(['#r1', '#r2', '#r3'], { x: 60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.18 }, 16.4);
    ['#r1', '#r2', '#r3'].forEach((r, i) => {
      const t = 17.5 + i * 0.5;
      ft(`${r} .tk`, { scale: 0 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t);
      ft(`${r} .tk path`, { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, t + 0.08);
      T.to(`${r} img`, { scale: 1.25, rotate: 12, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out' }, t);
      cue(t, 'tick', 0.9);
    });
    flyIn('#f1e1', 16.0, 300, -200, 30); flyIn('#f1e2', 16.3, -200, 250, -40);
    cue(16.0, 'pop', 0.5, 0.6); cue(16.3, 'pop', 0.5, -0.2);
    floaty([$('#f1e1'), $('#f1e2')], 12, 6);
    blurIn('#f1s', 19.0, 0, 0.8, 20); cue(19.0, 'shimmer', 0.45);
    ft('#shine i', { left: '-60%' }, { left: '160%', duration: 0.8, ease: 'power2.inOut' }, 19.6);
    cue(19.6, 'glint', 0.7);
    T.to('#rec', { scale: 1.05, duration: 0.8, ease: 'power2.inOut' }, 20.4);
    T.to('#f1', { x: -520, filter: 'blur(22px)', opacity: 0, duration: 0.3, ease: 'power3.in' }, 21.2);
    cue(21.2, 'whoosh', 0.9);

    /* ====== F2 · doctors (21.5–27.5) ====== */
    show('#f2', 21.45, 27.55);
    ft('#f2', { x: 520, filter: 'blur(22px)', opacity: 0 }, { x: 0, filter: 'blur(0px)', opacity: 1, duration: 0.35, ease: 'power3.out' }, 21.45);
    pop('#f2l', 21.6, 0, 0.5, 0.7);
    rise(f2w, 21.7, 0.1); cue(21.7, 'tok', 0.5); cue(22.0, 'slam', 0.5);
    const cards = [$('#dA'), $('#dB'), $('#dC')];
    const cp = cards.map(() => ({ y: 420, o: 0, lift: 0 }));
    cp.forEach((p, i) => { ft(p, { y: 420, o: 0 }, { y: 0, o: 1, duration: 0.9, ease: 'expo.out' }, 22.2 + i * 0.12); cue(22.2 + i * 0.12, 'glass', 0.5, (i - 1) * 0.5); });
    ft(cp[1], { lift: 0 }, { lift: -26, duration: 0.45, ease: 'back.out(2.2)' }, 25.0);
    DYN.push((t) => {
      const off = 38 * (1 - seg(t, 23.4, 24.3, 'expo.inOut'));
      cards.forEach((c, i) => {
        const a = (i - 1) * 38 + off, r = (a * Math.PI) / 180, R = 560;
        const x = R * Math.sin(r), z = R * Math.cos(r) - R;
        const p = cp[i];
        c.style.transform = `translate3d(${x.toFixed(1)}px, ${(p.y + p.lift).toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${(a * 0.9).toFixed(2)}deg)`;
        c.style.opacity = p.o.toFixed(3);
        c.style.zIndex = Math.round(100 + z);
        c.style.filter = `brightness(${(1 + z / 1400).toFixed(3)})`;
      });
    });
    cue(23.4, 'whooshS', 0.6);
    flyIn('#f2e1', 22.6, -300, 100, -30); flyIn('#f2e2', 22.8, 300, 100, 30);
    floaty([$('#f2e1'), $('#f2e2')], 12, 6);
    cursorIn(24.4, 1900, 1100, 990, 620, 0.55);
    click(25.0, 990, 620);
    cursorOut(25.3);
    pop('#f2chip', 25.5, 0, 0.6, 0.5); cue(25.5, 'bubble', 0.8);
    floaty([$('#f2chip')], 5, 0.8);
    T.to('#f2', { scale: 1.08, opacity: 0, filter: 'blur(12px)', duration: 0.35, ease: 'power3.in' }, 27.15);
    cue(27.2, 'whoosh', 0.7);

    /* ====== F3 · Ask Avni (27.5–35.5, dark) ====== */
    show('#f3', 27.45, 35.6);
    pop('#f3l', 27.6, 0, 0.5, 0.7);
    blurIn('#f3k', 27.7, 0, 0.6, 14);
    rise(f3w, 27.85, 0.12); cue(27.85, 'tok', 0.5); cue(28.25, 'slam', 0.55);
    ft('#chat', { y: 260, rotateX: 26, opacity: 0, transformPerspective: 1600 }, { y: 0, rotateX: 0, opacity: 1, transformPerspective: 1600, duration: 1.0, ease: 'expo.out' }, 28.3);
    cue(28.3, 'whoosh', 0.6);
    ft('#bu', { scale: 0.4, opacity: 0, transformOrigin: '100% 100%' }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)' }, 28.9);
    const msg = 'Book a consultation for me.';
    const tA = 29.0, tB = 29.85;
    for (let i = 0; i < msg.length; i++) if (msg[i] !== ' ') cue(tA + (i / msg.length) * (tB - tA), 'type', 0.35, 0.3);
    DYN.push((t) => {
      const s = msg.slice(0, Math.round(seg(t, tA, tB) * msg.length));
      if ($('#buTx').textContent !== s) $('#buTx').textContent = s;
      $$('#dots i').forEach((d, i) => { d.style.transform = `translateY(${(-7 * Math.max(0, Math.sin((t - 30.0) * 9 - i * 0.9))).toFixed(2)}px)`; });
    });
    ft('#dots', { opacity: 0, scale: 0.5, transformOrigin: '0% 100%' }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, 30.0);
    T.to('#dots', { opacity: 0, duration: 0.15 }, 30.55);
    ft('#bb', { opacity: 0, scale: 0.6, transformOrigin: '0% 100%' }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 30.65);
    cue(30.65, 'bubble', 0.8);
    ft($$('#dates .date'), { y: 50, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.07 }, 31.1);
    [0, 1, 2, 3, 4].forEach((i) => cue(31.1 + i * 0.07, 'tick', 0.25 + i * 0.05));
    cursorIn(31.4, 1900, 1100, P.wed.x + 10, P.wed.y + 24, 0.5);
    click(32.0, P.wed.x + 10, P.wed.y + 24);
    T.set('#dW', { background: 'linear-gradient(135deg,#32d58b,#0ba77e)', borderColor: 'rgba(255,255,255,.6)' }, 32.0);
    T.to('#dW', { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1 }, 32.0);
    cursorOut(32.2);
    T.to(['#bu', '#bb', '#dates', '#chat .chh'], { opacity: 0.18, filter: 'blur(4px)', duration: 0.35 }, 32.5);
    ft('#okc', { scale: 0, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.6, ease: 'back.out(2.6)' }, 32.5);
    cue(32.5, 'success', 1); cue(32.55, 'confetti', 0.9);
    // confetti burst (deterministic physics)
    const cols = ['#32d58b', '#b6df7e', '#0ba77e', '#e8c35a', '#ffffff', '#9fe3c2'];
    const conf = [];
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('div'); d.className = 'conf'; d.style.background = cols[i % cols.length];
      $('#confetti').appendChild(d);
      const a = (i / 46) * Math.PI * 2 + (i % 3) * 0.2, v = 520 + ((i * 97) % 380);
      conf.push({ d, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 380, spin: ((i * 53) % 720) - 360 });
    }
    DYN.push((t) => {
      const k = t - 32.55;
      conf.forEach((c) => {
        if (k < 0 || k > 2.2) { c.d.style.opacity = 0; return; }
        const x = 1400 + c.vx * k * Math.exp(-k * 0.9), y = 545 + c.vy * k + 520 * k * k;
        c.d.style.opacity = Math.max(0, 1 - k / 2.2).toFixed(3);
        c.d.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(c.spin * k).toFixed(1)}deg) rotateX(${(k * 540).toFixed(0)}deg)`;
      });
    });
    pop('#okchip', 33.1, 0, 0.6, 0.5); cue(33.1, 'glass', 0.6);
    T.to('#f3', { scale: 1.08, opacity: 0, filter: 'blur(12px)', duration: 0.35, ease: 'power3.in' }, 35.15);
    cue(35.15, 'whoosh', 0.7);

    /* ====== F4 · hospitals (35.5–42.0) ====== */
    show('#f4', 35.4, 42.05);
    ft('#f4', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'expo.out' }, 35.4);
    pop('#f4l', 35.6, 0, 0.5, 0.7);
    rise(f4w, 35.7, 0.08); cue(35.7, 'tok', 0.5); cue(36.1, 'slam', 0.5);
    ft(['#or1', '#or2', '#or3'], { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, ease: 'expo.out', stagger: 0.12 }, 35.9);
    DYN.push((t) => { $('#or3').style.rotate = `${(t * 8).toFixed(2)}deg`; });
    ft('#tile', { scale: 0, rotate: -40 }, { scale: 1, rotate: -6, duration: 0.8, ease: 'back.out(2)' }, 36.4);
    cue(36.4, 'impactS', 0.7);
    [37, 38, 39, 40, 41].forEach((t) => T.to('#tile img', { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t));
    const net = $('#net'); const C = { x: 1350, y: 560 };
    const roles = ['#ro1', '#ro2', '#ro3', '#ro4'].map((s) => ({ s, x: parseFloat($(s).style.left), y: parseFloat($(s).style.top) }));
    const pulses = [];
    roles.forEach((r, i) => {
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', C.x); ln.setAttribute('y1', C.y); ln.setAttribute('x2', r.x); ln.setAttribute('y2', r.y);
      ln.setAttribute('stroke', 'rgba(11,167,126,.5)'); ln.setAttribute('stroke-width', '2.5');
      net.appendChild(ln);
      const len = Math.hypot(r.x - C.x, r.y - C.y), t = 36.9 + i * 0.3;
      ft(ln, { attr: { 'stroke-dasharray': `0 ${len}` } }, { attr: { 'stroke-dasharray': `${len} 0` }, duration: 0.4, ease: 'power2.out' }, t);
      ft(r.s, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)' }, t + 0.2);
      cue(t + 0.2, 'glass', 0.6, r.x > 1350 ? 0.5 : -0.1);
      const pd = document.createElement('div'); pd.className = 'pulse'; $('#f4').appendChild(pd); pulses.push({ pd, r });
    });
    floaty(roles.map((r) => $(r.s)), 7, 1.2);
    DYN.push((t) => pulses.forEach(({ pd, r }, i) => {
      const local = t - 38.3 - i * 0.22;
      if (local < 0 || t > 41.5) { pd.style.opacity = 0; return; }
      const k = (local % 1) / 1, e = ease('power1.inOut')(k);
      pd.style.opacity = Math.sin(k * Math.PI).toFixed(3);
      pd.style.left = `${lerp(C.x, r.x, e)}px`; pd.style.top = `${lerp(C.y, r.y, e)}px`;
    }));
    exitUp(f4w, 39.8); cue(39.8, 'whooshS', 0.5);
    rise(f4w2, 40.1, 0.08); cue(40.1, 'tok', 0.5); cue(40.5, 'slam', 0.5);
    T.to('#f4', { scale: 1.15, opacity: 0, filter: 'blur(14px)', duration: 0.35, ease: 'power3.in' }, 41.65);
    cue(41.65, 'whoosh', 0.8);

    /* ====== ST · stat slams (42.0–46.0, dark) ====== */
    show('#st', 42.0, 46.0);
    [['#sA', 42.0], ['#sB', 42.75], ['#sC', 43.5]].forEach(([s, t]) => {
      show(s, t, t + 0.75); slam(`${s} .n`, t, 1.6); blurIn(`${s} .cap`, t + 0.12, 0, 0.4, 16);
      T.to(`${s} .n`, { scale: 1.05, duration: 0.45, ease: 'none' }, t + 0.28);
      cue(t, 'slam', 1); cue(t + 0.02, 'count', 0.8);
    });
    show('#strow', 44.25, 46.0);
    ft($$('#strow .s'), { y: 120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.1 }, 44.25);
    cue(44.25, 'whooshS', 0.6);
    T.to('#strow', { scale: 0.92, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power3.in' }, 45.7);

    /* ====== C1 · A little care. A long way. (46.0–51.0) ====== */
    show('#c1s', 45.95, 51.05);
    ft('#walk', { scale: 0.6, rotateX: 30, y: 260, opacity: 0, transformPerspective: 2000 }, { scale: 1, rotateX: 0, y: 0, opacity: 1, transformPerspective: 2000, duration: 1.0, ease: 'expo.out' }, 46.0);
    ft('#walkImg', { scale: 1.2 }, { scale: 1.02, duration: 5, ease: 'power1.out' }, 46.0);
    cue(46.0, 'whoosh', 0.7);
    rise(c1w.slice(0, 3), 46.45, 0.1); rise(c1w.slice(3), 47.3, 0.1);
    cue(46.45, 'tok', 0.5); cue(47.3, 'shimmer', 0.5);
    flyIn('#c1e1', 47.6, 200, -200, 30); flyIn('#c1e2', 47.8, -200, 200, -30); flyIn('#c1e3', 48.0, 200, 200, 30);
    [47.6, 47.8, 48.0].forEach((t, i) => cue(t, 'pop', 0.45, i === 1 ? -0.5 : 0.5));
    floaty([$('#c1e1'), $('#c1e2'), $('#c1e3')], 12, 6);
    T.to('#walk', { rotateY: -6, duration: 3, ease: 'sine.inOut' }, 47.0);
    T.to(['#walk', '#c1e1', '#c1e2', '#c1e3'], { scale: 0.15, opacity: 0, filter: 'blur(10px)', duration: 0.45, ease: 'power3.in', stagger: 0.03 }, 50.55);
    comet(50.2, 0.9, 'M -100 820 C 500 950, 1300 300, 2050 160', { size: 1.0 });
    cue(50.2, 'comet', 0.7);

    /* ====== C2 · logo sting + CTA (51.0–60.0) ====== */
    show('#c2s', 51.0, 60.0);
    const c2e = $$('#c2els .el');
    const restPos = [[110, 110], [330, 330], [120, 600], [330, 830], [1660, 110], [1440, 330], [1650, 600], [1440, 830]];
    const ep = c2e.map(() => ({ k: 0, o: 0, out: 0 }));
    ep.forEach((p) => { ft(p, { k: 0, o: 0 }, { k: 1, o: 1, duration: 1.0, ease: 'power2.in' }, 51.0); });
    ep.forEach((p, i) => ft(p, { out: 0 }, { out: 1, duration: 0.9, ease: 'expo.out' }, 53.0 + i * 0.05));
    DYN.push((t) => c2e.forEach((el, i) => {
      const p = ep[i];
      let x, y, s, o;
      if (p.out <= 0) {   // spiral into the logo centre
        const a = i * (Math.PI / 4) + p.k * 2.4, R = 1150 * (1 - p.k);
        x = 960 + Math.cos(a) * R; y = 425 + Math.sin(a) * R * 0.6; s = 1 - 0.8 * p.k; o = p.o * (p.k < 0.92 ? 1 : (1 - p.k) / 0.08);
      } else {            // burst back out to rest positions around the frame
        const [rx, ry] = restPos[i];
        x = lerp(960, rx + 75, p.out); y = lerp(425, ry + 75, p.out); s = lerp(0.2, 1, p.out); o = Math.min(1, p.out * 2);
        x += Math.sin(t * 0.9 + i * 1.7) * 8; y += Math.sin(t * 1.2 + i * 2.1) * 12;
      }
      el.style.transform = `translate(${(x - 75).toFixed(1)}px, ${(y - 75).toFixed(1)}px) scale(${s.toFixed(3)}) rotate(${(Math.sin(t + i) * 8).toFixed(1)}deg)`;
      el.style.opacity = Math.max(0, o).toFixed(3);
      el.style.left = '0px'; el.style.top = '0px';
    }));
    cue(51.0, 'suck', 0.9);
    cue(52.0, 'impact', 1);
    ft('#flash', { opacity: 0 }, { opacity: 0.85, duration: 0.06 }, 51.98);
    T.to('#flash', { opacity: 0, duration: 0.5, ease: 'power2.out' }, 52.04);
    ft('#m9', { scale: 0.3, opacity: 0, rotate: -25, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: 'expo.out' }, 52.0);
    ft('#m9a', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)' }, 52.12);
    ft('#m9h', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, 52.22);
    ft('#m9c', { scale: 0, rotate: -90, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(2.5)' }, 52.3);
    $$('#c2s .lring').forEach((r, i) => ft(r, { scale: 0.6, opacity: 0.9 }, { scale: 3.6, opacity: 0, duration: 1.4, ease: 'power2.out' }, 52.0 + i * 0.2));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, x2 = 960 + Math.cos(a) * 1300, y2 = 425 + Math.sin(a) * 900;
      neon(52.0, 0.7, `${960 + Math.cos(a) * 160},${425 + Math.sin(a) * 160} ${x2},${y2}`, { seglen: 300, color: '#0ba77e', width: 3 });
    }
    ft('#wm9r', { attr: { width: 0 } }, { attr: { width: 200 }, duration: 0.8, ease: 'expo.out' }, 52.5);
    ft('#t9', { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 52.5);
    ft('#s9', { opacity: 0, attr: { 'letter-spacing': 12 } }, { opacity: 1, attr: { 'letter-spacing': 4 }, duration: 1.0, ease: 'expo.out' }, 52.7);
    ft('#l9', { scale: 0, rotate: -70, transformOrigin: '0% 100%' }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)' }, 53.0);
    cue(52.5, 'whooshS', 0.5); cue(53.0, 'shimmer', 0.8); cue(53.0, 'scatter', 0.5);
    ft('#logo9', { scale: 1 }, { scale: 1.04, duration: 7, ease: 'none' }, 52.5);
    rise(c2w, 53.6, 0.08); cue(53.6, 'tok', 0.5);
    pop(['#c2cta .url', '#c2btn'], 54.6, 0.15, 0.6, 0.6); cue(54.6, 'glass', 0.6); cue(54.75, 'pop', 0.6);
    cursorIn(55.3, 1920, 1100, P.btn.x + 60, P.btn.y + 8, 0.6);
    click(56.0, P.btn.x + 60, P.btn.y + 8);
    T.to('#c2btn', { scale: 0.94, duration: 0.09, yoyo: true, repeat: 1 }, 56.0);
    cue(56.05, 'ding', 0.6);
    cursorOut(56.35);
    blurIn('#c2foot', 56.6, 0, 0.8, 10);
    comet(56.9, 1.1, 'M -100 980 C 600 1040, 1300 760, 2050 860', { size: 0.8 });
    cue(56.9, 'comet', 0.45);
    ft('#fadeout', { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.in' }, 59.0);

    T.set({}, {}, DURATION);
  }

  /* ---------- film grain ---------- */
  const g = document.getElementById('grain'), gc = g.getContext('2d');
  const img = gc.createImageData(960, 540);
  function drawGrain(f) {
    let s = (Math.imul(f + 1, 2654435761) >>> 0) || 1;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; const v = s & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    gc.putImageData(img, 0, 0);
  }

  window.renderFrame = (f, fps) => { const t = f / fps; T.seek(t, false); DYN.forEach((fn) => fn(t)); drawGrain(f); };
  window.FILM = { DURATION, CUES, T };
  Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))])
    .then(() => Promise.all([document.fonts.load('800 80px Jakarta'), document.fonts.load('600 40px Jakarta'), document.fonts.load('italic 500 40px Gelasio')]))
    .then(() => { build(); window.renderFrame(0, 60); window.READY = true; })
    .catch((e) => { window.BUILD_ERROR = String((e && e.stack) || e); });
})();
