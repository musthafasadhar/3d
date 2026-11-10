import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { makeCharacter } from './characters.js';

THREE.ColorManagement.enabled = false;

const W = 1080, H = 1920;
const params = new URLSearchParams(location.search);
const RENDER = params.has('render');
const OPT = {
  text: params.get('text') !== '0',     // headlines / panels / Telugu captions
  chars: params.get('chars') !== '0',   // cartoon characters
};
if (RENDER) document.body.classList.add('render');

// ---------------------------------------------------------------- helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, s, d) => clamp((t - s) / d);
const lerp = (a, b, k) => a + (b - a) * k;
const easeOut = (x) => 1 - Math.pow(1 - x, 3);
const easeIn = (x) => x * x * x;
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = (x) => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

function ll(lat, lon, r = 1) {
  const phi = ((lon + 180) / 360) * Math.PI * 2, th = (lat * Math.PI) / 180;
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(th) * r, Math.sin(th) * r, Math.sin(phi) * Math.cos(th) * r);
}

const LOC = {
  USA: [39, -98], WHITEMAN: [38.73, -93.55], NYC: [40.7, -74], LA: [34, -118.2], CHI: [41.9, -87.6], HOU: [29.8, -95.4],
  MIA: [25.8, -80.2], SEA: [47.6, -122.3], DEN: [39.7, -105], WASHINGTON: [38.9, -77.04],
  IRAN: [32.4, 54.3], TEHRAN: [35.69, 51.39], ISFAHAN: [32.65, 51.67], NATANZ: [33.72, 51.73], FORDOW: [34.88, 50.99],
  BANDAR: [27.18, 56.27], SHIRAZ: [29.59, 52.58], TABRIZ: [38.08, 46.29], ARABIAN_SEA: [19.5, 63.5], GULF_OMAN: [24.6, 58.9],
  RIYADH: [24.71, 46.68], DOHA: [25.29, 51.53], ABUDHABI: [24.45, 54.38], MANAMA: [26.23, 50.59], KUWAIT: [29.38, 47.99],
  TELAVIV: [32.08, 34.78], AMMAN: [31.95, 35.93], BAGHDAD: [33.3, 44.4],
  RUSSIA: [55.5, 44], MOSCOW: [55.75, 37.62], UKRAINE: [49.2, 31.2], KYIV: [50.45, 30.52], KHARKIV: [49.99, 36.23], ODESA: [46.48, 30.72],
  LVIV: [49.84, 24.03], DNIPRO: [48.46, 35.04], ZAPOR: [47.84, 35.14], BELGOROD: [50.6, 36.6], ROSTOV: [47.23, 39.7],
  KURSK: [51.73, 36.19], CRIMEA: [44.95, 34.1], BLACKSEA: [44.0, 37.2], BRYANSK: [53.25, 34.37],
  LONDON: [51.5, -0.13], PARIS: [48.86, 2.35], BERLIN: [52.52, 13.4], WARSAW: [52.23, 21.01], ROME: [41.9, 12.5], BRUSSELS: [50.85, 4.35],
};

const ID = {
  USA: '840', IRAN: '364', RUSSIA: '643', UKRAINE: '804', ISRAEL: '376', SAUDI: '682', UAE: '784', QATAR: '634',
  BAHRAIN: '048', KUWAIT: '414', JORDAN: '400', IRAQ: '368',
};
const NATO = ['008', '056', '100', '124', '191', '203', '208', '233', '246', '250', '276', '300', '348', '352', '380', '428', '440', '442',
  '499', '528', '807', '578', '616', '620', '642', '703', '705', '724', '752', '792', '826', '840', '304'];

// ---------------------------------------------------------------- renderer
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02040a);
const camera = new THREE.PerspectiveCamera(32, W / H, 0.01, 200);
const VIEW_SHIFT = -60; // px: push the globe up so characters can stand under it
camera.setViewOffset(W, H, 0, VIEW_SHIFT, W, H);
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
scene.add(keyLight);

const composer = new EffectComposer(renderer);
composer.setPixelRatio(1);
composer.setSize(W, H);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.85, 0.55, 0.62));

// ---------------------------------------------------------------- textures
const loader = new THREE.TextureLoader();
const loadTex = (u) => new Promise((res, rej) => loader.load(u, res, undefined, rej));
const [dayTex, nightTex, topoTex, world] = await Promise.all([
  loadTex('vendor/earth-blue-marble.jpg'), loadTex('vendor/earth-night.jpg'), loadTex('vendor/earth-topology.png'),
  fetch('vendor/countries-50m.json').then((r) => r.json()),
]);
for (const t of [dayTex, nightTex, topoTex]) { t.anisotropy = 8; }

const countries = topojson.feature(world, world.objects.countries).features;
const byId = new Map(countries.map((f) => [f.id, f]));

function eqx(lon, w) { return ((lon + 180) / 360) * w; }
function eqy(lat, h) { return ((90 - lat) / 180) * h; }

function drawLines(ctx, geom, w, h) {
  const lines = geom.type === 'MultiLineString' ? geom.coordinates : [geom.coordinates];
  ctx.beginPath();
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      const [lon, lat] = line[i];
      const x = eqx(lon, w), y = eqy(lat, h);
      if (i === 0 || Math.abs(lon - line[i - 1][0]) > 180) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

// borders texture (static)
const bordersCanvas = document.createElement('canvas');
bordersCanvas.width = 4096; bordersCanvas.height = 2048;
{
  const c = bordersCanvas.getContext('2d');
  c.strokeStyle = 'rgba(255,255,255,1)'; c.lineJoin = 'round';
  c.lineWidth = 2.2;
  drawLines(c, topojson.mesh(world, world.objects.countries, (a, b) => a !== b), 4096, 2048);
  c.lineWidth = 1.4; c.strokeStyle = 'rgba(160,210,255,.8)';
  drawLines(c, topojson.mesh(world, world.objects.countries, (a, b) => a === b), 4096, 2048);
}
const bordersTex = new THREE.CanvasTexture(bordersCanvas);
bordersTex.anisotropy = 8;

// highlight textures (redrawn per scene)
function makeHL() {
  const cv = document.createElement('canvas'); cv.width = 2048; cv.height = 1024;
  const tex = new THREE.CanvasTexture(cv);
  return { cv, tex, key: '' };
}
const HL = [makeHL(), makeHL()];

function fillCountry(ctx, f, w, h) {
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  for (const shift of [-360, 0, 360]) {
    ctx.beginPath();
    for (const poly of polys) {
      for (const ring of poly) {
        let prev = null, off = 0;
        ring.forEach(([lon, lat], i) => {
          if (prev !== null) { const d = lon + off - prev; if (d > 180) off -= 360; else if (d < -180) off += 360; }
          const L = lon + off; prev = L;
          const x = eqx(L + shift, w), y = eqy(lat, h);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
      }
    }
    ctx.fill('evenodd');
    ctx.stroke();
  }
}

function setHighlight(slot, map) {
  const key = JSON.stringify(map);
  const hl = HL[slot];
  if (hl.key === key) return;
  hl.key = key;
  const c = hl.cv.getContext('2d');
  c.clearRect(0, 0, 2048, 1024);
  c.lineJoin = 'round';
  for (const [id, color] of Object.entries(map)) {
    const f = byId.get(id); if (!f) continue;
    c.fillStyle = color; c.strokeStyle = color; c.lineWidth = 3;
    fillCountry(c, f, 2048, 1024);
  }
  hl.tex.needsUpdate = true;
}

// ---------------------------------------------------------------- globe
const globeMat = new THREE.ShaderMaterial({
  uniforms: {
    uDay: { value: dayTex }, uNight: { value: nightTex }, uTopo: { value: topoTex }, uBorders: { value: bordersTex },
    uHL0: { value: HL[0].tex }, uHL1: { value: HL[1].tex }, uA0: { value: 0 }, uA1: { value: 0 }, uBorderAmt: { value: 0.55 },
  },
  vertexShader: `
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `
    uniform sampler2D uDay,uNight,uTopo,uBorders,uHL0,uHL1; uniform float uA0,uA1,uBorderAmt;
    varying vec2 vUv; varying vec3 vN; varying vec3 vV;
    void main(){
      vec3 day = texture2D(uDay, vUv).rgb;
      vec3 night = texture2D(uNight, vUv).rgb;
      float topo = texture2D(uTopo, vUv).r;
      float ndv = max(dot(vN, vV), 0.0);
      vec3 col = day * vec3(0.30, 0.40, 0.55) * (0.55 + 0.6*ndv) + night * vec3(1.25, 0.95, 0.65) + vec3(topo)*0.05;
      float b = texture2D(uBorders, vUv).r;
      col += vec3(0.55, 0.75, 1.0) * b * uBorderAmt;
      vec4 h0 = texture2D(uHL0, vUv); vec4 h1 = texture2D(uHL1, vUv);
      col = mix(col, h0.rgb*0.55 + col*0.5, h0.a*uA0*0.75);
      col = mix(col, h1.rgb*0.55 + col*0.5, h1.a*uA1*0.75);
      col += (h0.rgb*h0.a*uA0 + h1.rgb*h1.a*uA1) * b * 0.8;
      float fres = pow(1.0 - ndv, 2.6);
      col += vec3(0.25, 0.55, 1.0) * fres * 0.85;
      gl_FragColor = vec4(col, 1.0);
    }`,
});
const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 120), globeMat);
scene.add(globe);

const atmo = new THREE.Mesh(
  new THREE.SphereGeometry(1.14, 96, 64),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vV; void main(){ float d = dot(vN, vV); float i = pow(clamp(0.72 + d, 0.0, 1.0), 5.0); gl_FragColor = vec4(vec3(0.25,0.55,1.0)*i*1.1, i); }`,
  }),
);
scene.add(atmo);

// stars
{
  const r = rng(7), n = 2600, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), R = 60;
    pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3);
    const b = 0.35 + r() * 0.65; col.set([b, b, b * (0.9 + r() * 0.2)], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true })));
}

// sprite textures
function radialTex(stops, size = 128) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const c = cv.getContext('2d'); const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, s]) => g.addColorStop(o, s)); c.fillStyle = g; c.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}
const glowTex = radialTex([[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,255,255,.85)'], [0.5, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);
const smokeTex = (() => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d'); const r = rng(3);
  for (let i = 0; i < 26; i++) {
    const x = 34 + r() * 60, y = 34 + r() * 60, rr = 14 + r() * 26;
    const g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(cv);
})();

// ---------------------------------------------------------------- FX world
const fxRoot = new THREE.Group();
scene.add(fxRoot);
let FX = [];          // objects with update(t)
let shake = 0, flash = 0;
const camDir = new THREE.Vector3();
let camDist = 3;

function sprite(color, tex = glowTex, additive = true) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, color, transparent: true, depthWrite: false, depthTest: false,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  }));
  return s;
}
function facing(p) { return p.clone().normalize().dot(camDir); }

function arcCurve(a, b, height) {
  const A = ll(...a), B = ll(...b), om = A.angleTo(B), pts = [];
  const h = height ?? 0.05 + om * 0.32;
  for (let i = 0; i <= 120; i++) {
    const s = i / 120;
    const v = A.clone().multiplyScalar(Math.sin((1 - s) * om)).add(B.clone().multiplyScalar(Math.sin(s * om))).divideScalar(Math.sin(om));
    pts.push(v.normalize().multiplyScalar(1.004 + h * Math.sin(Math.PI * s)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

const trailVS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;

function missileMesh() {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xdde2ea, metalness: 0.55, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a3f48, metalness: 0.4, roughness: 0.5 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0034, 0.032, 12), metal);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.0034, 0.013, 12), dark); nose.position.y = 0.0225;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.0036, 0.0036, 0.003, 12), new THREE.MeshStandardMaterial({ color: 0xb01020 })); band.position.y = 0.009;
  g.add(body, nose, band);
  for (let k = 0; k < 4; k++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.008, 0.0007), dark);
    fin.position.set(Math.cos(k * Math.PI / 2) * 0.0055, -0.0125, Math.sin(k * Math.PI / 2) * 0.0055);
    fin.rotation.y = -k * Math.PI / 2;
    g.add(fin);
  }
  const flame = sprite(0xff8a2a); flame.position.y = -0.024; flame.scale.setScalar(0.03);
  const core = sprite(0xfff2c0); core.position.y = -0.02; core.scale.setScalar(0.014);
  const halo = sprite(0xff5a1a); halo.scale.setScalar(0.07); halo.material.opacity = 0.5;
  g.add(flame, core, halo);
  g.userData = { flame, core, halo };
  return g;
}

const Y = new THREE.Vector3(0, 1, 0);

// A missile: launch at t0 from `from`, impact at t0+dur on `to`
function missile({ from, to, t0, dur = 1.6, height, color = 0xff6a1a, size = 1, boom = 1 }) {
  const curve = arcCurve(from, to, height);
  const tubeGeo = new THREE.TubeGeometry(curve, 240, 0.0042, 8, false);
  const hot = new THREE.Mesh(tubeGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uHead: { value: 0 }, uTrail: { value: 0.35 }, uOp: { value: 1 }, uColor: { value: new THREE.Color(color) } },
    vertexShader: trailVS,
    fragmentShader: `varying vec2 vUv; uniform float uHead,uTrail,uOp; uniform vec3 uColor;
      void main(){ float s=vUv.x; if(s>uHead) discard; float a=smoothstep(uHead-uTrail,uHead,s); a*=a; vec3 c=mix(uColor, vec3(1.0,0.95,0.8), a*a); gl_FragColor=vec4(c, a*uOp); }`,
  }));
  const smoke = new THREE.Mesh(new THREE.TubeGeometry(curve, 240, 0.0065, 8, false), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uHead: { value: 0 }, uOp: { value: 0 } },
    vertexShader: trailVS,
    fragmentShader: `varying vec2 vUv; uniform float uHead,uOp; void main(){ float s=vUv.x; if(s>uHead) discard; float a = 0.35*smoothstep(0.0, 0.08, s)*(0.4+0.6*smoothstep(uHead-0.6,uHead,s)); gl_FragColor=vec4(vec3(0.82,0.84,0.88), a*uOp); }`,
  }));
  const m = missileMesh();
  const launch = sprite(0xffaa55);
  launch.position.copy(ll(...from, 1.01));
  fxRoot.add(smoke, hot, m, launch);
  const ex = boom ? explosion({ at: to, t0: t0 + dur, scale: boom }) : null;
  return {
    update(t) {
      const k = (t - t0) / dur;
      const vis = k > 0;
      hot.visible = smoke.visible = vis;
      m.visible = vis && k < 1;
      const head = clamp(Math.pow(clamp(k), 1.25));
      hot.material.uniforms.uHead.value = head;
      hot.material.uniforms.uOp.value = k < 1 ? 1 : Math.max(0, 1 - (k - 1) * dur / 0.7);
      smoke.material.uniforms.uHead.value = head;
      smoke.material.uniforms.uOp.value = k < 1 ? 1 : Math.max(0, 1 - (t - t0 - dur) / 2.5);
      if (m.visible) {
        const p = curve.getPointAt(head), tan = curve.getTangentAt(head);
        m.position.copy(p); m.quaternion.setFromUnitVectors(Y, tan);
        m.scale.setScalar(size * clamp(camDist / 2.7, 0.7, 2.6));
        const fl = 0.85 + 0.15 * Math.sin(t * 70 + t0 * 13);
        m.userData.flame.scale.setScalar(0.03 * fl);
      }
      const la = t - t0;
      launch.visible = la > 0 && la < 0.8 && facing(launch.position) > 0.05;
      if (launch.visible) { launch.scale.setScalar(0.03 + la * 0.12); launch.material.opacity = 1 - la / 0.8; }
      ex && ex.update(t);
    },
  };
}

function surfaceRing(p, color, additive = true) {
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1, 72), new THREE.MeshBasicMaterial({
    color, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  }));
  ring.position.copy(p.clone().multiplyScalar(1.003));
  ring.lookAt(p.clone().multiplyScalar(2));
  return ring;
}

function explosion({ at, t0, scale = 1 }) {
  const p = ll(...at, 1.0);
  const n = p.clone().normalize();
  const r = rng(Math.floor((at[0] * 1000 + at[1] * 77 + t0 * 131) & 0xffff));
  const tA = new THREE.Vector3().crossVectors(n, Y).normalize(), tB = new THREE.Vector3().crossVectors(n, tA);
  const flashS = sprite(0xfff4d6);
  const balls = Array.from({ length: 6 }, () => ({ s: sprite(r() > 0.5 ? 0xff7a1a : 0xffb030), o: tA.clone().multiplyScalar((r() - 0.5) * 0.04).add(tB.clone().multiplyScalar((r() - 0.5) * 0.04)), d: r() * 0.25 }));
  const smokes = Array.from({ length: 7 }, () => ({ s: sprite(0x4a4440, smokeTex, false), o: tA.clone().multiplyScalar((r() - 0.5) * 0.05).add(tB.clone().multiplyScalar((r() - 0.5) * 0.05)), d: 0.2 + r() * 0.6, rise: 0.04 + r() * 0.06 }));
  const ember = sprite(0xff3010);
  const ring = surfaceRing(p, 0xffc080);
  const ring2 = surfaceRing(p, 0xff4020);
  fxRoot.add(ring, ring2, ember, ...smokes.map((x) => x.s), ...balls.map((x) => x.s), flashS);
  const all = [flashS, ember, ring, ring2, ...balls.map((b) => b.s), ...smokes.map((x) => x.s)];
  return {
    update(t) {
      const a = t - t0;
      const vis = a > 0 && facing(p) > 0.08;
      all.forEach((o) => (o.visible = vis));
      if (!vis) return;
      const S = scale * clamp(camDist / 2.7, 0.8, 2.2);
      // flash
      flashS.position.copy(n.clone().multiplyScalar(1.015));
      flashS.scale.setScalar(S * (0.04 + 0.26 * easeOut(clamp(a / 0.22))));
      flashS.material.opacity = a < 0.06 ? a / 0.06 : Math.max(0, 1 - (a - 0.06) / 0.45);
      // fireballs
      balls.forEach((b) => {
        const aa = a - b.d * 0.3;
        b.s.visible = aa > 0;
        b.s.position.copy(n.clone().multiplyScalar(1.012 + clamp(aa / 1.5) * 0.02)).add(b.o.clone().multiplyScalar(S));
        b.s.scale.setScalar(S * (0.035 + 0.11 * easeOut(clamp(aa / 0.9))));
        b.s.material.opacity = Math.max(0, 1 - aa / 1.7);
      });
      smokes.forEach((x) => {
        const aa = a - x.d;
        x.s.visible = aa > 0;
        x.s.position.copy(n.clone().multiplyScalar(1.015 + x.rise * clamp(aa / 4) * S)).add(x.o.clone().multiplyScalar(S));
        x.s.scale.setScalar(S * (0.05 + 0.16 * easeOut(clamp(aa / 4))));
        x.s.material.opacity = 0.75 * clamp(aa / 0.4) * Math.max(0, 1 - aa / 4.5);
        x.s.material.rotation = x.d * 6 + aa * 0.2;
      });
      ember.position.copy(n.clone().multiplyScalar(1.006));
      ember.scale.setScalar(S * 0.07 * (0.8 + 0.2 * Math.sin(t * 9 + t0)));
      ember.material.opacity = clamp((a - 0.3) / 0.5) * 0.75;
      // shockwaves
      const k = easeOut(clamp(a / 1.1));
      ring.scale.setScalar(S * (0.01 + 0.32 * k)); ring.material.opacity = (1 - k) * 0.95;
      const k2 = easeOut(clamp((a - 0.12) / 1.6));
      ring2.scale.setScalar(S * (0.01 + 0.5 * k2)); ring2.material.opacity = (1 - k2) * 0.6;
      // global camera shake + white flash
      if (a < 0.6) { shake += (1 - a / 0.6) * 0.012 * scale; flash += Math.max(0, 1 - a / 0.25) * 0.18 * scale; }
    },
  };
}

// repeating surface pulse rings
function pulse({ at, t0 = 0, t1 = 1e9, color = 0xff2a2a, period = 1.6, count = 3, radius = 0.25 }) {
  const p = ll(...at);
  const rings = Array.from({ length: count }, () => surfaceRing(p, color));
  const dot = sprite(color); dot.position.copy(p.clone().multiplyScalar(1.01));
  fxRoot.add(...rings, dot);
  return {
    update(t) {
      const on = t > t0 && t < t1;
      const fade = clamp((t - t0) / 0.3) * clamp((t1 - t) / 0.3);
      const S = clamp(camDist / 2.7, 0.8, 2.2);
      rings.forEach((r, i) => {
        r.visible = on;
        const ph = (((t - t0) / period + i / count) % 1 + 1) % 1;
        r.scale.setScalar(S * (0.005 + radius * ph));
        r.material.opacity = (1 - ph) * 0.9 * fade;
      });
      dot.visible = on && facing(p) > 0.05;
      dot.scale.setScalar(S * 0.045 * (1 + 0.2 * Math.sin(t * 8)));
      dot.material.opacity = fade;
    },
  };
}

// dashed "threat" arc that grows from source to target (warnings, not strikes)
function threat({ from, to, t0, dur = 1.0, color = 0xff2a2a, height, width = 1, t1 = 1e9 }) {
  const curve = arcCurve(from, to, height);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.0045 * width, 8, false), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uGrow: { value: 0 }, uTime: { value: 0 }, uOp: { value: 1 }, uColor: { value: new THREE.Color(color) }, uDash: { value: 14 + curve.getLength() * 10 } },
    vertexShader: trailVS,
    fragmentShader: `varying vec2 vUv; uniform float uGrow,uTime,uOp,uDash; uniform vec3 uColor;
      void main(){ float s=vUv.x; if(s>uGrow) discard; float d=step(0.42, fract(s*uDash - uTime*1.6)); float tip=smoothstep(uGrow-0.06,uGrow,s);
      gl_FragColor=vec4(mix(uColor, vec3(1.0), tip*0.7), (d*0.9+tip)*uOp); }`,
  }));
  const tip = sprite(color);
  const hit = pulse({ at: to, t0: t0 + dur, t1, color, period: 1.2, count: 2, radius: 0.12 });
  fxRoot.add(mesh, tip);
  return {
    update(t) {
      const k = easeInOut(clamp((t - t0) / dur));
      mesh.visible = t > t0 && t < t1;
      tip.visible = mesh.visible && k < 1;
      const u = mesh.material.uniforms;
      u.uGrow.value = k; u.uTime.value = t; u.uOp.value = clamp((t1 - t) / 0.3);
      if (tip.visible) { tip.position.copy(curve.getPointAt(k)); tip.scale.setScalar(0.05 * clamp(camDist / 2.7, 0.8, 2.2)); }
      hit.update(t);
    },
  };
}

// ---------------------------------------------------------------- UI (DOM)
const ui = document.getElementById('ui');
let UIA = []; // per-frame DOM animators
function el(html, cls = '', style = {}, parent = ui) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  d.innerHTML = html;
  Object.assign(d.style, style);
  parent.appendChild(d);
  return d;
}
// generic enter / exit animation for an element
function anim(node, { t0 = 0, t1 = 1e9, from = 'pop', dur = 0.45, base = '' } = {}) {
  UIA.push((t) => {
    const k = clamp((t - t0) / dur), o = clamp((t1 - t) / 0.25);
    let tr = '';
    if (from === 'pop') tr = `scale(${Math.max(0, backOut(k))})`;
    else if (from === 'left') tr = `translateX(${(1 - easeOut(k)) * -1200}px)`;
    else if (from === 'right') tr = `translateX(${(1 - easeOut(k)) * 1200}px)`;
    else if (from === 'up') tr = `translateY(${(1 - backOut(k)) * 260}px)`;
    else if (from === 'down') tr = `translateY(${(1 - easeOut(k)) * -260}px)`;
    else if (from === 'slam') tr = `scale(${lerp(3.2, 1, easeIn(k))}) rotate(${lerp(-25, -8, k)}deg)`;
    node.style.transform = `${base} ${tr}`;
    node.style.opacity = (t < t0 ? 0 : Math.min(from === 'slam' ? clamp(k * 3) : clamp(k * 2.5), o)).toFixed(3);
  });
  return node;
}

function hud(coords) {
  if (!OPT.text) return;
  const tag = el('<div class="a">BREAKING</div><div class="b"><span class="dot"></span>LIVE</div>', 'hud-tag');
  const dot = tag.querySelector('.dot');
  const c = el(coords, 'coords');
  ['tl', 'tr', 'bl', 'br'].forEach((k) => el('', `corner ${k}`));
  anim(tag, { t0: 0.05, from: 'left', dur: 0.4 });
  anim(c, { t0: 0.15, from: 'right', dur: 0.4 });
  UIA.push((t) => { dot.style.opacity = Math.sin(t * 6) > 0 ? 1 : 0.15; });
}

function headline(items, top = 330) {
  if (!OPT.text) return null;
  const box = el('', 'headline', { top: top + 'px' });
  items.forEach((it) => {
    const n = el(it.html, it.cls, {}, box);
    anim(n, { t0: it.t0, t1: it.t1, from: it.from || 'pop', dur: it.dur || 0.45 });
  });
  return box;
}

const labels = [];
function label(text, at, { cls = '', t0 = 0, t1 = 1e9 } = {}) {
  const n = el(text, 'label ' + cls);
  const p = ll(...at, 1.01);
  labels.push({ n, p, t0, t1 });
}
function updateLabels(t) {
  for (const L of labels) {
    const f = facing(L.p);
    const v = L.p.clone().project(camera);
    const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
    const k = clamp((t - L.t0) / 0.35);
    const o = Math.min(k, clamp((L.t1 - t) / 0.25), clamp((f - 0.1) / 0.15));
    L.n.style.left = x + 'px'; L.n.style.top = y + 'px';
    L.n.style.opacity = o.toFixed(3);
    L.n.style.transform = `translate(-50%, -130%) scale(${0.6 + 0.4 * backOut(k)})`;
  }
}

function character(kind, { left, top, t0, t1 = 1e9, scale = 1, mirror = false, talk = () => 0, angry = () => 0, from = 'up' }) {
  if (!OPT.chars) return null;
  const c = makeCharacter(kind, { mirror });
  ui.appendChild(c.el);
  Object.assign(c.el.style, { left: left + 'px', top: top + 'px' });
  anim(c.el, { t0, t1, from, dur: 0.55, base: `scale(${scale})` });
  UIA.push((t) => {
    const bob = Math.sin(t * 2.4 + left) * 6;
    c.el.querySelector('svg').style.translate = `0 ${bob}px`;
    c.update(t, { talk: talk(t), angry: angry(t) });
  });
  return c;
}

const NUKE_SVG = `<svg viewBox="-100 -100 200 200" class="nuke-svg" width="300" height="300">
  <circle r="96" fill="#ffd400" stroke="#111" stroke-width="8"/>
  <g fill="#111">
    <circle r="14"/>
    <path d="M0 0 L -38 -66 A 76 76 0 0 1 38 -66 Z" transform="rotate(0)"/>
    <path d="M0 0 L -38 -66 A 76 76 0 0 1 38 -66 Z" transform="rotate(120)"/>
    <path d="M0 0 L -38 -66 A 76 76 0 0 1 38 -66 Z" transform="rotate(240)"/>
  </g><circle r="22" fill="#ffd400"/><circle r="14" fill="#111"/></svg>`;
const WARN_ICO = `<svg class="ico" viewBox="0 0 100 100"><path d="M50 6 L96 90 L4 90 Z" fill="#ff2436" stroke="#fff" stroke-width="5" stroke-linejoin="round"/><rect x="45" y="34" width="10" height="32" fill="#fff"/><rect x="45" y="72" width="10" height="10" fill="#fff"/></svg>`;

// ---------------------------------------------------------------- camera keyframes
let camKeys = [];
function cam(keys) { camKeys = keys; }
function applyCamera(t) {
  let k0 = camKeys[0], k1 = camKeys[camKeys.length - 1];
  for (let i = 0; i < camKeys.length - 1; i++) if (t >= camKeys[i][0] && t <= camKeys[i + 1][0]) { k0 = camKeys[i]; k1 = camKeys[i + 1]; break; }
  if (t > camKeys[camKeys.length - 1][0]) k0 = k1;
  const span = k1[0] - k0[0];
  const e = span > 0 ? easeInOut(clamp((t - k0[0]) / span)) : 1;
  let dl = k1[2] - k0[2]; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
  const lat = lerp(k0[1], k1[1], e), lon = k0[2] + dl * e;
  // logarithmic zoom feels natural on big moves; small arc lift on long flights
  const lift = span > 0 ? Math.sin(Math.PI * e) * Math.min(1.6, Math.abs(dl) / 45 + Math.abs(k1[1] - k0[1]) / 60) : 0;
  const dist = Math.exp(lerp(Math.log(k0[3]), Math.log(k1[3]), e)) + lift;
  camera.position.copy(ll(lat, lon, dist));
  camera.up.set(0, 1, 0);
  camera.lookAt(0, 0, 0);
  camDist = dist;
  camDir.copy(camera.position).normalize();
  keyLight.position.copy(camera.position).add(new THREE.Vector3(1, 2, 0));
}

// ---------------------------------------------------------------- scenes
let hlAmp = [() => 0, () => 0];
const SCENES = [
  {
    id: '01-midterms', dur: 5.5,
    build() {
      cam([[0, 28, -55, 9], [2.4, 39, -97, 3.0], [5.5, 39.5, -101, 2.85]]);
      setHighlight(0, { [ID.USA]: '#2f7bff' });
      setHighlight(1, { [ID.USA]: '#ff2436' });
      hlAmp = [(t) => clamp((t - 1.2) / 0.6) * (0.75 + 0.25 * Math.sin(t * 5)) * (1 - clamp((t - 4.3) / 0.6)), (t) => clamp((t - 4.3) / 0.6) * (0.8 + 0.2 * Math.sin(t * 9))];
      hud('LAT 38.90 N<br>LON 77.03 W');
      [['NYC', 0xff2436], ['LA', 0x2f7bff], ['CHI', 0x2f7bff], ['HOU', 0xff2436], ['MIA', 0xff2436], ['SEA', 0x2f7bff], ['DEN', 0xff2436], ['WASHINGTON', 0xffffff]]
        .forEach(([c, col], i) => FX.push(pulse({ at: LOC[c], t0: 1.6 + i * 0.12, color: col, period: 1.4, count: 2, radius: 0.12 })));
      label('🇺🇸 USA', [41.5, -100], { cls: 'blue', t0: 1.8 });
      label('WASHINGTON D.C.', LOC.WASHINGTON, { cls: 'city', t0: 2.3 });
      headline([
        { html: 'US MIDTERM', cls: 'hl-main white', t0: 0.35 },
        { html: 'ELECTIONS', cls: 'hl-main white', t0: 0.55 },
        { html: 'మిడ్ టర్మ్ ఎలక్షన్స్ కంప్లీట్', cls: 'hl-sub', t0: 1.0, from: 'up' },
      ]);
      if (OPT.text) {
        const stamp = el('✔ COMPLETE', 'hl-main green', { left: '330px', top: '790px', fontSize: '96px', border: '6px solid #fff', borderRadius: '10px' });
        anim(stamp, { t0: 1.7, from: 'slam', dur: 0.28 });
        const next = el('NEXT ➜ 🇮🇷 IRAN', 'hl-main', { left: '230px', top: '940px', fontSize: '80px' });
        anim(next, { t0: 4.2, from: 'left', dur: 0.4 });
      }
      character('trump', { left: 300, top: 1020, t0: 2.4, talk: (t) => (t > 2.8 && t < 4.8 ? 1 : 0) });
      return (t) => { flash += Math.max(0, 1 - Math.abs(t - 1.95) / 0.12) * 0.25; };
    },
  },
  {
    id: '02-trump-vs-iran', dur: 7.5,
    build() {
      cam([[0, 39, -97, 3.0], [1.2, 34, -50, 6.5], [3.0, 29.5, 53, 2.75], [7.5, 30.5, 50, 2.6]]);
      setHighlight(0, { [ID.USA]: '#2f7bff' });
      setHighlight(1, { [ID.IRAN]: '#ff2436' });
      hlAmp = [(t) => 1 - clamp((t - 1) / 0.8), (t) => clamp((t - 2.4) / 0.6) * (0.75 + 0.25 * Math.sin(t * 7))];
      hud('LAT 35.69 N<br>LON 51.39 E');
      FX.push(missile({ from: LOC.WHITEMAN, to: LOC.FORDOW, t0: 0.15, dur: 3.1, height: 0.55, size: 1.4, boom: 1.6 }));
      const shots = [
        [LOC.ARABIAN_SEA, LOC.TEHRAN], [LOC.GULF_OMAN, LOC.ISFAHAN], [LOC.ARABIAN_SEA, LOC.BANDAR], [LOC.GULF_OMAN, LOC.NATANZ],
        [LOC.ARABIAN_SEA, LOC.SHIRAZ], [LOC.GULF_OMAN, LOC.TABRIZ], [LOC.ARABIAN_SEA, LOC.ISFAHAN], [LOC.GULF_OMAN, LOC.TEHRAN],
      ];
      shots.forEach(([a, b], i) => FX.push(missile({ from: a, to: b, t0: 2.7 + i * 0.32, dur: 1.25 + (i % 3) * 0.15 })));
      FX.push(pulse({ at: LOC.ARABIAN_SEA, t0: 2.4, color: 0x2f7bff, radius: 0.1, count: 2 }));
      label('🇺🇸 USA', [41.5, -100], { cls: 'blue', t0: 0.1, t1: 1.3 });
      label('🇮🇷 IRAN', LOC.IRAN, { cls: 'red', t0: 2.6 });
      label('⚓ US NAVY', LOC.ARABIAN_SEA, { cls: 'city blue', t0: 2.5 });
      label('TEHRAN', LOC.TEHRAN, { cls: 'city', t0: 4.4 });
      label('ISFAHAN', LOC.ISFAHAN, { cls: 'city', t0: 4.8 });
      headline([
        { html: 'TRUMP <span style="position:static;color:#ffe14a">VS</span> IRAN', cls: 'hl-main', t0: 0.3 },
        { html: 'WAR BEGINS', cls: 'hl-main black', t0: 3.3, from: 'slam', dur: 0.28 },
        { html: 'ట్రంప్ యుద్ధం స్టార్ట్ చేశారు', cls: 'hl-sub', t0: 3.8, from: 'up' },
      ]);
      character('trump', { left: -40, top: 1040, t0: 0.9, scale: 0.92, talk: (t) => (t > 1.2 && t < 3.0 ? 1 : 0), angry: () => 0.6 });
      character('iran', { left: 650, top: 1040, t0: 2.6, scale: 0.92, mirror: true, angry: (t) => clamp((t - 3.2) / 0.4), talk: (t) => (t > 4.5 ? 0.8 : 0) });
      return () => {};
    },
  },
  {
    id: '03-iran-warning', dur: 7,
    build() {
      cam([[0, 30.5, 50, 2.6], [1.4, 28, 46, 3.25], [7, 28.5, 44, 3.1]]);
      setHighlight(0, { [ID.IRAN]: '#ff2436' });
      const host = '#ffb400';
      setHighlight(1, { [ID.ISRAEL]: host, [ID.SAUDI]: host, [ID.UAE]: host, [ID.QATAR]: host, [ID.BAHRAIN]: host, [ID.KUWAIT]: host, [ID.JORDAN]: host, [ID.IRAQ]: host });
      hlAmp = [(t) => 0.6 + 0.2 * Math.sin(t * 8), (t) => clamp((t - 1.6) / 0.8) * (0.5 + 0.15 * Math.sin(t * 4))];
      hud('IRAN • WARNING');
      FX.push(pulse({ at: LOC.TEHRAN, t0: 0.2, color: 0xff2436, radius: 0.4, period: 2, count: 2 }));
      const tg = ['TELAVIV', 'RIYADH', 'ABUDHABI', 'DOHA', 'MANAMA', 'KUWAIT', 'AMMAN', 'BAGHDAD'];
      tg.forEach((c, i) => FX.push(threat({ from: LOC.TEHRAN, to: LOC[c], t0: 1.6 + i * 0.16, dur: 0.9, height: 0.06 })));
      label('🇮🇷 IRAN', LOC.IRAN, { cls: 'red', t0: 0.3 });
      label('ISRAEL', LOC.TELAVIV, { cls: 'city amber', t0: 2.6 });
      label('SAUDI', LOC.RIYADH, { cls: 'city amber', t0: 2.75 });
      label('UAE', LOC.ABUDHABI, { cls: 'city amber', t0: 2.9 });
      label('QATAR', [25.6, 51.2], { cls: 'city amber', t0: 3.05 });
      label('IRAQ', LOC.BAGHDAD, { cls: 'city amber', t0: 3.2 });
      if (OPT.text) {
        const panel = el(`<div class="ph">${WARN_ICO}IRAN'S WARNING</div>
          <div class="pb">Support the USA &amp; attack Iran →<br><b>you get dragged DIRECTLY into the war</b></div>
          <div class="pt">ఎవరైనా యూఎస్ఏకి సపోర్ట్ చేస్తూ మా మీద అటాక్ చేస్తే డైరెక్ట్‌గా వార్‌లోకి లాగుతాం</div>`, 'panel', { top: '320px' });
        anim(panel, { t0: 0.4, from: 'down', dur: 0.5 });
        const ico = panel.querySelector('.ico');
        UIA.push((t) => { ico.style.transform = `scale(${1 + 0.12 * Math.max(0, Math.sin(t * 10))})`; });
      }
      character('iran', { left: 305, top: 1040, t0: 0.9, angry: () => 1, talk: (t) => (t > 1.3 && t < 5.8 ? 1 : 0.15) });
      return (t) => { redPulse = 0.2 + 0.3 * Math.max(0, Math.sin(t * 5)); };
    },
  },
  {
    id: '04-russia-vs-ukraine', dur: 7.5,
    build() {
      cam([[0, 28.5, 44, 3.1], [1.8, 49.5, 35, 2.7], [7.5, 49.8, 33.2, 2.55]]);
      setHighlight(0, { [ID.RUSSIA]: '#ff2436' });
      setHighlight(1, { [ID.UKRAINE]: '#ffd500' });
      hlAmp = [(t) => clamp((t - 1) / 0.6) * (0.7 + 0.2 * Math.sin(t * 6)), (t) => clamp((t - 1.3) / 0.6) * (0.55 + 0.25 * Math.sin(t * 3))];
      hud('LAT 50.45 N<br>LON 30.52 E');
      const src = ['BELGOROD', 'ROSTOV', 'KURSK', 'CRIMEA', 'BLACKSEA', 'BRYANSK'];
      const dst = ['KYIV', 'KHARKIV', 'ODESA', 'DNIPRO', 'LVIV', 'ZAPOR', 'KYIV', 'KHARKIV', 'ODESA', 'KYIV', 'DNIPRO'];
      dst.forEach((d, i) => FX.push(missile({ from: LOC[src[i % src.length]], to: LOC[d], t0: 1.9 + i * 0.36, dur: 1.1 + (i % 4) * 0.2, height: 0.05 + (i % 3) * 0.025, size: 0.85 })));
      label('🇷🇺 RUSSIA', [53.5, 42], { cls: 'red', t0: 1.4 });
      label('🇺🇦 UKRAINE', [48.6, 29.5], { cls: 'amber', t0: 1.6 });
      label('KYIV', LOC.KYIV, { cls: 'city', t0: 3.0 });
      label('KHARKIV', LOC.KHARKIV, { cls: 'city', t0: 3.4 });
      label('ODESA', LOC.ODESA, { cls: 'city', t0: 3.8 });
      headline([
        { html: 'RUSSIA <span style="position:static;color:#ffe14a">VS</span> UKRAINE', cls: 'hl-main sm', t0: 0.3 },
        { html: 'MISSILE ATTACK', cls: 'hl-main black', t0: 2.4, from: 'slam', dur: 0.28 },
        { html: 'రష్యా ఉక్రెయిన్ మీద కూడా దాడి చేసింది', cls: 'hl-sub', t0: 2.9, from: 'up' },
      ]);
      character('putin', { left: -40, top: 1040, t0: 0.8, scale: 0.92, angry: () => 0.7, talk: (t) => (t > 1.1 && t < 2.6 ? 1 : 0) });
      character('zelensky', { left: 650, top: 1040, t0: 1.3, scale: 0.92, mirror: true, angry: (t) => clamp((t - 3) / 0.5), talk: (t) => (t > 4.2 && t < 6.4 ? 1 : 0) });
      return () => {};
    },
  },
  {
    id: '05-nuclear-warning-nato', dur: 8,
    build() {
      cam([[0, 49.8, 33.2, 2.55], [1.8, 52, 22, 3.7], [8, 50, 10, 4.2]]);
      const nato = {}; NATO.forEach((id) => (nato[id] = '#2f7bff'));
      const natoRed = {}; NATO.forEach((id) => (natoRed[id] = '#ff2436'));
      setHighlight(0, { ...nato, [ID.RUSSIA]: '#ff2436', [ID.UKRAINE]: '#ffd500' });
      setHighlight(1, { ...natoRed, [ID.RUSSIA]: '#ff2436', [ID.UKRAINE]: '#ffd500' });
      hlAmp = [(t) => clamp((t - 0.6) / 0.6) * (1 - clamp((t - 4.2) / 0.5)) * 0.8, (t) => clamp((t - 4.2) / 0.5) * (0.6 + 0.3 * Math.max(0, Math.sin(t * 9)))];
      hud('DEFCON ALERT');
      FX.push(pulse({ at: LOC.MOSCOW, t0: 0.3, color: 0xffd400, radius: 0.7, period: 2.2, count: 3 }));
      FX.push(pulse({ at: LOC.MOSCOW, t0: 0.5, color: 0xff2436, radius: 0.35, period: 1.1, count: 2 }));
      const tg = ['WARSAW', 'BERLIN', 'BRUSSELS', 'PARIS', 'LONDON', 'ROME', 'WASHINGTON'];
      tg.forEach((c, i) => FX.push(threat({ from: LOC.MOSCOW, to: LOC[c], t0: 2.4 + i * 0.22, dur: c === 'WASHINGTON' ? 1.8 : 1.1, width: 1.6, height: c === 'WASHINGTON' ? 0.45 : 0.12 })));
      label('☢ MOSCOW', LOC.MOSCOW, { cls: 'red', t0: 0.6 });
      label('NATO', [50.5, 10.5], { cls: 'blue', t0: 1.2 });
      label('🇺🇦', [49.2, 31.2], { cls: 'city amber', t0: 1.0 });
      ['LONDON', 'PARIS', 'BERLIN', 'WARSAW', 'ROME'].forEach((c, i) => label(c, LOC[c], { cls: 'city', t0: 3.4 + i * 0.2 }));
      if (OPT.text) {
        const nuke = el(NUKE_SVG, 'nuke', { left: '410px', top: '290px', transform: 'scale(.85)' });
        anim(nuke, { t0: 0.3, from: 'pop', dur: 0.5, base: 'scale(.85)' });
        const svg = nuke.querySelector('svg');
        UIA.push((t) => { svg.style.transform = `rotate(${t * 40}deg)`; svg.style.filter = `drop-shadow(0 0 ${20 + 20 * Math.max(0, Math.sin(t * 6))}px rgba(255,212,0,.9))`; });
      }
      headline([
        { html: 'NUCLEAR WARNING', cls: 'hl-main black', t0: 0.7, from: 'slam', dur: 0.3 },
        { html: 'TO NATO COUNTRIES', cls: 'hl-main sm', t0: 1.3 },
        { html: 'నాటో కంట్రీస్ ఉక్రెయిన్‌కి సపోర్ట్ చేస్తే న్యూక్లియర్ అటాక్స్', cls: 'hl-sub', t0: 1.9, from: 'up' },
      ], 650);
      character('putin', { left: 305, top: 1040, t0: 1.0, angry: () => 1, talk: (t) => (t > 1.4 && t < 6.6 ? 1 : 0.1) });
      return (t) => { redPulse = clamp((t - 2) / 0.5) * (0.25 + 0.55 * Math.max(0, Math.sin(t * 7))); };
    },
  },
  {
    id: '06-ww3-not-yet', dur: 7.5,
    build() {
      cam([[0, 50, 10, 4.2], [2.5, 40, 30, 4.9], [7.5, 37, 42, 5.3]]);
      setHighlight(0, { [ID.RUSSIA]: '#ff2436', [ID.IRAN]: '#ff2436' });
      const b = {}; NATO.forEach((id) => (b[id] = '#2f7bff')); b[ID.UKRAINE] = '#ffd500'; b[ID.ISRAEL] = '#2f7bff';
      setHighlight(1, b);
      hlAmp = [(t) => 0.7 + 0.3 * Math.sin(t * 6), () => 0.45];
      hud('WORLD • STATUS');
      FX.push(pulse({ at: LOC.TEHRAN, t0: 0.2, color: 0xff2436, radius: 0.35, period: 1.5 }));
      FX.push(pulse({ at: LOC.KYIV, t0: 0.4, color: 0xff2436, radius: 0.35, period: 1.5 }));
      FX.push(threat({ from: LOC.WASHINGTON, to: LOC.TEHRAN, t0: 0.6, dur: 1.4, height: 0.4, color: 0x2f7bff }));
      FX.push(threat({ from: LOC.MOSCOW, to: LOC.KYIV, t0: 0.9, dur: 0.8, height: 0.08 }));
      FX.push(threat({ from: LOC.MOSCOW, to: LOC.BRUSSELS, t0: 1.2, dur: 1.0, height: 0.12 }));
      FX.push(threat({ from: LOC.TEHRAN, to: LOC.TELAVIV, t0: 1.4, dur: 0.8, height: 0.06 }));
      label('🇮🇷 IRAN', LOC.IRAN, { cls: 'red', t0: 1.0 });
      headline([
        { html: 'WORLD WAR 3?', cls: 'hl-main', t0: 0.3, from: 'slam', dur: 0.3 },
        { html: '✋ NOT STARTED YET', cls: 'hl-main green sm', t0: 1.8 },
        { html: 'కంగారు పడాల్సిన అవసరం లేదు', cls: 'hl-sub', t0: 2.3, from: 'up' },
        { html: '⚠ BUT IT IS DANGEROUS', cls: 'hl-main black sm', t0: 3.6, from: 'slam', dur: 0.28 },
      ]);
      if (OPT.text) {
        const m = el('<div class="mt"><span>DANGER LEVEL</span><span class="pct">0%</span></div><div class="bar"><div class="fill"></div><div class="ticks"></div></div>', 'meter', { top: '1000px' });
        anim(m, { t0: 4.1, from: 'up', dur: 0.4 });
        const fill = m.querySelector('.fill'), pct = m.querySelector('.pct');
        UIA.push((t) => { const v = 82 * easeOut(P(t, 4.4, 1.6)); fill.style.width = v + '%'; pct.textContent = Math.round(v) + '%'; pct.style.color = v > 60 ? '#ff4050' : '#fff'; });
        UIA.push((t) => { const g = t > 0.3 && t < 0.9 ? Math.sin(t * 90) * 8 : 0; const h = ui.querySelector('.headline'); if (h) h.style.translate = `${g}px 0`; });
      }
      character('trump', { left: -20, top: 1170, t0: 4.6, scale: 0.78, talk: () => 0.3 });
      character('putin', { left: 630, top: 1170, t0: 4.8, scale: 0.78, mirror: true, talk: () => 0.3 });
      return (t) => { redPulse = clamp((t - 3.6) / 0.4) * 0.35 * (0.5 + 0.5 * Math.sin(t * 5)); };
    },
  },
];

// ---------------------------------------------------------------- frame driver
let current = -1, sceneUpdate = () => {};
let redPulse = 0;
const flashEl = document.getElementById('flash'), redEl = document.getElementById('redpulse');

function teardown() {
  fxRoot.traverse((o) => { o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); });
  fxRoot.clear();
  FX = []; UIA = []; labels.length = 0; ui.innerHTML = '';
}

function renderFrame(i, t) {
  if (i !== current) { teardown(); current = i; sceneUpdate = SCENES[i].build(); }
  shake = 0; flash = 0; redPulse = 0;
  applyCamera(t);
  sceneUpdate(t);
  FX.forEach((f) => f.update(t));
  globeMat.uniforms.uA0.value = hlAmp[0](t);
  globeMat.uniforms.uA1.value = hlAmp[1](t);
  if (shake > 0) {
    const s = Math.min(shake, 0.03) * camDist;
    camera.translateX(Math.sin(t * 91.7) * s); camera.translateY(Math.cos(t * 77.3) * s);
  }
  updateLabels(t);
  UIA.forEach((f) => f(t));
  flashEl.style.opacity = Math.min(0.55, flash).toFixed(3);
  redEl.style.opacity = redPulse.toFixed(3);
  composer.render();
}

window.SCENES = SCENES.map((s) => ({ id: s.id, dur: s.dur }));
window.renderFrame = renderFrame;
await document.fonts.load('120px Anton');
await document.fonts.load('900 58px TeluguX', 'మిడ్');
renderFrame(0, 0);
window.__ready = true;

// ---------------------------------------------------------------- live preview
if (!RENDER) {
  const stage = document.getElementById('stage');
  const fit = () => { const s = Math.min(innerWidth / W, innerHeight / H); stage.style.transform = `scale(${s})`; };
  addEventListener('resize', fit); fit();
  const ctl = document.getElementById('controls');
  let si = 0, t0 = performance.now(), playAll = true;
  const btns = SCENES.map((s, i) => {
    const b = document.createElement('button'); b.textContent = s.id;
    b.onclick = () => { si = i; t0 = performance.now(); playAll = false; }; ctl.appendChild(b); return b;
  });
  const all = document.createElement('button'); all.textContent = '▶ play all';
  all.onclick = () => { si = 0; t0 = performance.now(); playAll = true; }; ctl.appendChild(all);
  const loop = () => {
    let t = (performance.now() - t0) / 1000;
    if (t > SCENES[si].dur) { if (playAll) si = (si + 1) % SCENES.length; t0 = performance.now(); t = 0; }
    btns.forEach((b, i) => b.classList.toggle('on', i === si));
    renderFrame(si, t);
    requestAnimationFrame(loop);
  };
  loop();
}
