// Stylized cartoon characters drawn as SVG "puppets".
// Each one exposes update(t, opts) so animation is fully deterministic (frame-exact renders).

const SVGNS = 'http://www.w3.org/2000/svg';

function suitBody(p, suit, suitDark, lapel, tie, tieDark, shirt = '#f4f5f8') {
  return `
  <defs>
    <linearGradient id="${p}suit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${suit}"/><stop offset="1" stop-color="${suitDark}"/></linearGradient>
    <linearGradient id="${p}tie" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${tie}"/><stop offset="1" stop-color="${tieDark}"/></linearGradient>
  </defs>
  <path d="M8 380 C 18 308, 60 284, 110 271 L 190 271 C 240 284, 282 308, 292 380 Z" fill="url(#${p}suit)"/>
  <path d="M112 272 L150 346 L188 272 Z" fill="${shirt}"/>
  <path d="M110 272 L150 350 L128 380 L92 300 Z" fill="${lapel}"/>
  <path d="M190 272 L150 350 L172 380 L208 300 Z" fill="${lapel}"/>
  <path d="M141 276 L159 276 L156 293 L144 293 Z" fill="${tieDark}"/>
  <path d="M144 293 L156 293 L165 380 L135 380 Z" fill="url(#${p}tie)"/>
  <path d="M114 266 L150 291 L130 302 Z" fill="${shirt}"/>
  <path d="M186 266 L150 291 L170 302 Z" fill="${shirt}"/>
  <path d="M40 330 C 60 320, 80 318, 96 322" stroke="rgba(255,255,255,.08)" stroke-width="6" fill="none"/>`;
}

function skinGrad(p, light, dark) {
  return `<defs><radialGradient id="${p}skin" cx="45%" cy="38%" r="70%"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></radialGradient></defs>`;
}

const LIB = {
  trump: {
    plate: '🇺🇸 TRUMP', plateClass: 'blue',
    svg: (p) => `
    ${suitBody(p, '#24315c', '#141b36', '#18213f', '#d8142f', '#9e0c20')}
    <rect x="102" y="300" width="14" height="9" fill="#c8102e"/><rect x="102" y="300" width="6" height="5" fill="#2340a0"/>
    ${skinGrad(p, '#f7b878', '#dc8442')}
    <defs><linearGradient id="${p}hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0a6"/><stop offset=".5" stop-color="#f2cd62"/><stop offset="1" stop-color="#d9a53a"/></linearGradient></defs>
    <path d="M118 228 L182 228 L188 278 L112 278 Z" fill="#e3924e"/>
    <g class="head">
      <ellipse cx="80" cy="172" rx="13" ry="21" fill="#e58f4c"/><ellipse cx="220" cy="172" rx="13" ry="21" fill="#e58f4c"/>
      <path d="M150 80 C 206 80, 224 122, 224 166 C 224 214, 204 252, 150 260 C 96 252, 76 214, 76 166 C 76 122, 94 80, 150 80 Z" fill="url(#${p}skin)"/>
      <ellipse cx="121" cy="160" rx="22" ry="12" fill="#fbd9ad" opacity=".85"/><ellipse cx="179" cy="160" rx="22" ry="12" fill="#fbd9ad" opacity=".85"/>
      <ellipse cx="110" cy="202" rx="16" ry="9" fill="#e2702e" opacity=".35"/><ellipse cx="190" cy="202" rx="16" ry="9" fill="#e2702e" opacity=".35"/>
      <g class="eyes"><ellipse cx="121" cy="161" rx="8" ry="4.5" fill="#2e2018"/><ellipse cx="179" cy="161" rx="8" ry="4.5" fill="#2e2018"/>
        <circle cx="123" cy="159.5" r="1.6" fill="#fff"/><circle cx="181" cy="159.5" r="1.6" fill="#fff"/></g>
      <path class="brow" d="M101 146 Q121 136 140 145" stroke="#e9c766" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path class="brow" d="M160 145 Q179 136 199 146" stroke="#e9c766" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M150 162 Q160 190 152 199 Q145 202 139 196" stroke="#c4763a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M116 238 Q150 254 184 238" stroke="#c97436" stroke-width="3" fill="none" opacity=".45"/>
      <g class="mouth" transform="translate(150 223)"><ellipse rx="17" ry="8.5" fill="#c4614c"/><ellipse class="inner" rx="9" ry="3" fill="#4d1515"/></g>
      <path d="M82 150 C 76 112, 92 84, 122 72 L 130 110 C 106 118, 94 134, 90 160 Z" fill="#e2b64c"/>
      <path d="M218 152 C 224 116, 212 88, 188 78 L 180 112 C 200 120, 210 135, 213 160 Z" fill="#e2b64c"/>
      <path d="M76 130 C 66 78, 120 42, 178 50 C 220 56, 244 86, 230 124 C 216 100, 190 92, 160 96 C 128 100, 104 112, 92 134 C 87 140, 78 138, 76 130 Z" fill="url(#${p}hair)"/>
      <path d="M90 128 C 98 100, 130 84, 170 88 C 140 94, 112 106, 102 130 Z" fill="#fff6c8" opacity=".8"/>
      <path d="M120 66 C 150 58, 190 62, 214 84" stroke="#fff3b8" stroke-width="4" fill="none" opacity=".7"/>
      <path d="M110 80 C 140 70, 190 72, 222 104" stroke="#c99a35" stroke-width="3" fill="none" opacity=".6"/>
    </g>`,
  },
  putin: {
    plate: '🇷🇺 PUTIN', plateClass: '',
    svg: (p) => `
    ${suitBody(p, '#363b45', '#1c1f26', '#22252d', '#2b3f7a', '#1a2752')}
    ${skinGrad(p, '#f6d6c0', '#d7a389')}
    <path d="M120 228 L180 228 L186 278 L114 278 Z" fill="#e2b49b"/>
    <g class="head">
      <ellipse cx="88" cy="170" rx="11" ry="19" fill="#e3b097"/><ellipse cx="212" cy="170" rx="11" ry="19" fill="#e3b097"/>
      <path d="M150 84 C 198 84, 212 124, 212 166 C 212 214, 192 250, 150 258 C 108 250, 88 214, 88 166 C 88 124, 102 84, 150 84 Z" fill="url(#${p}skin)"/>
      <ellipse cx="150" cy="106" rx="34" ry="13" fill="#fff" opacity=".28"/>
      <ellipse cx="112" cy="196" rx="12" ry="20" fill="#cf9178" opacity=".35"/><ellipse cx="188" cy="196" rx="12" ry="20" fill="#cf9178" opacity=".35"/>
      <path d="M91 152 C 88 122, 98 102, 114 95 C 105 112, 101 130, 100 158 Z" fill="#b59c80"/>
      <path d="M209 152 C 212 122, 202 102, 186 95 C 195 112, 199 130, 200 158 Z" fill="#b59c80"/>
      <path d="M104 106 C 120 84, 180 84, 196 106 C 180 95, 120 95, 104 106 Z" fill="#c8b296" opacity=".75"/>
      <path class="brow" d="M108 148 Q124 142 139 148" stroke="#a48b70" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path class="brow" d="M161 148 Q176 142 192 148" stroke="#a48b70" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <g class="eyes"><ellipse cx="124" cy="160" rx="8" ry="4" fill="#fff"/><ellipse cx="176" cy="160" rx="8" ry="4" fill="#fff"/>
        <circle cx="125" cy="160" r="3.6" fill="#3f6488"/><circle cx="177" cy="160" r="3.6" fill="#3f6488"/>
        <circle cx="125" cy="160" r="1.6" fill="#111"/><circle cx="177" cy="160" r="1.6" fill="#111"/></g>
      <path d="M113 155 Q124 150 136 155" stroke="#b07e66" stroke-width="3" fill="none"/><path d="M164 155 Q176 150 187 155" stroke="#b07e66" stroke-width="3" fill="none"/>
      <path d="M115 169 Q124 173 134 169" stroke="#c08f78" stroke-width="2" fill="none"/><path d="M166 169 Q176 173 185 169" stroke="#c08f78" stroke-width="2" fill="none"/>
      <path d="M150 160 L155 193 Q151 198 144 194" stroke="#bd8a70" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M128 204 Q122 216 130 226" stroke="#c08f78" stroke-width="2.5" fill="none"/><path d="M172 204 Q178 216 170 226" stroke="#c08f78" stroke-width="2.5" fill="none"/>
      <g class="mouth" transform="translate(150 222)"><path d="M-16 0 Q0 3 16 0" stroke="#a0604f" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse class="inner" rx="9" ry="2" fill="#4a1a16"/></g>
    </g>`,
  },
  zelensky: {
    plate: '🇺🇦 ZELENSKY', plateClass: 'yellow',
    svg: (p) => `
    <defs><linearGradient id="${p}tee" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5d6a33"/><stop offset="1" stop-color="#363e1c"/></linearGradient></defs>
    ${skinGrad(p, '#f1c9a3', '#d79f78')}
    <path d="M120 226 L180 226 L188 282 L112 282 Z" fill="#dba783"/>
    <path d="M12 380 C 22 312, 62 286, 112 276 C 130 292, 170 292, 188 276 C 238 286, 278 312, 288 380 Z" fill="url(#${p}tee)"/>
    <path d="M112 276 C 130 298, 170 298, 188 276" stroke="#3a4220" stroke-width="10" fill="none"/>
    <path d="M60 318 L60 380 M240 318 L240 380" stroke="#2f3618" stroke-width="4"/>
    <g transform="translate(212 326)" stroke="#f2c94c" stroke-width="3.5" fill="none" stroke-linejoin="round"><path d="M-11 -13 L-11 6 L0 15 L11 6 L11 -13"/><path d="M0 -16 L0 15"/><path d="M-11 6 L11 6"/></g>
    <g class="head">
      <ellipse cx="86" cy="172" rx="12" ry="20" fill="#dfa983"/><ellipse cx="214" cy="172" rx="12" ry="20" fill="#dfa983"/>
      <path d="M150 84 C 200 84, 214 124, 214 166 C 214 216, 194 252, 150 258 C 106 252, 86 216, 86 166 C 86 124, 100 84, 150 84 Z" fill="url(#${p}skin)"/>
      <path d="M88 178 C 92 230, 116 256, 150 258 C 184 256, 208 230, 212 178 C 204 202, 190 214, 178 216 C 168 208, 132 208, 122 216 C 110 214, 96 202, 88 178 Z" fill="#3b2b22" opacity=".58"/>
      <path d="M126 210 Q150 198 174 210 Q150 207 126 210 Z" fill="#3b2b22" opacity=".7"/>
      <path d="M88 142 C 82 96, 116 72, 152 72 C 190 72, 220 98, 212 144 C 206 120, 196 110, 180 106 C 160 100, 130 102, 112 110 C 98 118, 92 128, 88 142 Z" fill="#2e211b"/>
      <path d="M110 84 C 130 76, 170 76, 192 88" stroke="#4a372c" stroke-width="3" fill="none"/>
      <path class="brow" d="M104 147 Q122 139 140 146" stroke="#2a1d17" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path class="brow" d="M160 146 Q178 139 196 147" stroke="#2a1d17" stroke-width="7" fill="none" stroke-linecap="round"/>
      <g class="eyes"><ellipse cx="122" cy="161" rx="8" ry="5" fill="#fff"/><ellipse cx="178" cy="161" rx="8" ry="5" fill="#fff"/>
        <circle cx="123" cy="161" r="4" fill="#4b3424"/><circle cx="179" cy="161" r="4" fill="#4b3424"/>
        <circle cx="124.5" cy="159.5" r="1.4" fill="#fff"/><circle cx="180.5" cy="159.5" r="1.4" fill="#fff"/></g>
      <path d="M112 171 Q122 176 133 171" stroke="#b98463" stroke-width="2.5" fill="none"/><path d="M167 171 Q178 176 188 171" stroke="#b98463" stroke-width="2.5" fill="none"/>
      <path d="M150 162 Q158 188 152 196 Q146 199 140 195" stroke="#bf8661" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <g class="mouth" transform="translate(150 224)"><path d="M-14 0 Q0 4 14 0" stroke="#8e4f42" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse class="inner" rx="9" ry="2" fill="#3f1611"/></g>
    </g>`,
  },
  iran: {
    plate: '🇮🇷 IRAN', plateClass: 'green',
    svg: (p) => `
    <defs><linearGradient id="${p}uni" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#55623c"/><stop offset="1" stop-color="#2f3720"/></linearGradient>
      <linearGradient id="${p}cap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6840"/><stop offset="1" stop-color="#3a4428"/></linearGradient></defs>
    ${skinGrad(p, '#e9bf97', '#c48f68')}
    <path d="M120 226 L180 226 L188 280 L112 280 Z" fill="#c99671"/>
    <path d="M8 380 C 18 308, 60 284, 110 272 L 190 272 C 240 284, 282 308, 292 380 Z" fill="url(#${p}uni)"/>
    <path d="M110 272 L150 300 L190 272 L178 268 L150 288 L122 268 Z" fill="#46522f"/>
    <path d="M28 300 L96 286 L100 300 L32 314 Z M272 300 L204 286 L200 300 L268 314 Z" fill="#2b321c"/>
    <circle cx="66" cy="300" r="4" fill="#e7c04d"/><circle cx="234" cy="300" r="4" fill="#e7c04d"/>
    <rect x="196" y="320" width="54" height="16" rx="3" fill="#1f2414"/><rect x="200" y="323" width="14" height="10" fill="#239f40"/><rect x="214" y="323" width="14" height="10" fill="#fff"/><rect x="228" y="323" width="14" height="10" fill="#da0000"/>
    <g class="head">
      <ellipse cx="86" cy="176" rx="12" ry="20" fill="#cf9a74"/><ellipse cx="214" cy="176" rx="12" ry="20" fill="#cf9a74"/>
      <path d="M150 92 C 200 92, 214 128, 214 170 C 214 218, 194 252, 150 260 C 106 252, 86 218, 86 170 C 86 128, 100 92, 150 92 Z" fill="url(#${p}skin)"/>
      <path d="M86 172 C 84 236, 112 274, 150 278 C 188 274, 216 236, 214 172 C 206 200, 192 212, 180 214 C 170 204, 130 204, 120 214 C 108 212, 94 200, 86 172 Z" fill="#1d1612"/>
      <path d="M120 250 C 132 262, 168 262, 180 250" stroke="#7a6e66" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M124 206 Q150 194 176 206 Q150 212 124 206 Z" fill="#1d1612"/>
      <path class="brow" d="M104 150 Q122 140 140 150" stroke="#1a1310" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path class="brow" d="M160 150 Q178 140 196 150" stroke="#1a1310" stroke-width="8" fill="none" stroke-linecap="round"/>
      <g class="eyes"><ellipse cx="122" cy="163" rx="8" ry="4.6" fill="#fff"/><ellipse cx="178" cy="163" rx="8" ry="4.6" fill="#fff"/>
        <circle cx="123" cy="163" r="3.8" fill="#2b1c12"/><circle cx="179" cy="163" r="3.8" fill="#2b1c12"/></g>
      <path d="M150 164 Q159 190 152 198 Q145 201 139 197" stroke="#a9744f" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <g class="mouth" transform="translate(150 222)"><ellipse rx="13" ry="4" fill="#5a2a20"/><ellipse class="inner" rx="9" ry="2" fill="#2a0d08"/></g>
      <path d="M78 128 C 80 84, 116 62, 150 62 C 184 62, 220 84, 222 128 Z" fill="url(#${p}cap)"/>
      <path d="M70 128 C 110 120, 190 120, 230 128 C 232 136, 228 140, 222 140 C 180 134, 120 134, 78 140 C 72 140, 68 136, 70 128 Z" fill="#14170e"/>
      <path d="M86 122 C 120 116, 180 116, 214 122" stroke="#d9b440" stroke-width="3" fill="none"/>
      <g transform="translate(150 96)"><circle r="15" fill="#d9b440"/><circle r="10" fill="#239f40"/><path d="M0 -7 L2 -2 L7 -2 L3 1 L5 6 L0 3 L-5 6 L-3 1 L-7 -2 L-2 -2 Z" fill="#fff"/></g>
    </g>`,
  },
};

let uid = 0;
export function makeCharacter(kind, { mirror = false } = {}) {
  const def = LIB[kind];
  const p = `c${kind}${uid++}`;
  const el = document.createElement('div');
  el.className = 'char' + (mirror ? ' mirror' : '');
  el.innerHTML = `<svg xmlns="${SVGNS}" viewBox="0 30 300 350">${def.svg(p)}</svg><div class="plate ${def.plateClass}">${def.plate}</div>`;
  const head = el.querySelector('.head');
  const eyes = el.querySelector('.eyes');
  const inner = el.querySelector('.mouth .inner');
  const brows = el.querySelectorAll('.brow');
  head.style.transformBox = 'view-box';
  head.style.transformOrigin = '150px 250px';
  eyes.style.transformBox = 'view-box';
  eyes.style.transformOrigin = '150px 161px';
  const phase = (kind.charCodeAt(0) % 7) * 0.37;
  return {
    el,
    // talk: 0..1 amount of talking; angry: 0..1 frowning brows
    update(t, { talk = 0, angry = 0 } = {}) {
      const tt = t + phase;
      const rot = Math.sin(tt * 1.4) * 3 + Math.sin(tt * 3.7) * talk * 2.5;
      const nod = Math.sin(tt * 6.1) * talk * 3;
      head.style.transform = `translateY(${nod}px) rotate(${rot}deg)`;
      const bp = (tt % 3.3);
      const blink = bp > 3.15 ? 0.08 : 1;
      eyes.style.transform = `scaleY(${blink})`;
      const m = talk * Math.max(0, 0.5 + 0.5 * Math.sin(tt * 17) * Math.sin(tt * 5.3 + 1));
      inner.setAttribute('ry', (1.5 + m * 9).toFixed(2));
      brows.forEach((b, i) => {
        const dir = i === 0 ? 1 : -1;
        b.style.transformBox = 'fill-box';
        b.style.transformOrigin = 'center';
        b.style.transform = `translateY(${angry * 4}px) rotate(${dir * angry * 12}deg)`;
      });
    },
  };
}
