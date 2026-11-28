const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const prog=(t,a,b)=>clamp((t-a)/(b-a));
const E={
  lin:t=>t,
  out2:t=>1-(1-t)*(1-t),
  out3:t=>1-Math.pow(1-t,3),
  out4:t=>1-Math.pow(1-t,4),
  expo:t=>t>=1?1:1-Math.pow(2,-10*t),
  inout:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
  back:(t,s=1.7)=>1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2),
  elastic:t=>t===0||t===1?t:Math.pow(2,-9*t)*Math.sin((t*10-.75)*(2*Math.PI/3))+1,
};
const $=(html)=>{const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild};
function mk(parent,cls,css,html){const d=document.createElement('div');if(cls)d.className=cls;if(css)d.style.cssText=css;if(html!==undefined)d.innerHTML=html;parent.appendChild(d);return d}
function st(el,o){for(const k in o)el.style[k]=o[k]}
const rnd=(n)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
// typewriter
const typed=(s,t,t0,cps)=>s.slice(0,Math.max(0,Math.min(s.length,Math.floor((t-t0)*cps))));
