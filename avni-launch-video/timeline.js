/* Avni Health ERP — launch film timeline.
   120 BPM: one beat = 0.5s, one bar = 2s. Every cut and text hit is placed on the beat grid.
   The timeline is deterministic: renderFrame(f, fps) seeks GSAP and redraws procedural layers. */
(function () {
  const DURATION = 66.0;
  const T = gsap.timeline({ paused: true });
  const CUES = [];
  const DYN = [];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const cue = (t, name, gain = 1, pan = 0) => CUES.push({ t: +t.toFixed(4), name, gain, pan });

  /* ---------- helpers ---------- */
  const seen = new Map();
  function ft(targets, from, to, pos) {
    const els = gsap.utils.toArray(targets);
    const props = Object.keys(from).map((p) => (p === 'autoAlpha' ? 'opacity' : p));
    let first = true;
    els.forEach((e) => {
      const s = seen.get(e) || new Set();
      props.forEach((p) => { if (s.has(p)) first = false; s.add(p); });
      seen.set(e, s);
    });
    T.fromTo(els, from, Object.assign({}, to, { immediateRender: first }), pos);
  }
  const show = (sel, t0, t1) => {
    T.set(sel, { visibility: 'visible' }, t0);
    if (t1 != null) T.set(sel, { visibility: 'hidden' }, t1);
  };
  const ease = (n) => gsap.parseEase(n);
  function seg(t, a, b, e = 'none') {
    const p = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return ease(e)(p);
  }
  function splitWords(root) {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const parts = n.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
            w.appendChild(i); frag.appendChild(w); out.push(i);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && !n.classList.contains('nosplit') && n.tagName !== 'svg') {
          walk(n);
        }
      });
    };
    walk(root);
    return out;
  }
  function splitChars(root) {
    const txt = root.textContent; root.textContent = '';
    return [...txt].map((ch) => {
      const s = document.createElement('span'); s.className = 'c';
      s.innerHTML = ch === ' ' ? '&nbsp;' : ch; root.appendChild(s); return s;
    });
  }
  const rect = (el) => { const r = (typeof el === 'string' ? $(el) : el).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, l: r.left, t: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; };

  /* word reveal presets */
  const rise = (words, t, stagger = 0.12, dur = 0.85) =>
    ft(words, { yPercent: 118, rotate: 3, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, duration: dur, ease: 'expo.out', stagger }, t);
  const blurIn = (els, t, stagger = 0.08, dur = 0.8, y = 26) =>
    ft(els, { opacity: 0, y, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur, ease: 'power3.out', stagger }, t);
  const popIn = (els, t, stagger = 0.1, dur = 0.7) =>
    ft(els, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: dur, ease: 'back.out(2.2)', stagger }, t);
  const exitUp = (els, t, stagger = 0.03, dur = 0.42) =>
    T.to(els, { yPercent: -118, opacity: 0, duration: dur, ease: 'power3.in', stagger }, t);

  /* cursor (hotspot sits at 19%/10% of the 46px svg) */
  const HX = 8.6, HY = 4.8;
  let cursorStarted = false;
  function cursorIn(t, fromX, fromY, toX, toY, dur = 0.8) {
    if (!cursorStarted) {
      ft('#cursor', { x: fromX - HX, y: fromY - HY, opacity: 0 }, { x: toX - HX, y: toY - HY, opacity: 1, duration: dur, ease: 'power3.out' }, t);
      cursorStarted = true;
    } else {
      T.set('#cursor', { x: fromX - HX, y: fromY - HY }, t);
      T.to('#cursor', { x: toX - HX, y: toY - HY, opacity: 1, duration: dur, ease: 'power3.out' }, t);
    }
  }
  const cursorTo = (t, x, y, dur = 0.6, e = 'power3.inOut') => T.to('#cursor', { x: x - HX, y: y - HY, duration: dur, ease: e }, t);
  const cursorOut = (t, dx = 260, dy = 240) => T.to('#cursor', { x: `+=${dx}`, y: `+=${dy}`, opacity: 0, duration: 0.6, ease: 'power2.in' }, t);
  function click(t, x, y) {
    T.to('#cursor', { scale: 0.8, transformOrigin: '19% 10%', duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }, t);
    T.set('#clickRing', { x, y, scale: 0.2, opacity: 0.9 }, t);
    T.to('#clickRing', { scale: 1.35, opacity: 0, duration: 0.55, ease: 'power2.out' }, t + 0.001);
    cue(t, 'click', 1);
  }

  /* ---------- build ---------- */
  function build() {
    // split everything first, then measure, then animate
    const labelChars = splitChars($('#heroLabelTx'));
    const h1 = splitWords($('#s1h'));
    const s2w = splitWords($('#s2h'));
    const s2bw = splitWords($('#s2bh'));
    const s3w = splitWords($('#s3h'));
    const st = [1, 2, 3].map((i) => splitWords($(`#st${i} .st`)));
    const s4lab = splitChars($('#s4label'));
    const s5lab = splitChars($('#s5label'));
    const s5w = splitWords($('#s5h'));
    const s6lab = splitChars($('#s6label'));
    const s6w = splitWords($('#s6h'));
    const s6w2 = splitWords($('#s6h2'));
    const s7lab = splitChars($('#s7label'));
    const s7w = splitWords($('#s7h'));
    const s8lab = splitChars($('#s8label'));
    const s8w = splitWords($('#s8h'));
    const s9w = splitWords($('#s9h'));
    const tagW = splitWords($('#s9tag'));
    const botW = splitWords($('#mBot'));

    const P = {
      pill: rect('#pill'), s1btn: rect('#s1btn'), conn: rect(s2bw[s2bw.length - 1]),
      chips: [1, 2, 3, 4].map((i) => rect(`#chip${i}`)), neha: rect('#d2 .ph'), wed: rect('#dWed'),
      s5btn: rect('#s5btn'), s9btn: rect('#s9btn'),
    };

    /* ===== global ambience ===== */
    ft('#glow', { scale: 0.55, opacity: 0 }, { scale: 1, opacity: 1, duration: 3.2, ease: 'power2.out' }, 0);
    ft('#glow2', { opacity: 0 }, { opacity: 1, duration: 4, ease: 'power1.inOut' }, 2);
    DYN.push((t) => {
      const g = $('#glow');
      const dx = Math.sin(t * 0.35) * 120, dy = Math.cos(t * 0.27) * 70;
      g.style.translate = `${dx}px ${dy}px`;
      $('#glow2').style.translate = `${Math.cos(t * 0.3) * 160}px ${Math.sin(t * 0.22) * 90}px`;
    });

    /* ===== S0 · intro (0–4) ===== */
    show('#s0', 0, 4.2);
    ft('#s0dot', { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, 0.25);
    cue(0.25, 'pop', 0.7);
    $$('#s0 .ring').forEach((r, i) => {
      const t = 0.25 + i * 0.5;
      ft(r, { scale: 0.12, opacity: 0 }, { scale: 0.4, opacity: 0.9, duration: 0.18, ease: 'none' }, t);
      T.to(r, { scale: 4.6, opacity: 0, duration: 2.9, ease: 'power2.out' }, t + 0.18);
    });
    ft('#heroLabel', { y: 360, opacity: 0 }, { y: 360, opacity: 1, duration: 0.01 }, 0.99);
    ft(labelChars, { opacity: 0, y: 18, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', stagger: 0.03 }, 1.0);
    cue(1.0, 'shimmer', 0.55);
    T.to('#s0dot', { scale: 0, duration: 0.4, ease: 'back.in(2)' }, 3.0);
    T.to('#heroLabel', { y: 0, duration: 0.85, ease: 'expo.inOut' }, 3.15);
    cue(3.15, 'whooshS', 0.7);

    /* ===== S1 · hero (4–10) ===== */
    show('#s1', 3.9, 10.1);
    const h1a = h1.slice(0, 5), h1b = h1.slice(5);
    rise(h1a, 4.0, 0.25);
    h1a.forEach((_, i) => cue(4.0 + i * 0.25, 'tok', 0.45));
    ft('#pill .pbg', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'expo.out' }, 5.5);
    ft('#pill .ptx', { yPercent: 70, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out' }, 5.58);
    cue(5.5, 'swipe', 0.8);
    cursorIn(5.75, 1500, 1120, P.pill.x + 70, P.pill.y + 26, 0.75);
    click(6.5, P.pill.x + 70, P.pill.y + 26);
    T.to('#pill', { scale: 1.07, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 6.5);
    cursorTo(6.8, P.pill.x + 380, P.pill.y + 300, 0.9, 'power2.inOut');
    rise(h1b, 6.75, 0.25);
    h1b.forEach((_, i) => cue(6.75 + i * 0.25, 'tok', 0.45));
    blurIn('#s1sub', 7.75, 0, 0.9);
    popIn('#s1btn', 8.5);
    cue(8.5, 'pop', 0.8);
    cursorTo(8.65, P.s1btn.x + 60, P.s1btn.y + 6, 0.55);
    click(9.25, P.s1btn.x + 60, P.s1btn.y + 6);
    T.to('#s1btn', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 9.25);
    ft('#morph', { left: P.s1btn.l, top: P.s1btn.t, width: P.s1btn.w, height: P.s1btn.h, borderRadius: 6, opacity: 0 },
      { left: P.s1btn.l, top: P.s1btn.t, width: P.s1btn.w, height: P.s1btn.h, borderRadius: 6, opacity: 1, duration: 0.01 }, 9.36);
    T.to('#morph', { left: 0, top: 0, width: 1920, height: 1080, borderRadius: 0, duration: 0.62, ease: 'expo.inOut' }, 9.38);
    T.to('#cursor', { opacity: 0, duration: 0.2 }, 9.45);
    cue(9.38, 'whoosh', 0.9);
    T.set('#morph', { opacity: 0 }, 10.06);
    T.set('#heroLabel', { opacity: 0 }, 10.0);

    /* ===== S2 · problem (10–14.9) ===== */
    show('#s2', 9.98, 15.0);
    ft('#s2glow', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.5, ease: 'power2.out' }, 10.0);
    rise(s2w, 10.1, 0.18);
    s2w.forEach((_, i) => cue(10.1 + i * 0.18, 'tok', 0.35));
    const chipRot = [-8, 6, 5, -6];
    [1, 2, 3, 4].forEach((n, i) => {
      const t = 11.5 + i * 0.5;
      ft(`#chip${n}`, { opacity: 0, scale: 0.4, rotate: chipRot[i] * 2.4, y: 50 }, { opacity: 1, scale: 1, rotate: chipRot[i], y: 0, duration: 0.75, ease: 'back.out(2)' }, t);
      T.to(`#chip${n}`, { y: -16, duration: 1.6, ease: 'sine.inOut' }, t + 0.75);
      cue(t, 'pop', 0.8, i % 2 ? 0.35 : -0.35);
    });
    [1, 2, 3, 4].forEach((n, i) => {
      const c = P.chips[i];
      T.to(`#chip${n}`, { x: 960 - c.x, y: 540 - c.y, scale: 0.08, rotate: 0, opacity: 0, duration: 0.5, ease: 'power3.in' }, 14.0 + i * 0.03);
    });
    T.to('#s2h', { scale: 0.7, opacity: 0, filter: 'blur(12px)', duration: 0.5, ease: 'power3.in' }, 14.0);
    cue(14.0, 'suck', 0.9);
    ft('#wipe', { scale: 0, opacity: 1 }, { scale: 1, opacity: 1, duration: 0.65, ease: 'expo.out' }, 14.45);
    cue(14.45, 'whoosh', 0.8);
    T.set('#wipe', { opacity: 0 }, 15.02);

    /* ===== S2b · "It should feel connected." (15–18) ===== */
    show('#s2b', 14.95, 18.0);
    const conn = s2bw[s2bw.length - 1];
    rise(s2bw.slice(0, -1), 15.05, 0.17);
    s2bw.slice(0, -1).forEach((_, i) => cue(15.05 + i * 0.17, 'tok', 0.4));
    ft(conn, { opacity: 0, filter: 'blur(16px)', scale: 1.12 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.8, ease: 'expo.out' }, 15.6);
    cue(15.6, 'shimmer', 0.5);
    cursorIn(15.7, P.conn.l - 120, P.conn.b + 220, P.conn.l + 4, P.conn.y + 10, 0.4);
    ft('#hl', { scaleX: 0 }, { scaleX: 1, duration: 0.65, ease: 'power2.inOut' }, 16.0);
    cursorTo(16.0, P.conn.r + 6, P.conn.y + 10, 0.65, 'power2.inOut');
    T.to(conn, { color: '#125b49', duration: 0.4 }, 16.1);
    cue(16.0, 'select', 0.8);
    cursorOut(16.9, 220, 200);
    T.to('#s2bh', { scale: 1.045, duration: 0.95, ease: 'power1.in' }, 17.0);
    ft('#s2bh', { opacity: 1 }, { opacity: 0, duration: 0.12 }, 17.86);

    /* ===== S3 · Meet Avni (18–22) ===== */
    show('#s3', 18.0, 22.2);
    cue(18.0, 'impact', 1);
    ft('#s3mark', { scale: 0.35, opacity: 0, rotate: -18, filter: 'blur(12px)' }, { scale: 1, opacity: 1, rotate: 0, filter: 'blur(0px)', duration: 1, ease: 'expo.out' }, 18.0);
    ft('#mArms', { y: -26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, 18.15);
    ft('#mHead', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 18.3);
    ft('#mCross', { scale: 0, rotate: -90, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.5)' }, 18.42);
    cue(18.42, 'pop', 0.6);
    $$('#s3 .ring3').forEach((r, i) => {
      ft(r, { scale: 1, opacity: 0.85 }, { scale: 2.8, opacity: 0, duration: 1.6, ease: 'power2.out' }, 18.0 + i * 0.25);
    });
    T.set('#s3 .ring3', { opacity: 0 }, 17.99);
    rise(s3w, 18.75, 0.25);
    cue(18.75, 'tok', 0.5); cue(19.0, 'tok', 0.5);
    blurIn('#s3sub', 19.55, 0, 0.9);
    ft('#s3line', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut' }, 20.3);
    blurIn($$('#s3feat .feat'), 20.6, 0.2, 0.7, 20);
    [0, 1, 2].forEach((i) => cue(20.6 + i * 0.2, 'tick', 0.5));
    T.to(['#s3mark', '#s3h', '#s3sub', '#s3line', '#s3feat'], { y: -70, opacity: 0, filter: 'blur(8px)', duration: 0.45, stagger: 0.04, ease: 'power3.in' }, 21.55);
    cue(21.55, 'whooshS', 0.7);

    /* ===== S4 · approach: Understand / Connect / Continue (22–36.4) ===== */
    show('#s4', 21.95, 36.5);
    ft(s4lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out' }, 22.05);
    const C1 = 2 * Math.PI * 560, C3 = 2 * Math.PI * 420;
    ft('#orb1', { strokeDasharray: C1, strokeDashoffset: C1 }, { strokeDasharray: C1, strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 22.0);
    ft('#orb3', { strokeDasharray: C3, strokeDashoffset: C3 }, { strokeDasharray: C3, strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut' }, 22.15);
    ft('#orb2', { opacity: 0 }, { opacity: 1, duration: 1.2 }, 22.3);
    ft('#orbDots', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 22.6);
    ft('#nodes', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 22.1);
    cue(22.0, 'whoosh', 0.7);
    // node positions along the orbit
    const nodes = [$('#n1'), $('#n2'), $('#n3')];
    const W = [255, 255, 255], G = [18, 91, 73];
    const mix = (a, b, k) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
    DYN.push((t) => {
      const rot = 70 * (1 - seg(t, 22.0, 23.2, 'expo.out')) - 40 * seg(t, 26.35, 27.15, 'expo.inOut') - 40 * seg(t, 30.85, 31.65, 'expo.inOut');
      nodes.forEach((n, k) => {
        const a = k * 40 + rot, rad = (a * Math.PI) / 180;
        const x = -260 + 560 * Math.cos(rad), y = 540 + 560 * Math.sin(rad);
        const w = Math.max(0, 1 - Math.abs(a) / 40);
        const s = 1 + 0.28 * ease('power2.out')(w);
        n.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
        n.style.background = mix(W, G, w);
        n.style.color = mix(G, W, w);
        n.style.borderColor = mix([228, 234, 230], G, w);
      });
      $('#orbDots').setAttribute('transform', `rotate(${(-t * 9).toFixed(3)} -260 540)`);
    });
    // step texts
    const stepIn = (i, t) => {
      ft(`#st${i} .sn`, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, t);
      rise(st[i - 1], t + 0.08, 0.1);
      blurIn(`#st${i} .sd`, t + 0.3, 0, 0.8, 18);
    };
    const stepOut = (i, t) => T.to([`#st${i} .sn`, `#st${i} .st`, `#st${i} .sd`], { y: -40, opacity: 0, filter: 'blur(6px)', duration: 0.38, stagger: 0.04, ease: 'power2.in' }, t);
    stepIn(1, 22.7); stepOut(1, 26.3);
    stepIn(2, 26.95); stepOut(2, 30.8);
    stepIn(3, 31.45);

    // card 1: records
    ft('#card1', { x: 140, opacity: 0, scale: 0.94 }, { x: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out' }, 22.6);
    cue(22.6, 'swipe', 0.6);
    blurIn(['#card1 .chead', '#card1 .ctitle'], 22.95, 0.12, 0.7, 16);
    ft(['#r1', '#r2', '#r3'], { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.2 }, 23.25);
    ['#r1', '#r2', '#r3'].forEach((r, i) => {
      const t = 24.0 + i * 0.5;
      ft(`${r} .tk path`, { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, t);
      T.to(r, { backgroundColor: '#f4fbf6', duration: 0.3 }, t);
      T.to(r, { scale: 1.02, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t);
      cue(t, 'tick', 0.9);
    });
    blurIn('#card1 .cfoot', 25.4, 0, 0.6, 10);
    T.to('#card1', { x: -170, opacity: 0, scale: 0.92, filter: 'blur(8px)', duration: 0.6, ease: 'power3.in' }, 26.3);
    cue(26.35, 'whoosh', 0.75);

    // card 2: doctors
    T.set('#card2', { opacity: 1 }, 26.8);
    ['#d1', '#d2', '#d3'].forEach((d, i) => {
      const t = 26.9 + i * 0.2;
      ft(d, { y: 140, opacity: 0, rotate: 5 - i * 2 }, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease: 'expo.out' }, t);
      ft(`${d} img`, { scale: 1.18 }, { scale: 1.0, duration: 3.2, ease: 'power2.out' }, t);
      cue(t, 'pop', 0.55, (i - 1) * 0.4);
    });
    ft('#card2', { opacity: 0 }, { opacity: 0, duration: 0.01 }, 22.0);
    popIn('#bubble', 28.5, 0, 0.7);
    cue(28.5, 'bubble', 0.8);
    cursorIn(29.0, 1900, 1000, P.neha.x + 30, P.neha.y + 40, 0.65);
    click(30.0, P.neha.x + 30, P.neha.y + 40);
    T.to('#d2', { y: -22, duration: 0.45, ease: 'back.out(2.2)' }, 30.0);
    T.to(['#d1', '#d3'], { opacity: 0.5, duration: 0.4 }, 30.0);
    cursorOut(30.35, 300, 200);
    T.to('#card2', { x: -170, opacity: 0, scale: 0.92, filter: 'blur(8px)', duration: 0.6, ease: 'power3.in' }, 30.8);
    cue(30.85, 'whoosh', 0.75);

    // card 3: Ask Avni
    ft('#card3', { x: 140, opacity: 0, scale: 0.94 }, { x: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out' }, 31.35);
    blurIn('#card3 .chead', 31.6, 0, 0.6, 12);
    ft('#mUser', { scale: 0.5, opacity: 0, transformOrigin: '100% 100%' }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 31.7);
    const userMsg = 'Book a consultation for me.';
    const tyA = 31.8, tyB = 32.6;
    for (let i = 0; i < userMsg.length; i++) {
      if (userMsg[i] !== ' ') cue(tyA + (i / userMsg.length) * (tyB - tyA), 'type', 0.32 + 0.12 * ((i * 7) % 3) / 2, 0.25);
    }
    DYN.push((t) => {
      const n = Math.round(seg(t, tyA, tyB) * userMsg.length);
      const el = $('#mUserTx');
      const s = userMsg.slice(0, n);
      if (el.textContent !== s) el.textContent = s;
      // typing dots bounce
      $$('#typing i').forEach((d, i) => { d.style.transform = `translateY(${(-6 * Math.max(0, Math.sin((t - 32.7) * 9 - i * 0.9))).toFixed(2)}px)`; });
    });
    ft('#typing', { opacity: 0, scale: 0.6, transformOrigin: '0% 100%' }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, 32.7);
    T.to('#typing', { opacity: 0, scale: 0.8, duration: 0.2 }, 33.1);
    rise(botW, 33.15, 0.06, 0.7);
    cue(33.15, 'bubble', 0.8);
    ft($$('#dates .date'), { y: 40, opacity: 0, scale: 0.85 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)', stagger: 0.08 }, 33.6);
    [0, 1, 2, 3, 4].forEach((i) => cue(33.6 + i * 0.08, 'tick', 0.25 + i * 0.04));
    cursorIn(33.95, 1900, 1080, P.wed.x + 14, P.wed.y + 22, 0.55);
    click(34.5, P.wed.x + 14, P.wed.y + 22);
    T.to('#dWed', { backgroundColor: '#125b49', color: '#ffffff', duration: 0.25 }, 34.5);
    T.to('#dWed .dw', { color: '#d8eee2', duration: 0.25 }, 34.5);
    T.to('#dWed', { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, 34.5);
    cue(34.56, 'ding', 0.8);
    cursorOut(34.75, 240, 220);
    ft('#nextStep', { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 35.0);
    cue(35.0, 'tick', 0.7);
    // push up into S5 (like scrolling the site)
    T.to('#s4', { yPercent: -100, duration: 0.85, ease: 'expo.inOut' }, 35.6);
    cue(35.6, 'whoosh', 0.9);

    /* ===== S5 · for patients (35.6–42.1) ===== */
    show('#s5', 35.55, 42.2);
    ft('#s5', { yPercent: 100 }, { yPercent: 0, duration: 0.85, ease: 'expo.inOut' }, 35.6);
    ft('#s5panel', { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.0, ease: 'expo.out' }, 35.95);
    ft('#phone', { y: 320, rotate: -16, opacity: 0 }, { y: 0, rotate: -6, opacity: 1, duration: 1.15, ease: 'expo.out' }, 36.0);
    cue(36.0, 'swipe', 0.6);
    blurIn($$('#phone > *:not(.notch)'), 36.4, 0.08, 0.6, 22);
    T.to('#phone', { y: -16, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 37.15);
    ft(s5lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.025, ease: 'power3.out' }, 36.4);
    rise(s5w, 36.7, 0.12);
    s5w.forEach((_, i) => { if (i % 2 === 0) cue(36.7 + i * 0.12, 'tok', 0.32); });
    ft(['#tg1', '#tg2', '#tg3'], { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out', stagger: 0.15 }, 37.8);
    ['#tg1', '#tg2', '#tg3'].forEach((g, i) => {
      const t = 38.5 + i * 0.5;
      T.to(`${g} .sw`, { backgroundColor: '#168567', duration: 0.25 }, t);
      T.to(`${g} .sw i`, { x: 30, duration: 0.35, ease: 'back.out(2.4)' }, t);
      cue(t, 'toggle', 0.9);
    });
    popIn('#s5btn', 40.1);
    cue(40.1, 'pop', 0.7);
    cursorIn(40.35, 1920, 1100, P.s5btn.x + 50, P.s5btn.y + 6, 0.55);
    click(40.95, P.s5btn.x + 50, P.s5btn.y + 6);
    T.to('#s5btn', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 40.95);
    cursorOut(41.2, 200, 260);
    // wave rises into S6
    T.set('#wave', { opacity: 1 }, 41.2);
    T.set('#wave', { opacity: 0 }, 42.12);
    DYN.push((t) => {
      if (t < 41.15 || t > 42.15) return;
      const p = seg(t, 41.2, 42.05, 'power2.inOut');
      const level = 1250 - p * 1420, ph = t * 7.5;
      let d = `M0 ${level.toFixed(1)}`;
      for (let x = 0; x <= 1920; x += 32) {
        const amp = 70 * (1 - p * 0.6);
        const y = level + amp * Math.sin((x / 1920) * Math.PI * 2.4 + ph) + amp * 0.45 * Math.sin((x / 1920) * Math.PI * 5.1 - ph * 1.3);
        d += ` L${x} ${y.toFixed(1)}`;
      }
      d += ' L1920 1400 L0 1400 Z';
      $('#wavePath').setAttribute('d', d);
    });
    cue(41.2, 'wave', 0.9);

    /* ===== S6 · hospitals & care teams (42–48) ===== */
    show('#s6', 42.05, 48.3);
    ft(s6lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out' }, 42.2);
    rise(s6w, 42.35, 0.14);
    s6w.forEach((_, i) => { if (i % 2 === 0) cue(42.35 + i * 0.14, 'tok', 0.32); });
    ft(['#or1', '#or2', '#or3'], { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: 0.15 }, 42.5);
    DYN.push((t) => { $('#or3').style.rotate = `${(t * 6).toFixed(2)}deg`; });
    ft('#tile', { scale: 0, rotate: -40 }, { scale: 1, rotate: -6, duration: 0.95, ease: 'back.out(1.8)' }, 43.0);
    cue(43.0, 'impactS', 0.8);
    const pl = $('#pulseLine'); const pLen = 34;
    ft(pl, { strokeDasharray: pLen, strokeDashoffset: pLen }, { strokeDasharray: pLen, strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, 43.4);
    cue(43.4, 'blip', 0.6);
    [44, 45, 46, 47].forEach((t) => { T.to('#tile', { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, t); });
    // network lines tile → roles
    const net = $('#net');
    const center = { x: 1330, y: 540 };
    const roles = ['#ro1', '#ro2', '#ro3', '#ro4'].map((s) => ({ s, x: parseFloat($(s).style.left), y: parseFloat($(s).style.top) }));
    const pulses = [];
    roles.forEach((r, i) => {
      const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', center.x); ln.setAttribute('y1', center.y); ln.setAttribute('x2', r.x); ln.setAttribute('y2', r.y);
      ln.setAttribute('stroke', 'rgba(255,255,255,.4)'); ln.setAttribute('stroke-width', '1.5'); ln.setAttribute('stroke-dasharray', '3 7');
      net.appendChild(ln);
      const len = Math.hypot(r.x - center.x, r.y - center.y);
      const t = 43.8 + i * 0.3;
      ft(ln, { attr: { 'stroke-dasharray': `0 ${len}` } }, { attr: { 'stroke-dasharray': `${len} 0` }, duration: 0.45, ease: 'power2.out' }, t);
      ft(r.s, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2.2)' }, t + 0.25);
      cue(t + 0.25, 'pop', 0.6, r.x > 1330 ? 0.4 : -0.2);
      const pd = document.createElement('div'); pd.className = 'pulse'; $('#s6').appendChild(pd); pulses.push({ pd, r });
    });
    DYN.push((t) => {
      pulses.forEach(({ pd, r }, i) => {
        const local = t - 45.0 - i * 0.25;
        if (local < 0 || t > 47.7) { pd.style.opacity = 0; return; }
        const p = (local % 1.0) / 1.0;
        const e = ease('power1.inOut')(p);
        pd.style.opacity = (Math.sin(p * Math.PI)).toFixed(3);
        pd.style.left = `${center.x + (r.x - center.x) * e}px`;
        pd.style.top = `${center.y + (r.y - center.y) * e}px`;
      });
    });
    blurIn('#s6sub', 44.9, 0, 0.8, 18);
    exitUp(s6w, 46.0);
    cue(46.0, 'whooshS', 0.6);
    rise(s6w2, 46.4, 0.14);
    s6w2.forEach((_, i) => { if (i % 2 === 0) cue(46.4 + i * 0.14, 'tok', 0.32); });
    T.to('#s6', { scale: 1.1, filter: 'blur(14px)', duration: 0.65, ease: 'power2.in' }, 47.55);
    cue(47.6, 'whoosh', 0.8);

    /* ===== S7 · small steps (47.7–52.2) ===== */
    show('#s7', 47.65, 52.35);
    ft('#s7', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.inOut' }, 47.7);
    ft(s7lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.015, ease: 'power3.out' }, 48.0);
    rise(s7w, 48.1, 0.16);
    s7w.forEach((_, i) => cue(48.1 + i * 0.16, 'tok', 0.35));
    ft($$('#stats .ln'), { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: 'expo.inOut', stagger: 0.2 }, 48.85);
    ft('#cA', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 49.25);
    ft('#cB', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out' }, 49.75);
    const cC = splitChars($('#svC'));
    ft(cC, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }, 50.35);
    blurIn($$('#stats .sl'), 49.5, 0.5, 0.7, 14);
    // counters
    const cntA = [[49.25, '00'], [49.5, '01']];
    const cntB = [[49.75, '00'], [49.95, '01'], [50.05, '02'], [50.15, '03'], [50.25, '04']];
    cntA.slice(1).forEach(([t]) => cue(t, 'count', 0.7));
    cntB.slice(1).forEach(([t], i) => cue(t, 'count', 0.45 + i * 0.12));
    cue(50.35, 'count', 0.7);
    DYN.push((t) => {
      const pick = (arr) => { let v = arr[0][1]; arr.forEach(([tt, s]) => { if (t >= tt) v = s; }); return v; };
      const a = pick(cntA), b = pick(cntB);
      if ($('#cA').textContent !== a) $('#cA').textContent = a;
      if ($('#cB').textContent !== b) $('#cB').textContent = b;
    });
    // slit reveal into S8
    show('#s8', 51.6, 56.25);
    ft('#s8', { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' }, 51.6);
    cue(51.6, 'swipe', 0.9);

    /* ===== S8 · a healthier tomorrow (51.6–56) ===== */
    ft('#s8img', { scale: 1.2 }, { scale: 1.04, duration: 4.7, ease: 'power1.out' }, 51.6);
    ft(s8lab, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power3.out' }, 52.3);
    rise(s8w, 52.5, 0.11);
    popIn('#s8btn', 54.25);
    cue(54.25, 'pop', 0.6);
    T.to('#s8', { scale: 1.06, duration: 0.7, ease: 'power2.in' }, 55.35);
    ft('#flash', { opacity: 0 }, { opacity: 1, duration: 0.55, ease: 'power2.in' }, 55.45);
    T.to('#flash', { opacity: 0, duration: 0.7, ease: 'power2.out' }, 56.0);

    /* ===== S9 · end card (56–66) ===== */
    show('#s9', 55.95, 66.1);
    cue(56.0, 'impact', 0.9);
    rise(s9w, 56.05, 0.14);
    s9w.forEach((_, i) => cue(56.05 + i * 0.14, 'tok', 0.35));
    exitUp(s9w, 58.0, 0.03, 0.42);
    cue(58.0, 'whooshS', 0.6);
    ft('#lMark', { scale: 0.4, opacity: 0, rotate: -22, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, rotate: 0, duration: 1.0, ease: 'expo.out' }, 58.5);
    ft('#lArms', { y: -24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, 58.62);
    ft('#lHead', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, 58.75);
    ft('#lCross', { scale: 0, rotate: -90, transformOrigin: '50% 50%' }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.5)' }, 58.85);
    cue(58.5, 'logo', 1);
    ft('#wmRect', { attr: { width: 0 } }, { attr: { width: 200 }, duration: 0.9, ease: 'expo.out' }, 58.95);
    ft('#lText', { x: -34, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, 58.95);
    ft('#lSub', { opacity: 0, attr: { 'letter-spacing': 12 } }, { opacity: 1, attr: { 'letter-spacing': 4 }, duration: 1.1, ease: 'expo.out' }, 59.15);
    ft('#lLeaf', { scale: 0, rotate: -70, transformOrigin: '0% 100%' }, { scale: 1, rotate: 0, duration: 0.75, ease: 'back.out(3)' }, 59.6);
    cue(59.6, 'shimmer', 0.75);
    rise(tagW, 60.2, 0.1);
    popIn(['#s9url', '#s9btn'], 60.95, 0.15);
    cue(60.95, 'pop', 0.55); cue(61.1, 'pop', 0.6);
    cursorIn(61.25, 1920, 1100, P.s9btn.x + 40, P.s9btn.y + 6, 0.6);
    click(62.0, P.s9btn.x + 40, P.s9btn.y + 6);
    T.to('#s9btn', { scale: 0.95, duration: 0.09, yoyo: true, repeat: 1 }, 62.0);
    cursorOut(62.35, 240, 220);
    blurIn('#s9foot', 62.5, 0, 0.9, 10);
    ft('#fadeout', { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power1.in' }, 64.9);

    T.set({}, {}, DURATION);
  }

  /* ---------- film grain ---------- */
  const g = document.getElementById('grain'), gc = g.getContext('2d');
  const img = gc.createImageData(960, 540);
  function drawGrain(f) {
    let s = (Math.imul(f + 1, 2654435761) >>> 0) || 1;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
      const v = s & 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    gc.putImageData(img, 0, 0);
  }

  window.renderFrame = (f, fps) => {
    const t = f / fps;
    T.seek(t, false);
    DYN.forEach((fn) => fn(t));
    drawGrain(f);
  };
  window.FILM = { DURATION, CUES, T };

  Promise.all([document.fonts.ready, ...[...document.images].map((i) => (i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; })))])
    .then(() => document.fonts.load('600 40px Arimo'))
    .then(() => Promise.all([document.fonts.load('italic 40px Gelasio'), document.fonts.load('40px Gelasio')]))
    .then(() => { build(); window.renderFrame(0, 60); window.READY = true; })
    .catch((e) => { window.BUILD_ERROR = String(e && e.stack || e); });
})();
