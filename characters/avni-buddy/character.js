// "Avni" mascot - brand-green low-poly heart buddy (Avni Health ERP logo = heart).
// Same acting rules as the reference reel's blob: no mouth, emotion lives in the eyes
// (two black vertical bars) plus squash/stretch and hops.
// Units: about 1.6 tall, feet at y = 0, faces +Z.
import * as THREE from 'three';

export const PALETTE = { body: 0x16a37b, feet: 0x0f7a5a, eye: 0x0b0b10 };

// Eye presets: [scaleX, scaleY, offsetY] for the bar eyes
export const EYES = {
  neutral: [1, 1, 0],
  happy: [1.25, 0.35, 0.03], // squished lines = smiling
  sad: [1, 0.45, -0.04], // short squares (like the reference's "that's cruel")
  wide: [1.15, 1.35, 0.02], // surprised
  sus: [1.3, 0.3, 0], // suspicious squint
};

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.62);
  s.bezierCurveTo(-0.28, -0.4, -0.78, -0.12, -0.74, 0.22);
  s.bezierCurveTo(-0.7, 0.55, -0.3, 0.68, 0, 0.36);
  s.bezierCurveTo(0.3, 0.68, 0.7, 0.55, 0.74, 0.22);
  s.bezierCurveTo(0.78, -0.12, 0.28, -0.4, 0, -0.62);
  return s;
}

export function createAvniBuddy(opts = {}) {
  const P = { ...PALETTE, ...opts };
  const mat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75, flatShading: true });
  const root = new THREE.Group();
  root.name = 'avniBuddy';

  const body = new THREE.Group();
  body.name = 'body';
  const geo = new THREE.ExtrudeGeometry(heartShape(), {
    depth: 0.42, bevelEnabled: true, bevelThickness: 0.2, bevelSize: 0.16, bevelSegments: 3, curveSegments: 7,
  });
  geo.center();
  const heart = new THREE.Mesh(geo, mat(P.body));
  body.add(heart);
  body.position.y = 0.92;
  root.add(body);

  // Eyes (bars) on the front face
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.24, 0.04), mat(P.eye));
    eye.name = s < 0 ? 'eyeR' : 'eyeL';
    eye.position.set(s * 0.2, 0.05, 0.43);
    body.add(eye);
  }
  // Little round feet (4 bumps, like the reference blob)
  for (const [x, z] of [[-0.24, 0.12], [0.24, 0.12], [-0.24, -0.12], [0.24, -0.12]]) {
    const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.13, 1), mat(P.feet));
    f.scale.set(1, 0.75, 1);
    f.position.set(x, 0.1, z);
    root.add(f);
  }
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  root.setEyes = (name) => {
    const [sx, sy, oy] = EYES[name] || EYES.neutral;
    for (const n of ['eyeL', 'eyeR']) {
      const e = root.getObjectByName(n);
      e.scale.set(sx, sy, 1);
      e.position.y = 0.05 + oy;
    }
  };
  return root;
}
