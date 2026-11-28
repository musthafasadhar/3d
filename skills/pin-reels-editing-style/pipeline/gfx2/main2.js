let ALL=[];
async function init(){
  await Promise.all([document.fonts.load('800 100px PJS'),document.fonts.load('800 50px PJS'),document.fonts.load('600 20px Inter'),document.fonts.load('700 20px Inter'),document.fonts.load('800 20px Inter'),document.fonts.load('600 40px Fra')]);
  await document.fonts.ready;
  THEMES=[[1.55,3.55,'dark'],[5.78,8.55,'light'],[9.90,11.50,'light'],[12.90,15.30,'light'],[16.30,17.75,'light'],[17.75,21.10,'dark'],[21.10,22.45,'light'],[24.40,27.70,'dark'],[33.60,36.00,'light']];
  const cards=await (await fetch('cards.json')).json();
  buildCards(cards);
  ALL=[sceneSilos(),sceneAdmission(),sceneAcademics(),sceneFees(),sceneRoute(),sceneDupes(),sceneReveal(),sceneHub(),sceneDash(),sceneEnd(),
    logoBadge(),timeline(8.55,9.90,'userplus','Admission','cap','Academics'),timeline(11.50,12.90,'cap','Academics','wallet','Accounts'),timeline(15.30,16.30,'wallet','Accounts','bus','Transport'),
    deptPills(),enterOnce(),dimTitle(),ctaPills(),creamWipe()];
  window.READY=true;
}
function render(t){
  const m=renderSpeaker(t);
  const hideSpk=t>=44.10;document.getElementById('spk').style.display=hideSpk?'none':'block';if(hideSpk)document.getElementById('ring').style.display='none';
  ALL.forEach(s=>{const on=t>=s.t0&&t<s.t1+(s.hold||0);s.root.classList.toggle('hide',!on);if(on)s.update(t)});
  renderCaptions(t);
}
window.render=render;
init();
