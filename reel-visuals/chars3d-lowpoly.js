// 3D low-poly "clay" characters (faceted, flat-shaded, chunky big-head proportions).
// Built from primitives so everything stays procedural and frame-deterministic.
import * as THREE from 'three';

// ---------- low-poly helpers
function hash3(x, y, z) {
  let h = Math.imul(Math.round(x * 997) | 0, 73856093) ^ Math.imul(Math.round(y * 997) | 0, 19349663) ^ Math.imul(Math.round(z * 997) | 0, 83492791);
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
// jitter vertices by position hash -> identical positions move identically, so faces never tear
function jitter(geo, amt = 0.04) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setXYZ(i, x + (hash3(x, y, z) - 0.5) * amt, y + (hash3(y, z, x) - 0.5) * amt, z + (hash3(z, x, y) - 0.5) * amt);
  }
  geo.computeVertexNormals();
  return geo;
}
// keep only triangles whose centroid passes a test (for beards / hair shells)
function shellPart(geo, keep) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position, out = [];
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    if (keep(cx, cy, cz)) for (let k = 0; k < 3; k++) out.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k));
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.Float32BufferAttribute(out, 3));
  r.computeVertexNormals();
  return r;
}
const matCache = new Map();
function M(color, extra = {}) {
  const k = color + JSON.stringify(extra);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...extra }));
  return matCache.get(k);
}
function mesh(geo, color, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], extra) {
  const m = new THREE.Mesh(geo, M(color, extra));
  m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot);
  return m;
}
const ico = (r, d = 1, j = 0.05) => jitter(new THREE.IcosahedronGeometry(r, d), j * r);
const caps = (r, l, j = 0.04) => jitter(new THREE.CapsuleGeometry(r, l, 3, 7), j);
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);

// ---------- generic body
function buildBody(o) {
  const body = new THREE.Group();
  // puffy torso
  body.add(mesh(caps(1.1, 0.9, 0.08), o.suit, [0, 0.75, 0], [1.28, 1, 0.82]));
  // shoulders
  body.add(mesh(ico(0.62, 1), o.suit, [-1.05, 1.45, 0], [1, 0.85, 1]));
  body.add(mesh(ico(0.62, 1), o.suit, [1.05, 1.45, 0], [1, 0.85, 1]));
  if (o.shirt) {
    // V-neck shirt panel + tie
    const v = new THREE.Shape(); v.moveTo(-0.48, 0); v.lineTo(0.48, 0); v.lineTo(0, -1.1); v.closePath();
    body.add(mesh(new THREE.ShapeGeometry(v), o.shirt, [0, 1.78, 0.93], [1, 1, 1], [-0.18, 0, 0]));
    body.add(mesh(box(0.42, 0.14, 0.12), o.shirt, [-0.22, 1.74, 0.86], [1, 1, 1], [0, 0, -0.5]));
    body.add(mesh(box(0.42, 0.14, 0.12), o.shirt, [0.22, 1.74, 0.86], [1, 1, 1], [0, 0, 0.5]));
  }
  if (o.tie) {
    body.add(mesh(box(0.2, 0.17, 0.12), o.tie, [0, 1.62, 0.98]));
    const tg = new THREE.CylinderGeometry(0.17, 0.09, 1.25, 4); tg.rotateY(Math.PI / 4);
    body.add(mesh(tg, o.tie, [0, 0.92, 1.02], [1, 1, 0.35], [-0.12, 0, 0]));
  }
  if (o.lapel) {
    body.add(mesh(box(0.3, 1.2, 0.1), o.lapel, [-0.52, 1.2, 0.93], [1, 1, 1], [-0.12, 0, -0.42]));
    body.add(mesh(box(0.3, 1.2, 0.1), o.lapel, [0.52, 1.2, 0.93], [1, 1, 1], [-0.12, 0, 0.42]));
  }
  // neck
  body.add(mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.6, 7), o.skinDark || o.skin, [0, 1.95, 0]));
  // arms (pivot at shoulder so they can gesture)
  const arms = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(1.2 * s, 1.5, 0);
    pivot.add(mesh(caps(0.4, 1.0), o.suit, [0.12 * s, -0.75, 0.05], [1, 1, 1], [0, 0, 0.12 * s]));
    pivot.add(mesh(ico(0.32, 1), o.skin, [0.24 * s, -1.55, 0.12]));
    body.add(pivot);
    return pivot;
  });
  return { body, arms };
}

function buildHead(o) {
  const head = new THREE.Group();
  head.position.y = 2.65;
  const hg = ico(1, 2, 0.035);
  head.add(mesh(hg, o.skin, [0, 0, 0], o.headScale || [0.95, 1.05, 0.96]));
  head.add(mesh(ico(0.2, 1), o.skinDark || o.skin, [-0.92, -0.05, 0], [0.6, 1, 0.8]));
  head.add(mesh(ico(0.2, 1), o.skinDark || o.skin, [0.92, -0.05, 0], [0.6, 1, 0.8]));
  // eyes
  const eyes = new THREE.Group();
  const eyeG = new THREE.SphereGeometry(0.1, 6, 5);
  const eL = mesh(eyeG, 0x15100c, [-0.33, 0.06, 0.88], [1, 1.25, 0.6]);
  const eR = mesh(eyeG, 0x15100c, [0.33, 0.06, 0.88], [1, 1.25, 0.6]);
  eyes.add(eL, eR); head.add(eyes);
  // brows
  const brows = [-1, 1].map((s) => {
    const b = mesh(box(0.34, 0.08, 0.08), o.brow, [0.33 * s, 0.3, 0.9], [1, 1, 1], [0, 0, -0.08 * s]);
    head.add(b); return b;
  });
  // nose
  head.add(mesh(ico(0.15, 0), o.skinDark || o.skin, [0, -0.12, 1.0], [0.9, 1.1, 0.9]));
  // mouth
  const mouth = mesh(box(0.3, 0.07, 0.06), o.mouth || 0x3a1512, [0, -0.45, 0.92]);
  head.add(mouth);
  if (o.cheeks) {
    head.add(mesh(ico(0.18, 0), o.cheeks, [-0.55, -0.25, 0.75], [1, 0.6, 0.4], [0, 0, 0], { transparent: true, opacity: 0.5 }));
    head.add(mesh(ico(0.18, 0), o.cheeks, [0.55, -0.25, 0.75], [1, 0.6, 0.4], [0, 0, 0], { transparent: true, opacity: 0.5 }));
  }
  return { head, eyes, brows, mouth, hg };
}

// ---------- the cast
const CAST = {
  trump: () => {
    const o = { suit: 0x1f2c57, lapel: 0x17203f, shirt: 0xf3f3f6, tie: 0xd0142c, skin: 0xf0a463, skinDark: 0xe08f4f, brow: 0xe8c66a, mouth: 0xb8564a, cheeks: 0xe2703a };
    const b = buildBody(o), h = buildHead(o);
    // pale area around eyes
    h.head.add(mesh(ico(0.26, 1), 0xf8d2a4, [-0.33, 0.06, 0.8], [1.2, 0.7, 0.5]));
    h.head.add(mesh(ico(0.26, 1), 0xf8d2a4, [0.33, 0.06, 0.8], [1.2, 0.7, 0.5]));
    h.eyes.children.forEach((e) => (e.position.z = 0.93));
    h.mouth.scale.set(0.8, 1.4, 1);
    // the famous swoop
    const hair = 0xf1c95a, hairL = 0xfbe08c;
    h.head.add(mesh(ico(1, 1, 0.06), hair, [0.02, 0.62, -0.05], [1.06, 0.5, 1.04], [0.1, 0, 0]));
    h.head.add(mesh(ico(0.7, 1, 0.06), hairL, [-0.12, 0.72, 0.5], [1.15, 0.42, 0.75], [0.25, 0, 0.18]));
    h.head.add(mesh(ico(0.45, 1, 0.06), hairL, [0.4, 0.62, 0.78], [1.3, 0.4, 0.6], [0.4, 0.2, -0.25]));
    h.head.add(mesh(ico(0.45, 1, 0.06), hair, [-0.88, 0.25, -0.05], [0.42, 0.9, 1.4]));
    h.head.add(mesh(ico(0.45, 1, 0.06), hair, [0.88, 0.25, -0.05], [0.42, 0.9, 1.4]));
    h.head.add(mesh(ico(0.8, 1, 0.06), hair, [0, 0.25, -0.55], [1.15, 0.85, 0.6]));
    // flag pin
    b.body.add(mesh(box(0.14, 0.09, 0.04), 0xc8102e, [-0.62, 1.32, 1.0]));
    return { ...b, ...h };
  },
  putin: () => {
    const o = { suit: 0x30343c, lapel: 0x23262d, shirt: 0xf2f2f4, tie: 0x2a3e7c, skin: 0xf1cbb3, skinDark: 0xdcaa90, brow: 0xa58c70, mouth: 0x9a5a4c, headScale: [0.9, 1.06, 0.94] };
    const b = buildBody(o), h = buildHead(o);
    // thinning light hair: side patches + faint top
    const hair = 0xb9a084;
    h.head.add(mesh(ico(0.45, 1), hair, [-0.8, 0.35, -0.15], [0.35, 0.75, 1.3]));
    h.head.add(mesh(ico(0.45, 1), hair, [0.8, 0.35, -0.15], [0.35, 0.75, 1.3]));
    h.head.add(mesh(shellPart(ico(1.02, 2, 0.02), (x, y, z) => y > 0.6 && z < 0.55), 0xc9b497, [0, 0, 0], [0.92, 1.05, 0.95], [0, 0, 0], { transparent: true, opacity: 0.85 }));
    h.head.add(mesh(ico(0.75, 1), hair, [0, 0.2, -0.6], [1.1, 0.95, 0.5]));
    // narrow, cool eyes & cheekbones
    h.eyes.children.forEach((e) => { e.scale.set(1.15, 0.75, 0.6); });
    h.mouth.scale.set(1.1, 0.7, 1);
    h.head.add(mesh(ico(0.2, 0), 0xd99f88, [-0.55, -0.2, 0.72], [1, 1.3, 0.4], [0, 0, 0], { transparent: true, opacity: 0.6 }));
    h.head.add(mesh(ico(0.2, 0), 0xd99f88, [0.55, -0.2, 0.72], [1, 1.3, 0.4], [0, 0, 0], { transparent: true, opacity: 0.6 }));
    return { ...b, ...h };
  },
  zelensky: () => {
    const o = { suit: 0x56602f, skin: 0xeabd98, skinDark: 0xd8a681, brow: 0x2a1d17, mouth: 0x7a3e33 };
    const b = buildBody(o), h = buildHead(o);
    // crew neck band + trident
    b.body.add(mesh(new THREE.TorusGeometry(0.5, 0.1, 4, 9), 0x434b22, [0, 1.7, 0.1], [1.15, 1, 0.9], [Math.PI / 2 - 0.25, 0, 0]));
    b.body.add(mesh(box(0.22, 0.26, 0.05), 0xf2c94c, [0.6, 1.1, 0.95]));
    // short dark hair
    h.head.add(mesh(shellPart(ico(1.07, 2, 0.03), (x, y, z) => y > 0.42 - z * 0.12 || (z < -0.2 && y > -0.1)), 0x2e211b, [0, 0, 0], [0.97, 1.05, 0.99]));
    // stubble beard
    h.head.add(mesh(shellPart(ico(1.03, 2, 0.02), (x, y, z) => y < -0.3 && z > -0.3 && !(Math.abs(x) < 0.26 && y > -0.6 && z > 0.75)), 0x6b4e3d, [0, 0, 0], [0.97, 1.06, 0.99]));
    h.head.add(mesh(box(0.5, 0.08, 0.08), 0x3b2b22, [0, -0.34, 0.95]));
    h.mouth.position.z = 1.0;
    h.brows.forEach((x) => x.scale.set(1.1, 1.5, 1));
    return { ...b, ...h };
  },
  iran: () => {
    const o = { suit: 0x4e5a35, lapel: 0x414c2b, shirt: 0x6b7650, skin: 0xd9a47c, skinDark: 0xc48f68, brow: 0x16110e, mouth: 0x3a1a14 };
    const b = buildBody(o), h = buildHead(o);
    // full black beard
    h.head.add(mesh(shellPart(ico(1.05, 2, 0.03), (x, y, z) => y < -0.05 && z > -0.45 && !(Math.abs(x) < 0.22 && y > -0.55 && y < -0.35 && z > 0.8)), 0x1a1411, [0, -0.06, 0.02], [0.99, 1.12, 1.02]));
    h.head.add(mesh(box(0.56, 0.1, 0.1), 0x1a1411, [0, -0.33, 0.95]));
    h.mouth.position.z = 1.02;
    // military peaked cap
    const cap = new THREE.Group(); cap.position.set(0, 0.78, 0); cap.rotation.x = -0.08;
    cap.add(mesh(new THREE.CylinderGeometry(1.05, 0.98, 0.55, 9), 0x4b5733, [0, 0.12, 0]));
    cap.add(mesh(new THREE.CylinderGeometry(1.14, 1.05, 0.12, 9), 0x3d4729, [0, 0.42, 0]));
    const visor = new THREE.CylinderGeometry(0.75, 0.75, 0.06, 9, 1, false, -Math.PI / 2, Math.PI);
    cap.add(mesh(visor, 0x111309, [0, -0.13, 0.6], [1, 1, 0.65], [0.15, 0, 0]));
    cap.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 8), 0xd9b440, [0, 0.15, 1.02], [1, 1, 1], [Math.PI / 2, 0, 0]));
    h.head.add(cap);
    // shoulder boards + flag patch
    b.body.add(mesh(box(0.7, 0.1, 0.4), 0x2b321c, [-1.05, 1.92, 0]));
    b.body.add(mesh(box(0.7, 0.1, 0.4), 0x2b321c, [1.05, 1.92, 0]));
    [0x239f40, 0xffffff, 0xda0000].forEach((c, i) => b.body.add(mesh(box(0.13, 0.16, 0.04), c, [0.45 + i * 0.13, 1.1, 0.96])));
    h.brows.forEach((x) => x.scale.set(1.1, 1.6, 1));
    return { ...b, ...h };
  },
};

export function makeCharacter3D(kind) {
  const parts = CAST[kind]();
  const root = new THREE.Group();
  const rig = new THREE.Group();
  rig.add(parts.body, parts.head);
  parts.head.scale.setScalar(1.2); parts.head.position.y = 2.85;
  root.add(rig);
  const phase = (kind.charCodeAt(0) % 7) * 0.37;
  return {
    root,
    update(t, { talk = 0, angry = 0, point = 0 } = {}) {
      const tt = t + phase;
      rig.position.y = Math.sin(tt * 2.4) * 0.05;
      parts.head.rotation.z = Math.sin(tt * 1.4) * 0.05 + Math.sin(tt * 3.7) * talk * 0.04;
      parts.head.rotation.x = Math.sin(tt * 6.1) * talk * 0.05 - angry * 0.05;
      parts.head.rotation.y = Math.sin(tt * 0.9) * 0.08;
      parts.eyes.scale.y = (tt % 3.3) > 3.15 ? 0.1 : 1;
      const m = talk * Math.max(0, 0.5 + 0.5 * Math.sin(tt * 17) * Math.sin(tt * 5.3 + 1));
      parts.mouth.scale.y = (parts.mouth.userData.sy ??= parts.mouth.scale.y) * (1 + m * 3.5);
      parts.brows.forEach((b, i) => { const s = i === 0 ? 1 : -1; b.rotation.z = -0.08 * s - angry * 0.35 * s; b.position.y = 0.3 - angry * 0.06; });
      // arms: idle sway, talk gestures, angry pointing (right arm)
      const g = talk * (0.25 + 0.2 * Math.sin(tt * 4.3));
      parts.arms[0].rotation.z = -0.05 - g * 0.6;
      parts.arms[0].rotation.x = -g * 0.8;
      const pr = Math.max(point, g);
      parts.arms[1].rotation.z = 0.05 + pr * 0.9 + point * 0.25 * Math.sin(tt * 9);
      parts.arms[1].rotation.x = -pr * 1.1;
    },
  };
}
