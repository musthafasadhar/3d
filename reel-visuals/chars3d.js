// Smooth, rounded 3D "toy" characters in the style of the reference reel:
// big round head, small black oval eyes with a white glint, tiny nose, little flat mouth,
// puffy rounded clothes, soft shading. Plus a 3D 8-axle mobile ICBM launcher.
import * as THREE from 'three';

const matCache = new Map();
function M(color, extra = {}) {
  const k = color + JSON.stringify(extra);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0, ...extra }));
  return matCache.get(k);
}
function mesh(geo, color, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0], extra) {
  const m = new THREE.Mesh(geo, M(color, extra));
  m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot);
  return m;
}
// modest segment counts keep the gentle "soft low-poly" facets of the reference
const sph = (r, w = 26, h = 18) => new THREE.SphereGeometry(r, w, h);
const caps = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 16);
const box = (x, y, z) => new THREE.BoxGeometry(x, y, z);
const cyl = (rt, rb, h, s = 20) => new THREE.CylinderGeometry(rt, rb, h, s);

// keep only triangles whose centroid passes a test (hair caps, beards) – normals stay smooth
function shellPart(geo, keep) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const p = g.attributes.position, n = g.attributes.normal, P = [], N = [];
  for (let i = 0; i < p.count; i += 3) {
    const cx = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, cy = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, cz = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
    if (!keep(cx, cy, cz)) continue;
    for (let k = 0; k < 3; k++) { P.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); N.push(n.getX(i + k), n.getY(i + k), n.getZ(i + k)); }
  }
  const r = new THREE.BufferGeometry();
  r.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  r.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return r;
}

// ---------------------------------------------------------------- body + head
function buildBody(o) {
  const body = new THREE.Group();
  body.add(mesh(caps(1.0, 0.55), o.suit, [0, 0.55, 0], [1.42, 1, 0.9]));
  body.add(mesh(sph(0.62), o.suit, [-1.02, 1.12, 0], [1.05, 0.9, 1]));
  body.add(mesh(sph(0.62), o.suit, [1.02, 1.12, 0], [1.05, 0.9, 1]));
  if (o.shirt) {
    const v = new THREE.Shape(); v.moveTo(-0.42, 0); v.quadraticCurveTo(0, -0.05, 0.42, 0); v.lineTo(0, -0.95); v.closePath();
    body.add(mesh(new THREE.ShapeGeometry(v, 8), o.shirt, [0, 1.5, 0.86], [1, 1, 1], [-0.25, 0, 0]));
    body.add(mesh(caps(0.07, 0.32), o.shirt, [-0.2, 1.45, 0.82], [1, 1, 1], [0.2, 0, -1.05]));
    body.add(mesh(caps(0.07, 0.32), o.shirt, [0.2, 1.45, 0.82], [1, 1, 1], [0.2, 0, 1.05]));
  }
  if (o.tie) {
    body.add(mesh(sph(0.11, 12, 8), o.tie, [0, 1.38, 0.92], [1, 0.9, 0.7]));
    body.add(mesh(cyl(0.12, 0.07, 1.0, 4), o.tie, [0, 0.82, 0.98], [1, 1, 0.35], [-0.2, Math.PI / 4, 0]));
  }
  if (o.lapel) {
    body.add(mesh(caps(0.11, 0.9), o.lapel, [-0.44, 1.05, 0.86], [1.4, 1, 0.5], [-0.25, 0, -0.38]));
    body.add(mesh(caps(0.11, 0.9), o.lapel, [0.44, 1.05, 0.86], [1.4, 1, 0.5], [-0.25, 0, 0.38]));
  }
  body.add(mesh(cyl(0.34, 0.4, 0.55), o.skinDark || o.skin, [0, 1.7, 0]));
  const arms = [-1, 1].map((s) => {
    const pivot = new THREE.Group(); pivot.position.set(1.15 * s, 1.15, 0);
    pivot.add(mesh(caps(0.36, 0.8), o.suit, [0.1 * s, -0.62, 0.05], [1, 1, 1], [0, 0, 0.1 * s]));
    pivot.add(mesh(sph(0.27), o.skin, [0.2 * s, -1.28, 0.12]));
    body.add(pivot);
    return pivot;
  });
  return { body, arms };
}

function buildHead(o) {
  const head = new THREE.Group();
  head.add(mesh(sph(1, 32, 24), o.skin, [0, 0, 0], o.headScale || [1, 0.98, 0.95]));
  head.add(mesh(sph(0.17), o.skinDark || o.skin, [-0.97, -0.05, 0], [0.55, 1, 0.8]));
  head.add(mesh(sph(0.17), o.skinDark || o.skin, [0.97, -0.05, 0], [0.55, 1, 0.8]));
  const eyes = new THREE.Group();
  const ex = o.eyeX ?? 0.3, ey = o.eyeY ?? 0.02;
  [-1, 1].forEach((s) => {
    eyes.add(mesh(sph(0.075, 14, 10), 0x0c0a0a, [ex * s, ey, 0.93], [0.82, 1.25, 0.5], [0, 0, 0], { roughness: 0.25 }));
    eyes.add(mesh(sph(0.022, 8, 6), 0xffffff, [ex * s + 0.022, ey + 0.04, 0.965], [1, 1, 0.5], [0, 0, 0], { emissive: 0xffffff, emissiveIntensity: 0.6 }));
  });
  head.add(eyes);
  const brows = [-1, 1].map((s) => {
    const b = mesh(caps(0.035, 0.2), o.brow, [ex * s, ey + 0.24, 0.9], [1, 1, 0.6], [0, 0, Math.PI / 2 - 0.08 * s]);
    head.add(b); return b;
  });
  head.add(mesh(sph(0.065, 12, 8), o.nose || o.skinDark || o.skin, [0, -0.14, 0.99], [0.9, 1.1, 1]));
  const mouth = mesh(box(0.2, 0.06, 0.04), o.mouth || 0x3a1a18, [0, -0.42, 0.9]);
  head.add(mouth);
  if (o.cheeks) [-1, 1].forEach((s) => head.add(mesh(sph(0.16, 12, 8), o.cheeks, [0.55 * s, -0.24, 0.76], [1, 0.6, 0.35], [0, 0, 0], { transparent: true, opacity: 0.45 })));
  return { head, eyes, brows, mouth };
}

// ---------------------------------------------------------------- cast
const CAST = {
  trump: () => {
    const o = { suit: 0x1e2b58, lapel: 0x17214a, shirt: 0xf4f4f6, tie: 0xd3132d, skin: 0xf2a768, skinDark: 0xe29457, nose: 0xe98f55, brow: 0xe8c46a, mouth: 0x9a3e36, cheeks: 0xe86b3a };
    const b = buildBody(o), h = buildHead(o);
    [-1, 1].forEach((s) => h.head.add(mesh(sph(0.2), 0xf9d3a8, [0.3 * s, 0.03, 0.86], [1.2, 0.75, 0.45])));
    h.mouth.scale.set(0.8, 1.3, 1);
    const hair = 0xf0c85a, hairL = 0xfde296;
    h.head.add(mesh(sph(1), hair, [0.02, 0.58, -0.08], [1.07, 0.52, 1.05], [0.12, 0, 0]));
    h.head.add(mesh(sph(0.7), hairL, [-0.1, 0.72, 0.42], [1.2, 0.42, 0.8], [0.3, 0, 0.16]));
    h.head.add(mesh(sph(0.45), hairL, [0.42, 0.62, 0.72], [1.35, 0.42, 0.62], [0.45, 0.2, -0.25]));
    [-1, 1].forEach((s) => h.head.add(mesh(sph(0.45), hair, [0.9 * s, 0.22, -0.08], [0.4, 0.9, 1.4])));
    h.head.add(mesh(sph(0.8), hair, [0, 0.22, -0.55], [1.18, 0.88, 0.62]));
    b.body.add(mesh(box(0.13, 0.08, 0.04), 0xc8102e, [-0.56, 1.12, 0.93]));
    b.body.add(mesh(box(0.05, 0.04, 0.045), 0x1f3a93, [-0.6, 1.14, 0.94]));
    return { ...b, ...h };
  },
  putin: () => {
    const o = { suit: 0x2e323b, lapel: 0x22252c, shirt: 0xf2f2f4, tie: 0x2a3e7c, skin: 0xf3cdb6, skinDark: 0xe0b09a, brow: 0xa58c70, mouth: 0x8a4e44, headScale: [0.94, 1.0, 0.94], cheeks: 0xe09a88 };
    const b = buildBody(o), h = buildHead(o);
    const hair = 0xb9a084;
    [-1, 1].forEach((s) => h.head.add(mesh(sph(0.45), hair, [0.8 * s, 0.32, -0.18], [0.36, 0.72, 1.3])));
    h.head.add(mesh(shellPart(sph(1.015, 72, 54), (x, y, z) => y > 0.62 && z < 0.5), 0xcbb69a, [0, 0, 0], [0.94, 1.0, 0.94], [0, 0, 0], { transparent: true, opacity: 0.8 }));
    h.head.add(mesh(sph(0.75), hair, [0, 0.18, -0.6], [1.12, 0.95, 0.5]));
    h.eyes.children.forEach((e, i) => { if (i % 2 === 0) e.scale.set(0.95, 0.85, 0.5); });
    h.mouth.scale.set(1.15, 0.7, 1);
    return { ...b, ...h };
  },
  zelensky: () => {
    const o = { suit: 0x56602f, skin: 0xebbf9a, skinDark: 0xd9a782, brow: 0x2a1d17, mouth: 0x6e382e };
    const b = buildBody(o), h = buildHead(o);
    b.body.add(mesh(new THREE.TorusGeometry(0.45, 0.1, 10, 24), 0x434b22, [0, 1.45, 0.12], [1.2, 1, 0.9], [Math.PI / 2 - 0.3, 0, 0]));
    b.body.add(mesh(box(0.2, 0.12, 0.05), 0xf2c94c, [0.55, 0.86, 0.93]));
    b.body.add(mesh(box(0.2, 0.12, 0.05), 0x1f5fc4, [0.55, 0.98, 0.93]));
    h.head.add(mesh(shellPart(sph(1.06, 72, 54), (x, y, z) => y > 0.42 - z * 0.12 || (z < -0.2 && y > -0.1)), 0x2e211b, [0, 0, 0], [1, 0.99, 0.96]));
    h.head.add(mesh(shellPart(sph(1.025, 72, 54), (x, y, z) => y < -0.3 && z > -0.3 && !(Math.abs(x) < 0.24 && y > -0.58 && z > 0.75)), 0x6b4e3d, [0, 0, 0], [1, 0.98, 0.95], [0, 0, 0], { transparent: true, opacity: 0.85 }));
    h.head.add(mesh(caps(0.035, 0.26), 0x3b2b22, [0, -0.32, 0.96], [1, 1, 0.6], [0, 0, Math.PI / 2]));
    h.mouth.position.z = 0.97;
    h.brows.forEach((x) => x.scale.set(1.5, 1.1, 0.6));
    return { ...b, ...h };
  },
  iran: () => {
    const o = { suit: 0x4e5a35, lapel: 0x414c2b, shirt: 0x6b7650, skin: 0xd9a47c, skinDark: 0xc48f68, brow: 0x16110e, mouth: 0x3a1a14 };
    const b = buildBody(o), h = buildHead(o);
    h.head.add(mesh(shellPart(sph(1.04, 72, 54), (x, y, z) => y < -0.06 && z > -0.45 && !(Math.abs(x) < 0.2 && y > -0.53 && y < -0.33 && z > 0.8)), 0x1a1411, [0, -0.06, 0.02], [1.02, 1.1, 1.0]));
    h.head.add(mesh(caps(0.05, 0.36), 0x1a1411, [0, -0.32, 0.95], [1, 1, 0.6], [0, 0, Math.PI / 2]));
    h.mouth.position.z = 1.0;
    const cap = new THREE.Group(); cap.position.set(0, 0.74, 0); cap.rotation.x = -0.08;
    cap.add(mesh(cyl(1.04, 0.98, 0.5, 28), 0x4b5733, [0, 0.12, 0]));
    cap.add(mesh(cyl(1.12, 1.04, 0.12, 28), 0x3d4729, [0, 0.4, 0]));
    cap.add(mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.05, 20, 1, false, -Math.PI / 2, Math.PI), 0x111309, [0, -0.12, 0.62], [1, 1, 0.62], [0.15, 0, 0]));
    cap.add(mesh(cyl(0.16, 0.16, 0.05, 16), 0xd9b440, [0, 0.14, 1.02], [1, 1, 1], [Math.PI / 2, 0, 0], { metalness: 0.6, roughness: 0.35 }));
    h.head.add(cap);
    [-1, 1].forEach((s) => b.body.add(mesh(box(0.66, 0.1, 0.4), 0x2b321c, [1.0 * s, 1.62, 0])));
    [0x239f40, 0xffffff, 0xda0000].forEach((c, i) => b.body.add(mesh(box(0.12, 0.15, 0.04), c, [0.4 + i * 0.12, 0.9, 0.93])));
    h.brows.forEach((x) => x.scale.set(1.6, 1.15, 0.6));
    return { ...b, ...h };
  },
};

export function makeCharacter3D(kind) {
  const parts = CAST[kind]();
  const root = new THREE.Group(), rig = new THREE.Group();
  parts.head.scale.setScalar(1.35);
  parts.head.position.y = 2.75;
  rig.add(parts.body, parts.head);
  root.add(rig);
  const phase = (kind.charCodeAt(0) % 7) * 0.37;
  const msy = parts.mouth.scale.y, msx = parts.mouth.scale.x;
  return {
    root,
    // talk 0..1, angry 0..1 (brows down/in), worried 0..1 (brows up), point 0..1 (right arm forward)
    update(t, { talk = 0, angry = 0, worried = 0, point = 0, look = 0 } = {}) {
      const tt = t + phase;
      rig.position.y = Math.sin(tt * 2.2) * 0.04;
      parts.head.rotation.z = Math.sin(tt * 1.3) * 0.05 + Math.sin(tt * 3.7) * talk * 0.04;
      parts.head.rotation.x = Math.sin(tt * 6.1) * talk * 0.05 - angry * 0.06 + worried * 0.04;
      parts.head.rotation.y = Math.sin(tt * 0.9) * 0.07 + look;
      parts.eyes.scale.y = (tt % 3.3) > 3.16 ? 0.12 : 1;
      const m = talk * Math.max(0, 0.5 + 0.5 * Math.sin(tt * 16) * Math.sin(tt * 5.3 + 1));
      parts.mouth.scale.y = msy * (1 + m * 3.2);
      parts.mouth.scale.x = msx * (1 - worried * 0.3);
      parts.brows.forEach((b, i) => {
        const s = i === 0 ? 1 : -1;
        b.rotation.z = Math.PI / 2 - 0.08 * s - angry * 0.4 * s + worried * 0.35 * s;
        b.position.y = 0.26 - angry * 0.05 + worried * 0.04;
      });
      const g = talk * (0.22 + 0.18 * Math.sin(tt * 4.3));
      parts.arms[0].rotation.z = -0.05 - g * 0.5 - worried * 0.2;
      parts.arms[0].rotation.x = -g * 0.7;
      const pr = Math.max(point, g * 0.8);
      parts.arms[1].rotation.z = 0.05 + pr * 0.85 + point * 0.2 * Math.sin(tt * 9);
      parts.arms[1].rotation.x = -pr * 1.15;
    },
  };
}

// ---------------------------------------------------------------- 8-axle mobile ICBM launcher
export function makeLauncher(glowTex) {
  const root = new THREE.Group();
  const green = 0x4a5a34, greenD = 0x37432a, black = 0x151515, glass = { metalness: 0.6, roughness: 0.15 };
  const truck = new THREE.Group(); root.add(truck);
  truck.add(mesh(box(8.4, 0.55, 2.1), greenD, [0, 1.05, 0]));
  truck.add(mesh(box(1.7, 1.5, 2.2), green, [3.75, 1.85, 0]));
  truck.add(mesh(box(0.05, 0.6, 1.9), 0x9fc0d8, [4.61, 2.15, 0], [1, 1, 1], [0, 0, 0.15], glass));
  [-1, 1].forEach((s) => truck.add(mesh(box(1.1, 0.5, 0.05), 0x9fc0d8, [3.8, 2.2, 1.11 * s], [1, 1, 1], [0, 0, 0], glass)));
  truck.add(mesh(box(6.2, 0.9, 2.0), green, [-0.9, 1.7, 0]));
  for (let i = 0; i < 6; i++) truck.add(mesh(box(0.06, 0.6, 2.02), greenD, [-3.6 + i * 1.1, 1.7, 0]));
  const wheels = [];
  for (let i = 0; i < 8; i++) {
    const x = -3.5 + i * 1.0 + (i > 3 ? 0.35 : 0);
    [-1, 1].forEach((s) => {
      const w = new THREE.Group(); w.position.set(x, 0.55, 1.02 * s);
      w.add(mesh(cyl(0.55, 0.55, 0.42, 22), black, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0], { roughness: 0.95 }));
      w.add(mesh(cyl(0.3, 0.3, 0.44, 6), 0x3e4a2c, [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0]));
      truck.add(w); wheels.push(w);
    });
  }
  const pivot = new THREE.Group(); pivot.position.set(-4.2, 2.45, 0); truck.add(pivot);
  const can = new THREE.Group(); pivot.add(can);
  can.add(mesh(cyl(0.72, 0.72, 8.2, 28), green, [4.1, 0, 0], [1, 1, 1], [0, 0, Math.PI / 2]));
  can.add(mesh(sph(0.72, 28, 16), green, [8.2, 0, 0], [0.7, 1, 1]));
  for (let i = 0; i < 4; i++) can.add(mesh(new THREE.TorusGeometry(0.73, 0.05, 6, 28), greenD, [1 + i * 2, 0, 0], [1, 1, 1], [0, Math.PI / 2, 0]));
  [0.2, 0.05, -0.1].forEach((y) => can.add(mesh(box(2.2, 0.08, 0.04), 0xb02020, [3.6, y, 0.71])));
  const missile = new THREE.Group();
  missile.add(mesh(cyl(0.55, 0.55, 6.5, 24), 0xe8eaee, [0, 3.25, 0], [1, 1, 1], [0, 0, 0], { metalness: 0.3, roughness: 0.4 }));
  missile.add(mesh(new THREE.ConeGeometry(0.55, 1.6, 24), 0x3a3f48, [0, 7.3, 0]));
  missile.add(mesh(cyl(0.57, 0.57, 0.3, 24), 0xb01020, [0, 5.6, 0]));
  const spr = (color, opacity = 1, additive = true) => new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
  const flame = spr(0xffa040); flame.position.y = -1.2; missile.add(flame);
  const core = spr(0xfff4d0); core.position.y = -0.4; core.scale.set(1.2, 1.8, 1); missile.add(core);
  missile.visible = false;
  root.add(missile);
  const smoke = Array.from({ length: 16 }, (_, i) => { const s = spr(0xb8b2ac, 0, false); s.userData = { a: (i / 16) * Math.PI * 2, d: i * 0.05 }; root.add(s); return s; });
  const base = new THREE.Vector3(), dir = new THREE.Vector3(), Yv = new THREE.Vector3(0, 1, 0);
  return {
    root,
    update(t, { tIn, tUp, tFire }) {
      const drive = Math.min(1, Math.max(0, (t - tIn) / 1.4));
      truck.position.x = Math.pow(1 - drive, 3) * -26;
      wheels.forEach((w) => (w.rotation.z = -truck.position.x / 0.55));
      truck.position.y = drive < 1 ? Math.sin(t * 30) * 0.02 : 0;
      const up = Math.min(1, Math.max(0, (t - tUp) / 1.1));
      pivot.rotation.z = (up < 0.5 ? 2 * up * up : 1 - Math.pow(-2 * up + 2, 2) / 2) * 1.42;
      const a = t - tFire;
      missile.visible = a > 0 && a < 2.4;
      if (missile.visible) {
        root.updateMatrixWorld(true);
        base.set(0.4, 0, 0); pivot.localToWorld(base); root.worldToLocal(base);
        dir.set(Math.cos(pivot.rotation.z), Math.sin(pivot.rotation.z), 0);
        missile.position.copy(base).addScaledVector(dir, 0.5 + 6 * a + 14 * a * a * a);
        missile.quaternion.setFromUnitVectors(Yv, dir);
        flame.scale.set(2.2 + Math.sin(t * 60) * 0.3, 4 + a * 3, 1);
      }
      smoke.forEach((s) => {
        const k = a - s.userData.d;
        s.visible = k > 0;
        if (!s.visible) return;
        const r = 0.8 + k * 3.2;
        s.position.set(-4.0 + Math.cos(s.userData.a) * r, 2.0 + k * 1.2, Math.sin(s.userData.a) * r * 0.6);
        s.scale.setScalar(1.5 + k * 3);
        s.material.opacity = Math.max(0, 0.6 * (1 - k / 4));
      });
      return a > 0 && a < 0.6 ? (0.6 - a) / 0.6 : 0; // shake amount
    },
  };
}
