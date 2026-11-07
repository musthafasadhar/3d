// S1 — HOOK: "Not the doctor next door... the one on their phone."
// Patient walks past a neighbourhood clinic, eyes glued to a doctor's reel.
import {
  THREE, RoundedBoxGeometry, createStage, backdrop, bokeh, skyline, makePerson, makePhone, canvasPlane, mat,
  drawReelUI, heartStream, glowSprite, overlay, textOn, animIn, prog, easeOut, easeInOut, easeBack, lerp, clamp, rr, FONT, BRAND,
} from '../lib.js';

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#0A0F2C'], [0.45, '#1D1F5C'], [0.75, '#5B2D7A'], [1, '#C2557A']]);
  scene.fog = new THREE.Fog('#1A1C4A', 14, 42);

  // lights
  scene.add(new THREE.HemisphereLight('#6C7BD6', '#20142E', 0.9));
  const moon = new THREE.DirectionalLight('#9DB4FF', 1.4);
  moon.position.set(6, 12, 8); moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  Object.assign(moon.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
  moon.shadow.radius = 4;
  scene.add(moon);
  const rim = new THREE.DirectionalLight('#FF7AB6', 1.2);
  rim.position.set(-4, 5, -8);
  scene.add(rim);
  const key = new THREE.DirectionalLight('#FFE3C4', 1.3);
  key.position.set(3, 5, 14);
  scene.add(key);

  // ground + road
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mat('#23233F', { roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const walk = new THREE.Mesh(new THREE.BoxGeometry(30, 0.12, 3.2), mat('#3A3960'));
  walk.position.set(0, 0.06, 0.6); walk.receiveShadow = true;
  scene.add(walk);
  for (let i = -6; i <= 6; i++) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.125, 3.2), mat('#2C2B4E'));
    tile.position.set(i * 1.4, 0.065, 0.6);
    scene.add(tile);
  }

  skyline(scene, { z: -20, count: 16, spread: 34 });

  // ---- clinic (neighbourhood) ----
  const clinic = new THREE.Group();
  clinic.position.set(-1.7, 0, -3.6);
  scene.add(clinic);
  const wallM = mat('#E9D8C4');
  const bld = new THREE.Mesh(new RoundedBoxGeometry(4.2, 3.6, 2.4, 2, 0.08), wallM);
  bld.position.y = 1.8; bld.castShadow = bld.receiveShadow = true;
  clinic.add(bld);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.25, 2.7), mat('#B9876A'));
  roof.position.y = 3.65; clinic.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.9, 0.08), mat('#2B6C74'));
  door.position.set(0.9, 0.95, 1.21); clinic.add(door);
  const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.7), new THREE.MeshBasicMaterial({ color: '#FFE2A8', toneMapped: false }));
  doorGlow.position.set(0.9, 0.95, 1.26); clinic.add(doorGlow);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), new THREE.MeshBasicMaterial({ color: '#FFD9A0', toneMapped: false }));
  win.position.set(-0.9, 1.5, 1.21); clinic.add(win);
  const winBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.05), mat('#6B4E3D'));
  winBar.position.set(-0.9, 1.5, 1.24); clinic.add(winBar);
  // sign
  const sign = canvasPlane(3.4, 0.75, 680, 150, { radius: 0.08, transparent: false });
  {
    const { ctx } = sign;
    ctx.fillStyle = '#F7F7F2'; ctx.fillRect(0, 0, 680, 150);
    ctx.fillStyle = '#18A26B';
    ctx.fillRect(48, 45, 60, 20 + 40); ctx.fillRect(48 - 0, 45, 60, 60);
    ctx.fillRect(63, 30, 30, 90); ctx.fillRect(33, 60, 90, 30);
    ctx.fillStyle = '#1D2B3A'; ctx.font = `800 70px ${FONT}`; ctx.textBaseline = 'middle';
    ctx.fillText('CLINIC', 160, 80);
    ctx.font = `600 26px ${FONT}`; ctx.fillStyle = '#5B6B7A';
    ctx.fillText('OPEN · 9AM – 9PM', 430, 82);
    sign.tex.needsUpdate = true;
  }
  sign.mesh.position.set(0, 2.85, 1.24);
  clinic.add(sign.mesh);
  const signGlow = glowSprite('#FFF1C9', 4.5, 0.25); signGlow.position.set(0, 2.85, 1.5); clinic.add(signGlow);
  const doorLight = new THREE.PointLight('#FFD39A', 6, 6, 1.6);
  doorLight.position.set(0.9, 2.2, 2.2); clinic.add(doorLight);

  // doctor waiting at the door
  const doc = makePerson({ role: 'doctor', skin: '#C98F6B', hair: '#1E1E22', glasses: true, seed: 9 });
  doc.root.position.set(-0.4, 0, -2.1);
  doc.root.scale.setScalar(0.92);
  doc.root.rotation.y = 0.35;
  scene.add(doc.root);
  // "?" above doctor
  const q = canvasPlane(0.8, 0.8, 200, 200);
  {
    const { ctx } = q;
    ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(100, 100, 92, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1D2B3A'; ctx.font = `800 130px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 100, 110);
    q.tex.needsUpdate = true;
  }
  q.mesh.position.set(-0.25, 3.35, -2.0);
  scene.add(q.mesh);

  // street lamp
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), mat('#2A2D3E'));
  pole.position.set(2.3, 2.1, -1.4); pole.castShadow = true; scene.add(pole);
  const lampHead = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 6), mat('#2A2D3E'));
  lampHead.position.set(2.3, 4.25, -1.4); scene.add(lampHead);
  const bulb = glowSprite('#FFC77A', 2.6, 0.9); bulb.position.set(2.3, 4.05, -1.4); scene.add(bulb);
  const lampLight = new THREE.PointLight('#FFB867', 10, 9, 1.4);
  lampLight.position.set(2.3, 3.9, -1.4); scene.add(lampLight);

  // ---- patient with phone ----
  const pat = makePerson({ role: 'patient', top: '#FFC23A', skin: '#E7B48F', hair: '#3A2418', hairStyle: 'long', seed: 4 });
  scene.add(pat.root);
  const phone = makePhone({ w: 0.26, h: 0.52, d: 0.04, screenW: 180, screenH: 360 });
  scene.add(phone.group);
  const _hand = new THREE.Vector3(), _head = new THREE.Vector3();
  const faceLight = new THREE.PointLight('#DDF3FF', 0, 3, 1.5);
  scene.add(faceLight);

  // floating reel card (what she's watching)
  const card = new THREE.Group();
  scene.add(card);
  const cardFrame = new THREE.Mesh(new RoundedBoxGeometry(1.86, 3.3, 0.08, 3, 0.12), new THREE.MeshStandardMaterial({ color: '#0E0F14', roughness: 0.3, metalness: 0.5 }));
  card.add(cardFrame);
  const reel = canvasPlane(1.72, 3.14, 540, 986, { radius: 0.09, transparent: false });
  reel.mesh.position.z = 0.045;
  card.add(reel.mesh);
  const cardGlow = glowSprite(BRAND.accent, 5, 0.35); cardGlow.position.z = -0.2; card.add(cardGlow);
  const hearts = heartStream(card, { origin: new THREE.Vector3(0.55, 0.2, 0.15), start: 2.9, every: 0.16, count: 16, rise: 1.4, size: 0.32 });

  const bk = bokeh(scene, { count: 36, colors: ['#FFFFFF', '#FFC77A', '#9DB4FF', '#FF8FC0'], area: [-9, 9, 1, 12, -26, -10], size: [0.4, 1.4] });

  // ---- text ----
  const ov = overlay();
  let L1, L2, K;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block" style="top:170px">
        <span class="kicker line" id="k">Personal Branding</span>
        <div class="title stack"><span class="line" id="l1">Not the doctor<br>next door…</span><span class="line" id="l2">The one on<br>their <span class="acc">phone.</span></span></div>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1'); L2 = ov.querySelector('#l2');
  }

  const camFrom = new THREE.Vector3(1.6, 3.1, 17.5), camTo = new THREE.Vector3(0.7, 2.9, 15.0);
  const tgtFrom = new THREE.Vector3(0.2, 3.1, 0), tgtTo = new THREE.Vector3(0.1, 3.0, 0);

  return {
    duration: 6,
    update(t) {
      // camera dolly
      const cp = easeInOut(prog(t, 0, 6));
      camera.position.lerpVectors(camFrom, camTo, cp);
      const tg = new THREE.Vector3().lerpVectors(tgtFrom, tgtTo, cp);
      camera.lookAt(tg);

      // patient walks in from the right, stops, keeps watching
      const wp = easeOut(prog(t, 0, 2.4));
      const walking = t < 2.4 ? 1 - prog(t, 1.8, 0.6) : 0;
      pat.root.position.set(lerp(3.4, 0.95, wp), 0, 1.2);
      pat.root.rotation.y = lerp(-0.9, -0.15, easeInOut(prog(t, 1.6, 1.0)));
      pat.pose(t, { walk: walking, phone: 1, lookUp: -0.38, look: 0, smile: lerp(0.3, 1, prog(t, 3, 0.6)) });
      // phone screen
      drawReelUI(phone.ctx, 180, 360, t, { likes: 12000 + t * 9000 });
      phone.tex.needsUpdate = true;
      pat.root.updateMatrixWorld(true);
      pat.armR.children[1].getWorldPosition(_hand);
      pat.head.children[0].getWorldPosition(_head);
      phone.group.position.copy(_hand).add(new THREE.Vector3(-0.12, 0.12, 0.08));
      phone.group.lookAt(_head);
      phone.group.rotateX(0.25);
      faceLight.position.copy(_hand).add(new THREE.Vector3(0, 0.3, 0.3));
      faceLight.intensity = 1.2;

      // doctor at clinic: waves, then puzzled
      const wv = prog(t, 0.6, 0.4) * (1 - prog(t, 2.6, 0.5));
      doc.pose(t, { wave: easeOut(wv), look: 0.35, smile: lerp(1, -1, prog(t, 3.4, 0.3)) });
      doc.browL.rotation.z = lerp(0, 0.3, prog(t, 3.4, 0.3));
      doc.browR.rotation.z = lerp(0, -0.3, prog(t, 3.4, 0.3));
      const qp = prog(t, 3.6, 0.45);
      q.mesh.scale.setScalar(Math.max(0.001, easeBack(qp)));
      q.mesh.position.y = 3.35 + Math.sin(t * 3) * 0.05;
      q.mesh.lookAt(camera.position);

      // reel card pops above her phone
      const cp2 = prog(t, 2.2, 0.7);
      const s = Math.max(0.001, easeBack(cp2)) * 0.62;
      card.scale.setScalar(s);
      card.position.set(lerp(0.9, 1.3, cp2), lerp(3.0, 4.0, easeOut(cp2)) + Math.sin(t * 1.6) * 0.05, 2.4);
      card.rotation.set(0, -0.25 + Math.sin(t * 0.9) * 0.05, -0.04);
      drawReelUI(reel.ctx, 540, 986, t, { likes: Math.floor(48000 + Math.max(0, t - 2.9) * 40000), views: '2.4M', caption: 'Doctor explains in 30 sec' });
      reel.tex.needsUpdate = true;
      hearts.update(t);

      bk.update(t);

      if (K) {
        animIn(K, t, 0.15);
        animIn(L1, t, 0.35, { out: 2.3, outDur: 0.3 });
        animIn(L2, t, 2.55);
      }
      renderer.render(scene, camera);
    },
  };
}
