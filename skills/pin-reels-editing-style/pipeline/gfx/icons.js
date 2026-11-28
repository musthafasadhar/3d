// hand-built 24x24 stroke icons (rounded, 2px)
const IC={
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
 userplus:'<circle cx="10" cy="8" r="4"/><path d="M2.5 21c0-4 3.4-6.5 7.5-6.5 1.6 0 3 .4 4.2 1"/><path d="M19 8v6M16 11h6"/>',
 cap:'<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>',
 wallet:'<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10V8a3 3 0 013-3h11"/><circle cx="16.5" cy="13.5" r="1.4"/>',
 bus:'<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M8 18v2.5M16 18v2.5"/><circle cx="8" cy="14.5" r=".9"/><circle cx="16" cy="14.5" r=".9"/>',
 db:'<ellipse cx="12" cy="5.5" rx="7.5" ry="3"/><path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/><path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 comment:'<path d="M21 12a8 8 0 01-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1121 12z"/>',
 link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 00-5.7 0l-3 3A4 4 0 0011 18.7l1-1"/>',
 route:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M6 15.5V12a3 3 0 013-3h6a3 3 0 003-3"/>',
 star:'<path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>',
 book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19V5"/>',
 pin:'<path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
};
function ic(name,size=40,color='#fff',sw=2){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="display:block">${IC[name]}</svg>`}
// filled 4-point star (the Tara mark)
let __sid=0;
function starSVG(size){const id='gstar'+(++__sid),fill=`url(#${id})`;return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="display:block;overflow:visible"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset=".45" stop-color="#FFD36E"/><stop offset="1" stop-color="#FF7A3D"/></linearGradient></defs><path d="M50 2C54 30 70 46 98 50 70 54 54 70 50 98 46 70 30 54 2 50 30 46 46 30 50 2Z" fill="${fill}"/></svg>`}
