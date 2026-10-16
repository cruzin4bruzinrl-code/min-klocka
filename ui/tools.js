// ================= Ordning: verktygen som kort, en förklarande bild för varje, och en rundtur =================
// Verktygens knappar och fält finns kvar som förut. Här flyttas de bara in i ett eget blad när du öppnar verktyget.
(function(){
const CLASSIC=navigator.webdriver&&!window.__newTools;   // de gamla proven kör sidan som förut
const G={   // små bilder, 24x24, ritade med linjer
  note:'<rect x="6" y="3.5" width="12" height="17" rx="2.5"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
  bubble:'<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2H11l-4 3.5v-3.5H6.5a2 2 0 0 1-2-2z"/><path d="M8.5 9.5h7M8.5 12.5h4"/>',
  bell:'<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5h-14z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  num:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M9 8.5h6l-4 7.5"/>',
  steps:'<path d="M8.5 13.5c-2 0-3-2-3-4.5S6.5 4 8.5 4s3 2.5 2.7 5-.7 4.5-2.7 4.5zM15.5 20c-2 0-2.5-2-2.7-4.5S13.5 10 15.5 10s3 2.5 3 5-1 5-3 5z"/>',
  timer:'<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3.5h4M18.5 6.5l1.5-1.5"/>',
  bright:'<circle cx="12" cy="12" r="5"/><path d="M12 7a5 5 0 0 1 0 10z" fill="currentColor"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/><path d="M6.5 12.5h2.5l1.5-2.5 2 4.5 1.5-2h3.5"/>',
  wrist:'<path d="M4 18c3-1 5-3 6.5-6l2-4"/><rect x="11" y="4" width="6" height="8" rx="1.8" transform="rotate(25 14 8)"/><path d="M19 15l1.5-3M17 17.5l3 .5"/>',
  watch:'<rect x="6.5" y="5.5" width="11" height="13" rx="3"/><path d="M9 5.5l.6-2.5h4.8l.6 2.5M9 18.5l.6 2.5h4.8l.6-2.5M12 9.5V12l1.8 1.2"/>',
  spark:'<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
  cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="3"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 14h2.5M13.5 14H16"/>',
  qr:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 20h1"/>',
  dumb:'<path d="M3 12h18M6 8v8M3.5 9.5v5M18 8v8M20.5 9.5v5"/>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  find:'<rect x="8" y="5" width="8" height="14" rx="2.6"/><path d="M4.5 9v6M19.5 9v6M2 10.5v3M22 10.5v3"/>',
  music:'<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/>'
};
const svg=(k,cls)=>'<svg class="'+(cls||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(G[k]||G.watch)+'</svg>';
// dir: 'ut' = telefonen skickar till klockan, 'in' = klockan till telefonen, 'båda'
const TOOLS=[
  {k:'note',cat:'show',a:'txtNote',t:'Lapp på handleden',d:'Din lista som urtavla, med påminnelser',g:'note',m:'float',dir:'ut',
   s:['Skriv en sak per rad','Tryck ⏰ vid en rad om du vill bli påmind','Tryck Uppdatera lappen och skicka']},
  {k:'msg',cat:'show',a:'txtMsg',t:'Meddelande',d:'En rad text som avisering på klockan',g:'bubble',m:'bob',dir:'ut',
   s:['Skriv ett kort meddelande','Tryck Skicka','Klockan vibrerar och visar det']},
  {k:'today',cat:'show',a:'btnToday',t:'Dagens urtavla',d:'Veckodag, datum, vecka och solens tider',g:'cal',m:'flip',dir:'ut',
   s:['Skriv gärna något att räkna ner till','Tryck Skapa dagens urtavla','Skicka den till klockan']},
  {k:'weather',cat:'show',a:'txtOrt',t:'Väder',d:'Dagens väder till klockan, utan Triacle',g:'sun',m:'spin',dir:'ut',exp:1,
   s:['Skriv din ort, eller låt fältet vara tomt','Tryck Hämta','Väderurtavlor visar det nya vädret']},
  {k:'qr',cat:'show',a:'txtQR',t:'QR-kod',d:'Länk eller kortnummer som kod på klockan',g:'qr',m:'pop',dir:'ut',exp:1,
   s:['Skriv texten eller länken','Tryck Skapa','Skicka urtavlan och visa klockan för läsaren']},
  {k:'builtin',cat:'show',a:'segBuiltin',t:'Klockans egna urtavlor',d:'Byt tillbaka till en inbyggd urtavla',g:'watch',m:'wiggle',dir:'ut',
   s:['Tryck på en siffra 1–5','Klockan byter direkt']},
  {k:'notif',cat:'phone',a:'grpNotif',t:'Aviseringar och sms',d:'Telefonens aviseringar på klockan, svara på sms',g:'bell',m:'ring',dir:'båda',
   s:['Ge appen lov att läsa aviseringar','Ge lov för sms om du vill svara från klockan','Svara med klockans färdiga svar']},
  {k:'measure',cat:'phone',a:'segAuto',t:'Tänd skärm vid mätning',d:'Skärmen släcks inte medan pulsen mäts',g:'heart',m:'beat',dir:'båda',
   s:['Slå på','Välj hur länge resultatet ska stå kvar','Mät puls på klockan som vanligt']},
  {k:'wrist',cat:'phone',a:'segWrist',t:'Lyft för att tända',d:'Skärmen tänds när du lyfter armen',g:'wrist',m:'wiggle',dir:'ut',
   s:['På: lyft armen så tänds skärmen','Av: färre tändningar av misstag']},
  {k:'goal',cat:'fit',a:'numGoal',t:'Stegmål',d:'Målet som klockan räknar mot',g:'steps',m:'walk',dir:'ut',exp:1,
   s:['Skriv ditt mål','Tryck Skicka']},
  {k:'sig',cat:'fit',a:'segSig',t:'Träningssignal',d:'KÖR och VILA på klockan i takt',g:'timer',m:'tick',dir:'ut',exp:1,
   s:['Välj Intervall, Tabata eller Pomodoro','Låt appen vara öppen under passet','Klockan säger till när det är dags']},
  {k:'pass',cat:'fit',a:'blkPass',t:'Pass från IronSplit',d:'Dagens pass som urtavla',g:'dumb',m:'lift',dir:'ut',
   s:['Planera passet i IronSplit','Tryck Skapa urtavla av passet','Skicka den till klockan']},
  {k:'ai',cat:'make',a:'grpAI',t:'Skapa med AI',d:'Beskriv en bild, få en urtavla',g:'spark',m:'twinkle',dir:'ut',exp:1,
   s:['Beskriv bilden','Välj stil och var värdena ska stå','Tryck Skapa bilden, eller välj en färdig bild']}
];
const CATS=[['show','Visa på klockan','Saker du skickar till klockans skärm'],['phone','Telefon och klocka','Det som telefonen sköter åt klockan'],['fit','Träning','För passet och stegen'],['make','Skapa','Egna urtavlor']];
window.TOOLS_UI=TOOLS;
// Bilden överst i ett verktyg: telefonen, en rörelse mellan dem, och klockan som visar resultatet
function scene(t){
  const dots='<g class="sc-dots">'+[0,1,2].map(i=>'<circle cx="'+(86+i*14)+'" cy="58" r="3.4" style="animation-delay:'+(i*.18)+'s"/>').join('')+'</g>';
  const back=t.dir!=='ut'?'<g class="sc-dots back">'+[0,1,2].map(i=>'<circle cx="'+(114-i*14)+'" cy="76" r="3" style="animation-delay:'+(.9+i*.18)+'s"/>').join('')+'</g>':'';
  return '<svg class="sc" viewBox="0 0 220 120" aria-hidden="true">'+
    '<g class="sc-phone"><rect x="18" y="18" width="50" height="88" rx="11"/><rect x="24" y="26" width="38" height="68" rx="6" class="scr"/><g transform="translate(31 48) scale(1)">'+svg(t.g,'sc-g1').replace('<svg','<svg width="24" height="24"')+'</g></g>'+
    dots+back+
    '<g class="sc-watch"><path d="M160 22l3-12h22l3 12M160 98l3 12h22l3-12" class="band"/><rect x="146" y="22" width="56" height="76" rx="16"/><rect x="152" y="28" width="44" height="64" rx="11" class="scr"/>'+
    '<g class="sc-pop" transform="translate(162 46)">'+svg(t.g,'sc-g2').replace('<svg','<svg width="24" height="24"')+'</g></g></svg>';
}
let open=null;
function build(){
  const view=$('view-tools');if(!view||CLASSIC)return;
  // ställ tiden och hitta klockan blir snabbknappar överst
  const quick=document.createElement('div');quick.className='quick';
  [['btnTime','clock','Ställ tiden'],['btnFind','find','Hitta klockan']].forEach(([id,g,txt])=>{const b=document.createElement('button');b.className='qbtn glass';b.innerHTML=svg(g,'qi')+'<span>'+txt+'</span>';b.onclick=()=>{bounce(b);$(id).click();};quick.appendChild(b);});
  const grid=document.createElement('div');grid.id='toolGrid';
  const store=document.createElement('div');store.id='toolStore';store.hidden=true;
  while(view.firstChild)store.appendChild(view.firstChild);
  view.appendChild(quick);view.appendChild(grid);view.appendChild(store);
  let n=0;
  CATS.forEach(([c,h,sub])=>{
    const sec=document.createElement('div');sec.className='tcat';sec.innerHTML='<h3>'+h+'</h3><p>'+sub+'</p>';
    const wrap=document.createElement('div');wrap.className='tcards';
    TOOLS.filter(t=>t.cat===c).forEach(t=>{
      const el=$(t.a);if(!el){return;}
      t.node=el.classList.contains('group')||el.classList.contains('block')?el:el.closest('.block');
      const card=document.createElement('button');card.className='tcard glass';card.dataset.tool=t.k;card.style.animationDelay=(n++*45)+'ms';
      card.innerHTML='<span class="ti m-'+t.m+'">'+svg(t.g)+'</span><span class="tt"><b>'+t.t+(t.exp?' <i class="tg">ny</i>':'')+'</b><small>'+t.d+'</small></span><span class="chev">›</span>';
      card.onclick=()=>{bounce(card);setTimeout(()=>openTool(t.k),120);};
      t.card=card;wrap.appendChild(card);});
    if(c==='make'){   // egen urtavla i redigeraren
      const card=document.createElement('button');card.className='tcard glass';card.dataset.tool='own';card.style.animationDelay=(n++*45)+'ms';
      card.innerHTML='<span class="ti m-wiggle">'+svg('watch')+'</span><span class="tt"><b>Skapa egen urtavla</b><small>Bakgrund, foto, siffror och visare som du vill</small></span><span class="chev">›</span>';
      card.onclick=()=>{bounce(card);setTimeout(()=>{showTab('dials');const t=document.querySelector('#dialGrid [data-new]');if(t)t.click();},120);};wrap.appendChild(card);}
    sec.appendChild(wrap);grid.appendChild(sec);});
  // passet syns bara när IronSplit har ett
  const pass=TOOLS.find(t=>t.k==='pass');if(pass&&pass.card){const sync=()=>{pass.card.hidden=$('blkPass').hidden;};sync();new MutationObserver(sync).observe($('blkPass'),{attributes:true});}
  // bladet
  const sh=document.createElement('div');sh.id='tsheet';sh.innerHTML='<div class="tsh-bg"></div><div class="tsh-card"><div class="tsh-top"><button class="tsh-x" aria-label="Stäng">‹</button><h2></h2></div><div class="tsh-scroll"><div class="tsh-scene"></div><ol class="tsh-steps"></ol><div class="tsh-body"></div></div></div>';
  document.body.appendChild(sh);
  sh.querySelector('.tsh-bg').onclick=closeTool;sh.querySelector('.tsh-x').onclick=closeTool;
  window.addEventListener('popstate',()=>{if(open)closeTool(true);});
}
function bounce(el){el.classList.remove('boing');void el.offsetWidth;el.classList.add('boing');}
function openTool(k){
  const t=TOOLS.find(x=>x.k===k);if(!t||!t.node)return;if(open)closeTool(true);
  const sh=$('tsheet');sh.querySelector('h2').innerHTML=t.t+(t.exp?' <i class="tg">ny</i>':'');
  sh.querySelector('.tsh-scene').innerHTML=scene(t);
  sh.querySelector('.tsh-steps').innerHTML=t.s.map((x,i)=>'<li style="animation-delay:'+(160+i*90)+'ms"><b>'+(i+1)+'</b><span>'+x+'</span></li>').join('');
  t.home=t.node.parentNode;t.next=t.node.nextSibling;t.node.hidden=false;sh.querySelector('.tsh-body').appendChild(t.node);
  open=t;sh.classList.add('on');document.body.classList.add('sheet-open');sh.querySelector('.tsh-scroll').scrollTop=0;
  try{history.pushState({tool:k},'');}catch(e){}
}
function closeTool(fromPop){
  const t=open;if(!t)return;const sh=$('tsheet');sh.classList.remove('on');document.body.classList.remove('sheet-open');open=null;
  setTimeout(()=>{if(open===t)return;if(t.home)t.home.insertBefore(t.node,t.next&&t.next.parentNode===t.home?t.next:null);},320);
  if(fromPop!==true){try{if(history.state&&history.state.tool)history.back();}catch(e){}}
}
window.openTool=openTool;window.closeTool=closeTool;
// byter appen flik (till exempel till Urtavlor efter Skapa) stängs bladet först
if(typeof showTab==='function'){const st=showTab;showTab=function(v){if(open)closeTool();const sl=$('tabSlide'),was=document.querySelector('#tabs button.on');const r=st.apply(this,arguments);
  // flytande glas: markören töjs ut när den byter flik
  if(sl&&was&&was.dataset.v!==v){sl.classList.remove('goo');void sl.offsetWidth;sl.classList.add('goo');}return r;};}
// ---------- rundtur första gången ----------
const TOUR=[
  {h:'Välkommen till Min klocka',p:'Telefonen pratar med klockan över Bluetooth. Håll dem nära varandra, så ansluter appen av sig själv.',art:'link'},
  {h:'Urtavlor',p:'Bläddra bland urtavlorna, tryck på en du gillar och tryck Skicka. Efter en halv minut syns den på klockan.',art:'faces'},
  {h:'Verktyg',p:'Lapp med påminnelser, meddelanden, väder och mycket mer. Varje verktyg visar med en bild vad det gör.',art:'tools'},
  {h:'Sköter sig själv',p:'Musikknapparna på klockan styr telefonens musik, och aviseringar, sms och historik sköts i bakgrunden.',art:'bg'}
];
function tourArt(a){
  if(a==='link')return '<svg viewBox="0 0 220 140" class="ta"><g class="ta-ph"><rect x="22" y="22" width="56" height="98" rx="12"/><rect x="29" y="31" width="42" height="76" rx="6" class="scr"/></g><g class="ta-wv"><path class="w1" d="M100 58q10 13 0 26"/><path class="w2" d="M110 50q16 21 0 42"/><path class="w3" d="M120 42q22 29 0 58"/></g><g class="ta-w"><rect x="146" y="38" width="54" height="66" rx="15"/><rect x="152" y="44" width="42" height="54" rx="10" class="scr"/><text x="173" y="77" text-anchor="middle" class="tt2">12:30</text></g></svg>';
  if(a==='faces')return '<svg viewBox="0 0 220 140" class="ta">'+[0,1,2,3,4,5].map(i=>{const x=22+(i%3)*62,y=14+Math.floor(i/3)*62;const c=['#3ba0ff','#ff5aa0','#ffd23f','#3ee6a0','#b48cff','#ff8a3c'][i];return '<rect class="tf" style="animation-delay:'+(i*.12)+'s;fill:'+c+';stroke:none" x="'+x+'" y="'+y+'" width="52" height="54" rx="12"/>';}).join('')+'<circle class="tap" cx="139" cy="41" r="12"/></svg>';
  if(a==='tools')return '<svg viewBox="0 0 220 140" class="ta">'+['note','bell','sun','spark'].map((g,i)=>'<g class="tt3" style="animation-delay:'+(i*.15)+'s" transform="translate('+(20+i*50)+' 46)"><rect x="0" y="0" width="40" height="40" rx="12" class="tbx"/><g transform="translate(8 8)">'+svg(g).replace('<svg','<svg width="24" height="24"')+'</g></g>').join('')+'</svg>';
  return '<svg viewBox="0 0 220 140" class="ta"><g class="ta-w"><rect x="83" y="34" width="54" height="66" rx="15"/><rect x="89" y="40" width="42" height="54" rx="10" class="scr"/></g><g class="fl f1" transform="translate(40 30)">'+svg('music').replace('<svg','<svg width="26" height="26"')+'</g><g class="fl f2" transform="translate(156 36)">'+svg('bell').replace('<svg','<svg width="26" height="26"')+'</g><g class="fl f3" transform="translate(48 92)">'+svg('heart').replace('<svg','<svg width="26" height="26"')+'</g><g class="fl f4" transform="translate(150 94)">'+svg('bubble').replace('<svg','<svg width="26" height="26"')+'</g></svg>';
}
// ---------- kom igång: en guide för den som är ny, steg för steg ----------
// Varje steg gör något på riktigt: ger lov, ansluter klockan, skickar en första urtavla och väljer tema.
const OBKEY='minklocka.start.v2';
function tour(force){
  if(CLASSIC&&!force)return;if(!force&&lsGet(OBKEY,false))return;if($('tour'))return;
  const N=window.MinKlockaNative||null,hasPerm=!!(N&&N.perms);
  const perm=()=>{try{return JSON.parse(N.perms());}catch(e){return {};}};
  const PICKS=['rutnat','astronauten','marschen','solrosen','dansgolvet','sovkatten'];
  const steps=[
    {k:'hej',art:()=>tourArt('link'),h:'Hej! Nu kopplar vi ihop din klocka',p:'Det tar en minut. Du kan hoppa över allt och göra det senare under Mer.',next:'Kom igång'},
    hasPerm&&{k:'lov',art:()=>tourArt('bg'),h:'Låt klockan få veta saker',p:'Med lov kan appen skicka aviseringar och sms till klockan, och du kan svara från den.',body:()=>{const p=perm();
      return '<div class="ob-list"><div class="ob-row'+(p.notif?' ok':'')+'"><span>'+svg('bell')+'</span><b>Aviseringar<small>Allt som plingar i telefonen</small></b>'+(p.notif?'<i>✓</i>':'<button data-a="notif">Ge lov</button>')+'</div>'+
        '<div class="ob-row'+(p.sms?' ok':'')+'"><span>'+svg('bubble')+'</span><b>Sms<small>Svara med klockans färdiga svar</small></b>'+(p.sms?'<i>✓</i>':'<button data-a="sms">Ge lov</button>')+'</div></div>';},
      bind:(o,re)=>{o.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(b.dataset.a==='notif')N.openNotifyAccess();else N.askSms();});return setInterval(re,1200);}},
    {k:'koppla',art:()=>connArt(),h:'Anslut klockan',p:'',body:()=>{
      const on=typeof connected!=='undefined'&&connected,nokey=$('keyBox')&&!$('keyBox').hidden;
      if(on)return '<p class="ob-st ok">Klockan är ansluten. Bra!</p>';
      return '<p class="ob-st">'+(N?'Appen letar efter klockan. Håll den nära telefonen och se till att Bluetooth är på.':'Tryck på knappen och välj klockan i listan.')+'</p>'+
        (N?'':'<button class="ob-big" data-a="conn">Anslut klockan</button>')+(nokey?'<p class="ob-st warn">Din personliga nyckel saknas. Öppna din personliga länk en gång, så känner klockan igen appen.</p>':'');},
      bind:(o,re)=>{const b=o.querySelector('[data-a="conn"]');if(b)b.onclick=()=>{$('btnConnect').click();};let was=typeof connected!=='undefined'&&connected;
        return setInterval(()=>{const now=typeof connected!=='undefined'&&connected;if(now!==was){was=now;re();}},700);}},
    {k:'urtavla',art:()=>'',h:'Välj en första urtavla',p:'Tryck på en du gillar. Du kan byta när du vill under Urtavlor.',body:()=>{
      const on=typeof connected!=='undefined'&&connected;
      return '<div class="ob-faces">'+PICKS.map(k=>'<button data-k="'+k+'"><canvas width="120" height="143"></canvas></button>').join('')+'</div>'+
        (on?'<button class="ob-big" data-a="send">Skicka till klockan</button><p class="ob-st" id="obProg"></p>':'<p class="ob-st">Anslut klockan för att skicka den. Den du valt ligger kvar under Urtavlor.</p>');},
      bind:(o,re)=>{const ds=typeof allDials==='function'?allDials():[];
        o.querySelectorAll('.ob-faces button').forEach((b,i)=>{const d=ds.find(x=>x.key===b.dataset.k);const cv=b.querySelector('canvas');b.style.animationDelay=(i*70)+'ms';
          if(d){try{paintFace(d,cv,nowT());}catch(e){}if(cur&&cur.key===d.key)b.classList.add('on');}
          b.onclick=()=>{if(!d)return;pickDial(d.gk,true);o.querySelectorAll('.ob-faces button').forEach(x=>x.classList.toggle('on',x===b));};});
        const sb=o.querySelector('[data-a="send"]');if(sb)sb.onclick=()=>{$('btnSend').click();};
        return setInterval(()=>{const pr=o.querySelector('#obProg');if(pr)pr.textContent=$('stProg').textContent;},400);}},
    {k:'tema',art:()=>'',h:'Välj utseende',p:'Ljust, mörkt eller i urtavlans färger. Du kan ändra under Mer.',body:()=>'<div class="themes ob-th">'+THEMES.map(t=>'<button data-th="'+t[0]+'"><span class="sw"><i style="background:'+t[2]+'"></i><i style="background:'+t[3]+'"></i><i style="background:'+t[4]+'"></i></span>'+t[1]+'</button>').join('')+'</div>',
      bind:(o)=>{o.querySelector('.themes').onclick=e=>{const b=e.target.closest('button');if(b){setTheme(b.dataset.th);o.querySelectorAll('.themes button').forEach(x=>x.classList.toggle('on',x===b));}};
        const t=document.documentElement.dataset.theme;o.querySelectorAll('.themes button').forEach(x=>x.classList.toggle('on',x.dataset.th===t));}},
    {k:'klar',art:()=>doneArt(),h:'Klart!',p:'',body:()=>'<div class="ob-list tips"><div class="ob-row"><span>'+svg('watch')+'</span><b>Urtavlor<small>Tryck på en och sedan Skicka</small></b></div><div class="ob-row"><span>'+svg('note')+'</span><b>Verktyg<small>Lapp med påminnelser, meddelanden, väder och mer</small></b></div><div class="ob-row"><span>'+svg('music')+'</span><b>Musik<small>Klockans musikknappar styr telefonen</small></b></div></div>',next:'Börja använda'}
  ].filter(Boolean);
  let i=0,timer=0;const o=document.createElement('div');o.id='tour';
  const done=()=>{clearInterval(timer);lsSet(OBKEY,true);lsSet('minklocka.rundtur.v1',true);o.classList.add('out');setTimeout(()=>o.remove(),350);};
  const paint=(soft)=>{clearInterval(timer);const s=steps[i];
    o.innerHTML='<div class="tr-card'+(soft?' soft':'')+'"><div class="tr-prog">'+steps.map((_,j)=>'<i class="'+(j<i?'done':j===i?'on':'')+'"></i>').join('')+'</div>'+
      (s.art&&s.art()?'<div class="tr-art">'+s.art()+'</div>':'')+'<h2>'+s.h+'</h2>'+(s.p?'<p>'+s.p+'</p>':'')+(s.body?'<div class="tr-body">'+s.body()+'</div>':'')+
      '<div class="tr-btns">'+(i>0?'<button class="tr-back" aria-label="Tillbaka">‹</button>':'')+(i<steps.length-1?'<button class="tr-skip">'+(i===0?'Hoppa över':'Senare')+'</button>':'')+'<button class="tr-next">'+(s.next||'Nästa')+'</button></div></div>';
    o.querySelector('.tr-next').onclick=()=>{if(i<steps.length-1){i++;paint();}else done();};
    const sk=o.querySelector('.tr-skip');if(sk)sk.onclick=i===0?done:()=>{i++;paint();};
    const bk=o.querySelector('.tr-back');if(bk)bk.onclick=()=>{i--;paint();};
    // steget ritas bara om när något faktiskt har ändrats, annars blinkar det
    let last=s.body?s.body():'';if(s.bind)timer=s.bind(o,()=>{const h=s.body?s.body():'';if(h!==last)paint(true);})||0;};
  paint();document.body.appendChild(o);
}
function connArt(){const on=typeof connected!=='undefined'&&connected;
  return '<svg viewBox="0 0 220 140" class="ta'+(on?' ok':'')+'"><g class="ta-ph"><rect x="22" y="22" width="56" height="98" rx="12"/><rect x="29" y="31" width="42" height="76" rx="6" class="scr"/></g>'+
    (on?'<circle class="okc" cx="112" cy="71" r="18"/><path class="okm" d="M103 71l6 6 12-13"/>':'<g class="ta-wv"><path class="w1" d="M100 58q10 13 0 26"/><path class="w2" d="M110 50q16 21 0 42"/><path class="w3" d="M120 42q22 29 0 58"/></g>')+
    '<g class="ta-w"><rect x="146" y="38" width="54" height="66" rx="15"/><rect x="152" y="44" width="42" height="54" rx="10" class="scr"/><text x="173" y="77" text-anchor="middle" class="tt2">'+new Date().toTimeString().slice(0,5)+'</text></g></svg>';}
function doneArt(){return '<svg viewBox="0 0 220 140" class="ta conf">'+Array.from({length:18},(_,k)=>{const x=20+(k*37)%180,c=['var(--a1)','var(--a2)','#ffc857','#3ee6a0'][k%4];return '<rect class="cf" style="animation-delay:'+(k*.07)+'s;fill:'+c+';stroke:none" x="'+x+'" y="10" width="7" height="12" rx="2" transform="rotate('+(k*23%60-30)+' '+x+' 16)"/>';}).join('')+
  '<circle class="okc big" cx="110" cy="74" r="30"/><path class="okm big" d="M95 74l10 10 20-22"/></svg>';}
window.startTour=()=>tour(true);
// hjälp i Mer-fliken
function helpCard(){
  const v=$('view-log');if(!v||$('helpCard'))return;const c=document.createElement('div');c.id='helpCard';c.className='group glass';
  c.innerHTML='<button class="row" id="btnTour"><span class="ic">'+svg('spark')+'</span><span class="tx">Kom igång-guiden<small>Ge lov, anslut klockan, välj urtavla och tema</small></span></button>'+
    '<div class="block"><span class="lab">Bra att veta<small>Etiketten <i class="tg">ny</i> betyder att funktionen inte är provad på din klocka än. Loggen här under visar vad appen och klockan säger till varandra, och är till hjälp om något krånglar.</small></span></div>';
  v.insertBefore(c,v.firstChild);$('btnTour').onclick=()=>tour(true);
  // teman
  const th=document.createElement('div');th.className='group glass';th.id='themeCard';
  th.innerHTML='<div class="block" style="border-top:0"><span class="lab">Tema<small>Välj färger för appen. Urtavlans färger följer den urtavla du valt</small></span><div class="themes">'+
    THEMES.map(t=>'<button data-th="'+t[0]+'"><span class="sw"><i style="background:'+t[2]+'"></i><i style="background:'+t[3]+'"></i><i style="background:'+t[4]+'"></i></span>'+t[1]+'</button>').join('')+'</div></div>';
  v.insertBefore(th,c.nextSibling);
  th.querySelector('.themes').onclick=e=>{const b=e.target.closest('button');if(!b)return;setTheme(b.dataset.th);};
  markTheme();
}
const THEMES=[['ljus','Ljus','#fdf7ff','#eaddff','#6750a4'],['mint','Mint','#f3fbf6','#c3eed6','#1b7f55'],['persika','Persika','#fff8f4','#ffdbcc','#b5532f'],['hav','Hav','#f4f9fd','#cfe5ff','#0b6aa2'],['mork','Mörk','#0f1513','#1f4d36','#7fd8a6'],['urtavla','Urtavlans färger','#07080c','#ff5aa0','#3ba0ff']];
function markTheme(){const t=document.documentElement.dataset.theme;document.querySelectorAll('.themes button').forEach(b=>b.classList.toggle('on',b.dataset.th===t));
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim()||'#07080c';}
function setTheme(t){const r=document.documentElement;r.dataset.theme=t;lsSet('minklocka.tema.v1',t);
  if(t==='urtavla'&&typeof cur!=='undefined'&&cur){r.style.setProperty('--a1',cur.c1||'#7c8cff');r.style.setProperty('--a2',cur.c2||'#ff5aa0');}else{r.style.removeProperty('--a1');r.style.removeProperty('--a2');}
  markTheme();if(typeof hlRender==='function')hlRender();toast('Tema: '+THEMES.find(x=>x[0]===t)[1]);}
window.setTheme=setTheme;
function dialsHint(){
  const v=$('view-dials');if(!v||CLASSIC||lsGet('minklocka.tips.urtavlor',false))return;
  const h=document.createElement('div');h.className='hint glass';
  h.innerHTML='<div class="hint-art">'+svg('watch','m-pop')+'</div><div class="hint-tx"><b>Så byter du urtavla</b><ol><li>Tryck på en urtavla nedanför</li><li>Tryck <b>Skicka till klockan</b></li><li>Vänta en halv minut, håll klockan nära</li></ol></div><button class="hint-x" aria-label="Stäng">✕</button>';
  h.querySelector('.hint-x').onclick=()=>{lsSet('minklocka.tips.urtavlor',true);h.classList.add('out');setTimeout(()=>h.remove(),300);};
  v.insertBefore(h,v.firstChild);
}
build();helpCard();dialsHint();
const tb=document.querySelector('#tabs [data-v="log"]');if(tb)tb.lastChild.textContent='Mer';
setTimeout(()=>tour(false),900);
window.__obSteps=()=>$('tour')?$('tour').querySelectorAll('.tr-prog i').length:0;
// studs på alla knappar
const PRESS='.cta,.soft,.ghost,.qbtn,.hl-me,.hl-hint';
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button,.seg button,.soft,label.own');if(b&&!b.closest('#tabs')&&!b.matches(PRESS))bounce(b);},{passive:true});
// Knapp med tryckkänsla: ner till 95 % direkt, ljus där fingret är, kort vibration, och en studs tillbaka när man släpper
function pressable(root){
  let cur=null;const up=()=>{if(!cur)return;const b=cur;cur=null;b.classList.remove('pressed');b.classList.add('released');setTimeout(()=>b.classList.remove('released'),520);};
  root.addEventListener('pointerdown',e=>{const b=e.target.closest(PRESS);if(!b||b.disabled)return;const r=b.getBoundingClientRect();
    b.style.setProperty('--px',(e.clientX-r.left)+'px');b.style.setProperty('--py',(e.clientY-r.top)+'px');b.classList.remove('released');b.classList.add('pressed');cur=b;
    try{if(navigator.vibrate&&!navigator.webdriver)navigator.vibrate(8);}catch(_){}},{passive:true});
  ['pointerup','pointercancel','pointerleave','blur'].forEach(t=>(t==='blur'?window:root).addEventListener(t,up,{passive:true}));
}
pressable(document);
})();
