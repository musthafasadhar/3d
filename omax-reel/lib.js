// Shared helpers for the Omax Media "Personal Branding" reel visuals.
// Everything is deterministic: scenes are rendered via renderAt(t) so the
// Playwright renderer can step frame-by-frame.
import * as THREE from './vendor/three.module.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export { THREE, RoundedBoxGeometry };

export const W = 1080;
export const H = 1920;
// Instagram overlays the bottom ~15% (username, caption, audio). Keep it clear.
export const SAFE_BOTTOM = Math.round(H * 0.85); // 1632px

export const BRAND = {
  name: 'OMAX MEDIA',
  accent: '#2ED3B7', // teal accent (like the reference "reel.")
  warm: '#FFB347',
  heart: '#FF4D6D',
  navy: '#0B1230',
};

// ---------- easing / timing ----------
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, start, dur) => clamp((t - start) / dur);
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x) => x * x * x;
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeBack = (x) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
// seeded random
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- renderer / scene ----------
export function createStage({ fov = 32, near = 0.1, far = 200 } = {}) {
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, W / H, near, far);
  return { renderer, scene, camera };
}

export function gradientTexture(stops, w = 16, h = 512) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Large backdrop plane that always faces camera (attach to camera).
export function backdrop(camera, stops, dist = 80) {
  const tex = gradientTexture(stops);
  const hgt = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.25;
  const geo = new THREE.PlaneGeometry(hgt * camera.aspect * 1.25, hgt);
  const mat = new THREE.MeshBasicMaterial({ map: tex, depthWrite: false, fog: false, toneMapped: false });
  const m = new THREE.Mesh(geo, mat);
  m.position.set(0, 0, -dist);
  m.renderOrder = -10;
  camera.add(m);
  return m;
}

// Soft round sprite texture (for bokeh / glow)
let _dot;
export function dotTexture() {
  if (_dot) return _dot;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  grd.addColorStop(0.75, 'rgba(255,255,255,0.25)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  _dot = new THREE.CanvasTexture(c);
  return _dot;
}
let _glow;
export function glowTexture() {
  if (_glow) return _glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.3, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

export function glowSprite(color, size, opacity = 0.8) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
  }));
  s.scale.set(size, size, 1);
  return s;
}

// Floating bokeh dots, like the references.
export function bokeh(scene, { count = 40, seed = 7, colors = ['#ffffff'], area = [-10, 10, -2, 14, -30, -8], size = [0.3, 1.1], opacity = [0.12, 0.45] } = {}) {
  const r = rng(seed);
  const group = new THREE.Group();
  const items = [];
  for (let i = 0; i < count; i++) {
    const col = colors[Math.floor(r() * colors.length)];
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: dotTexture(), color: col, transparent: true,
      opacity: lerp(opacity[0], opacity[1], r()), depthWrite: false, fog: false,
      blending: THREE.AdditiveBlending,
    }));
    const s = lerp(size[0], size[1], r());
    sp.scale.set(s, s, 1);
    const base = new THREE.Vector3(lerp(area[0], area[1], r()), lerp(area[2], area[3], r()), lerp(area[4], area[5], r()));
    sp.position.copy(base);
    items.push({ sp, base, ph: r() * Math.PI * 2, sp1: 0.2 + r() * 0.4, o: sp.material.opacity });
    group.add(sp);
  }
  scene.add(group);
  return {
    group,
    update(t) {
      for (const it of items) {
        it.sp.position.x = it.base.x + Math.sin(t * it.sp1 + it.ph) * 0.4;
        it.sp.position.y = it.base.y + Math.cos(t * it.sp1 * 0.8 + it.ph) * 0.3;
        it.sp.material.opacity = it.o * (0.75 + 0.25 * Math.sin(t * 1.3 + it.ph));
      }
    },
  };
}

// ---------- materials ----------
export function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.0, flatShading: true, ...opts });
}

export function shadowify(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return obj;
}

// ---------- low-poly character ----------
// role: 'patient' | 'doctor' | 'lawyer' | 'ca' | 'creator'
export function makePerson({
  role = 'patient', skin = '#E0A986', hair = '#2A1C17', top = '#F5B82E', pants = '#2B2F45',
  glasses = false, hairStyle = 'short', seed = 3,
} = {}) {
  const P = new THREE.Group();
  const r = rng(seed);
  const skinM = mat(skin, { roughness: 0.6 });
  const hairM = mat(hair, { roughness: 0.9 });
  const topM = mat(top, { roughness: 0.85 });
  const pantsM = mat(pants);
  const darkM = mat('#151515', { roughness: 0.4 });

  // legs
  const legGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.95, 7);
  const shoeGeo = new RoundedBoxGeometry(0.28, 0.14, 0.42, 2, 0.05);
  const shoeM = mat(role === 'doctor' ? '#ECECEC' : '#1E1E24');
  function leg(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.19, 0.97, 0);
    const m = new THREE.Mesh(legGeo, pantsM); m.position.y = -0.47;
    const shoe = new THREE.Mesh(shoeGeo, shoeM); shoe.position.set(0, -0.9, 0.06);
    pivot.add(m, shoe);
    P.add(pivot);
    return pivot;
  }
  const legL = leg(-1), legR = leg(1);

  // torso
  const torso = new THREE.Group();
  torso.position.y = 0.95;
  P.add(torso);
  const bodyGeo = new RoundedBoxGeometry(0.86, 1.0, 0.5, 3, 0.18);
  const body = new THREE.Mesh(bodyGeo, topM);
  body.position.y = 0.5;
  torso.add(body);

  if (role === 'doctor') {
    // white coat: slightly larger shell, open front showing shirt
    const coatM = mat('#F4F6F8', { roughness: 0.8 });
    const shirt = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.8, 0.06, 1, 0.02), mat('#4F8FE6'));
    shirt.position.set(0, 0.55, 0.255);
    const coat = new THREE.Mesh(new RoundedBoxGeometry(0.92, 1.12, 0.54, 3, 0.18), coatM);
    coat.position.y = 0.44;
    body.material = coatM;
    torso.add(coat, shirt);
    // lapels
    const lap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.04), mat('#DADDE2'));
    lap.position.set(-0.17, 0.7, 0.275); lap.rotation.z = -0.25;
    const lap2 = lap.clone(); lap2.position.x = 0.17; lap2.rotation.z = 0.25;
    torso.add(lap, lap2);
    // stethoscope
    const steth = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 6, 20, Math.PI), mat('#222831', { roughness: 0.3 }));
    steth.rotation.z = Math.PI; steth.position.set(0, 0.92, 0.27);
    const bell = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), mat('#B8C2CC', { metalness: 0.8, roughness: 0.3 }));
    bell.rotation.x = Math.PI / 2; bell.position.set(0.22, 0.62, 0.29);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 5), mat('#222831'));
    tube.position.set(0.22, 0.78, 0.28);
    torso.add(steth, bell, tube);
    // pocket + pen
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.02), mat('#E6E9EE'));
    pocket.position.set(-0.27, 0.62, 0.28);
    const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 5), mat(BRAND.accent));
    pen.position.set(-0.3, 0.7, 0.29);
    torso.add(pocket, pen);
  } else if (role === 'lawyer') {
    body.material = mat('#16171C');
    const shirt = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.6, 0.05, 1, 0.02), mat('#FFFFFF'));
    shirt.position.set(0, 0.7, 0.25);
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.03), mat('#FFFFFF'));
    band.position.set(-0.04, 0.82, 0.28);
    const band2 = band.clone(); band2.position.x = 0.04;
    torso.add(shirt, band, band2);
  } else if (role === 'ca') {
    body.material = mat('#2E4A7D');
    const shirt = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.6, 0.05, 1, 0.02), mat('#FFFFFF'));
    shirt.position.set(0, 0.7, 0.25);
    const tie = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 4), mat('#C0392B'));
    tie.rotation.x = Math.PI; tie.position.set(0, 0.68, 0.29);
    torso.add(shirt, tie);
  } else if (role === 'creator') {
    // hoodie strings
    const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), mat('#FFFFFF'));
    s1.position.set(-0.08, 0.8, 0.26);
    const s2 = s1.clone(); s2.position.x = 0.08;
    torso.add(s1, s2);
  } else {
    // patient: hoodie pocket line
    const pk = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.03), mat(new THREE.Color(top).multiplyScalar(0.8)));
    pk.position.set(0, 0.25, 0.26);
    torso.add(pk);
  }

  // arms (pivot at shoulder)
  const armM = body.material;
  function arm(side) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.5, 0.88, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.6, 3, 7), armM);
    upper.position.y = -0.38;
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), skinM);
    hand.position.y = -0.8;
    pivot.add(upper, hand);
    pivot.rotation.z = side * 0.12;
    torso.add(pivot);
    return pivot;
  }
  const armL = arm(-1);
  const armR = arm(1);

  // neck + head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.18, 7), skinM);
  neck.position.y = 1.05;
  torso.add(neck);
  const head = new THREE.Group();
  head.position.y = 1.1;
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), skinM);
  skull.scale.set(1, 1.08, 0.95);
  skull.position.y = 0.38;
  head.add(skull);
  // ears
  const ear = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), skinM);
  ear.position.set(-0.41, 0.36, 0);
  const ear2 = ear.clone(); ear2.position.x = 0.41;
  head.add(ear, ear2);
  // eyes
  const eyeGeo = new THREE.SphereGeometry(0.045, 10, 8);
  const eyeL = new THREE.Mesh(eyeGeo, darkM); eyeL.position.set(-0.14, 0.42, 0.37); eyeL.scale.set(1, 1.3, 0.6);
  const eyeR = eyeL.clone(); eyeR.position.x = 0.14;
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), new THREE.MeshBasicMaterial({ color: '#fff' }));
  hl.position.set(-0.125, 0.44, 0.4);
  const hl2 = hl.clone(); hl2.position.x = 0.155;
  head.add(eyeL, eyeR, hl, hl2);
  // brows
  const browGeo = new RoundedBoxGeometry(0.14, 0.035, 0.03, 1, 0.012);
  const browL = new THREE.Mesh(browGeo, hairM); browL.position.set(-0.14, 0.53, 0.37);
  const browR = browL.clone(); browR.position.x = 0.14;
  head.add(browL, browR);
  // nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 4), mat(new THREE.Color(skin).multiplyScalar(0.92)));
  nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.34, 0.42);
  head.add(nose);
  // mouth (smile arc)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.017, 5, 12, Math.PI), mat('#5A2A27'));
  mouth.rotation.z = Math.PI; mouth.position.set(0, 0.24, 0.385);
  head.add(mouth);
  // cheeks
  const cheekM = new THREE.MeshBasicMaterial({ color: '#FF8A80', transparent: true, opacity: 0.25 });
  const ch = new THREE.Mesh(new THREE.CircleGeometry(0.05, 10), cheekM);
  ch.position.set(-0.24, 0.3, 0.36); ch.rotation.y = -0.4;
  const ch2 = ch.clone(); ch2.position.x = 0.24; ch2.rotation.y = 0.4;
  head.add(ch, ch2);

  // hair: cap + chunky tufts
  const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), hairM);
  cap.scale.set(1.0, 0.72, 1.0);
  cap.position.set(0, 0.6, -0.04);
  head.add(cap);
  if (hairStyle === 'long') {
    const back = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.85, 0.3, 2, 0.12), hairM);
    back.position.set(0, 0.2, -0.22);
    head.add(back);
    const side = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.6, 0.3, 2, 0.06), hairM);
    side.position.set(-0.42, 0.25, 0.0);
    const side2 = side.clone(); side2.position.x = 0.42;
    head.add(side, side2);
  }
  const tufts = hairStyle === 'bald' ? 0 : 7;
  for (let i = 0; i < tufts; i++) {
    const tf = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13 + r() * 0.05, 0), hairM);
    const a = (i / (tufts - 1)) * Math.PI - Math.PI / 2;
    tf.position.set(Math.sin(a) * 0.32, 0.72 + r() * 0.06, Math.cos(a) * 0.12 + 0.12);
    tf.rotation.set(r() * 3, r() * 3, r() * 3);
    head.add(tf);
  }
  if (glasses) {
    const gm = mat('#1B1B1F', { roughness: 0.3 });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 6, 16), gm);
    rim.position.set(-0.15, 0.42, 0.4);
    const rim2 = rim.clone(); rim2.position.x = 0.15;
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.015, 0.015), gm);
    bridge.position.set(0, 0.43, 0.41);
    head.add(rim, rim2, bridge);
  }

  shadowify(P);
  const api = {
    root: P, torso, head, armL, armR, legL, legR, mouth, browL, browR, eyeL, eyeR,
    // simple procedural idle + optional walk
    pose(t, { walk = 0, breathe = 1, look = 0, lookUp = 0, wave = 0, phone = 0, cheer = 0, smile = 1 } = {}) {
      const b = Math.sin(t * 2.2) * 0.02 * breathe;
      torso.position.y = 0.95 + b + (walk ? Math.abs(Math.sin(t * 7)) * 0.05 * walk : 0);
      head.rotation.y = look;
      head.rotation.x = -lookUp + Math.sin(t * 1.3) * 0.02;
      const sw = Math.sin(t * 7) * 0.6 * walk;
      legL.rotation.x = sw; legR.rotation.x = -sw;
      armL.rotation.x = -sw * 0.8; armR.rotation.x = sw * 0.8;
      armL.rotation.z = -0.12; armR.rotation.z = 0.12;
      if (phone > 0) {
        // right arm raised holding phone in front of face
        armR.rotation.x = lerp(armR.rotation.x, -1.3, phone);
        armR.rotation.z = lerp(0.12, -0.35, phone);
      }
      if (wave > 0) {
        armL.rotation.z = lerp(-0.12, -2.6, wave);
        armL.rotation.x = 0;
        armL.rotation.y = Math.sin(t * 10) * 0.35 * wave;
      } else armL.rotation.y = 0;
      if (cheer > 0) {
        armL.rotation.z = lerp(-0.12, -2.7, cheer); armR.rotation.z = lerp(0.12, 2.7, cheer);
        armL.rotation.x = 0; armR.rotation.x = 0;
      }
      mouth.scale.set(1, lerp(0.25, 1, smile), 1);
      mouth.rotation.z = smile >= 0 ? Math.PI : 0;
    },
  };
  return api;
}

// ---------- phone with live canvas screen ----------
export function makePhone({ w = 1.5, h = 3.1, d = 0.14, color = '#14151A', screenW = 540, screenH = 1120 } = {}) {
  const g = new THREE.Group();
  const bodyM = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.6 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, 0.16), bodyM);
  g.add(body);
  const canvas = document.createElement('canvas');
  canvas.width = screenW; canvas.height = screenH;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const screen = new THREE.Mesh(
    roundedRectGeometry(w * 0.92, h * 0.955, 0.12),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }),
  );
  screen.position.z = d / 2 + 0.002;
  g.add(screen);
  body.castShadow = true;
  return { group: g, canvas, ctx, tex, screen, w, h };
}

export function roundedRectGeometry(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(s, 12);
  // UVs 0..1
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - x) / w;
    uv[i * 2 + 1] = (pos.getY(i) - y) / h;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

// ---------- 2D drawing helpers (for phone screens / cards) ----------
export const FONT = 'Poppins, Inter, sans-serif';
export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
export function heartPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  ctx.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
  ctx.closePath();
}
export function verified(ctx, x, y, r, color = '#3897F0') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rad = i % 2 ? r * 0.86 : r;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - r * 0.4, y); ctx.lineTo(x - r * 0.1, y + r * 0.32); ctx.lineTo(x + r * 0.42, y - r * 0.3); ctx.stroke();
  ctx.restore();
}
// simple flat doctor avatar drawn in 2D (generic, not any real person)
export function drawDoctorAvatar(ctx, cx, cy, R, { skin = '#E0A986', hair = '#2A1C17', bg = '#2ED3B7' } = {}) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  const grd = ctx.createLinearGradient(cx, cy - R, cx, cy + R);
  grd.addColorStop(0, bg); grd.addColorStop(1, '#0E3B5C');
  ctx.fillStyle = grd; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  // coat
  ctx.fillStyle = '#F4F6F8';
  ctx.beginPath(); ctx.ellipse(cx, cy + R * 1.05, R * 0.85, R * 0.65, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4F8FE6';
  ctx.beginPath(); ctx.moveTo(cx - R * 0.18, cy + R * 0.45); ctx.lineTo(cx + R * 0.18, cy + R * 0.45); ctx.lineTo(cx, cy + R * 0.95); ctx.fill();
  // stethoscope
  ctx.strokeStyle = '#222831'; ctx.lineWidth = R * 0.05;
  ctx.beginPath(); ctx.arc(cx, cy + R * 0.5, R * 0.3, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke();
  // neck/head
  ctx.fillStyle = skin;
  ctx.fillRect(cx - R * 0.12, cy + R * 0.15, R * 0.24, R * 0.3);
  ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.08, R * 0.36, R * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = hair;
  ctx.beginPath(); ctx.ellipse(cx, cy - R * 0.36, R * 0.38, R * 0.22, 0, Math.PI, Math.PI * 2); ctx.fill();
  ctx.fillRect(cx - R * 0.38, cy - R * 0.38, R * 0.76, R * 0.1);
  // face
  ctx.fillStyle = '#1B1B1F';
  ctx.beginPath(); ctx.arc(cx - R * 0.13, cy - R * 0.08, R * 0.035, 0, Math.PI * 2); ctx.arc(cx + R * 0.13, cy - R * 0.08, R * 0.035, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5A2A27'; ctx.lineWidth = R * 0.03; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy + R * 0.04, R * 0.1, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.restore();
}

export function fmtCount(n) {
  if (n >= 100000) return (n / 1000).toFixed(0) + 'K';
  if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
  return Math.round(n).toLocaleString('en-US');
}

// ---------- HTML text overlay ----------
// Text is placed only in the top ~85% of the frame.
export function overlay() {
  return document.getElementById('ov');
}
export function textOn() {
  return new URLSearchParams(location.search).get('text') !== '0';
}
// animate an element in (rise + fade) and optionally out
export function animIn(el, t, start, { dur = 0.5, out = null, outDur = 0.4, dy = 40 } = {}) {
  let p = easeOut(prog(t, start, dur));
  if (out != null) p *= 1 - easeIn(prog(t, out, outDur));
  el.style.opacity = p.toFixed(3);
  el.style.transform = `translateY(${((1 - p) * dy).toFixed(1)}px)`;
}

// Plane with a 2D canvas texture (cards, signs, UI panels)
export function canvasPlane(w, h, pxW, pxH, { radius = 0, transparent = true, basic = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = pxW; canvas.height = pxH;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const geo = radius ? roundedRectGeometry(w, h, radius) : new THREE.PlaneGeometry(w, h);
  const material = basic
    ? new THREE.MeshBasicMaterial({ map: tex, transparent, toneMapped: false, side: THREE.DoubleSide, depthWrite: !transparent })
    : new THREE.MeshStandardMaterial({ map: tex, transparent, roughness: 0.6 });
  const mesh = new THREE.Mesh(geo, material);
  return { mesh, canvas, ctx, tex, pxW, pxH };
}

// Low-poly city skyline with lit windows (background)
export function skyline(scene, { seed = 11, z = -18, count = 14, spread = 26, color = '#141a3a', win = '#FFD27A' } = {}) {
  const r = rng(seed);
  const g = new THREE.Group();
  const bm = new THREE.MeshBasicMaterial({ color, fog: true });
  const wm = new THREE.MeshBasicMaterial({ color: win, fog: false, toneMapped: false });
  for (let i = 0; i < count; i++) {
    const w = 1.5 + r() * 2.2, h = 3 + r() * 9;
    const x = -spread / 2 + (i / (count - 1)) * spread + (r() - 0.5);
    const zz = z - r() * 6;
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.5), bm);
    b.position.set(x, h / 2, zz);
    g.add(b);
    const cols = Math.max(1, Math.floor(w / 0.55)), rows = Math.floor(h / 0.8);
    for (let cx = 0; cx < cols; cx++) for (let ry = 0; ry < rows; ry++) {
      if (r() > 0.28) continue;
      const wnd = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), wm);
      wnd.position.set(x - w / 2 + 0.35 + cx * ((w - 0.5) / Math.max(1, cols - 1 || 1)), 0.8 + ry * 0.8, zz + 0.76);
      g.add(wnd);
    }
  }
  scene.add(g);
  return g;
}

// floating heart sprite (2D canvas)
let _heart;
export function heartTexture() {
  if (_heart) return _heart;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#FF4D6D'; heartPath(g, 64, 14, 100); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(42, 44, 10, 14, -0.6, 0, Math.PI * 2); g.fill();
  _heart = new THREE.CanvasTexture(c); _heart.colorSpace = THREE.SRGBColorSpace;
  return _heart;
}
// burst of hearts rising from an origin, deterministic in t
export function heartStream(parent, { origin = new THREE.Vector3(), count = 14, start = 0, every = 0.18, rise = 2.2, life = 1.6, spread = 0.8, size = 0.35, seed = 5 } = {}) {
  const r = rng(seed);
  const items = [];
  for (let i = 0; i < count; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTexture(), transparent: true, depthWrite: false, fog: false }));
    sp.visible = false;
    parent.add(sp);
    items.push({ sp, t0: start + i * every + r() * 0.08, dx: (r() - 0.5) * spread, wob: r() * 6, s: size * (0.7 + r() * 0.6) });
  }
  return {
    update(t) {
      for (const it of items) {
        const p = (t - it.t0) / life;
        if (p < 0 || p > 1) { it.sp.visible = false; continue; }
        it.sp.visible = true;
        it.sp.position.set(origin.x + it.dx * p + Math.sin(p * 6 + it.wob) * 0.12, origin.y + rise * easeOut(p), origin.z);
        const sc = it.s * (p < 0.15 ? easeBack(p / 0.15) : 1);
        it.sp.scale.set(sc, sc, 1);
        it.sp.material.opacity = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
      }
    },
  };
}

// Instagram-style reel UI (generic, unbranded) drawn on a 2D canvas
export function drawReelUI(ctx, W2, H2, t, { name = 'Dr. Your Name', likes = 0, views = '1.2M', bg = ['#1B6E8F', '#0B1F3A'], caption = '3 signs you need to see a doctor', hearts = true } = {}) {
  const grd = ctx.createLinearGradient(0, 0, W2 * 0.4, H2);
  grd.addColorStop(0, bg[0]); grd.addColorStop(1, bg[1]);
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W2, H2);
  // big doctor in frame
  drawDoctorAvatar(ctx, W2 * 0.5, H2 * 0.42, W2 * 0.36, { bg: bg[0] });
  // speech bubble / title sticker
  ctx.fillStyle = '#fff';
  rr(ctx, W2 * 0.08, H2 * 0.08, W2 * 0.84, H2 * 0.09, 18); ctx.fill();
  ctx.fillStyle = '#111'; ctx.font = `700 ${Math.round(W2 * 0.052)}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(caption, W2 * 0.5, H2 * 0.125);
  // bottom gradient
  const g2 = ctx.createLinearGradient(0, H2 * 0.62, 0, H2);
  g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,0.75)');
  ctx.fillStyle = g2; ctx.fillRect(0, H2 * 0.62, W2, H2 * 0.38);
  // name row
  drawDoctorAvatar(ctx, W2 * 0.13, H2 * 0.86, W2 * 0.055, { bg: '#2ED3B7' });
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(W2 * 0.048)}px ${FONT}`;
  ctx.fillText(name, W2 * 0.21, H2 * 0.86);
  const nw = ctx.measureText(name).width;
  verified(ctx, W2 * 0.21 + nw + W2 * 0.04, H2 * 0.86, W2 * 0.028);
  ctx.font = `500 ${Math.round(W2 * 0.036)}px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(`▶ ${views} views`, W2 * 0.08, H2 * 0.925);
  // right action column
  const ax = W2 * 0.88;
  ctx.fillStyle = hearts ? '#FF4D6D' : '#fff';
  heartPath(ctx, ax, H2 * 0.56, W2 * 0.08); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `600 ${Math.round(W2 * 0.034)}px ${FONT}`;
  ctx.fillText(fmtCount(likes), ax, H2 * 0.63);
  // comment bubble
  ctx.strokeStyle = '#fff'; ctx.lineWidth = W2 * 0.008;
  ctx.beginPath(); ctx.ellipse(ax, H2 * 0.69, W2 * 0.036, W2 * 0.032, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillText(fmtCount(Math.floor(likes / 23)), ax, H2 * 0.735);
  // share arrow
  ctx.beginPath(); ctx.moveTo(ax - W2 * 0.035, H2 * 0.79); ctx.lineTo(ax + W2 * 0.04, H2 * 0.77); ctx.lineTo(ax, H2 * 0.81); ctx.closePath(); ctx.stroke();
  // progress bar
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(0, H2 - 6, W2, 6);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, H2 - 6, W2 * ((t * 0.18) % 1), 6);
}
