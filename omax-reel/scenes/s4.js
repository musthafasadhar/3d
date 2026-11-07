// S4 — "Like Dr. Vikrant — build a name people trust."
// A doctor's profile grows: followers climb, reels fill the grid, notifications pop.
import {
  THREE, RoundedBoxGeometry, createStage, backdrop, bokeh, makePerson, makePhone, canvasPlane, mat, glowSprite,
  heartStream, overlay, textOn, animIn, prog, easeOut, easeInOut, easeBack, lerp, rr, FONT, BRAND, verified,
  drawDoctorAvatar, fmtCount, heartPath,
} from '../lib.js';

const THUMBS = [
  ['#FF8A5B', '#B83B5E', '5 foods for a healthy heart'], ['#2ED3B7', '#11698E', 'BP myths busted'], ['#7B61FF', '#2B1A6E', 'Sleep better tonight'],
  ['#FFC23A', '#E0643A', 'Doctor reacts'], ['#5B8CFF', '#1C2E8F', 'Ask me anything'], ['#FF5C8A', '#7A1F5C', 'Day in my clinic'],
  ['#3FAE7A', '#145A41', 'Diabetes: 3 signs'], ['#F06543', '#7A2E1F', 'Q&A Friday'], ['#00B4D8', '#03396C', 'Heart health 101'],
];
const VIEWS = ['1.2M', '842K', '310K', '2.4M', '96K', '512K', '1.8M', '230K', '640K'];

function drawProfile(ctx, W, H, t, followers) {
  ctx.fillStyle = '#0F1117'; ctx.fillRect(0, 0, W, H);
  // top bar
  ctx.fillStyle = '#fff'; ctx.font = `700 30px ${FONT}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillText('dr.yourname', 36, 60);
  verified(ctx, 36 + ctx.measureText('dr.yourname').width + 22, 60, 13);
  // avatar with story ring
  const ax = 100, ay = 170;
  const ring = ctx.createLinearGradient(ax - 70, ay - 70, ax + 70, ay + 70);
  ring.addColorStop(0, '#FFC23A'); ring.addColorStop(0.5, '#FF4D6D'); ring.addColorStop(1, '#7B61FF');
  ctx.fillStyle = ring; ctx.beginPath(); ctx.arc(ax, ay, 70, 0, 7); ctx.fill();
  ctx.fillStyle = '#0F1117'; ctx.beginPath(); ctx.arc(ax, ay, 63, 0, 7); ctx.fill();
  drawDoctorAvatar(ctx, ax, ay, 58);
  // stats
  const stats = [['48', 'posts'], [fmtCount(followers), 'followers'], ['180', 'following']];
  stats.forEach(([n, l], i) => {
    const x = 250 + i * 110;
    ctx.textAlign = 'center'; ctx.fillStyle = i === 1 ? BRAND.accent : '#fff';
    ctx.font = `800 ${i === 1 ? 34 : 30}px ${FONT}`; ctx.fillText(n, x, ay - 12);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = `500 20px ${FONT}`; ctx.fillText(l, x, ay + 24);
  });
  // name + bio
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = `700 28px ${FONT}`;
  ctx.fillText('Dr. Your Name', 36, 280);
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = `500 22px ${FONT}`;
  ctx.fillText('Doctor · Simple health tips daily', 36, 316);
  ctx.fillText('Clinic in your city · Book below', 36, 348);
  // buttons
  ctx.fillStyle = BRAND.accent; rr(ctx, 36, 384, 300, 58, 14); ctx.fill();
  ctx.fillStyle = '#062B26'; ctx.font = `700 22px ${FONT}`; ctx.textAlign = 'center';
  ctx.fillText('Book appointment', 186, 414);
  ctx.fillStyle = '#262A35'; rr(ctx, 350, 384, 154, 58, 14); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillText('Message', 427, 414);
  // grid tabs
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(0, 466, W, 2);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 466, W / 2, 3);
  // reel grid fills in
  const gx = 4, gy = 474, cw = (W - 8) / 3, ch = cw * 1.38;
  THUMBS.forEach(([c1, c2, cap], i) => {
    const appear = clamp01((t - 0.5 - i * 0.32) / 0.3);
    const col = i % 3, row = Math.floor(i / 3);
    const x = gx + col * cw, y = gy + row * ch;
    ctx.save();
    ctx.globalAlpha = appear;
    const s = 0.6 + 0.4 * easeBack(appear);
    ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(s, s); ctx.translate(-(x + cw / 2), -(y + ch / 2));
    const g = ctx.createLinearGradient(x, y, x + cw, y + ch); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
    drawDoctorAvatar(ctx, x + cw / 2, y + ch * 0.46, cw * 0.28, { bg: c1 });
    ctx.fillStyle = '#fff'; ctx.font = `700 15px ${FONT}`; ctx.textAlign = 'center';
    wrap(ctx, cap, x + cw / 2, y + 26, cw - 18, 18);
    ctx.textAlign = 'left'; ctx.font = `600 16px ${FONT}`;
    ctx.fillText(`▶ ${VIEWS[i]}`, x + 10, y + ch - 18);
    ctx.restore();
  });
}
const clamp01 = (v) => Math.min(1, Math.max(0, v));
function wrap(ctx, text, x, y, maxW, lh) {
  const words = text.split(' '); let line = ''; let yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = test;
  }
  ctx.fillText(line, x, yy);
}

function drawNotif(ctx, W, H, icon, color, title, sub) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.97)'; rr(ctx, 4, 4, W - 8, H - 8, 36); ctx.fill();
  ctx.fillStyle = color; ctx.beginPath(); ctx.arc(64, H / 2, 38, 0, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (icon === 'heart') { heartPath(ctx, 64, H / 2 - 18, 36); ctx.fill(); }
  if (icon === 'user') { ctx.beginPath(); ctx.arc(64, H / 2 - 10, 11, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(64, H / 2 + 22, 20, Math.PI, 0); ctx.fill(); }
  if (icon === 'cal') { ctx.strokeRect(46, H / 2 - 16, 36, 32); ctx.beginPath(); ctx.moveTo(46, H / 2 - 5); ctx.lineTo(82, H / 2 - 5); ctx.stroke(); }
  if (icon === 'chat') { ctx.beginPath(); ctx.ellipse(64, H / 2 - 2, 20, 16, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(52, H / 2 + 8); ctx.lineTo(46, H / 2 + 22); ctx.lineTo(62, H / 2 + 12); ctx.fill(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#12141C'; ctx.font = `700 30px ${FONT}`; ctx.fillText(title, 120, H / 2 - 17);
  ctx.fillStyle = '#5B6070'; ctx.font = `500 23px ${FONT}`; ctx.fillText(sub, 120, H / 2 + 20);
}

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#0A0F2C'], [0.55, '#14264F'], [1, '#0E3B4A']]);

  scene.add(new THREE.HemisphereLight('#8FA5FF', '#1A2030', 0.9));
  const key = new THREE.DirectionalLight('#FFE3C4', 1.6); key.position.set(3, 6, 10); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 7, bottom: -2 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(BRAND.accent, 2.0); rim.position.set(-5, 4, -4); scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#FF7AB6', 1.2); rim2.position.set(5, 3, -4); scene.add(rim2);

  // podium floor
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.3, 40), mat('#1A2547'));
  floor.position.y = -0.15; floor.receiveShadow = true; scene.add(floor);
  const floorRing = new THREE.Mesh(new THREE.TorusGeometry(3.25, 0.04, 6, 80), new THREE.MeshBasicMaterial({ color: BRAND.accent, toneMapped: false }));
  floorRing.rotation.x = Math.PI / 2; floorRing.position.y = 0.01; scene.add(floorRing);

  // big phone
  const phone = makePhone({ w: 1.75, h: 3.6, d: 0.14, screenW: 540, screenH: 1120 });
  phone.group.position.set(0.3, 3.0, 0);
  phone.group.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(phone.group);
  const pGlow = glowSprite(BRAND.accent, 6, 0.35); pGlow.position.set(0.45, 3.0, -0.5); scene.add(pGlow);
  const hearts = heartStream(scene, { origin: new THREE.Vector3(1.3, 1.3, 0.6), start: 1.2, every: 0.12, count: 34, rise: 1.5, life: 1.5, spread: 1.0, size: 0.3 });

  // doctor beside phone
  const doc = makePerson({ role: 'doctor', skin: '#C98F6B', hair: '#1E1E22', glasses: true, seed: 9 });
  doc.root.position.set(-1.2, 0, 1.4);
  doc.root.rotation.y = 0.35;
  doc.root.scale.setScalar(0.95);
  scene.add(doc.root);

  // notifications
  const notifDefs = [
    ['user', '#5B8CFF', '+2,481 followers', 'in the last 24 hours', 1.3, -0.95, 4.3],
    ['cal', BRAND.accent, 'New appointment', 'request from Instagram', 2.4, 1.2, 3.55],
    ['chat', '#FF8A5B', '“Thank you, Doctor!”', 'Your reel really helped', 3.5, -0.95, 3.2],
    ['heart', '#FF4D6D', 'Reel hit 1M views', 'People trust your advice', 4.5, 1.2, 1.9],
  ];
  const notifs = notifDefs.map(([icon, col, title, sub, t0, x, y]) => {
    const n = canvasPlane(1.75, 0.42, 600, 144);
    drawNotif(n.ctx, 600, 144, icon, col, title, sub); n.tex.needsUpdate = true;
    n.mesh.position.set(x, y, 1.1);
    scene.add(n.mesh);
    return { n, t0, x, y };
  });

  const bk = bokeh(scene, { count: 30, colors: ['#FFFFFF', BRAND.accent, '#9DB4FF', '#FF8FC0'], area: [-7, 7, 0, 10, -14, -6], size: [0.3, 1.0] });

  const ov = overlay();
  let K, L1;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block" style="top:170px">
        <span class="kicker line" id="k">Like Dr. Vikrant</span>
        <div class="title"><span class="line" id="l1">Build a name<br>people <span class="acc">trust.</span></span></div>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1');
  }

  return {
    duration: 6,
    update(t) {
      const cp = easeInOut(prog(t, 0, 6));
      camera.position.set(lerp(0.4, 0.2, cp), lerp(3.0, 3.1, cp), lerp(16.8, 15.8, cp));
      camera.lookAt(0.15, 2.75, 0);

      // phone floats + pops in
      const pin = easeBack(prog(t, 0, 0.6));
      phone.group.scale.setScalar(Math.max(0.001, pin));
      phone.group.rotation.set(Math.sin(t * 0.8) * 0.03, -0.22 + Math.sin(t * 0.6) * 0.05, 0.03);
      phone.group.position.y = 2.95 + Math.sin(t * 1.2) * 0.05;
      const fp = easeInOut(prog(t, 0.8, 4.0));
      const followers = Math.round(lerp(1240, 152000, fp * fp));
      drawProfile(phone.ctx, 540, 1120, t, followers);
      phone.tex.needsUpdate = true;
      hearts.update(t);

      // doctor: wave, then cheer when it peaks
      const cheer = easeOut(prog(t, 4.6, 0.35));
      const wave = easeOut(prog(t, 0.6, 0.3)) * (1 - prog(t, 2.2, 0.3));
      doc.pose(t, { wave: cheer > 0 ? 0 : wave, cheer, look: 0.15, smile: 1 });
      doc.root.position.y = cheer > 0 ? Math.abs(Math.sin((t - 4.6) * 7)) * 0.18 * cheer : 0;

      for (const { n, t0, x, y } of notifs) {
        const p = prog(t, t0, 0.45);
        n.mesh.scale.setScalar(Math.max(0.001, easeBack(p)));
        n.mesh.position.set(x + (1 - easeOut(p)) * (x > 0 ? 0.8 : -0.8), y + Math.sin(t * 1.5 + x) * 0.03, 1.1);
        n.mesh.material.opacity = easeOut(p);
      }

      bk.update(t);
      if (K) { animIn(K, t, 0.1); animIn(L1, t, 0.3); }
      renderer.render(scene, camera);
    },
  };
}
