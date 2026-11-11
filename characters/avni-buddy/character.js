// "Avni" mascot - a low-poly cloud blob (style of the reference image), in Avni brand green.
// No mouth: emotion lives in two black bar eyes + squash/stretch and hops.
// About 1.7 units tall, feet at y = 0, faces +Z.
import * as THREE from 'three';

export const PALETTE = { body: 0x3cc79a, feet: 0x27a77c, eye: 0x0b0b10 };
export const SCALE = 0.62; // ~1 unit tall: about one head high next to Kiran

// Eye presets: [scaleX, scaleY, offsetY]
export const EYES = {
  neutral: [1, 1, 0],
  happy: [1.25, 0.32, 0.03], // squished = smiling
  sad: [1, 0.45, -0.05], // short squares
  wide: [1.12, 1.3, 0.02], // surprised
  sus: [1.3, 0.28, 0], // suspicious / serious squint
  closed: [1.2, 0.12, 0], // blink
};

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function createAvniBuddy(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const bodyMat = new THREE.MeshStandardMaterial({ color: P.body, roughness: 0.62, flatShading: true });
  const root = new THREE.Group();
  root.name = 'avniBuddy';
  const body = new THREE.Group();
  body.name = 'body';
  body.position.y = 0.92;
  root.add(body);

  // Cloud = a big core + overlapping puffs around the rim + one on top.
  // Low-poly (detail 1-2) with slight vertex jitter -> chunky facets like the reference.
  const r = rng(11);
  const puff = (rad, x, y, z, detail = 2) => {
    const g = new THREE.IcosahedronGeometry(rad, detail);
    const p = g.attributes.position;
    // jitter by position hash so shared corners move together (no cracks)
    const seed = r() * 100;
    for (let i = 0; i < p.count; i++) {
      const hsh = Math.sin(p.getX(i) * 91.7 + p.getY(i) * 37.3 + p.getZ(i) * 53.1 + seed) * 43758.5453;
      const k = 1 + 0.06 * ((hsh - Math.floor(hsh)) - 0.5);
      p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, bodyMat);
    m.position.set(x, y, z);
    body.add(m);
    return m;
  };
  // One chunky body; lobes sit mostly inside it so they only bump the silhouette.
  const core = puff(0.72, 0, 0, 0, 2);
  core.scale.set(1.12, 0.95, 0.86);
  const lobes = [
    // radius, x, y, z  (front view: top bump, upper + lower side lobes, back lobes)
    [0.4, 0.02, 0.62, -0.02], [0.36, -0.6, 0.32, 0.0], [0.36, 0.62, 0.3, 0.0],
    [0.38, -0.62, -0.24, 0.02], [0.38, 0.62, -0.26, 0.02], [0.34, -0.3, -0.48, 0.12],
    [0.34, 0.32, -0.48, 0.12], [0.4, -0.3, 0.2, -0.42], [0.4, 0.32, 0.18, -0.42],
  ];
  for (const [rad, x, y, z] of lobes) puff(rad, x, y, z, 1);

  // Bar eyes on the front face
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.05),
      new THREE.MeshStandardMaterial({ color: P.eye, roughness: 0.4 }));
    eye.name = s < 0 ? 'eyeR' : 'eyeL';
    eye.position.set(s * 0.24, 0.02, 0.63);
    body.add(eye);
  }

  // Four round feet
  const feetMat = new THREE.MeshStandardMaterial({ color: P.feet, roughness: 0.65, flatShading: true });
  for (const [x, z] of [[-0.4, 0.12], [-0.13, 0.22], [0.13, 0.22], [0.4, 0.12]]) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), feetMat);
    f.scale.set(1, 0.8, 1);
    f.position.set(x, 0.13, z);
    root.add(f);
  }
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  root.scale.setScalar(P.scale ?? SCALE);
  root.setEyes = (name) => {
    const [sx, sy, oy] = EYES[name] || EYES.neutral;
    for (const n of ['eyeL', 'eyeR']) {
      const e = root.getObjectByName(n);
      e.scale.set(sx, sy, 1);
      e.position.y = 0.02 + oy;
    }
  };
  return root;
}
