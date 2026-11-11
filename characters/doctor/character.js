// Doctor - same soft chibi family as Kiran, but an appealing, clearly different face:
// thick rectangular glasses (like the hashhh.co reference), neat trimmed beard,
// fuller swept hair with grey temples, defined brows, slightly longer face.
// Long white coat, light-blue shirt, navy tie, stethoscope, name badge.
import * as THREE from 'three';
import { createHostMale, HS, onHead, mat, lathe, rng } from '../host-male/character.js';

export const PALETTE = {
  skin: 0xedb08f,
  blush: 0xf0a896,
  hairDark: 0x2f2520,
  hairGrey: 0xb3aca5,
  beard: 0x34291f,
  frames: 0x3a2418,
  coat: 0xfbfcfd,
  shirt: 0xa9cff2,
  tie: 0x1f3d6c,
  pants: 0x3c4352,
  shoes: 0x3b2a20,
  steth: 0x2b2f36,
  metal: 0xd6dade,
};

// Shell around the head; vertices inside `keep()` stay on the surface (+thickness),
// the rest are tucked inside the skull. Vertex colours give grey/speckle variation.
function shell(keep, thickness, colorAt, segs = [36, 28]) {
  const g = new THREE.SphereGeometry(1, segs[0], segs[1]);
  const p = g.attributes.position, col = [], v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = keep(v);
    const rad = k ? 1 + thickness(v) : 0.985;
    const c = colorAt(v);
    p.setXYZ(i, v.x * rad * HS.x, v.y * rad * HS.y, v.z * rad * HS.z);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, flatShading: true }));
}

function buildHair(P) {
  const r = rng(31);
  const dark = new THREE.Color(P.hairDark), grey = new THREE.Color(P.hairGrey);
  const hair = new THREE.Group(); hair.name = 'hair';
  // Voluminous wavy hair (like the hashhh.co reference): domed top, wavy hairline,
  // chunky facets from position-hashed jitter, grey only at the temples.
  const hsh = (v) => { const q = Math.sin(v.x * 71.3 + v.y * 23.9 + v.z * 47.1) * 43758.5; return q - Math.floor(q); };
  hair.add(shell(
    (v) => v.y > (v.z > 0 ? 0.36 + 0.24 * Math.pow(v.z, 1.3) + 0.05 * Math.sin(v.x * 9) : 0.18 + 0.7 * v.z),
    (v) => 0.05 + 0.2 * Math.pow(Math.max(0, v.y), 1.5) * Math.max(0.3, v.z + 0.7) + 0.035 * Math.abs(Math.sin(Math.atan2(v.x, v.z) * 5 + v.y * 4)) + 0.03 * hsh(v),
    (v) => {
      const tmp = Math.max(0, Math.min(1, (Math.abs(v.x) - 0.65) / 0.25)) * Math.max(0, Math.min(1, (0.55 - v.y) / 0.4));
      return dark.clone().lerp(grey, tmp * 0.85 + 0.05 * r());
    },
    [30, 22],
  ));
  // chunky swept strands on top, combed from a left part towards the right/back
  const strands = [ // big soft waves lifting off the forehead (pompadour-ish)
    [-0.35, 0.92, 0.55, 0.42, 0.22, 0.34, -0.7, 0.4, 0.25],
    [0.05, 1.02, 0.6, 0.5, 0.24, 0.36, -0.75, 0.1, -0.1],
    [0.42, 0.94, 0.55, 0.42, 0.22, 0.34, -0.7, -0.3, -0.35],
    [0.0, 1.12, 0.15, 0.55, 0.22, 0.45, -0.25, 0.2, -0.15],
  ];
  const hm = mat(P.hairDark, { roughness: 0.7 });
  for (const [x, y, z, sx, sy, sz, rx, ry, rz] of strands) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), hm);
    m.position.set(x * HS.x, y * HS.y, z * HS.z); m.scale.set(sx, sy, sz); m.rotation.set(rx, ry, rz);
    hair.add(m);
  }
  return hair;
}

function buildBeard(P) {
  const r = rng(41);
  const base = new THREE.Color(P.beard), grey = new THREE.Color(P.hairGrey);
  const beard = shell(
    (v) => {
      const ax = Math.abs(v.x);
      // neat short beard: under the mouth line in front, along the jaw, thin sideburns
      const t = Math.min(1, Math.max(0, (ax - 0.62) / 0.3));
      const line = -0.5 + 0.08 * Math.min(1, ax / 0.62) + 0.42 * t * t * (3 - 2 * t);
      const mustache = ax < 0.3 && v.y < -0.43 && v.y > -0.56; // thin mustache above the mouth
      return (v.y < line || mustache) && v.z > -0.2;
    },
    (v) => 0.025 + 0.015 * Math.max(0, -v.y),
    () => base.clone().lerp(grey, r() * 0.25),
    [40, 30],
  );
  beard.name = 'beard';
  return beard;
}

function buildGlasses(P) {
  const g = new THREE.Group(); g.name = 'glasses';
  const fm = new THREE.MeshStandardMaterial({ color: P.frames, roughness: 0.35 });
  const w = 0.6, h = 0.4, t = 0.075;
  for (const s of [-1, 1]) {
    const lens = new THREE.Group();
    lens.position.copy(onHead(s * 0.42, -0.08, 0.1));
    lens.rotation.y = s * 0.28;
    for (const [bw, bh, x, y] of [[w, t, 0, h / 2], [w, t * 0.8, 0, -h / 2], [t, h, -w / 2, 0], [t, h, w / 2, 0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), fm); b.position.set(x, y, 0); lens.add(b);
    }
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05 }));
    lens.add(glass);
    g.add(lens);
    // temple arm to the ear
    const outer = lens.position.clone().add(new THREE.Vector3(s * (w / 2) * Math.cos(0.28), h / 2 - 0.04, -(w / 2) * Math.sin(0.28)));
    const ear = new THREE.Vector3(s * 0.98, -0.05, -0.1);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, outer.distanceTo(ear)), fm);
    arm.position.copy(outer).add(ear).multiplyScalar(0.5); arm.lookAt(ear);
    g.add(arm);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), fm);
  bridge.position.copy(onHead(0, 0.02, 0.17)); g.add(bridge);
  g.traverse((o) => { o.castShadow = false; });
  return g;
}

export function createDoctor(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const root = createHostMale({
    skin: P.skin, blush: P.blush, jacket: P.coat, tee: P.shirt, pants: P.pants, shoes: P.shoes, soles: 0x1d1916,
  });
  root.name = 'doctor';
  const head = root.getObjectByName('head');
  head.scale.set(1.0, 1.06, 1.0); // a slightly longer face than Kiran

  head.remove(head.getObjectByName('glasses'));
  head.remove(head.getObjectByName('hair'));
  head.add(buildHair(P), buildGlasses(P)); // clean-shaven (beard read as a mask on the chibi face)

  // defined brows
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.085, 0.07), mat(P.hairDark));
    brow.name = s < 0 ? 'browR' : 'browL';
    brow.position.copy(onHead(s * 0.42, 0.24, 0.02));
    brow.lookAt(brow.position.clone().multiplyScalar(2));
    brow.rotateZ(s * -0.1);
    head.add(brow);
  }
  // mouth sits on top of the beard
  const mouth = head.getObjectByName('mouth');
  mouth.position.copy(onHead(0, -0.64, 0.0));
  mouth.material = mat(0x6b3b33);
  mouth.scale.set(1.1, 1, 1);

  const torso = root.getObjectByName('torso');
  const gap = 0.42;
  const skirt = new THREE.Mesh(lathe([[0.74, 1.0], [0.82, 0.8], [0.86, 0.5]], 16, gap, Math.PI * 2 - gap * 2), mat(P.coat, { side: THREE.DoubleSide }));
  skirt.scale.z = 0.76; torso.add(skirt);
  for (const s of [-1, 1]) {
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.04), mat(0xe9edf0));
    pocket.position.set(s * 0.5, 1.12, 0.58); pocket.rotation.y = s * 0.45; torso.add(pocket);
  }
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.03), mat(0x16a37b));
  badge.position.set(0.48, 1.95, 0.53); badge.rotation.y = 0.5; torso.add(badge);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), mat(0x1f3d6c));
  pen.position.set(-0.47, 2.0, 0.52); torso.add(pen);
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.62, 0.04), mat(P.tie));
  tie.position.set(0, 1.95, 0.53); tie.rotation.x = -0.12; torso.add(tie);
  const knot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.06), mat(P.tie));
  knot.position.set(0, 2.27, 0.48); torso.add(knot);

  const tubeMat = new THREE.MeshStandardMaterial({ color: P.steth, roughness: 0.45 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 1.55, 0.63), new THREE.Vector3(-0.34, 1.95, 0.6), new THREE.Vector3(-0.32, 2.3, 0.35),
    new THREE.Vector3(0, 2.45, -0.35), new THREE.Vector3(0.32, 2.3, 0.35), new THREE.Vector3(0.36, 1.95, 0.6),
    new THREE.Vector3(0.3, 1.72, 0.64),
  ]);
  torso.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.03, 8), tubeMat));
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), new THREE.MeshStandardMaterial({ color: P.metal, roughness: 0.25, metalness: 0.8 }));
  chest.position.set(-0.3, 1.5, 0.66); chest.rotation.x = Math.PI / 2; torso.add(chest);

  root.traverse((o) => { if (o.isMesh && o.parent?.name !== 'glasses') { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}
