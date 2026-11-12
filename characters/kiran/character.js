// Kiran v2 - stylised (same smooth chibi family) from the owner's reference photos:
// voluminous dark curly hair (shorter sides), full neat beard + mustache, grey rectangular
// glasses, warm brown skin, black collared button-up shirt (sleeves rolled), smartwatch.
// Named parts (for animation): head, eyeL, eyeR, mouth, hair, beard, glasses, armL, armR, torso
import * as THREE from 'three';
import { createHostMale, HS, onHead, mat, rng } from '../host-male/character.js';

export const PALETTE = {
  skin: 0xc8916f,
  blush: 0xf2bfa8,
  hair: 0x2a1e17,
  beard: 0x211915,
  frames: 0x3b3f45,
  shirt: 0x1b1b20,
  pants: 0x2b2f3a,
  shoes: 0x1f1f24,
  watch: 0x111114,
};

// Shell around the head: vertices where keep(v) stay out at 1+thickness(v), the rest tuck
// inside the skull. Vertex colours allow subtle variation.
function shell(keep, thickness, color, segs = [40, 30], jitter = 0) {
  const g = new THREE.SphereGeometry(1, segs[0], segs[1]);
  const p = g.attributes.position, col = [], v = new THREE.Vector3();
  const base = new THREE.Color(color);
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const k = keep(v);
    const q = Math.sin(v.x * 71.3 + v.y * 23.9 + v.z * 47.1) * 43758.5; const h = q - Math.floor(q);
    const rad = k ? 1 + thickness(v) + jitter * h : 0.985;
    p.setXYZ(i, v.x * rad * HS.x, v.y * rad * HS.y, v.z * rad * HS.z);
    const c = base.clone().multiplyScalar(0.9 + 0.2 * h);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, flatShading: true }));
}

function buildCurlyHair(P) {
  const hair = new THREE.Group(); hair.name = 'hair';
  // base cap: hairline mid-forehead, faded (thin) sides, fuller top
  hair.add(shell(
    (v) => v.y > (v.z > 0 ? 0.42 + 0.2 * Math.pow(v.z, 1.5) : 0.1 + 0.6 * v.z),
    (v) => 0.03 + 0.14 * Math.pow(Math.max(0, v.y), 1.2),
    P.hair, [34, 26], 0.03,
  ));
  // curls: chunky low-poly clumps piled on top and spilling forward over the forehead
  const r = rng(77);
  const curlMat = mat(P.hair, { roughness: 0.75 });
  const curls = [];
  for (let i = 0; i < 44; i++) {
    const a = r() * Math.PI * 2, el = 0.35 + r() * 0.55; // elevation band on the top
    const front = Math.cos(a) > 0 ? 1 : 0.7;
    curls.push([Math.sin(a) * Math.cos(el) * 0.95, Math.sin(el) * 1.03 + 0.05, Math.cos(a) * Math.cos(el) * 0.95 * front, 0.13 + r() * 0.08]);
  }
  // forehead fringe clumps (the loose front curls in the photos)
  for (const [x, y, z, s] of [[-0.38, 0.74, 0.62, 0.15], [-0.12, 0.8, 0.64, 0.16], [0.14, 0.8, 0.63, 0.16], [0.4, 0.74, 0.6, 0.15], [0.62, 0.62, 0.5, 0.13], [-0.62, 0.62, 0.5, 0.13]]) curls.push([x, y, z, s]);
  for (const [x, y, z, s] of curls) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), curlMat);
    m.position.set(x * HS.x, y * HS.y, z * HS.z);
    m.scale.set(1, 0.85, 1);
    m.rotation.set(r() * 3, r() * 3, r() * 3);
    hair.add(m);
  }
  return hair;
}

function buildBeard(P) {
  // Full neat beard: jaw + chin + sideburns + mustache, leaving the cheeks and the mouth clear.
  const beard = shell(
    (v) => {
      if (v.z < -0.25) return false;
      const ax = Math.abs(v.x);
      const mouthGap = ax < 0.2 && v.y < -0.56 && v.y > -0.74; // keep the mouth visible
      if (mouthGap) return false;
      const mustache = ax < 0.34 && v.y < -0.46 && v.y > -0.6;
      // cheek line: low near the mouth, rising along the jaw into the sideburns
      // cheek line: low near the mouth, rising gently along the jaw; slim sideburn strip by the ear
      const t = Math.min(1, Math.max(0, (ax - 0.32) / 0.58));
      const cheek = -0.56 + 0.3 * t * t * (3 - 2 * t);
      const sideburn = ax > 0.93 && v.y < 0.05 && v.y > -0.6 && v.z > -0.12 && v.z < 0.28;
      return mustache || sideburn || v.y < cheek;
    },
    (v) => 0.03 + 0.04 * Math.max(0, -v.y - 0.55),
    P.beard, [60, 46], 0.01,
  );
  beard.name = 'beard';
  return beard;
}

function buildGlasses(P) {
  const g = new THREE.Group(); g.name = 'glasses';
  const fm = new THREE.MeshStandardMaterial({ color: P.frames, roughness: 0.3, transparent: true, opacity: 0.92 });
  const w = 0.64, h = 0.42, t = 0.065;
  for (const s of [-1, 1]) {
    const lens = new THREE.Group();
    lens.position.copy(onHead(s * 0.42, -0.08, 0.1));
    lens.rotation.y = s * 0.28;
    for (const [bw, bh, x, y] of [[w, t, 0, h / 2], [w, t * 0.8, 0, -h / 2], [t, h, -w / 2, 0], [t, h, w / 2, 0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), fm); b.position.set(x, y, 0); lens.add(b);
    }
    lens.add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xdfe8ff, transparent: true, opacity: 0.1, roughness: 0.05 })));
    g.add(lens);
    const outer = lens.position.clone().add(new THREE.Vector3(s * (w / 2) * Math.cos(0.28), h / 2 - 0.04, -(w / 2) * Math.sin(0.28)));
    const ear = new THREE.Vector3(s * 0.98, -0.05, -0.1);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, outer.distanceTo(ear)), fm);
    arm.position.copy(outer).add(ear).multiplyScalar(0.5); arm.lookAt(ear); g.add(arm);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.05), fm);
  bridge.position.copy(onHead(0, 0.02, 0.17)); g.add(bridge);
  return g;
}

export function createKiran(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const root = createHostMale({ skin: P.skin, blush: P.blush, jacket: P.shirt, tee: P.shirt, pants: P.pants, shoes: P.shoes, soles: 0x3a3a40 });
  root.name = 'kiran';
  const head = root.getObjectByName('head');
  head.remove(head.getObjectByName('glasses'));
  head.remove(head.getObjectByName('hair'));
  head.add(buildCurlyHair(P), buildBeard(P), buildGlasses(P));
  // thick dark brows
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.07), mat(P.hair));
    brow.position.copy(onHead(s * 0.42, 0.22, 0.02));
    brow.lookAt(brow.position.clone().multiplyScalar(2));
    brow.rotateZ(s * -0.06);
    head.add(brow);
  }
  // mouth sits on the beard, slightly wider (friendly half-smile)
  const mouth = head.getObjectByName('mouth');
  mouth.position.copy(onHead(0, -0.66, 0.05));
  mouth.material = mat(0x5a2f2a);
  mouth.scale.set(1.15, 1, 1);

  // black button-up: buttons down the placket + shirt collar points
  const torso = root.getObjectByName('torso');
  const btnMat = mat(0x3d3d44, { roughness: 0.4 });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), btnMat);
    b.rotation.x = Math.PI / 2; b.position.set(0.0, 2.15 - i * 0.24, 0.56 - i * 0.004);
    torso.add(b);
  }
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.06), mat(P.shirt));
    c.position.set(s * 0.2, 2.32, 0.42); c.rotation.set(-0.6, s * 0.4, s * 0.55); torso.add(c);
  }
  // rolled sleeves: shorter sleeve, bare forearm, fabric roll; smartwatch on the left wrist
  for (const name of ['armL', 'armR']) {
    const arm = root.getObjectByName(name);
    const hand = arm.children.find((c) => c.geometry?.type === 'IcosahedronGeometry');
    for (const c of arm.children) {
      if (c.geometry?.type === 'LatheGeometry') c.scale.y = 0.74;          // sleeve ends above the elbow-ish
      if (c.geometry?.type === 'CylinderGeometry') c.visible = false;      // old cuff
    }
    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.42, 10), hand.material);
    fore.position.y = -0.88; arm.add(fore);
    const roll = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 6, 14), mat(P.shirt));
    roll.rotation.x = Math.PI / 2; roll.position.y = -0.7; arm.add(roll);
    if (name === 'armL') {
      const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.1, 12), mat(P.watch, { roughness: 0.3 }));
      watch.position.y = -1.0; arm.add(watch);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.17), new THREE.MeshStandardMaterial({ color: 0x23272d, roughness: 0.15, metalness: 0.3 }));
      face.position.set(0, -1.0, 0.16); arm.add(face);
    }
  }
  root.traverse((o) => { if (o.isMesh) { o.castShadow = o.parent?.name !== 'glasses'; o.receiveShadow = true; } });
  return root;
}
