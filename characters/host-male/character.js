// Male host character - soft low-poly chibi style (see docs/reel-analysis.md, Reel A).
// Units: head radius = 1. Feet at y = 0. Character faces +Z.
// Returns a THREE.Group with named parts so reels can animate them:
//   head, eyeL, eyeR, mouth, glasses, hair, armL, armR, torso
import * as THREE from 'three';

export const PALETTE = {
  skin: 0xf9c3a8, // peach-pink
  blush: 0xffc2b4, // soft cheek / lower-face warmth (multiplied over skin - light pink, never muddy)
  skinShade: 0xe98c72, // nose
  hair: 0x5b3824,
  glasses: 0x17141c,
  eye: 0x050406,
  mouth: 0x3b1f1f,
  tee: 0x1b1a22,
  jacket: 0x3d82f2, // bright blue
  pants: 0x24283a,
  shoes: 0xece8e4,
  soles: 0x9a948f,
};

// Deterministic pseudo-random so the faceting is identical in every render.
export function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Soft, slightly velvety skin (sheen) - bright and smooth like the references.
export function skinMat(color, vertexColors = false) {
  return new THREE.MeshPhysicalMaterial({
    color, vertexColors, roughness: 0.55, metalness: 0, sheen: 0.6, sheenRoughness: 0.7,
    sheenColor: new THREE.Color(0xffd6c8), clearcoat: 0.05, clearcoatRoughness: 0.8,
  });
}
export const mat = (color, opts = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...opts });

// Head ellipsoid scale; used to put facial features exactly on the surface.
export const HS = new THREE.Vector3(1.0, 1.05, 0.95);
export function onHead(x, y, lift = 0) {
  // z on the ellipsoid for given x,y (head-local)
  const nx = x / HS.x, ny = y / HS.y;
  const z = HS.z * Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
  return new THREE.Vector3(x, y, z + lift);
}

function buildHair(M) {
  // Shell slightly larger than the head; vertices below the hairline are pulled
  // inside the skull. Strand ridges + seeded jitter give the chunky faceted look.
  const g = new THREE.SphereGeometry(1.0, 30, 22);
  const p = g.attributes.position;
  const r = rng(7);
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const front = v.z;
    // hairline: forehead high, temples mid (ears visible), nape low
    let line = front > 0 ? 0.1 + 0.42 * Math.pow(front, 1.4) : 0.1 + 0.78 * front;
    // side part: fringe dips a little on the character's right
    line -= 0.1 * Math.max(0, -v.x) * Math.max(0, front);
    const inHair = v.y > line;
    const ang = Math.atan2(v.x, v.z);
    const ridge = 0.035 * Math.abs(Math.sin(ang * 7 + v.y * 2.5));
    const rad = inHair ? 1.07 + 0.06 * Math.max(0, v.y) + ridge + 0.02 * (r() - 0.5) : 0.985;
    v.multiplyScalar(rad);
    if (inHair) v.y *= 1.05;
    p.setXYZ(i, v.x * HS.x, v.y * HS.y, v.z * HS.z);
  }
  g.computeVertexNormals();
  const hair = new THREE.Group();
  hair.add(new THREE.Mesh(g, M.hair));

  // Chunky fringe strands swept to the character's left (from a right side part)
  const pieces = [
    // x, y, z, sx, sy, sz, rotX, rotY, rotZ
    [-0.5, 0.66, 0.66, 0.36, 0.17, 0.26, -0.55, 0.3, 0.3],
    [-0.1, 0.74, 0.7, 0.42, 0.17, 0.26, -0.6, 0.1, -0.12],
    [0.32, 0.68, 0.68, 0.44, 0.17, 0.26, -0.6, -0.2, -0.3],
    [0.72, 0.46, 0.55, 0.3, 0.2, 0.24, -0.4, -0.5, -0.75],
    [-0.82, 0.36, 0.42, 0.2, 0.28, 0.24, -0.2, 0.5, 0.6],
  ];
  for (const [x, y, z, sx, sy, sz, rx, ry, rz] of pieces) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M.hair);
    m.position.set(x * HS.x, y * HS.y, z * HS.z);
    m.scale.set(sx, sy, sz);
    m.rotation.set(rx, ry, rz);
    hair.add(m);
  }
  hair.name = 'hair';
  return hair;
}

function buildGlasses(M) {
  const glasses = new THREE.Group();
  glasses.name = 'glasses';
  const lensR = 0.4, tube = 0.022, ex = 0.45, ey = -0.12;
  for (const s of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(lensR, tube, 8, 40), M.glasses);
    const c = onHead(s * ex, ey, 0.07);
    ring.position.copy(c);
    ring.rotation.y = s * 0.35; // wrap around the face
    glasses.add(ring);
    // faint lens glass (the reference shows a soft reflection inside the rims)
    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(lensR, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.1 })
    );
    lens.position.copy(c);
    lens.rotation.y = s * 0.35;
    glasses.add(lens);
    // temple arm from outer rim back to the ear
    const outer = c.clone().add(new THREE.Vector3(s * lensR * Math.cos(0.35), 0.02, -lensR * Math.sin(0.35)));
    const ear = new THREE.Vector3(s * 1.0, -0.08, -0.05);
    const len = outer.distanceTo(ear);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, len, 6), M.glasses);
    arm.position.copy(outer).add(ear).multiplyScalar(0.5);
    arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), ear.clone().sub(outer).normalize());
    glasses.add(arm);
  }
  // bridge
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.18, 6), M.glasses);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.copy(onHead(0, ey + 0.02, 0.12));
  glasses.add(bridge);
  return glasses;
}

function buildHead(M) {
  const head = new THREE.Group();
  head.name = 'head';
  // Face skin: vertex-colour blush on cheeks/chin/nose area fakes the soft
  // subsurface warmth of the reference renders (pink cheeks, warm lower face).
  const skullGeo = new THREE.IcosahedronGeometry(1, 5);
  const sp = skullGeo.attributes.position, col = [];
  const blush = new THREE.Color(M.blush), base = new THREE.Color(1, 1, 1), c = new THREE.Color();
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i);
    // broad, subtle warmth (reference look): soft cheeks + warmer lower face, no hard spots
    const cheek = Math.max(0, 1 - Math.hypot(Math.abs(x) - 0.5, (y + 0.3) * 0.8, Math.max(0, 0.7 - z)) / 0.7);
    const lower = Math.max(0, Math.min(1, (-y + 0.1) * 0.9)) * Math.max(0, z + 0.3) * 0.35;
    const t = Math.min(0.6, cheek * cheek * 0.45 + lower);
    c.copy(base).lerp(blush, t);
    col.push(c.r, c.g, c.b);
  }
  skullGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const skull = new THREE.Mesh(skullGeo, M.face);
  skull.scale.copy(HS);
  skull.name = 'skull';
  head.add(skull);

  // Eyes: small vertical black ovals with a single white highlight
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.name = s < 0 ? 'eyeR' : 'eyeL';
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), M.eye);
    pupil.scale.set(0.85, 1.25, 0.45);
    eye.add(pupil);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), M.white);
    hl.position.set(0.022, 0.035, 0.03);
    eye.add(hl);
    eye.position.copy(onHead(s * 0.43, -0.1, 0.0));
    eye.lookAt(eye.position.clone().multiplyScalar(2));
    head.add(eye);
  }

  // Tiny triangular nose
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.13, 3), M.nose);
  nose.position.copy(onHead(0, -0.36, 0.03));
  nose.rotation.set(Math.PI / 2 + 0.25, 0, Math.PI);
  head.add(nose);

  // Flat line mouth (scale.y opens it for lip-sync)
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.035, 0.04), M.mouth);
  mouth.name = 'mouth';
  mouth.position.copy(onHead(0, -0.66, 0.0));
  mouth.lookAt(mouth.position.clone().multiplyScalar(2));
  head.add(mouth);

  // Ears (visible on the male version - short hair)
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), M.skin);
    ear.scale.set(0.45, 1, 0.7);
    ear.position.set(s * 0.98, -0.12, -0.05);
    head.add(ear);
  }

  head.add(buildGlasses(M));
  head.add(buildHair(M));
  return head;
}

// Lathe profile helper: [radius, y] pairs -> faceted shell, optional front opening.
export function lathe(profile, segs, phiStart = 0, phiLen = Math.PI * 2) {
  return new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segs, phiStart, phiLen);
}

function buildBody(M) {
  const body = new THREE.Group();

  // Legs + chunky sneakers (short chibi legs)
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.25, 0.85, 9), M.pants);
    leg.position.set(s * 0.3, 0.6, 0);
    body.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.22, 0.66), M.shoes);
    shoe.position.set(s * 0.31, 0.13, 0.08);
    body.add(shoe);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.68), M.soles);
    sole.position.set(s * 0.31, 0.03, 0.08);
    body.add(sole);
  }

  const torso = new THREE.Group();
  torso.name = 'torso';
  // Black tee underneath (visible through the open jacket)
  const teeProfile = [[0.001, 2.32], [0.36, 2.3], [0.66, 2.1], [0.72, 1.6], [0.68, 1.05], [0.001, 1.04]];
  const tee = new THREE.Mesh(lathe(teeProfile, 14), M.tee);
  tee.scale.z = 0.72;
  torso.add(tee);

  // Oversized puffy jacket, open at the front (gap = half-angle of the opening)
  const gap = 0.42;
  const jacketProfile = [[0.42, 2.36], [0.62, 2.3], [0.8, 2.12], [0.86, 1.8], [0.84, 1.4], [0.8, 1.02], [0.74, 0.96]];
  const jacket = new THREE.Mesh(lathe(jacketProfile, 16, gap, Math.PI * 2 - gap * 2), M.jacket);
  jacket.scale.z = 0.76;
  torso.add(jacket);
  // Thick front facing / lapel band along each edge of the opening
  const band = 0.3;
  const facingProfile = jacketProfile.map(([r, y]) => [r + 0.035, y]);
  for (const [a, b] of [[gap, band], [Math.PI * 2 - gap - band, band]]) {
    const f = new THREE.Mesh(lathe(facingProfile, 3, a, b), M.jacketDark);
    f.scale.z = 0.76;
    torso.add(f);
  }
  // Collar: thick ring around the neck, open at the front
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.13, 6, 14, Math.PI * 2 - 1.3), M.jacket);
  collar.rotation.set(Math.PI / 2, 0, Math.PI / 2 + 0.65);
  collar.scale.set(1, 0.8, 1);
  collar.position.set(0, 2.34, -0.02);
  torso.add(collar);
  body.add(torso);

  // Arms: puffy blue sleeves, hands at hip height
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.name = s < 0 ? 'armR' : 'armL';
    arm.position.set(s * 0.82, 2.05, 0);
    const sleeve = new THREE.Mesh(lathe([[0.001, 0.08], [0.24, 0.05], [0.31, -0.2], [0.3, -0.6], [0.27, -0.95], [0.001, -0.97]], 10), M.jacket);
    arm.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 10), M.jacketDark);
    cuff.position.y = -0.95;
    arm.add(cuff);
    const hand = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), M.skin);
    hand.scale.set(0.9, 1.1, 0.85);
    hand.position.y = -1.1;
    arm.add(hand);
    arm.rotation.z = s * 0.12;
    body.add(arm);
  }

  // Short neck (chin sits almost on the collar, like the reference)
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.3, 10), M.skin);
  neck.position.y = 2.38;
  body.add(neck);
  return body;
}

export function createHostMale(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const M = {
    // Smooth, soft skin (like the references); hair and clothes stay faceted.
    skin: skinMat(P.skin, false),
    face: skinMat(P.skin, true),
    blush: P.blush,
    nose: mat(P.skinShade),
    hair: mat(P.hair, { roughness: 0.7 }),
    glasses: mat(P.glasses, { roughness: 0.4, flatShading: false }),
    eye: mat(P.eye, { roughness: 0.25, flatShading: false, envMapIntensity: 0.15 }),
    white: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    mouth: mat(P.mouth),
    tee: mat(P.tee),
    jacket: mat(P.jacket, { side: THREE.DoubleSide }),
    jacketDark: mat(new THREE.Color(P.jacket).multiplyScalar(0.82).getHex()),
    pants: mat(P.pants),
    shoes: mat(P.shoes),
    soles: mat(P.soles),
  };
  const root = new THREE.Group();
  root.name = 'hostMale';
  root.add(buildBody(M));
  const head = buildHead(M);
  head.position.y = 3.3;
  root.add(head);
  root.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  root.getObjectByName('glasses').traverse((o) => { o.castShadow = false; });
  return root;
}

export const HEIGHT = 4.5; // approx top of hair
export const HEAD_Y = 3.3;
