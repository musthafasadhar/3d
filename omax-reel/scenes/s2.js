// S2 — AI ERA: "Not the chatbot. Not the clinic nearby. The doctor they SEE every day."
// Patient on a sofa at night; three option cards float up; the doctor's reel wins.
import {
  THREE, RoundedBoxGeometry, createStage, backdrop, bokeh, makePerson, canvasPlane, mat, drawReelUI, heartStream,
  glowSprite, overlay, textOn, animIn, prog, easeOut, easeInOut, easeBack, lerp, rr, FONT, BRAND, verified,
} from '../lib.js';

function drawAICard(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#F4F5FA'; rr(ctx, 0, 0, w, h, 40); ctx.fill();
  // header
  ctx.fillStyle = '#7B61FF';
  ctx.beginPath(); ctx.arc(70, 72, 34, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  // sparkle
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r = i % 2 ? 7 : 22; ctx.lineTo(70 + Math.cos(a) * r, 72 + Math.sin(a) * r); }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1D2033'; ctx.font = `700 34px ${FONT}`; ctx.textBaseline = 'middle';
  ctx.fillText('AI Chatbot', 122, 72);
  // user bubble
  ctx.fillStyle = '#2E6BFF'; rr(ctx, 150, 130, w - 180, 76, 26); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = `600 26px ${FONT}`;
  ctx.fillText('I have a headache…', 176, 168);
  // AI bubble with long text
  ctx.fillStyle = '#E3E5F0'; rr(ctx, 30, 230, w - 80, 330, 26); ctx.fill();
  ctx.fillStyle = '#3B3F55'; ctx.font = `600 25px ${FONT}`;
  ['It could be one of', '27 possible conditions:', '1. Tension 2. Migraine', '3. Dehydration 4. Sinus…', '…please consult a', 'professional.'].forEach((l, i) => ctx.fillText(l, 56, 280 + i * 46));
}
function drawClinicCard(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#F4F5FA'; rr(ctx, 0, 0, w, h, 40); ctx.fill();
  // map
  ctx.save(); rr(ctx, 24, 24, w - 48, 330, 28); ctx.clip();
  ctx.fillStyle = '#DDE8D5'; ctx.fillRect(0, 0, w, 400);
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(w, 150); ctx.moveTo(170, 0); ctx.lineTo(250, 400); ctx.stroke();
  ctx.fillStyle = '#B9D3F0'; ctx.fillRect(w - 150, 230, 140, 140);
  ctx.restore();
  // pin
  ctx.fillStyle = '#E8453C';
  ctx.beginPath(); ctx.arc(w / 2, 150, 44, Math.PI, 0); ctx.lineTo(w / 2, 250); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(w / 2, 150, 17, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1D2033'; ctx.font = `700 34px ${FONT}`; ctx.textBaseline = 'middle';
  ctx.fillText('Clinic nearby', 40, 410);
  ctx.fillStyle = '#5B6070'; ctx.font = `600 26px ${FONT}`;
  ctx.fillText('300 m away · Open now', 40, 460);
  ctx.fillStyle = '#F5A623'; ctx.font = `700 28px ${FONT}`;
  ctx.fillText('★★★★', 40, 515);
  ctx.fillStyle = '#C9CCD6'; ctx.fillText('★', 40 + ctx.measureText('★★★★').width, 515);
}
function drawStamp(ctx, w, h, ok) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = ok ? BRAND.accent : '#FF4D4D';
  ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = w * 0.11; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  if (ok) { ctx.moveTo(w * 0.28, h * 0.52); ctx.lineTo(w * 0.44, h * 0.68); ctx.lineTo(w * 0.73, h * 0.36); }
  else { ctx.moveTo(w * 0.32, h * 0.32); ctx.lineTo(w * 0.68, h * 0.68); ctx.moveTo(w * 0.68, h * 0.32); ctx.lineTo(w * 0.32, h * 0.68); }
  ctx.stroke();
}

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#0B1030'], [0.6, '#1B1E4E'], [1, '#2A1B48']]);

  scene.add(new THREE.HemisphereLight('#7D8BE0', '#2A1A30', 0.8));
  const key = new THREE.DirectionalLight('#FFE3C4', 1.4); key.position.set(2, 5, 10); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 6, bottom: -2 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#7AA8FF', 1.6); rim.position.set(-4, 4, -6); scene.add(rim);
  const lampL = new THREE.PointLight('#FFB45E', 12, 10, 1.5); lampL.position.set(2.4, 3.2, -1.2); scene.add(lampL);

  // room: back wall with window, sofa
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat('#262A5A', { roughness: 1 }));
  wall.position.set(0, 4, -2.6); wall.receiveShadow = true; scene.add(wall);
  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.1), mat('#15183A'));
  winFrame.position.set(-1.6, 4.6, -2.52); scene.add(winFrame);
  const winSky = canvasPlane(2.36, 2.36, 256, 256, { transparent: false });
  {
    const { ctx } = winSky;
    const g = ctx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#2B2F7A'); g.addColorStop(1, '#C2557A');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#0F1233';
    [[0, 150, 50, 106], [55, 120, 40, 136], [100, 170, 60, 86], [165, 100, 45, 156], [215, 160, 41, 96]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    ctx.fillStyle = '#FFD27A';
    for (let i = 0; i < 26; i++) ctx.fillRect((i * 37) % 250, 130 + ((i * 53) % 110), 6, 9);
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(190, 50, 20, 0, Math.PI * 2); ctx.fill();
    winSky.tex.needsUpdate = true;
  }
  winSky.mesh.position.set(-1.6, 4.6, -2.46); scene.add(winSky.mesh);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.06), mat('#15183A')); bar.position.set(-1.6, 4.6, -2.42); scene.add(bar);
  const bar2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.06), mat('#15183A')); bar2.position.set(-1.6, 4.6, -2.42); scene.add(bar2);
  // floor lamp
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 6), mat('#1A1A22')); lampPole.position.set(2.4, 1.5, -1.6); scene.add(lampPole);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 0.5, 8, 1, true), new THREE.MeshStandardMaterial({ color: '#FFE0B0', emissive: '#FFB45E', emissiveIntensity: 0.8, side: THREE.DoubleSide, flatShading: true }));
  shade.position.set(2.4, 3.1, -1.6); scene.add(shade);
  const lampGlow = glowSprite('#FFB45E', 3.2, 0.6); lampGlow.position.set(2.4, 3.0, -1.4); scene.add(lampGlow);

  const sofaM = mat('#3C6E8F');
  const sofaBack = new THREE.Mesh(new RoundedBoxGeometry(4.4, 1.5, 0.6, 3, 0.2), sofaM); sofaBack.position.set(0, 1.55, -1.1);
  const sofaSeat = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.6, 1.6, 3, 0.2), sofaM); sofaSeat.position.set(0, 0.7, -0.3);
  const cushion = new THREE.Mesh(new RoundedBoxGeometry(0.9, 0.8, 0.3, 2, 0.15), mat('#F2A65A')); cushion.position.set(-1.3, 1.45, -0.7); cushion.rotation.z = 0.2;
  [sofaBack, sofaSeat, cushion].forEach((m) => { m.castShadow = m.receiveShadow = true; scene.add(m); });

  // patient (seated: legs hidden by framing)
  const pat = makePerson({ role: 'patient', top: '#FFC23A', skin: '#E7B48F', hair: '#3A2418', hairStyle: 'long', seed: 4 });
  pat.root.position.set(0, 0.1, 0.2);
  scene.add(pat.root);

  // cards
  const mk = (draw, w, h, pw, ph) => {
    const g = new THREE.Group();
    const c = canvasPlane(w, h, pw, ph);
    draw(c.ctx, pw, ph); c.tex.needsUpdate = true;
    g.add(c.mesh);
    const stamp = canvasPlane(0.32, 0.32, 160, 160);
    stamp.mesh.position.set(w / 2 - 0.08, h / 2 - 0.08, 0.03);
    g.add(stamp.mesh);
    scene.add(g);
    return { g, c, stamp };
  };
  const A = mk(drawAICard, 0.78, 1.0, 470, 600);
  const B = mk(drawClinicCard, 0.78, 0.95, 470, 570);
  drawStamp(A.stamp.ctx, 160, 160, false); A.stamp.tex.needsUpdate = true;
  drawStamp(B.stamp.ctx, 160, 160, false); B.stamp.tex.needsUpdate = true;

  const C = new THREE.Group(); scene.add(C);
  const cFrame = new THREE.Mesh(new RoundedBoxGeometry(1.0, 1.78, 0.05, 3, 0.07), new THREE.MeshStandardMaterial({ color: '#0E0F14', roughness: 0.3, metalness: 0.5 }));
  C.add(cFrame);
  const reel = canvasPlane(0.93, 1.7, 540, 986, { radius: 0.05, transparent: false });
  reel.mesh.position.z = 0.03; C.add(reel.mesh);
  const cGlow = glowSprite(BRAND.accent, 3.2, 0.5); cGlow.position.z = -0.1; C.add(cGlow);
  const okStamp = canvasPlane(0.36, 0.36, 160, 160); drawStamp(okStamp.ctx, 160, 160, true); okStamp.tex.needsUpdate = true;
  okStamp.mesh.position.set(0.38, 0.7, 0.06); C.add(okStamp.mesh);
  const hearts = heartStream(C, { origin: new THREE.Vector3(0.3, 0.0, 0.1), start: 3.9, every: 0.14, count: 14, rise: 0.7, size: 0.2 });

  const bk = bokeh(scene, { count: 22, colors: ['#FFFFFF', '#FFC77A', '#9DB4FF'], area: [-4, 4, 2, 7, -2.4, -2.2], size: [0.2, 0.6], opacity: [0.06, 0.2] });

  // text
  const ov = overlay();
  let K, L1, L2, L3;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block" style="top:170px">
        <span class="kicker line" id="k">After AI</span>
        <div class="title stack"><span class="line" id="l1">Not the<br>chatbot.</span><span class="line" id="l2">Not the<br>clinic nearby.</span><span class="line" id="l3">The doctor they<br><span class="acc">see</span> every day.</span></div>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1'); L2 = ov.querySelector('#l2'); L3 = ov.querySelector('#l3');
  }

  camera.position.set(0, 2.9, 8.2);
  const tgt = new THREE.Vector3(0, 3.35, 0);

  return {
    duration: 6,
    update(t) {
      const push = easeInOut(prog(t, 0, 6));
      camera.position.set(Math.sin(t * 0.4) * 0.15, 2.9, lerp(8.4, 7.6, push));
      camera.lookAt(tgt);

      // cards pop in
      const pa = easeBack(prog(t, 0.2, 0.5)), pb = easeBack(prog(t, 0.45, 0.5));
      const dimA = prog(t, 1.6, 0.4), dimB = prog(t, 2.9, 0.4);
      const away = easeInOut(prog(t, 3.5, 0.5));
      A.g.scale.setScalar(Math.max(0.001, 0.8 * pa * lerp(1, 0.82, dimA) * (1 - away * 0.3)));
      A.g.position.set(lerp(-0.5, -1.0, away), 3.5 + Math.sin(t * 1.5) * 0.04, 1.6 - away * 0.8);
      A.g.rotation.set(0, 0.25, 0.05);
      A.c.mesh.material.opacity = lerp(1, 0.45, dimA) * (1 - away * 0.6);
      A.stamp.mesh.scale.setScalar(Math.max(0.001, easeBack(prog(t, 1.6, 0.35))));
      B.g.scale.setScalar(Math.max(0.001, 0.8 * pb * lerp(1, 0.82, dimB) * (1 - away * 0.3)));
      B.g.position.set(lerp(0.5, 1.0, away), 3.42 + Math.sin(t * 1.5 + 1) * 0.04, 1.6 - away * 0.8);
      B.g.rotation.set(0, -0.25, -0.05);
      B.c.mesh.material.opacity = lerp(1, 0.45, dimB) * (1 - away * 0.6);
      B.stamp.mesh.scale.setScalar(Math.max(0.001, easeBack(prog(t, 2.9, 0.35))));

      // the winner: doctor reel
      const pc = prog(t, 3.5, 0.6);
      C.scale.setScalar(Math.max(0.001, 0.56 * easeBack(pc)));
      C.position.set(0, 3.42 + Math.sin(t * 1.4) * 0.03, 2.0);
      C.rotation.set(0, Math.sin(t * 0.8) * 0.06, 0);
      okStamp.mesh.scale.setScalar(Math.max(0.001, easeBack(prog(t, 4.3, 0.35))));
      drawReelUI(reel.ctx, 540, 986, t, { likes: Math.floor(86000 + Math.max(0, t - 3.9) * 52000), views: '3.1M', caption: 'Headache? Watch this first' });
      reel.tex.needsUpdate = true;
      hearts.update(t);

      // patient looks at A, then B, then up at C and smiles
      const look = t < 1.0 ? lerp(0, 0.45, easeInOut(prog(t, 0.3, 0.6)))
        : t < 2.3 ? lerp(0.45, -0.45, easeInOut(prog(t, 2.0, 0.4)))
        : lerp(-0.45, 0, easeInOut(prog(t, 3.4, 0.4)));
      const lookUp = lerp(0.25, 0.32, prog(t, 3.4, 0.4));
      const smile = t < 3.6 ? lerp(1, -0.6, prog(t, 1.4, 0.3)) : lerp(-0.6, 1, prog(t, 3.8, 0.3));
      pat.pose(t, { look, lookUp, smile, breathe: 1 });
      pat.armL.rotation.z = -0.2; pat.armR.rotation.z = 0.2;
      const brow = t < 3.6 ? prog(t, 1.4, 0.3) : 1 - prog(t, 3.8, 0.3);
      pat.browL.rotation.z = brow * -0.3; pat.browR.rotation.z = brow * 0.3;
      pat.browL.position.y = pat.browR.position.y = 0.53 + (t > 3.8 ? 0.03 * prog(t, 3.8, 0.3) : 0);

      bk.update(t);
      if (K) {
        animIn(K, t, 0.1);
        animIn(L1, t, 0.3, { out: 1.95, outDur: 0.25 });
        animIn(L2, t, 2.2, { out: 3.3, outDur: 0.25 });
        animIn(L3, t, 3.55);
      }
      renderer.render(scene, camera);
    },
  };
}
