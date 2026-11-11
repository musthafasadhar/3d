// Doctor - same soft low-poly chibi family as Kiran (host-male), clearly different silhouette:
// salt-and-pepper combed hair, brows + mustache, no glasses, long white coat, stethoscope, tie.
// Named parts (for animation): head, eyeL, eyeR, mouth, hair, armL, armR, torso, browL, browR
import * as THREE from 'three';
import { createHostMale, HS, onHead, mat, lathe, rng } from '../host-male/character.js';

export const PALETTE = {
  skin: 0xd8946f,
  hairDark: 0x4b4540,
  hairGrey: 0xa7a19a,
  coat: 0xf3f5f6,
  shirt: 0x9cc2e6,
  tie: 0x1f3d5c,
  pants: 0x4a4f5a,
  shoes: 0x3b2a20,
  steth: 0x2b2f36,
  metal: 0xc9cdd2,
};

function buildDoctorHair(P) {
  // Combed-back side-part cut, a little receded; grey at the temples (vertex colours).
  const g = new THREE.SphereGeometry(1, 32, 24);
  const pos = g.attributes.position;
  const colors = [];
  const r = rng(21);
  const dark = new THREE.Color(P.hairDark), grey = new THREE.Color(P.hairGrey);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize();
    const front = v.z;
    let line = front > 0 ? 0.22 + 0.42 * Math.pow(front, 1.3) : 0.16 + 0.8 * front;
    const inHair = v.y > line;
    const ang = Math.atan2(v.x, v.z);
    // combed-back grooves running front-to-back
    const groove = 0.025 * Math.abs(Math.sin(v.x * 9));
    const lift = 0.08 * Math.max(0, front) * Math.max(0, v.y); // volume at the front
    const rad = inHair ? 1.06 + groove + lift + 0.012 * (r() - 0.5) : 0.985;
    v.multiplyScalar(rad);
    pos.setXYZ(i, v.x * HS.x, v.y * HS.y * (inHair ? 1.04 : 1), v.z * HS.z);
    const side = Math.min(1, Math.abs(Math.sin(ang)) * (1 - Math.max(0, v.y)) * 1.6);
    const c = dark.clone().lerp(grey, side * 0.85 + 0.12 * r());
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  const hair = new THREE.Group();
  hair.name = 'hair';
  hair.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7, flatShading: true })));
  // swept front quiff (side part on his right)
  const quiff = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat(P.hairDark, { roughness: 0.7 }));
  quiff.position.set(0.18 * HS.x, 0.82 * HS.y, 0.5 * HS.z);
  quiff.scale.set(0.62, 0.22, 0.42);
  quiff.rotation.set(-0.35, -0.25, -0.12);
  hair.add(quiff);
  return hair;
}

export function createDoctor(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const root = createHostMale({
    skin: P.skin, jacket: P.coat, tee: P.shirt, pants: P.pants, shoes: P.shoes, soles: 0x1d1916, hair: P.hairDark,
  });
  root.name = 'doctor';
  const head = root.getObjectByName('head');

  // no glasses, new hair
  head.remove(head.getObjectByName('glasses'));
  head.remove(head.getObjectByName('hair'));
  head.add(buildDoctorHair(P));

  // brows (grey, slightly angled) + mustache
  for (const s of [-1, 1]) {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.06), mat(P.hairDark));
    brow.name = s < 0 ? 'browR' : 'browL';
    brow.position.copy(onHead(s * 0.43, 0.2, 0.02));
    brow.lookAt(brow.position.clone().multiplyScalar(2));
    brow.rotateZ(s * -0.12);
    head.add(brow);
  }
  const stache = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat(P.hairDark, { roughness: 0.75 }));
  stache.position.copy(onHead(0, -0.52, 0.02));
  stache.scale.set(0.27, 0.075, 0.08);
  head.add(stache);
  // move the mouth a touch lower so the mustache sits above it
  head.getObjectByName('mouth').position.copy(onHead(0, -0.68, 0.0));

  const torso = root.getObjectByName('torso');
  // long coat skirt (open front) below the jacket
  const gap = 0.42;
  const skirt = new THREE.Mesh(
    lathe([[0.74, 1.0], [0.82, 0.8], [0.86, 0.5]], 16, gap, Math.PI * 2 - gap * 2),
    mat(P.coat, { side: THREE.DoubleSide })
  );
  skirt.scale.z = 0.76;
  torso.add(skirt);
  // coat pockets + pen + name badge
  for (const s of [-1, 1]) {
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.04), mat(0xe2e6e8));
    pocket.position.set(s * 0.5, 1.12, 0.58);
    pocket.rotation.y = s * 0.45;
    torso.add(pocket);
  }
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.03), mat(0x16a37b));
  badge.position.set(0.48, 1.95, 0.53);
  badge.rotation.y = 0.5;
  torso.add(badge);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6), mat(0x1f3d5c));
  pen.position.set(-0.47, 2.0, 0.52);
  torso.add(pen);
  // tie
  const tie = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.62, 0.04), mat(P.tie));
  tie.position.set(0, 1.95, 0.53);
  tie.rotation.x = -0.12;
  torso.add(tie);
  const knot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.06), mat(P.tie));
  knot.position.set(0, 2.27, 0.48);
  torso.add(knot);

  // stethoscope: tube round the back of the neck, both ends down the chest
  const tubeMat = new THREE.MeshStandardMaterial({ color: P.steth, roughness: 0.45 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.3, 1.55, 0.63), new THREE.Vector3(-0.34, 1.95, 0.6), new THREE.Vector3(-0.32, 2.3, 0.35),
    new THREE.Vector3(0, 2.45, -0.35), new THREE.Vector3(0.32, 2.3, 0.35), new THREE.Vector3(0.36, 1.95, 0.6),
    new THREE.Vector3(0.3, 1.72, 0.64),
  ]);
  torso.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.03, 8), tubeMat));
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 16), new THREE.MeshStandardMaterial({ color: P.metal, roughness: 0.25, metalness: 0.8 }));
  chest.position.set(-0.3, 1.5, 0.66);
  chest.rotation.x = Math.PI / 2;
  torso.add(chest);

  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return root;
}
