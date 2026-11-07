// S3 — "This isn't about doubting doctors. It's time doctors show up online."
// Doctor at a desk at dusk; ring light switches on; the phone on a tripod records (live preview on screen).
import {
  THREE, RoundedBoxGeometry, createStage, backdrop, bokeh, skyline, makePerson, canvasPlane, mat, glowSprite,
  overlay, textOn, animIn, prog, easeOut, easeInOut, easeBack, lerp, rr, FONT, BRAND, roundedRectGeometry,
} from '../lib.js';

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#120F36'], [1, '#2B1A44']]);

  scene.add(new THREE.HemisphereLight('#7D8BE0', '#2A1A30', 0.55));
  const key = new THREE.DirectionalLight('#FFD9B0', 0.6); key.position.set(-3, 6, 6); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 6, bottom: -2 });
  scene.add(key);
  const rim = new THREE.DirectionalLight('#C77DFF', 1.6); rim.position.set(-3, 5, -6); scene.add(rim);

  // room
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), mat('#2A2557', { roughness: 1 }));
  wall.position.set(0, 4, -3); wall.receiveShadow = true; scene.add(wall);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), mat('#1F1A3A'));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // big window with dusk city
  const winSky = canvasPlane(4.2, 3.6, 420, 360, { transparent: false });
  {
    const { ctx } = winSky;
    const g = ctx.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, '#5A3FA8'); g.addColorStop(0.65, '#D95C8F'); g.addColorStop(1, '#FFB36B');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 420, 360);
    ctx.fillStyle = '#15123A';
    [[0, 210, 70, 150], [80, 160, 60, 200], [150, 240, 70, 120], [230, 130, 60, 230], [300, 200, 50, 160], [355, 170, 65, 190]].forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    ctx.fillStyle = '#FFD27A';
    for (let i = 0; i < 40; i++) ctx.fillRect((i * 47) % 410, 180 + ((i * 61) % 170), 7, 10);
    winSky.tex.needsUpdate = true;
  }
  winSky.mesh.position.set(-1.2, 4.2, -2.95); scene.add(winSky.mesh);
  const fr = mat('#14112E');
  [[-1.2, 6.05, 4.4, 0.12], [-1.2, 2.35, 4.4, 0.12], [-1.2, 4.2, 0.1, 3.7]].forEach(([x, y, w, h]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), fr); b.position.set(x, y, -2.9); scene.add(b);
  });
  [-3.35, 0.95].forEach((x) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.8, 0.1), fr); b.position.set(x, 4.2, -2.9); scene.add(b); });
  // shelf with books + plant on right wall
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), mat('#8A5A3C')); shelf.position.set(2.3, 4.0, -2.7); scene.add(shelf);
  const bookCols = ['#2ED3B7', '#FFB347', '#FF6B6B', '#5B8CFF', '#F4F6F8'];
  for (let i = 0; i < 7; i++) {
    const h = 0.45 + (i % 3) * 0.08;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, h, 0.38), mat(bookCols[i % 5]));
    b.position.set(1.65 + i * 0.17, 4.04 + h / 2, -2.7); b.rotation.z = i === 6 ? -0.25 : 0; scene.add(b);
  }
  // medical certificate frame
  const cert = canvasPlane(0.9, 0.65, 180, 130, { transparent: false });
  { const { ctx } = cert; ctx.fillStyle = '#C9A46A'; ctx.fillRect(0, 0, 180, 130); ctx.fillStyle = '#FBF7EE'; ctx.fillRect(12, 12, 156, 106);
    ctx.fillStyle = '#7A6A50'; ctx.font = `700 16px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('MBBS · MD', 90, 50);
    ctx.fillRect(40, 65, 100, 4); ctx.fillRect(50, 78, 80, 4); ctx.fillStyle = '#C0392B'; ctx.beginPath(); ctx.arc(140, 100, 10, 0, 7); ctx.fill(); cert.tex.needsUpdate = true; }
  cert.mesh.position.set(2.3, 5.1, -2.94); scene.add(cert.mesh);

  // desk
  const desk = new THREE.Mesh(new RoundedBoxGeometry(4.4, 0.16, 1.8, 2, 0.05), mat('#9B6A48'));
  desk.position.set(0, 1.15, 0.6); desk.castShadow = desk.receiveShadow = true; scene.add(desk);
  const deskFront = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 0.08), mat('#7B5236'));
  deskFront.position.set(0, 0.55, 1.45); scene.add(deskFront);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.12, 0.28, 10), mat('#F4F6F8')); mug.position.set(-1.25, 1.37, 1.0); scene.add(mug);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.3, 8), mat('#E07A5F')); pot.position.set(-1.75, 1.38, 0.4); scene.add(pot);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.6, 4), mat('#3FAE7A'));
    leaf.position.set(-1.75 + Math.sin(i) * 0.12, 1.75, 0.4 + Math.cos(i) * 0.12); leaf.rotation.set(Math.cos(i) * 0.5, 0, Math.sin(i) * 0.5); scene.add(leaf);
  }
  // notebook + stethoscope on desk
  const nb = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.5), mat('#2ED3B7')); nb.position.set(-0.6, 1.25, 1.05); nb.rotation.y = 0.2; scene.add(nb);

  // doctor
  const doc = makePerson({ role: 'doctor', skin: '#C98F6B', hair: '#1E1E22', glasses: true, seed: 9 });
  doc.root.position.set(-0.45, -0.1, 0);
  doc.root.rotation.y = 0.18;
  scene.add(doc.root);
  // chair back
  const chair = new THREE.Mesh(new RoundedBoxGeometry(1.2, 1.6, 0.2, 2, 0.08), mat('#1B1B24'));
  chair.position.set(-0.45, 1.6, -0.55); scene.add(chair);

  // tripod + phone + ring light (foreground right)
  const rig = new THREE.Group();
  rig.position.set(0.95, -0.35, 3.6);
  scene.add(rig);
  const legM = mat('#15151B', { roughness: 0.4 });
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 2.0, 5), legM);
    const a = (i / 3) * Math.PI * 2;
    l.position.set(Math.cos(a) * 0.3, 0.95, Math.sin(a) * 0.3); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); rig.add(l);
  }
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), legM); mast.position.y = 2.2; rig.add(mast);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 10, 48), new THREE.MeshStandardMaterial({ color: '#FFFFFF', emissive: '#FFF4E0', emissiveIntensity: 0, roughness: 0.4 }));
  ring.position.y = 2.75; rig.add(ring);
  const ringGlow = glowSprite('#FFF1DC', 3.2, 0); ringGlow.position.set(0, 2.75, -0.05); rig.add(ringGlow);
  const ringLight = new THREE.SpotLight('#FFF1DC', 0, 12, 0.6, 0.6, 1.2);
  ringLight.position.set(0.95, 2.4, 3.5); ringLight.target.position.set(-0.25, 2.4, 0);
  scene.add(ringLight, ringLight.target);
  // phone (screen faces viewer)
  const phoneBody = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.92, 0.05, 3, 0.06), new THREE.MeshStandardMaterial({ color: '#111216', roughness: 0.3, metalness: 0.6 }));
  phoneBody.position.y = 2.75; rig.add(phoneBody);
  const rt = new THREE.WebGLRenderTarget(360, 720, { samples: 4 });
  rt.texture.colorSpace = THREE.SRGBColorSpace;
  const feed = new THREE.Mesh(roundedRectGeometry(0.42, 0.88, 0.045), new THREE.MeshBasicMaterial({ map: rt.texture, toneMapped: false }));
  feed.position.set(0, 2.75, 0.028); rig.add(feed);
  const hud = canvasPlane(0.42, 0.88, 360, 754);
  hud.mesh.position.set(0, 2.75, 0.031); rig.add(hud.mesh);
  const feedCam = new THREE.PerspectiveCamera(32, 0.42 / 0.88, 0.1, 50);
  // rig faces the viewer a bit
  rig.rotation.y = -0.25;

  const bk = bokeh(scene, { count: 20, colors: ['#FFFFFF', '#FFC77A', '#FF8FC0'], area: [-4, 4, 2.5, 7, -2.8, -2.7], size: [0.2, 0.7], opacity: [0.05, 0.2] });

  // text
  const ov = overlay();
  let K, L1, L2;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block" style="top:170px">
        <span class="kicker line" id="k">To every doctor</span>
        <div class="title stack"><span class="line" id="l1">This isn't about<br>doubting doctors.</span><span class="line" id="l2">It's time to<br><span class="acc">show up online.</span></span></div>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1'); L2 = ov.querySelector('#l2');
  }

  const docHead = new THREE.Vector3();
  return {
    duration: 6,
    update(t) {
      const cp = easeInOut(prog(t, 0, 6));
      camera.position.set(lerp(1.1, 1.25, cp), lerp(2.9, 2.75, cp), lerp(11.4, 10.4, cp));
      camera.lookAt(0.1, 2.25, 0);

      // ring light switches on with a little flicker
      let on = prog(t, 1.0, 0.5);
      if (t > 1.0 && t < 1.3) on *= (Math.floor(t * 40) % 2) ? 0.3 : 1;
      ring.material.emissiveIntensity = on * 2.2;
      ringGlow.material.opacity = on * 0.7;
      ringLight.intensity = on * 16;
      key.intensity = lerp(0.6, 0.9, on);

      // doctor: glances at phone, smiles, talks + gestures
      const talk = t > 1.8 ? 1 : 0;
      doc.pose(t, { look: lerp(-0.1, 0.32, easeInOut(prog(t, 1.2, 0.5))), lookUp: 0, smile: 1 });
      doc.mouth.scale.y = talk ? 0.6 + 0.6 * Math.abs(Math.sin(t * 9)) : 1;
      // gesture with right hand (open palm) while explaining
      const g = easeInOut(prog(t, 2.0, 0.5));
      doc.armR.rotation.x = lerp(0, -1.1, g) + Math.sin(t * 3) * 0.12 * g;
      doc.armR.rotation.z = lerp(0.12, -0.25, g);
      // wave at 4.2s
      const w = easeOut(prog(t, 4.0, 0.3)) * (1 - prog(t, 5.4, 0.4));
      doc.armL.rotation.z = lerp(-0.12, -2.5, w);
      doc.armL.rotation.y = Math.sin(t * 10) * 0.35 * w;

      // live feed render
      rig.updateMatrixWorld(true);
      const pw = new THREE.Vector3(); phoneBody.getWorldPosition(pw);
      feedCam.position.copy(pw).add(new THREE.Vector3(0, 0, -0.1));
      doc.head.getWorldPosition(docHead);
      feedCam.lookAt(docHead.x, docHead.y + 0.1, docHead.z);
      rig.visible = false;
      renderer.setRenderTarget(rt);
      renderer.render(scene, feedCam);
      renderer.setRenderTarget(null);
      rig.visible = true;

      // HUD over feed: REC + timer + "Reel"
      const c = hud.ctx; c.clearRect(0, 0, 360, 754);
      const rec = t > 1.5;
      c.fillStyle = 'rgba(0,0,0,0.35)'; rr(c, 20, 26, 150, 48, 24); c.fill();
      if (rec && Math.floor(t * 2) % 2 === 0) { c.fillStyle = '#FF3B3B'; c.beginPath(); c.arc(46, 50, 11, 0, 7); c.fill(); }
      c.fillStyle = '#fff'; c.font = `700 24px ${FONT}`; c.textBaseline = 'middle';
      const sec = rec ? Math.floor((t - 1.5) * 1) : 0;
      c.fillText(`REC 00:${String(sec).padStart(2, '0')}`, 66, 51);
      // record button
      c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.arc(180, 670, 40, 0, 7); c.stroke();
      c.fillStyle = rec ? '#FF3B3B' : '#fff'; c.beginPath();
      if (rec) { rr(c, 162, 652, 36, 36, 8); } else c.arc(180, 670, 32, 0, 7);
      c.fill();
      if (!on) { c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, 0, 360, 754); }
      hud.tex.needsUpdate = true;
      feed.material.color.setScalar(lerp(0.35, 1, on));

      bk.update(t);
      if (K) {
        animIn(K, t, 0.1);
        animIn(L1, t, 0.3, { out: 2.6, outDur: 0.3 });
        animIn(L2, t, 2.9);
      }
      renderer.render(scene, camera);
    },
  };
}
