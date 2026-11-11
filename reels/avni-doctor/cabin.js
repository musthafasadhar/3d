// Doctor's cabin set - BRIGHT daytime clinic: soft sunlight through half-open blinds,
// cream walls, light oak floor, blue sky + trees outside, pastel mint accents. Scale: characters are ~4.5 units tall.
// Layout: back wall z=-5.5 (window + shelf), doctor behind desk (desk centre z=-1.2),
// patient side towards +z, front wall z=+8.
import * as THREE from 'three';

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...o });
function box(w, h, d, m, x, y, z, parent) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  b.position.set(x, y, z); b.castShadow = b.receiveShadow = true; parent.add(b); return b;
}
function canvasTex(w, h, draw, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

export function buildCabin() {
  const R = rng(5);
  const set = new THREE.Group(); set.name = 'cabin';

  // ---------- floor (warm wood planks) ----------
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    for (let i = 0; i < 16; i++) {
      const l = 66 + R() * 8;
      g.fillStyle = `hsl(32, 42%, ${l}%)`; g.fillRect(0, i * 64, w, 64);
      g.fillStyle = 'rgba(120,80,50,.25)'; g.fillRect(0, i * 64, w, 2);
      g.fillRect(((i * 397) % 900) + 60, i * 64, 2, 64);
      for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(60,30,15,${R() * 0.08})`; g.fillRect(R() * w, i * 64 + R() * 64, 80 + R() * 200, 1.5); }
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), std(0xffffff, { map: floorTex, roughness: 0.55 }));
  floor.rotation.x = -Math.PI / 2; floor.position.z = 1; floor.receiveShadow = true; set.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), std(0xbfe3d4, { roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0.6, 0.01, 1.4); rug.scale.set(1.3, 1, 1); rug.receiveShadow = true; set.add(rug);

  // ---------- walls ----------
  const wallM = std(0xfbf6ee, { roughness: 0.95 });
  const H = 9.5;
  // back wall with window opening x[-0.8, 5.2], y[2.6, 7.4]
  const bz = -5.5;
  box(8.2, H, 0.3, wallM, -4.9, H / 2, bz, set);
  box(3.8, H, 0.3, wallM, 7.1, H / 2, bz, set);
  box(6.0, 2.6, 0.3, wallM, 2.2, 1.3, bz, set);
  box(6.0, H - 7.4, 0.3, wallM, 2.2, 7.4 + (H - 7.4) / 2, bz, set);
  box(18, H, 0.3, wallM, 0, H / 2, 8, set).name = 'frontWall'; // front wall (hidden for wide shots)
  box(0.3, H, 14, wallM, -9, H / 2, 1.2, set); // left wall
  box(0.3, H, 14, wallM, 9, H / 2, 1.2, set); // right wall
  const skirtM = std(0xe6dccb); // skirting
  box(18, 0.3, 0.1, skirtM, 0, 0.15, bz + 0.2, set);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), std(0xf3efe6)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, 1.2); set.add(ceil);
  // window frame + sill
  const frameM = std(0xffffff, { roughness: 0.5 });
  box(6.2, 0.18, 0.5, frameM, 2.2, 2.6, bz + 0.1, set); box(6.2, 0.18, 0.4, frameM, 2.2, 7.4, bz, set);
  box(0.18, 4.8, 0.4, frameM, -0.8, 5, bz, set); box(0.18, 4.8, 0.4, frameM, 5.2, 5, bz, set); box(0.1, 4.8, 0.3, frameM, 2.2, 5, bz - 0.05, set);
  // blinds (partly open) -> stripe shadows
  const slatM = std(0xfaf7f0, { roughness: 0.6 });
  for (let i = 0; i < 15; i++) {
    const s = box(5.9, 0.04, 0.26, slatM, 2.2, 7.2 - i * 0.3, bz + 0.35, set);
    s.rotation.x = 0.95; // mostly open: bright, still casts soft stripes
  }
  // outside: dusk sky + city (emissive so bloom picks the lights)
  const skyTex = canvasTex(1024, 768, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#6fb6f2'); gr.addColorStop(0.6, '#b9e0fb'); gr.addColorStop(1, '#e9f6ff');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,.9)';
    for (const [x, y, r0] of [[180, 140, 60], [250, 130, 80], [320, 150, 55], [700, 90, 50], [760, 80, 70], [820, 100, 45]]) { g.beginPath(); g.arc(x, y, r0, 0, 7); g.fill(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(${205 + R() * 15}, 25%, ${78 + R() * 10}%)`; const bw = 60 + R() * 80, bh = 150 + R() * 200; g.fillRect(i * 130 + R() * 30, h - bh - 120, bw, bh); }
    for (let i = 0; i < 22; i++) { g.fillStyle = `hsl(${100 + R() * 30}, ${40 + R() * 20}%, ${38 + R() * 15}%)`; g.beginPath(); g.arc(R() * w, h - 60 - R() * 120, 50 + R() * 50, 0, 7); g.fill(); }
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(26, 16), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
  sky.position.set(2.2, 5, -16); set.add(sky);

  // ---------- back wall dressing: bookshelf + certificates ----------
  const shelfM = std(0xd9bf9b, { roughness: 0.6 });
  const shelf = new THREE.Group(); shelf.position.set(-5.2, 0, bz + 0.6); set.add(shelf);
  box(3.4, 6.4, 0.9, shelfM, 0, 3.2, 0, shelf);
  for (let k = 0; k < 4; k++) {
    const y = 1.0 + k * 1.45;
    box(3.1, 1.3, 0.1, std(0xcfb38e), 0, y + 0.55, 0.42, shelf).visible = false;
    let x = -1.4;
    while (x < 1.3) {
      const w = 0.12 + R() * 0.14, hgt = 0.8 + R() * 0.4;
      const hue = [8, 25, 140, 200, 35, 350, 160][Math.floor(R() * 7)];
      const b = box(w, hgt, 0.6, std(new THREE.Color(`hsl(${hue}, ${35 + R() * 30}%, ${48 + R() * 25}%)`)), x + w / 2, y + hgt / 2 + 0.05, 0.2, shelf);
      b.rotation.z = R() > 0.9 ? 0.15 : 0;
      x += w + 0.02;
    }
  }
  // carve shelf: put the shelf body behind books
  shelf.children[0].scale.z = 0.3; shelf.children[0].position.z = -0.35;
  for (let k = 0; k < 5; k++) box(3.3, 0.1, 0.9, shelfM, 0, 0.95 + k * 1.45, 0, shelf);
  const certTex = canvasTex(400, 300, (g, w, h) => {
    g.fillStyle = '#f6efdc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b08a3e'; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = '#4a3b22'; g.font = 'bold 30px serif'; g.textAlign = 'center'; g.fillText('CERTIFICATE', w / 2, 90);
    g.font = '18px serif'; g.fillText('Doctor of Medicine', w / 2, 140); g.fillRect(110, 200, 180, 2);
    g.fillStyle = '#b5372c'; g.beginPath(); g.arc(w - 70, h - 70, 24, 0, 7); g.fill();
  });
  for (const [x, y] of [[-2.4, 6.2], [-2.4, 4.3]]) {
    box(1.7, 1.3, 0.08, std(0xc9a46a, { roughness: 0.4 }), x, y, bz + 0.2, set);
    const c = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.08), std(0xffffff, { map: certTex, roughness: 0.4 })); c.position.set(x, y, bz + 0.25); set.add(c);
  }
  // wall clock
  const clockTex = canvasTex(256, 256, (g) => {
    g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 10; g.stroke();
    g.lineWidth = 6; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 50); g.moveTo(128, 128); g.lineTo(180, 150); g.stroke();
  });
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.55, 32), std(0xffffff, { map: clockTex })); clock.position.set(6.6, 6.6, bz + 0.2); set.add(clock);

  // ---------- left: examination bed + curtain ----------
  const bed = new THREE.Group(); bed.position.set(-6.8, 0, 1.0); set.add(bed);
  box(2.2, 0.2, 5, std(0x9aa3a8, { metalness: 0.4, roughness: 0.4 }), 0, 1.5, 0, bed);
  box(2.1, 0.3, 4.9, std(0x2f8f86, { roughness: 0.7 }), 0, 1.75, 0, bed);
  box(1.6, 0.25, 0.8, std(0xf4f4f0), 0, 2.0, -1.9, bed);
  for (const [x, z] of [[-0.9, -2.2], [0.9, -2.2], [-0.9, 2.2], [0.9, 2.2]]) box(0.12, 1.5, 0.12, std(0x8a9399, { metalness: 0.5 }), x, 0.75, z, bed);
  const cg = new THREE.PlaneGeometry(6, 7, 60, 1);
  const cp = cg.attributes.position;
  for (let i = 0; i < cp.count; i++) cp.setZ(i, Math.sin(cp.getX(i) * 4.2) * 0.12);
  cg.computeVertexNormals();
  const curtain = new THREE.Mesh(cg, std(0xb9dccf, { side: THREE.DoubleSide, roughness: 0.9 }));
  curtain.position.set(-4.6, 4.2, 2.5); curtain.rotation.y = Math.PI / 2; curtain.castShadow = curtain.receiveShadow = true; set.add(curtain);
  box(0.06, 0.06, 7, std(0x9aa3a8, { metalness: 0.6 }), -4.6, 7.8, 2.5, set);

  // ---------- right / front: door, poster, water dispenser, plant ----------
  box(0.15, 6.2, 2.6, std(0xd8b48a, { roughness: 0.6 }), 8.85, 3.1, 4.5, set);
  const posterTex = canvasTex(300, 420, (g, w, h) => {
    g.fillStyle = '#f2f6f4'; g.fillRect(0, 0, w, h); g.fillStyle = '#16a37b'; g.fillRect(0, 0, w, 60);
    g.fillStyle = '#fff'; g.font = 'bold 26px sans-serif'; g.fillText('HEALTHY HEART', 40, 40);
    g.fillStyle = '#d24c4c'; g.beginPath(); g.moveTo(150, 330); g.bezierCurveTo(30, 250, 60, 130, 150, 190); g.bezierCurveTo(240, 130, 270, 250, 150, 330); g.fill();
    g.fillStyle = '#7b8a85'; for (let i = 0; i < 4; i++) g.fillRect(40, 350 + i * 14, 220 - i * 30, 6);
  });
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.1), std(0xffffff, { map: posterTex })); poster.position.set(8.83, 5, 0.8); poster.rotation.y = -Math.PI / 2; set.add(poster);
  const plant = new THREE.Group(); plant.position.set(7.4, 0, -4.4); set.add(plant);
  box(0.9, 1.0, 0.9, std(0xd9d2c4), 0, 0.5, 0, plant);
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), std(0x3f7d3a, { flatShading: true }));
    leaf.position.set((R() - 0.5) * 0.9, 1.4 + R() * 1.6, (R() - 0.5) * 0.9); leaf.scale.set(0.6, 1.3, 0.25); leaf.rotation.set(R(), R() * 3, R() - 0.5);
    leaf.castShadow = true; plant.add(leaf);
  }

  // ---------- desk ----------
  const desk = new THREE.Group(); desk.name = 'desk'; desk.position.set(0.4, 0, -1.2); set.add(desk);
  const woodM = std(0xc89a6c, { roughness: 0.45 });
  box(5.6, 0.16, 2.4, woodM, 0, 1.2, 0, desk);
  box(5.4, 1.1, 0.12, std(0xf4efe6, { roughness: 0.6 }), 0, 0.6, 1.0, desk); // modesty panel (hides seated legs)
  box(0.14, 1.12, 2.2, woodM, -2.65, 0.56, 0, desk); box(0.14, 1.12, 2.2, woodM, 2.65, 0.56, 0, desk);
  // monitor (back to patient side, screen faces doctor)
  const mon = new THREE.Group(); mon.position.set(-1.5, 1.28, -0.4); mon.rotation.y = 0.35; desk.add(mon);
  box(1.7, 1.05, 0.08, std(0x1a1b1f, { roughness: 0.4 }), 0, 0.85, 0, mon);
  box(0.12, 0.35, 0.12, std(0x2a2b30), 0, 0.17, 0.05, mon); box(0.6, 0.04, 0.4, std(0x2a2b30), 0, 0.02, 0.05, mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.58, 0.92), new THREE.MeshBasicMaterial({ color: 0x9fc6ff, toneMapped: false }));
  scr.position.set(0, 0.85, -0.045); scr.rotation.y = Math.PI; mon.add(scr);
  const kb = box(1.2, 0.05, 0.42, std(0x2b2c30), -1.1, 1.3, 0.1, desk); kb.rotation.y = 0.3;
  // desk lamp (warm practical)
  const lamp = new THREE.Group(); lamp.position.set(2.2, 1.28, -0.6); desk.add(lamp);
  box(0.5, 0.06, 0.5, std(0x1f2a2a, { metalness: 0.5, roughness: 0.3 }), 0, 0.03, 0, lamp);
  const arm = box(0.06, 1.2, 0.06, std(0x1f2a2a, { metalness: 0.5, roughness: 0.3 }), 0, 0.6, 0, lamp); arm.rotation.z = 0.2;
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.45, 20, 1, true), std(0x1f5c4f, { side: THREE.DoubleSide, roughness: 0.4 }));
  shade.position.set(-0.2, 1.25, 0.1); shade.rotation.z = -0.5; shade.castShadow = true; lamp.add(shade);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0, toneMapped: false }));
  bulb.position.set(-0.27, 1.12, 0.1); lamp.add(bulb);
  // OLD PAPER FILES + register (script: doctor searches through them)
  const files = new THREE.Group(); files.name = 'files'; files.position.set(1.2, 1.28, 0.15); desk.add(files);
  const fcols = [0xd9b98a, 0xc9a26e, 0xe3cfa6, 0xb98c5a, 0xd7c08f, 0xc2955f];
  for (let i = 0; i < 9; i++) {
    const f = box(1.0, 0.07, 0.75, std(fcols[i % fcols.length], { roughness: 0.9 }), (R() - 0.5) * 0.12, 0.04 + i * 0.075, (R() - 0.5) * 0.1, files);
    f.rotation.y = (R() - 0.5) * 0.25;
  }
  box(0.08, 0.7, 0.06, std(0xb5372c), 0, 0.35, 0.36, files); // red tape
  const reg = box(0.9, 0.22, 1.2, std(0x6a1f24, { roughness: 0.6 }), -0.1, 1.39, 0.35, desk); reg.rotation.y = -0.2; reg.name = 'register';
  // mug, pen stand, name plate, papers
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.3, 16), std(0xf2efe8, { roughness: 0.35 })); mug.position.set(-0.35, 1.43, 0.6); mug.castShadow = true; desk.add(mug);
  const pens = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.35, 12), std(0x2f6b5e)); pens.position.set(2.3, 1.45, 0.4); desk.add(pens);
  for (let i = 0; i < 4; i++) box(0.03, 0.5, 0.03, std([0x1f3d5c, 0xb5372c, 0x222222, 0x2c7a3c][i]), 2.27 + (i % 2) * 0.06, 1.62, 0.37 + (i > 1 ? 0.06 : 0), desk).rotation.z = (i - 1.5) * 0.12;
  const plateTex = canvasTex(512, 128, (g, w, h) => {
    g.fillStyle = '#16a37b'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.font = 'bold 46px serif'; g.textAlign = 'center'; g.fillText('GENERAL PHYSICIAN', w / 2, 82);
  });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.3, 0.1), [std(0x16a37b), std(0x16a37b), std(0x16a37b), std(0x16a37b), std(0xffffff, { map: plateTex, roughness: 0.4 }), std(0x16a37b)]);
  plate.position.set(0.3, 1.43, 1.0); plate.rotation.x = -0.25; plate.castShadow = true; desk.add(plate);
  for (let i = 0; i < 3; i++) { const p = box(0.75, 0.01, 1.0, std(0xf7f5ef, { roughness: 0.95 }), -0.5 + i * 0.12, 1.29 + i * 0.01, 0.0, desk); p.rotation.y = (R() - 0.5) * 0.6; }
  // chairs
  const chairM = std(0x2f8f86, { roughness: 0.6 });
  const dchair = new THREE.Group(); dchair.name = 'doctorChair'; dchair.position.set(0.4, 0, -3.3); set.add(dchair);
  box(1.8, 0.25, 1.6, chairM, 0, 0.68, 0, dchair); box(1.8, 2.4, 0.25, chairM, 0, 2.0, -0.75, dchair);
  const pchair = new THREE.Group(); pchair.name = 'patientChair'; pchair.position.set(3.8, 0, -0.5); pchair.rotation.y = Math.PI / 2 + 0.35; set.add(pchair);
  box(1.5, 0.2, 1.4, std(0x3b6e66), 0, 0.95, 0, pchair); box(1.5, 1.6, 0.18, std(0x3b6e66), 0, 1.8, 0.65, pchair);
  for (const [x, z] of [[-0.6, -0.55], [0.6, -0.55], [-0.6, 0.55], [0.6, 0.55]]) box(0.08, 0.95, 0.08, std(0x777e83, { metalness: 0.6 }), x, 0.47, z, pchair);

  // ---------- lights (bright, soft daylight) ----------
  const lights = new THREE.Group(); set.add(lights);
  lights.add(new THREE.HemisphereLight(0xffffff, 0xe8d6bf, 2.2)); // bright sky fill + warm floor bounce
  const sun = new THREE.DirectionalLight(0xfff0d8, 3.2); // late-morning sun through the blinds
  sun.position.set(6.5, 12, -16); sun.target.position.set(-0.5, 0.5, 2.5);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 4;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  lights.add(sun, sun.target);
  // big soft key from the patient side (like a window/softbox) - keeps faces bright and even
  const key = new THREE.DirectionalLight(0xfff4ea, 1.6); key.position.set(4, 7, 9); lights.add(key);
  const fill = new THREE.DirectionalLight(0xe6f2ff, 0.8); fill.position.set(-7, 4, 5); lights.add(fill);
  const lampL = new THREE.PointLight(0xffd9a8, 2.5, 6, 1.6); lampL.position.set(2.35, 2.35, -1.7); lights.add(lampL);
  const screenL = new THREE.PointLight(0xcfe3ff, 1.0, 4, 2); screenL.position.set(-1.1, 2.1, -2.2); lights.add(screenL);
  return set;
}
