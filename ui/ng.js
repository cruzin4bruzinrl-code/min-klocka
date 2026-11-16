// ===== Next Gen: levande hemvy och en guide som visar nästa steg med rörelse i stället för text =====
(function(){
const NS='http://www.w3.org/2000/svg';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const IC={
  batt:'<svg viewBox="0 0 24 24" fill="none" stroke="#3dffa8" stroke-width="2" stroke-linecap="round"><rect x="3" y="7" width="16" height="10" rx="2.5"/><path d="M21 10.5v3"/><path d="M6.5 10v4M9.5 10v4" /></svg>',
  pulse:'<svg viewBox="0 0 24 24"><path fill="#ff4f8b" d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" style="filter:drop-shadow(0 0 5px #ff4f8b)"/></svg>',
  time:'<svg viewBox="0 0 24 24" fill="none" stroke="#2ee6ff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>'
};
// ---- scenen: banor runt klockan ----
function orbit(){const st=document.querySelector('.stage');if(!st||st.querySelector('.ng-orbit'))return;
  const o=document.createElement('div');o.className='ng-orbit';o.setAttribute('aria-hidden','true');o.innerHTML='<b></b>';st.insertBefore(o,st.firstChild);}
// ---- rutorna: ikoner, stegring och en liten studs när ett värde ändras ----
function tiles(){
  const t=[...document.querySelectorAll('#view-home .tiles .tile')];if(!t.length||t[0].dataset.ng)return;
  t.forEach(x=>x.dataset.ng=1);
  const add=(tile,k)=>{const s=document.createElement('span');s.className='ng-ic';s.innerHTML=IC[k];tile.appendChild(s);};
  const by=id=>{const e=document.getElementById(id);return e&&e.closest('.tile');};
  if(by('stBatt'))add(by('stBatt'),'batt');if(by('stPulse'))add(by('stPulse'),'pulse');if(by('stTime'))add(by('stTime'),'time');
  const sTile=by('stSteps');
  if(sTile){sTile.classList.add('ng-steps');
    const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 52 52');svg.setAttribute('class','ng-ring');svg.setAttribute('aria-hidden','true');
    svg.innerHTML='<defs><linearGradient id="ngGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b6cff"/><stop offset="1" stop-color="#2ee6ff"/></linearGradient></defs><circle class="t" cx="26" cy="26" r="22"/><circle class="v" cx="26" cy="26" r="22"/>';
    sTile.appendChild(svg);sTile.style.paddingRight='72px';}
  const ring=()=>{const v=document.querySelector('.ng-ring .v');if(!v)return;const n=parseInt(($('stSteps').textContent||'').replace(/\D/g,''),10);
    const goal=(typeof goals==='function'&&goals().steps)||8000;const f=isNaN(n)?0:Math.min(1,n/goal);v.style.strokeDashoffset=(138.2*(1-f)).toFixed(1);};
  ['stBatt','stPulse','stSteps','stTime'].forEach(id=>{const e=document.getElementById(id);if(!e)return;
    new MutationObserver(()=>{const tile=e.closest('.tile');if(id!=='stTime'&&!reduce){tile.classList.remove('ng-pop');void tile.offsetWidth;tile.classList.add('ng-pop');}if(id==='stSteps')ring();}).observe(e,{childList:true,characterData:true,subtree:true});});
  ring();
}
// ---- guiden ----
const done=k=>{try{return localStorage.getItem('minklocka.guide.'+k)==='1';}catch(e){return false;}};
const mark=k=>{try{localStorage.setItem('minklocka.guide.'+k,'1');}catch(e){}};
const connected=()=>{const c=document.getElementById('stConn');return !!c&&c.textContent==='Ansluten';};
const GUIDE=[
  {k:'conn',el:'#btnConnect',view:'home',when:()=>!connected(),t:'Börja här',d:'Tryck för att ansluta klockan. Håll den nära med skärmen tänd.',keep:1},
  {k:'dials',el:'#tabs [data-v="dials"]',view:'home',when:connected,t:'Byt urtavla',d:'Här finns alla urtavlor. Tryck på en och skicka den.'},
  {k:'tools',el:'#tabs [data-v="tools"]',view:'home',when:connected,t:'Smarta funktioner',d:'Låt klockans knappar styra telefonen, och mycket mer.'},
  {k:'health',el:'#tabs [data-v="health"]',view:'home',when:connected,t:'Din hälsa',d:'Steg, puls och sömn från klockan, och veckans sammanfattning.'}
];
let tip=null,hand=null,curG=null,shownAt=0;
function hideGuide(){if(curG){const e=document.querySelector(curG.el);if(e)e.classList.remove('ng-guide');}curG=null;if(tip)tip.classList.remove('on');if(hand)hand.classList.remove('on');}
function place(){if(!curG||!tip)return;const e=document.querySelector(curG.el);if(!e||!e.offsetParent){hideGuide();return;}
  const r=e.getBoundingClientRect(),W=innerWidth,tw=Math.min(240,W-32);tip.style.width=tw+'px';
  const th=tip.offsetHeight||70,below=r.top<th+40;
  let x=Math.max(16,Math.min(W-16-tw,r.left+r.width/2-tw/2));
  tip.style.left=x+'px';tip.style.top=(below?r.bottom+14:r.top-th-14)+'px';tip.className='ng-tip on '+(below?'down':'up');
  tip.style.setProperty('--ax',Math.max(14,Math.min(tw-26,r.left+r.width/2-x-6))+'px');
  hand.style.left=(r.left+r.width/2-6)+'px';hand.style.top=(r.top+r.height/2-6)+'px';}
function showGuide(g){const e=document.querySelector(g.el);if(!e)return;
  if(!tip){tip=document.createElement('div');tip.className='ng-tip';tip.style.position='fixed';document.body.appendChild(tip);tip.onclick=()=>{if(curG&&!curG.keep)mark(curG.k);hideGuide();};
    hand=document.createElement('div');hand.className='ng-hand';hand.style.position='fixed';hand.innerHTML='<svg viewBox="0 0 34 34"><circle cx="12" cy="12" r="9" fill="rgba(46,230,255,.25)" stroke="#2ee6ff" stroke-width="2"/><circle cx="12" cy="12" r="3.5" fill="#fff"/></svg>';document.body.appendChild(hand);}
  curG=g;shownAt=Date.now();tip.innerHTML='<b>'+g.t+'</b>'+g.d;e.classList.add('ng-guide');
  if(!reduce)hand.classList.add('on');
  if(!e.dataset.ngg){e.dataset.ngg=1;e.addEventListener('click',()=>{const g2=GUIDE.find(x=>x.el&&document.querySelector(x.el)===e);if(g2&&!g2.keep)mark(g2.k);hideGuide();});}
  requestAnimationFrame(place);}
function busyUI(){return !!(document.getElementById('tour')&&document.getElementById('tour').offsetParent)||document.querySelector('#tsheet.on')||document.querySelector('.ob.on,.sheet.on,.hl-sheet.on,#onb.on')||(typeof busy!=='undefined'&&busy);}
function tick(){
  if(document.documentElement.dataset.theme!=='nextgen'&&!curG){}
  const home=document.getElementById('view-home');const onHome=home&&home.classList.contains('on');
  if(!onHome||busyUI()){hideGuide();return;}
  const g=GUIDE.find(x=>(x.keep||!done(x.k))&&x.when()&&document.querySelector(x.el));
  if(!g){hideGuide();return;}
  if(curG!==g){hideGuide();showGuide(g);}else place();
  // en guide som inte är nödvändig drar sig undan efter en stund och kommer tillbaka senare
  if(!g.keep&&Date.now()-shownAt>12000){tip.classList.remove('on');hand.classList.remove('on');}
}
// ---- verktygsbladet: stegen tänds ett i taget, två varv ----
function sheetSteps(){const sh=document.getElementById('tsheet');if(!sh||sh.dataset.ng)return;sh.dataset.ng=1;let t=null;
  new MutationObserver(()=>{clearInterval(t);sh.querySelectorAll('.tsh-steps li').forEach(l=>l.classList.remove('ng-now'));
    if(!sh.classList.contains('on')||reduce)return;const li=[...sh.querySelectorAll('.tsh-steps li')];if(!li.length)return;let i=0,n=0;
    t=setInterval(()=>{li.forEach(l=>l.classList.remove('ng-now'));if(n>=li.length*2){clearInterval(t);return;}li[i].classList.add('ng-now');i=(i+1)%li.length;n++;},1300);
  }).observe(sh,{attributes:true,attributeFilter:['class']});}
function init(){orbit();tiles();sheetSteps();setInterval(()=>{sheetSteps();tick();},900);
  addEventListener('scroll',()=>{if(curG)requestAnimationFrame(place);},{passive:true});addEventListener('resize',()=>{if(curG)place();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.ngHideGuide=hideGuide;
})();
// ===== Veckan: en kort rapport ur det klockan faktiskt har mätt. Inga påhittade värden. =====
(function(){
  if(typeof hlRender!=='function'||typeof HL==='undefined')return;
  const DN=['sön','mån','tis','ons','tors','fre','lör'];
  function week(off){const out=[];for(let i=6+off;i>=off;i--){const d=hdayAgo(i),day=HL.days[hymd(d)];
      const hr=day&&day.hr&&day.hr.length?day.hr.map(r=>+r[2]).filter(v=>v>30&&v<220):[];
      out.push({d,steps:hlTotal(day),low:hr.length?Math.min(...hr):null});}return out;}
  function render(){
    const host=$('hlTip');if(!host)return;let box=$('ngWeek');
    const w=week(0),has=w.filter(x=>x.steps!=null);
    if(!has.length){if(box)box.remove();return;}
    if(!box){box=document.createElement('div');box.id='ngWeek';box.className='ng-week';host.parentNode.insertBefore(box,host);}
    const G=goals().steps,sum=has.reduce((a,x)=>a+x.steps,0),avg=Math.round(sum/has.length),hit=has.filter(x=>x.steps>=G).length;
    const best=has.reduce((a,x)=>x.steps>a.steps?x:a,has[0]);
    const prev=week(7).filter(x=>x.steps!=null),pavg=prev.length?Math.round(prev.reduce((a,x)=>a+x.steps,0)/prev.length):null;
    const lows=w.filter(x=>x.low!=null).map(x=>x.low),low=lows.length?Math.round(lows.reduce((a,b)=>a+b,0)/lows.length):null;
    const max=Math.max(G,...has.map(x=>x.steps))*1.08,f=n=>n.toLocaleString('sv-SE');
    let tr='';if(pavg){const p=Math.round((avg-pavg)/Math.max(1,pavg)*100);tr='<span class="ng-tr '+(p>=0?'up':'dn')+'">'+(p>=0?'▲ ':'▼ ')+Math.abs(p)+' % mot veckan innan</span>';}
    box.innerHTML='<div class="ng-wh"><span class="lab">Veckan<small>'+has.length+' av 7 dagar med data från klockan</small></span>'+tr+'</div>'+
      '<div class="ng-wb">'+w.map((x,i)=>'<i style="--h:'+(x.steps==null?0:Math.max(.03,x.steps/max)).toFixed(3)+';--d:'+(i*70)+'ms" class="'+(x.steps!=null&&x.steps>=G?'hit':'')+(x.steps==null?' none':'')+'"></i>').join('')+
      '<span class="ng-goal" style="bottom:'+(G/max*100).toFixed(1)+'%"><em>mål</em></span></div><div class="ng-wl">'+w.map(x=>'<small>'+DN[x.d.getDay()]+'</small>').join('')+'</div>'+
      '<div class="ng-ws"><div><b>'+f(avg)+'</b><small>steg per dag i snitt</small></div><div><b>'+hit+' / '+has.length+'</b><small>dagar nådde målet '+f(G)+'</small></div>'+
      '<div><b>'+f(best.steps)+'</b><small>bästa dagen ('+DN[best.d.getDay()]+')</small></div>'+(low?'<div><b>'+low+'</b><small>lägsta puls i snitt, slag/min</small></div>':'')+'</div>';
    box.classList.remove('go');void box.offsetWidth;box.classList.add('go');
  }
  const orig=hlRender;window.hlRender=hlRender=function(a){const r=orig.apply(this,arguments);try{render();}catch(e){}return r;};
  try{render();}catch(e){}
})();
// ===== rubriken: texten tonar ut medan klockan flyttar sig och tonar in när den står still =====
(function(){let t=0,was=document.body.classList.contains('compact');
  new MutationObserver(()=>{const now=document.body.classList.contains('compact');if(now===was)return;was=now;
    document.body.classList.add('hswap');clearTimeout(t);t=setTimeout(()=>document.body.classList.remove('hswap'),430);}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
