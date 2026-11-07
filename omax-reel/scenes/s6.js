// S6 — CTA / end card: Omax Media logo reveal + "Let's build your brand. Contact us today."
import {
  THREE, createStage, backdrop, bokeh, canvasPlane, glowSprite, overlay, textOn, animIn,
  prog, easeOut, easeInOut, easeBack, lerp, FONT, BRAND, heartPath,
} from '../lib.js';

function extrude(shape, depth = 0.12) {
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3, curveSegments: 16 });
  g.center();
  return g;
}

export default async function () {
  const { renderer, scene, camera } = createStage({ fov: 30 });
  scene.add(camera);
  backdrop(camera, [[0, '#070B22'], [0.45, '#121A45'], [0.75, '#0E2F45'], [1, '#081424']]);
  renderer.toneMappingExposure = 1.1;

  scene.add(new THREE.HemisphereLight('#9DB4FF', '#101020', 0.9));
  const key = new THREE.DirectionalLight('#FFFFFF', 2.2); key.position.set(3, 4, 6); scene.add(key);
  const rimA = new THREE.DirectionalLight(BRAND.accent, 3); rimA.position.set(-4, 2, -3); scene.add(rimA);
  const rimB = new THREE.DirectionalLight('#B15CFF', 2.5); rimB.position.set(4, -2, -3); scene.add(rimB);
  const sweep = new THREE.PointLight('#FFFFFF', 0, 6, 1.5); scene.add(sweep);

  const logo = new THREE.Group();
  logo.position.set(0, 0.5, 0);
  scene.add(logo);
  // the "O" ring
  const ringMat = new THREE.MeshPhysicalMaterial({ color: BRAND.accent, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.16, 32, 96), ringMat);
  logo.add(ring);
  // play triangle inside the O
  const tri = new THREE.Shape();
  tri.moveTo(-0.16, -0.21); tri.lineTo(0.24, 0); tri.lineTo(-0.16, 0.21); tri.closePath();
  const play = new THREE.Mesh(extrude(tri, 0.1), new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.25, clearcoat: 1 }));
  play.position.x = 0.04;
  logo.add(play);
  const halo = glowSprite(BRAND.accent, 4.2, 0); halo.position.z = -0.4; logo.add(halo);

  // orbiting tokens: heart, chat, star
  const hs = new THREE.Shape();
  hs.moveTo(0, -0.18); hs.bezierCurveTo(-0.05, -0.12, -0.2, -0.02, -0.2, 0.08); hs.bezierCurveTo(-0.2, 0.18, -0.08, 0.22, 0, 0.12);
  hs.bezierCurveTo(0.08, 0.22, 0.2, 0.18, 0.2, 0.08); hs.bezierCurveTo(0.2, -0.02, 0.05, -0.12, 0, -0.18);
  const heart = new THREE.Mesh(extrude(hs, 0.08), new THREE.MeshPhysicalMaterial({ color: BRAND.heart, roughness: 0.3, clearcoat: 1 }));
  const bub = new THREE.Shape(); bub.absellipse(0, 0, 0.2, 0.16, 0, Math.PI * 2);
  const chat = new THREE.Mesh(extrude(bub, 0.08), new THREE.MeshPhysicalMaterial({ color: '#FFC23A', roughness: 0.3, clearcoat: 1 }));
  const st = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 0.08 : 0.2; i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const star = new THREE.Mesh(extrude(st, 0.08), new THREE.MeshPhysicalMaterial({ color: '#7B61FF', roughness: 0.3, clearcoat: 1 }));
  const tokens = [heart, chat, star];
  tokens.forEach((m) => scene.add(m));

  // wordmark + tagline (part of the logo, shown in both versions)
  const word = canvasPlane(2.7, 0.5, 1080, 200);
  {
    const { ctx } = word;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 120px ${FONT}`;
    ctx.letterSpacing = '10px';
    ctx.textAlign = 'left';
    const w1 = ctx.measureText('OMAX').width, gap = 36, w2 = ctx.measureText('MEDIA').width;
    const x0 = (1080 - (w1 + gap + w2)) / 2;
    ctx.fillStyle = '#FFFFFF'; ctx.fillText('OMAX', x0, 104);
    ctx.fillStyle = BRAND.accent; ctx.fillText('MEDIA', x0 + w1 + gap, 104);
    word.tex.needsUpdate = true;
  }
  word.mesh.position.set(0, -0.58, 0.2); scene.add(word.mesh);
  const tag = canvasPlane(2.7, 0.18, 1080, 72);
  {
    const { ctx } = tag;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `600 34px ${FONT}`;
    ctx.letterSpacing = '4px'; ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.fillText('PERSONAL BRANDING  ·  CONTENT  ·  GROWTH', 540, 38);
    tag.tex.needsUpdate = true;
  }
  tag.mesh.position.set(0, -0.95, 0.2); scene.add(tag.mesh);
  // underline sweep
  const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.012), new THREE.MeshBasicMaterial({ color: BRAND.accent, toneMapped: false, transparent: true }));
  line.position.set(0, -0.8, 0.2); scene.add(line);

  const bk = bokeh(scene, { count: 40, colors: ['#FFFFFF', BRAND.accent, '#B15CFF', '#9DB4FF'], area: [-5, 5, -5, 5, -14, -4], size: [0.2, 0.8] });

  const ov = overlay();
  let K, L1, BTN;
  if (textOn()) {
    ov.innerHTML = `
      <div class="block center" style="top:170px">
        <span class="kicker line" id="k">Doctors · Lawyers · Professionals</span>
        <div class="title"><span class="line" id="l1">Let's build your<br><span class="acc">personal brand.</span></span></div>
      </div>
      <div class="block center" style="top:1440px">
        <span class="line" id="btn" style="display:inline-block;background:#fff;color:#0B1230;font-weight:800;font-size:46px;padding:22px 52px 20px;border-radius:999px;box-shadow:0 10px 40px rgba(46,211,183,0.45)">Contact us today <span style="color:${BRAND.accent}">→</span></span>
      </div>`;
    K = ov.querySelector('#k'); L1 = ov.querySelector('#l1'); BTN = ov.querySelector('#btn');
  }

  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  return {
    duration: 5,
    update(t) {
      camera.position.set(Math.sin(t * 0.5) * 0.25, Math.cos(t * 0.4) * 0.12, lerp(10.6, 9.8, easeInOut(prog(t, 0, 5))));
      camera.lookAt(0, 0, 0);

      // ring spins in and settles
      const r = prog(t, 0.0, 1.3);
      const s = Math.max(0.001, easeBack(r));
      logo.scale.setScalar(s);
      ring.rotation.set(lerp(Math.PI * 1.5, 0, easeOut(r)) + Math.sin(t * 1.2) * 0.06 * r, lerp(-Math.PI, 0, easeOut(r)) + Math.sin(t * 0.9) * 0.12 * r, 0);
      play.rotation.y = lerp(Math.PI * 2, 0, easeOut(prog(t, 0.4, 1.0))) + Math.sin(t * 0.9) * 0.12;
      play.scale.setScalar(Math.max(0.001, easeBack(prog(t, 0.5, 0.6))));
      halo.material.opacity = 0.45 * easeOut(prog(t, 0.8, 0.8));
      // light sweep across the ring
      const sw = prog(t, 1.3, 1.0);
      sweep.position.set(lerp(-2.2, 2.2, sw), 1.0, 1.4);
      sweep.intensity = Math.sin(sw * Math.PI) * 30;

      // tokens orbit
      tokens.forEach((m, i) => {
        const tp = easeBack(prog(t, 1.0 + i * 0.15, 0.5));
        const a = t * 0.9 + (i / 3) * Math.PI * 2;
        m.position.set(Math.cos(a) * 0.98, 0.5 + Math.sin(a) * 0.3 + Math.sin(t * 2 + i) * 0.05, Math.sin(a) * 0.7);
        m.rotation.set(Math.sin(t + i) * 0.3, t * 1.5 + i, 0);
        m.scale.setScalar(Math.max(0.001, tp * 0.8));
      });

      // wordmark
      const wp = easeOut(prog(t, 1.2, 0.6));
      word.mesh.material.opacity = wp; word.mesh.position.y = -0.58 - (1 - wp) * 0.15;
      const tp2 = easeOut(prog(t, 1.6, 0.6));
      tag.mesh.material.opacity = tp2; tag.mesh.position.y = -0.95 - (1 - tp2) * 0.1;
      const lp = easeInOut(prog(t, 1.4, 0.7));
      line.scale.x = Math.max(0.001, lp * 1.3); line.material.opacity = lp;

      bk.update(t);
      if (K) {
        animIn(K, t, 0.2); animIn(L1, t, 0.4);
        const bp = prog(t, 2.2, 0.5);
        BTN.style.opacity = easeOut(bp).toFixed(3);
        const pulse = t > 2.8 ? 1 + Math.sin((t - 2.8) * 5) * 0.03 : 1;
        BTN.style.transform = `scale(${(easeBack(bp) * pulse).toFixed(3)})`;
      }
      renderer.render(scene, camera);
    },
  };
}
