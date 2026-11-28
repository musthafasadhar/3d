let ALL=[],flashFn=null;
async function init(){
  await Promise.all([document.fonts.load('800 100px PJS'),document.fonts.load('700 54px PJS'),document.fonts.load('700 20px Unb'),document.fonts.load('800 100px Unb'),document.fonts.load('600 20px Inter'),document.fonts.load('750 20px Inter'),document.fonts.load('700 20px Inter')]);
  await document.fonts.ready;
  const cards=await (await fetch('cards.json')).json();
  buildCards(cards);
  ALL=[sceneSilos(),sceneAdmission(),sceneAcademics(),sceneFees(),sceneRoute(),sceneDupes(),sceneReveal(),sceneHub(),sceneEverywhere(),sceneEnd(),
       chipOverlay(8.50,9.90,'cap','ACADEMICS'),chipOverlay(11.50,12.90,'wallet','ACCOUNTS'),chipOverlay(15.30,16.30,'bus','TRANSPORT'),
       overlayRing(),overlayEnterOnce(),overlayDeptRow(),overlayBigIdea(),overlayCTA()];
  flashFn=makeFlashes([[0.0,.6],[1.0,.85],[3.55,.8],[5.78,.8],[8.50,.55],[9.90,.8],[11.50,.55],[12.90,.8],[15.30,.55],[16.30,.8],[17.75,.7],[21.10,.5],[22.45,.7],[24.40,.8],[27.70,.6],[33.60,.8],[36.00,.55],[44.10,.9]]);
  window.READY=true;
}
function render(t){
  ALL.forEach(s=>{const on=t>=s.t0&&t<s.t1;s.root.classList.toggle('hide',!on);if(on){s.update(t-s.t0);if(s.grain){const k=Math.floor(t*30);s.grain.style.transform=`translate(${Math.floor(rnd(k)*40)-20}px,${Math.floor(rnd(k+99)*40)-20}px)`;}}});
  renderCaptions(t);
  flashFn(t);
}
window.render=render;
init();
