// S5 — "Doctors. Lawyers. Everyone. Personal branding is a must today."
// Four professionals drop onto a stepped stage, get verified badges, celebrate.
import {
  THREE, RoundedBoxGeometry, createStage, backdrop, bokeh, makePerson, canvasPlane, mat, glowSprite,
  overlay, textOn, animIn, prog, easeOut, easeInOut, easeBack, lerp, rr, FONT, BRAND, verified, rng,
} from '../lib.js';

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#0B0F2E'], [0.6, '#1F1650'], [1, '#3B1747']]);
  scene.fog = new THREE.Fog('#160F3A', 22, 50);

  scene.add(new THREE.HemisphereLight('#8FA5FF', '#2A1A30', 1.0));
  const key = new THREE.DirectionalLight('#FFE6CC', 2.0); key.position.set(2, 6, 12); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 6, bottom: -3 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(BRAND.accent, 2.0); rim.position.set(-5, 5, -5); scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#FF7AB6', 1.5); rim2.position.set(5, 5, -5); scene.add(rim2);

  // stepped stage
  const stM = mat('#22244F');
  const front = new THREE.Mesh(new RoundedBoxGeometry(7.0, 0.4, 3.0, 2, 0.08), stM); front.position.set(0, -0.2, 0.2);
  const back = new THREE.Mesh(new RoundedBoxGeometry(7.6, 1.2, 1.2, 2, 0.08), stM); back.position.set(0, 0.2, -2.4);
  [front, back].forEach((m) => { m.receiveShadow = m.castShadow = true; scene.add(m); });
  const edgeM = new THREE.MeshBasicMaterial({ color: BRAND.accent, toneMapped: false });
  const e1 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.04, 0.04), edgeM); e1.position.set(0, 0.0, 1.7); scene.add(e1);
  const e2 = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.04, 0.04), edgeM); e2.position.set(0, 0.8, -1.8); scene.add(e2);
  // back wall glow arcs
  const arc = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.05, 6, 80, Math.PI), new THREE.MeshBasicMaterial({ color: '#7B61FF', toneMapped: false, transparent: true, opacity: 0.6 }));
  arc.position.set(0, 0.8, -4); scene.add(arc);
  const arc2 = new THREE.Mesh(new THREE.TorusGeometry(5.0, 0.04, 6, 80, Math.PI), new THREE.MeshBasicMaterial({ color: BRAND.accent, toneMapped: false, transparent: true, opacity: 0.4 }));
  arc2.position.set(0, 0.8, -4.5); scene.add(arc2);

  const people = [
    { role: 'lawyer', label: 'LAWYER', opts: { skin: '#D9A07A', hair: '#1A1414', hairStyle: 'long', seed: 21 }, pos: [-0.72, 0, 0.5], t0: 0.55 },
    { role: 'ca', label: 'CA', opts: { skin: '#B97E5B', hair: '#2A1C17', glasses: true, seed: 33 }, pos: [0.72, 0, 0.5], t0: 0.85 },
    { role: 'doctor', label: 'DOCTOR', opts: { skin: '#C98F6B', hair: '#1E1E22', glasses: true, seed: 9 }, pos: [-2.1, 0, -0.1], t0: 0.25 },
    { role: 'creator', label: 'COACH', opts: { skin: '#E7B48F', hair: '#3A2418', top: '#FF6B6B', seed: 44 }, pos: [2.1, 0, -0.1], t0: 1.15 },
  ];
  for (const p of people) {
    p.person = makePerson({ role: p.role, ...p.opts });
    p.person.root.rotation.y = -p.pos[0] * 0.12;
    scene.add(p.person.root);
    const lab = canvasPlane(1.4, 0.4, 420, 120);
    p.lab = lab;
    scene.add(lab.mesh);
    const spot = glowSprite('#FFFFFF', 2.6, 0.0); spot.position.set(p.pos[0], p.pos[1] + 0.05, p.pos[2]); spot.scale.set(2.2, 0.6, 1);
    p.spot = spot; scene.add(spot);
  }
  function drawLabel(ctx, text, badge) {
    ctx.clearRect(0, 0, 420, 120);
    ctx.font = `800 54px ${FONT}`; ctx.textBaseline = 'middle';
    const tw = ctx.measureText(text).width;
    const w = tw + 70 + (badge > 0 ? 64 : 0), x = (420 - w) / 2;
    ctx.fillStyle = '#FFFFFF'; rr(ctx, x, 14, w, 92, 46); ctx.fill();
    ctx.fillStyle = '#12141C'; ctx.textAlign = 'left'; ctx.fillText(text, x + 35, 63);
    if (badge > 0) {
      ctx.save(); ctx.translate(x + 35 + tw + 40, 60); ctx.scale(badge, badge);
      verified(ctx, 0, 0, 24); ctx.restore();
    }
  }

  // confetti
  const r = rng(77);
  const confColors = ['#2ED3B7', '#FFC23A', '#FF4D6D', '#7B61FF', '#FFFFFF', '#5B8CFF'];
  const confetti = [];
  for (let i = 0; i < 120; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.16), new THREE.MeshBasicMaterial({ color: confColors[i % 6], side: THREE.DoubleSide, toneMapped: false }));
    m.visible = false; scene.add(m);
    confetti.push({ m, x: (r() - 0.5) * 7, z: (r() - 0.5) * 3, delay: r() * 0.6, sp: 1.6 + r() * 1.2, rx: r() * 8, ry: r() * 8, sway: r() * 6 });
  }

  const bk = bokeh(scene, { count: 30, colors: ['#FFFFFF', '#FFC77A', '#9DB4FF', '#FF8FC0'], area: [-9, 9, 1, 12, -24, -10], size: [0.4, 1.2] });

  const ov = overlay();
  let K, L1, S;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block" style="top:170px">
        <span class="kicker line" id="k">Not just doctors</span>
        <div class="title"><span class="line" id="l1">Doctors. Lawyers.<br><span class="acc">Everyone.</span></span></div>
        <div class="sub line" id="s">Personal branding is a <span class="warm">must</span> today.</div>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1'); S = ov.querySelector('#s');
  }

  return {
    duration: 6,
    update(t) {
      const cp = easeInOut(prog(t, 0, 6));
      camera.position.set(Math.sin(t * 0.35) * 0.4, lerp(3.3, 3.1, cp), lerp(21.4, 20.2, cp));
      camera.lookAt(0, 2.95, 0);

      const cheer = easeOut(prog(t, 3.9, 0.35));
      for (const p of people) {
        const d = prog(t, p.t0, 0.55);
        const y = p.pos[1] + (1 - easeOut(d)) * 6;
        const land = prog(t, p.t0 + 0.4, 0.25);
        const squash = land > 0 && land < 1 ? 1 - Math.sin(land * Math.PI) * 0.12 : 1;
        const hop = cheer > 0 ? Math.abs(Math.sin((t - 3.9 + p.t0) * 7)) * 0.2 * cheer : 0;
        p.person.root.position.set(p.pos[0], y + hop, p.pos[2]);
        p.person.root.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
        p.person.root.visible = d > 0;
        p.person.pose(t + p.t0 * 3, { cheer, smile: 1, look: -p.pos[0] * 0.1 });
        p.spot.material.opacity = easeOut(prog(t, p.t0 + 0.4, 0.3)) * 0.5;

        const lp = prog(t, p.t0 + 0.55, 0.4);
        const badge = easeBack(prog(t, 2.4 + p.t0 * 0.5, 0.35));
        drawLabel(p.lab.ctx, p.label, badge); p.lab.tex.needsUpdate = true;
        p.lab.mesh.scale.setScalar(Math.max(0.001, 0.92 * easeBack(lp)));
        p.lab.mesh.position.set(p.pos[0], p.pos[1] + 3.35 + hop + Math.sin(t * 1.5 + p.pos[0]) * 0.04, p.pos[2]);
        p.lab.mesh.lookAt(camera.position);
      }

      for (const c of confetti) {
        const ct = t - 3.9 - c.delay;
        if (ct < 0) { c.m.visible = false; continue; }
        c.m.visible = true;
        c.m.position.set(c.x + Math.sin(ct * 3 + c.sway) * 0.25, 5.5 - ct * c.sp, c.z);
        c.m.visible = c.m.position.y > -0.2;
        c.m.rotation.set(c.rx + ct * 5, c.ry + ct * 4, 0);
      }

      bk.update(t);
      if (K) { animIn(K, t, 0.1); animIn(L1, t, 0.3); animIn(S, t, 2.9); }
      renderer.render(scene, camera);
    },
  };
}
