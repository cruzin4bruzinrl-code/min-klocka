// ---------- Historik från klockan ----------
// Klockan sparar steg, puls, syre och sömn i ungefär en vecka. Originalappen hämtar det med 0A/A0
// [typ, år-2000, månad, dag, tim, min, sek, 1] och klockan svarar dag för dag (fångat i trafiken):
// typ 3 -> A3 steg (24 timvärden, ackumulerade), 1 -> A2 sömn (läge, tim, min), 2 -> A4 puls, 7 -> AF syre
// (poster om 7 byte: år mån dag tim min sek värde). Bit 0x40 i rubrikens andra byte betyder att fler delar följer.
// 0A/A6 [3] ger dagens steg, kalorier och sträcka (0A/AC). Inget raderas på klockan.
var hcol=null,hlBusy=false;
const HKEY='minklocka.halsa.v1';
let HL={days:{}};try{const o=JSON.parse(localStorage.getItem(HKEY)||'null');if(o&&o.days)HL=o;}catch(e){}
let hlSel=0;   // 0 = idag, 1 = igår …
const hpad=n=>String(n).padStart(2,'0');
const hymd=d=>d.getFullYear()+'-'+hpad(d.getMonth()+1)+'-'+hpad(d.getDate());
const hdayAgo=i=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-i);return d;};
function hlSave(){
  const keep=Object.keys(HL.days).sort().slice(-60),o={};keep.forEach(k=>o[k]=HL.days[k]);HL.days=o;
  try{localStorage.setItem(HKEY,JSON.stringify(HL));}catch(e){}
}
// Skickar en fråga och samlar alla delar av svaret
function hlFetch(type,key,date,ms){
  return new Promise(res=>{
    const parts=[],c={key:key,parts:parts,t:0};
    c.fin=()=>{if(hcol===c)hcol=null;clearTimeout(c.t);res(parts);};
    c.arm=()=>{clearTimeout(c.t);c.t=setTimeout(c.fin,ms||4000);};
    hcol=c;c.arm();
    const n=new Date();
    send(0x0A,0xA0,[type,date.getFullYear()-2000,date.getMonth()+1,date.getDate(),n.getHours(),n.getMinutes(),n.getSeconds(),1]).catch(c.fin);
  });
}
const hu32=(d,i)=>((d[i]<<24)|(d[i+1]<<16)|(d[i+2]<<8)|d[i+3])>>>0;
const hsame=(d,i,date)=>d[i]===date.getFullYear()-2000&&d[i+1]===date.getMonth()+1&&d[i+2]===date.getDate();
function hlSteps(parts,date){
  let out=null;
  for(const d of parts){if(d.length<100||!hsame(d,0,date))continue;out=out||new Array(24).fill(0);
    for(let h=0;h<24;h++){const v=d[4+h*4]===0xFF?0:hu32(d,4+h*4);if(v>out[h])out[h]=v;}}
  return out;
}
function hlRecords(parts,date){
  let all=[];parts.forEach(p=>{all=all.concat(Array.from(p));});
  const m=new Map();
  for(let i=0;i+7<=all.length;i+=7){const r=all.slice(i,i+7);if(!hsame(r,0,date))continue;
    const v=r[6];if(v===0||v===255)continue;m.set(r[3]*60+r[4],[r[3],r[4],v]);}
  return [...m.values()].sort((a,b)=>a[0]*60+a[1]-b[0]*60-b[1]);
}
function hlSleepParse(parts,date){
  const out=[];
  for(const d of parts){if(d.length<6||!hsame(d,0,date))continue;
    for(let i=3;i+3<=d.length;i+=3){if(d[i]===0xFE)continue;if(d[i]>3||d[i+1]>23||d[i+2]>59)continue;out.push([d[i],d[i+1],d[i+2]]);}}
  return out;
}
// Sömn: varje läge gäller fram till nästa rad. 0 vaken, 1 lätt, 2 djup, 3 REM
function hlSleepSum(seg){
  const s={0:0,1:0,2:0,3:0};
  for(let i=0;i+1<seg.length;i++){let a=seg[i][1]*60+seg[i][2],b=seg[i+1][1]*60+seg[i+1][2];if(b<a)b+=1440;s[seg[i][0]]+=b-a;}
  return {sleep:s[1]+s[2]+s[3],light:s[1],deep:s[2],rem:s[3],awake:s[0]};
}
const hhm=m=>m>=60?Math.floor(m/60)+' h '+(m%60?m%60+' min':''):m+' min';
function hlTotal(day){
  if(!day)return null;let t=day.steps?Math.max(...day.steps):0;if(day.live&&day.live.steps>t)t=day.live.steps;return day.steps||day.live?t:null;
}
async function hlSync(manual){
  if(hlBusy)return;
  if(!chW){if(manual)toast('Anslut klockan först',true);return;}
  if(busy){if(manual)toast('Vänta tills klockan är klar',true);else setTimeout(()=>hlSync(false),15000);return;}
  hlBusy=true;busy=true;const say=t=>{$('hlState').textContent=t;};
  say('Hämtar från klockan…');$('btnHlSync').disabled=true;
  let got=0,miss=0;
  try{
    const tk=hymd(new Date());
    try{const d=await ask(0x0A,0xA6,[3],0x0A,0xAC,3000);onWatchEvent(0x0A,0xAC,d);
      const day=HL.days[tk]||(HL.days[tk]={});day.live={steps:hu32(d,0),at:Date.now()};
      if(d.length>=12){const f=new DataView(d.buffer,d.byteOffset);day.live.kcal=Math.round(f.getFloat32(4));if(d.length>=12)day.live.km=Math.round(f.getFloat32(8)*100)/100;}
    }catch(e){log('Dagens steg: inget svar ('+e.message+')');}
    for(let i=0;i<7;i++){
      const date=hdayAgo(i),k=hymd(date),old=HL.days[k];
      if(i>0&&old&&old.done)continue;
      say('Hämtar '+(i===0?'idag':i===1?'igår':k)+'…');
      const day=old||{};
      const st=await hlFetch(3,0xA3,date);
      if(!st.length){miss++;if(i===0){log('Historik: klockan svarade inte på frågan om steg','bad');break;}continue;}
      const steps=hlSteps(st,date);if(steps)day.steps=steps;
      const sl=hlSleepParse(await hlFetch(1,0xA2,date),date);if(sl.length)day.sleep=sl;
      const hr=hlRecords(await hlFetch(2,0xA4,date),date);if(hr.length)day.hr=hr;
      const o2=hlRecords(await hlFetch(7,0xAF,date),date);if(o2.length)day.o2=o2;
      day.at=Date.now();day.done=i>0;HL.days[k]=day;got++;
    }
    hlSave();
    const t=HL.days[tk];
    say(got?'Hämtat '+new Date().toTimeString().slice(0,5)+'. Klockan sparar ungefär en vecka, appen sparar allt den hämtat':'Klockan svarade inte på frågan om historik');
    log('Historik från klockan: '+got+' dagar hämtade'+(t&&hlTotal(t)!=null?', idag '+hlTotal(t)+' steg':'')+(t&&t.hr?', '+t.hr.length+' pulsmätningar':''),got?'ok':'bad');
  }catch(e){say('Kunde inte hämta: '+e.message);log('Historik: '+e.message,'bad');}
  busy=false;hlBusy=false;$('btnHlSync').disabled=false;hlRender();
}
function hlAfterConnect(){setTimeout(()=>hlSync(false),1200);setTimeout(()=>autoWeather(false),9000);}
// Klockans väderapp visar "Anslut APP" tills den fått väder. Har du valt en ort skickas vädret själv när klockan ansluter och var tredje timme.
let wxLast=0;
async function autoWeather(force){
  const pl=lsGet(PLLS,null);if(!pl||typeof pl.lat!=='number'||!chW)return;
  if(!force&&Date.now()-wxLast<3*3600e3)return;
  if(busy){setTimeout(()=>autoWeather(force),20000);return;}
  try{const days=await loadWeather(pl);if(busy||!chW)return;const ok=await sendWeather(days,pl.name==='Här'?'':pl.name);if(ok)wxLast=Date.now();log('Väder skickat automatiskt för '+pl.name+(ok?'':' (klockan svarade inte)'),ok?'ok':'bad');}
  catch(e){log('Automatiskt väder: '+e.message,'bad');}
}
setInterval(()=>autoWeather(false),30*60*1000);
setInterval(()=>{if(chW&&!busy&&!hlBusy&&document.visibilityState==='visible')hlSync(false);},20*60*1000);

// ---------- visning ----------
// Kort med ikon, mål efter ålder, längd och vikt, animerade diagram och förklaringar som öppnas när man trycker på ett kort.
const HWD=['sön','mån','tis','ons','tors','fre','lör'];
function hlLabel(i){if(i===0)return 'Idag';if(i===1)return 'Igår';const d=hdayAgo(i);return HWD[d.getDay()]+' '+d.getDate();}
const HFX=!navigator.webdriver&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const PROFLS='minklocka.profil.v1';
function meGet(){try{return JSON.parse(localStorage.getItem(PROFLS)||'null')||{};}catch(e){return {};}}
const nf=n=>Math.round(n).toLocaleString('sv-SE');
// Mål och gränser. Källor: stegmängd och dödlighet (Paluch m.fl., Lancet Public Health 2022), vilopuls 60–100 (American Heart Association),
// maxpuls 208 − 0,7 × ålder (Tanaka 2001), sömn 7–9 h för 18–64 år och 7–8 h för 65+ (National Sleep Foundation), BMI 18,5–24,9 (WHO),
// vilometabolism enligt Mifflin–St Jeor.
function goals(){
  const m=meGet(),age=+m.age||0,h=+m.h||0,w=+m.w||0,sex=m.sex||'';
  const g={age:age,h:h,w:w,sex:sex,has:!!(age&&h&&w)};
  g.steps=+m.goal||(age>=60?7000:8000);
  g.hrMax=age?Math.round(208-0.7*age):null;
  g.sleepHi=age>=65?8:9;
  if(h&&w)g.bmi=w/Math.pow(h/100,2);
  if(age&&h&&w)g.bmr=Math.round(10*w+6.25*h-5*age+(sex==='k'?-161:sex==='m'?5:-78));
  return g;
}
const HIC={
  steps:'<svg viewBox="0 0 24 24"><path d="M8.5 3c1.7 0 2.6 2 2.4 4.6-.2 2.2-1 3.4-2.5 3.4S6 9.6 6 7.3C6 4.9 6.9 3 8.5 3zM6.4 13.2l4.1.6c.2 1.9-.4 3.4-2.1 3.2-1.5-.2-2.1-1.6-2-3.8zM15.5 7c1.6 0 2.5 1.9 2.5 4.3 0 2.3-.9 3.7-2.4 3.7s-2.3-1.2-2.5-3.4C12.9 9 13.8 7 15.5 7zM13.5 17l4.1-.6c.1 2.2-.5 3.6-2 3.8-1.7.2-2.3-1.3-2.1-3.2z" fill="currentColor"/></svg>',
  hr:'<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" fill="currentColor"/><path d="M6 12.5h3l1.3-2.4 2 4.6 1.4-2.2H18" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  o2:'<svg viewBox="0 0 24 24"><path d="M12 3.2s6 6.6 6 11.1a6 6 0 0 1-12 0C6 9.8 12 3.2 12 3.2z" fill="currentColor"/><circle cx="10" cy="14.5" r="1.6" fill="#fff" opacity=".8"/></svg>',
  sleep:'<svg viewBox="0 0 24 24"><path d="M19.5 14.6A8 8 0 0 1 9.4 4.5a8 8 0 1 0 10.1 10.1z" fill="currentColor"/><path d="M15 4h3l-3 3.4h3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  me:'<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="3.5" fill="currentColor"/><path d="M5 20c.6-4 3.3-6.5 7-6.5s6.4 2.5 7 6.5z" fill="currentColor"/></svg>'
};
const HCOL={steps:'#1b8a5a',hr:'#e0445f',o2:'#2f74d0',sleep:'#7253d6',me:'#c4791c'};
function countUp(el,to,fmt){
  if(!HFX||!el){if(el)el.textContent=fmt(to);return;}
  const t0=performance.now(),d=650;cancelAnimationFrame(el.__cu);
  const f=n=>{const t=Math.min(1,(n-t0)/d),e=1-Math.pow(1-t,3);el.textContent=fmt(to*e);if(t<1)el.__cu=requestAnimationFrame(f);else el.textContent=fmt(to);};el.__cu=requestAnimationFrame(f);
}
function hlCards(){
  const box=$('hlCards');if(!box||box.dataset.built)return;box.dataset.built=1;
  box.querySelectorAll('.hcard').forEach(c=>{const k=c.dataset.k;c.style.setProperty('--hc',HCOL[k]);c.querySelector('.hc-ic').innerHTML=HIC[k];c.addEventListener('click',()=>hlInfo(k));});
}
function hlRender(anim){
  if(anim===undefined)anim=true;
  const days=$('hlDays');if(!days)return;hlCards();
  days.innerHTML='';
  for(let i=0;i<7;i++){const b=document.createElement('button');b.textContent=hlLabel(i);b.dataset.i=i;if(i===hlSel)b.className='on';days.appendChild(b);}
  const k=hymd(hdayAgo(hlSel)),day=HL.days[k],G=goals();
  const tot=hlTotal(day);
  // steg
  if(tot==null)$('hlSteps').textContent='–';else if(anim)countUp($('hlSteps'),tot,nf);else $('hlSteps').textContent=nf(tot);
  $('hlStepsSub').textContent=day&&day.live&&hlSel===0&&day.live.km!=null?day.live.km.toLocaleString('sv-SE')+' km, '+day.live.kcal+' kcal':'';
  const pr=tot?Math.min(1,tot/G.steps):0;$('hlStepsBar').style.width=(pr*100)+'%';
  $('hlStepsGoal').textContent=tot==null?'Mål '+nf(G.steps):tot>=G.steps?'Målet nått!':nf(G.steps-tot)+' kvar till '+nf(G.steps);
  $('hlCards').querySelector('[data-k="steps"]').classList.toggle('won',!!tot&&tot>=G.steps);
  // puls
  const tag=(id,t,c)=>{const e=$(id);e.textContent=t||'';e.hidden=!t;e.dataset.c=c||'';};
  if(day&&day.hr&&day.hr.length){const v=day.hr.map(r=>r[2]),lo=Math.min(...v);$('hlHr').textContent=Math.round(v.reduce((a,b)=>a+b,0)/v.length)+' snitt';$('hlHrSub').textContent='lägst '+lo+', högst '+Math.max(...v);
    tag('hlHrTag',lo<60?'Låg vilopuls':lo<=100?'Normal vilopuls':'Hög vilopuls',lo<=100?'ok':'warn');}
  else{$('hlHr').textContent='–';$('hlHrSub').textContent='';tag('hlHrTag','');}
  // syre
  if(day&&day.o2&&day.o2.length){const v=day.o2.map(r=>r[2]),a=Math.round(v.reduce((x,y)=>x+y,0)/v.length);$('hlO2').textContent=a+' %';$('hlO2Sub').textContent='lägst '+Math.min(...v)+' %';
    tag('hlO2Tag',a>=95?'Normalt':a>=90?'Lite lågt':'Lågt',a>=95?'ok':'warn');}
  else{$('hlO2').textContent='–';$('hlO2Sub').textContent='';tag('hlO2Tag','');}
  // sömn
  const sc=$('hlCards').querySelector('[data-k="sleep"]'),sb=$('hlSleepBar');
  if(day&&day.sleep&&day.sleep.length>1&&hlSleepSum(day.sleep).sleep){const s=hlSleepSum(day.sleep);$('hlSleep').textContent=hhm(s.sleep);$('hlSleepSub').textContent='djup '+hhm(s.deep)+(s.rem?', REM '+hhm(s.rem):'');
    sc.classList.remove('nodata');const p=x=>(x/s.sleep*100).toFixed(1)+'%';sb.innerHTML='<i class="l" style="width:'+p(s.light)+'"></i><i class="d" style="width:'+p(s.deep)+'"></i><i class="r" style="width:'+p(s.rem)+'"></i>';
    tag('hlSleepTag',s.sleep>=420&&s.sleep<=G.sleepHi*60?'Lagom':s.sleep<420?'Lite kort':'Långt',s.sleep>=420?'ok':'warn');}
  else{$('hlSleep').textContent='–';$('hlSleepSub').textContent='';sc.classList.add('nodata');sb.innerHTML='';tag('hlSleepTag','');}
  if(anim&&HFX){$('hlCards').classList.remove('in');void $('hlCards').offsetWidth;$('hlCards').classList.add('in');}
  $('hlMeHint').hidden=G.has;
  hlHideTips();
  hlDraw(day,anim);
  // rutorna överst: visa sparade värden när klockan inte skickat något nytt
  const td=HL.days[hymd(new Date())];
  const t=hlTotal(td);if(t!=null&&$('stSteps').textContent==='–')$('stSteps').textContent=t.toLocaleString('sv-SE');
  if(td&&td.hr&&td.hr.length&&$('stPulse').textContent==='–'){const r=td.hr[td.hr.length-1];$('stPulse').textContent=r[2];$('stPulseAt').textContent='Senast '+hpad(r[0])+':'+hpad(r[1])+', sparat på klockan';}
}
let hlCssC={};
function hlCss(n,f){if(n in hlCssC)return hlCssC[n]||f;const v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();hlCssC[n]=v;return v||f;}
function hlCanvas(id,h){
  const c=$(id),dpr=window.devicePixelRatio||1;if(!c.__w)c.__w=Math.round(c.getBoundingClientRect().width||0);const w=Math.max(200,c.__w||300);
  if(c.width!==w*dpr||c.height!==h*dpr){c.width=w*dpr;c.height=h*dpr;}c.style.height=h+'px';
  const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);return {x:x,w:w,h:h};
}
function hlAxis(g,top){
  const x=g.x,L=6,R=g.w-6,B=g.h-18;x.strokeStyle=hlCss('--edge','rgba(255,255,255,.10)');x.lineWidth=1;x.beginPath();x.moveTo(L,B+.5);x.lineTo(R,B+.5);x.stroke();
  x.fillStyle=hlCss('--dim','#9aa0b4');x.font='500 11px '+hlCss('--font','system-ui');x.textBaseline='top';
  [0,6,12,18,24].forEach(h=>{const px=L+(R-L)*h/24;x.textAlign=h===0?'left':h===24?'right':'center';x.fillText(String(h).padStart(2,'0'),px,B+5);});
  if(top){x.textAlign='right';x.textBaseline='top';x.fillText(top,R,0);}
  return {L:L,R:R,B:B,T:18};
}
const easeIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const easeBack=t=>{const c=1.6,c3=c+1;return 1+c3*Math.pow(t-1,3)+c*Math.pow(t-1,2);};
const hlRaf={};
function hlLoop(key,dur,anim,draw){
  cancelAnimationFrame(hlRaf[key]);if(!anim||!HFX){draw(1);return;}
  const t0=performance.now();const f=n=>{const t=Math.min(1,(n-t0)/dur);draw(t);if(t<1)hlRaf[key]=requestAnimationFrame(f);};draw(0);hlRaf[key]=requestAnimationFrame(f);
}
let hlHit={steps:null,hr:null},hlSelBar=-1,hlDay=null;
function hlDraw(day,anim){hlDay=day;hlCssC={};$('hlStepC').__w=0;$('hlHrC').__w=0;hlSelBar=-1;hlDrawSteps(day,anim);hlDrawHr(day,anim);}
// Steg per timme: staplarna växer upp i en våg, rundade toppar, mörkgrönt till ljusgrönt
function hlDrawSteps(day,anim){
  let inc=null;
  if(day&&day.steps){inc=day.steps.map((v,h)=>{let p=0;for(let j=h-1;j>=0;j--){if(day.steps[j]){p=day.steps[j];break;}}return v?Math.max(0,v-p):0;});}
  hlHit.steps=inc;const mx=inc?Math.max(...inc):0;
  hlLoop('steps',500+23*28,anim,t=>{
    const g=hlCanvas('hlStepC',140),ax=hlAxis(g,mx?'högst '+nf(mx):'');
    if(!inc||!mx){g.x.fillStyle=hlCss('--dim','#9aa0b4');g.x.textAlign='center';g.x.textBaseline='middle';g.x.fillText('Inga steg sparade',g.w/2,(ax.B+ax.T)/2);return;}
    const bw=(ax.R-ax.L)/24,grad=g.x.createLinearGradient(0,ax.B,0,ax.T);grad.addColorStop(0,'#14603f');grad.addColorStop(1,'#8fe6b5');
    const ms=t*(500+23*28);
    inc.forEach((v,h)=>{if(!v)return;const lt=Math.max(0,Math.min(1,(ms-h*28)/500));if(lt<=0)return;
      const full=Math.max(3,(ax.B-ax.T)*v/mx),bh=full*easeBack(lt),x0=ax.L+h*bw+1.5,w=bw-3,y=ax.B-bh,rad=Math.min(w/2,6);
      g.x.globalAlpha=hlSelBar<0||hlSelBar===h?1:.35;g.x.fillStyle=grad;g.x.beginPath();
      if(g.x.roundRect)g.x.roundRect(x0,y,w,bh,[rad,rad,1,1]);else g.x.rect(x0,y,w,bh);g.x.fill();});
    g.x.globalAlpha=1;
  });
}
// Puls: mjuk kurva som ritas fram från vänster, ytan under tonas
function hlSmooth(x,pts){
  x.moveTo(pts[0][0],pts[0][1]);
  for(let i=0;i<pts.length-1;i++){const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    x.bezierCurveTo(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,p2[0],p2[1]);}
}
let hlHrGeo=null;
function hlDrawHr(day,anim){
  const hr=day&&day.hr&&day.hr.length?day.hr:null;hlHit.hr=hr;hlHrGeo=null;
  hlLoop('hr',1300,anim,t=>{
    const g=hlCanvas('hlHrC',160);
    if(!hr){const ax=hlAxis(g,'');g.x.fillStyle=hlCss('--dim','#9aa0b4');g.x.textAlign='center';g.x.textBaseline='middle';g.x.fillText('Ingen puls sparad',g.w/2,(ax.B+ax.T)/2);return;}
    const v=hr.map(r=>r[2]),lo=Math.min(...v,60)-6,hi=Math.max(...v)+8,ax=hlAxis(g,'slag/min '+Math.min(...v)+'–'+Math.max(...v));
    const px=r=>ax.L+(ax.R-ax.L)*(r[0]*60+r[1])/1440,py=b=>ax.B-(ax.B-ax.T)*(b-lo)/(hi-lo);
    hlHrGeo={px:px,py:py};
    const x=g.x,col='#e0445f';
    // normal vilopuls 60–100 som ett svagt band
    const y1=Math.max(ax.T,py(100)),y2=Math.min(ax.B,py(60));
    if(y2>y1){x.fillStyle='rgba(46,158,91,.08)';x.fillRect(ax.L,y1,ax.R-ax.L,y2-y1);x.fillStyle='rgba(46,158,91,.75)';x.font='600 10px '+hlCss('--font','system-ui');x.textAlign='left';x.textBaseline='top';x.fillText('normal vilopuls',ax.L+4,y1+3);}
    // dela upp där det saknas mätningar längre än 90 minuter
    const segs=[];let cur=[];hr.forEach((r,i)=>{const p=hr[i-1];if(p&&(r[0]*60+r[1])-(p[0]*60+p[1])>90){segs.push(cur);cur=[];}cur.push([px(r),py(r[2])]);});segs.push(cur);
    const x0=px(hr[0]),x1=px(hr[hr.length-1]),cx=x0+(x1-x0+8)*easeIO(t);
    x.save();x.beginPath();x.rect(0,0,cx,g.h);x.clip();
    const ar=x.createLinearGradient(0,ax.T,0,ax.B);ar.addColorStop(0,'rgba(224,68,95,.28)');ar.addColorStop(1,'rgba(224,68,95,0)');
    segs.forEach(s=>{if(s.length<2)return;x.beginPath();hlSmooth(x,s);x.lineTo(s[s.length-1][0],ax.B);x.lineTo(s[0][0],ax.B);x.closePath();x.fillStyle=ar;x.fill();});
    x.strokeStyle=col;x.lineWidth=2.4;x.lineJoin='round';x.lineCap='round';
    segs.forEach(s=>{x.beginPath();if(s.length<2){x.arc(s[0][0],s[0][1],2.6,0,7);x.fillStyle=col;x.fill();return;}hlSmooth(x,s);x.stroke();});
    x.restore();
    // lysande topp medan linjen ritas
    if(t<1){let a=null,b=null;for(const s of segs)for(const p of s){if(p[0]<=cx)a=p;else if(!b)b=p;}
      if(a){const y=b&&b[0]>a[0]?a[1]+(b[1]-a[1])*Math.min(1,(cx-a[0])/(b[0]-a[0])):a[1],xx=b?Math.min(cx,b[0]):a[0];
        x.fillStyle='rgba(224,68,95,.25)';x.beginPath();x.arc(xx,y,8,0,7);x.fill();x.fillStyle=col;x.beginPath();x.arc(xx,y,3.5,0,7);x.fill();}}
  });
}
// ---------- tryck i diagrammen: punkt som pulserar och en bubbla som studsar fram ----------
function hlHideTips(){['hlStepTip','hlHrTip'].forEach(id=>{const e=$(id);if(e)e.classList.remove('show');});const d=$('hlDot');if(d)d.classList.remove('show');}
function hlTipAt(id,x,y,html,w){
  const e=$(id);e.innerHTML=html;e.classList.remove('show');void e.offsetWidth;
  const half=Math.max(48,e.offsetWidth/2||60);e.style.left=Math.max(half,Math.min(w-half,x))+'px';e.style.top=y+'px';e.classList.add('show');
}
function hlTap(id,ev){
  const c=$(id),r=c.getBoundingClientRect(),f=Math.min(1,Math.max(0,(ev.clientX-r.left-6)/(r.width-12))),min=f*1440;
  if(id==='hlStepC'){const h=Math.min(23,Math.floor(f*24)),v=hlHit.steps?hlHit.steps[h]:0;$('hlTip').textContent='Kl '+hpad(h)+'–'+hpad(h+1)+': '+(v||0).toLocaleString('sv-SE')+' steg';
    if(!hlHit.steps)return;hlSelBar=v?h:-1;const mx=Math.max(...hlHit.steps);
    hlDrawSteps(hlDay,false);
    const bw=(r.width-12)/24,top=122-Math.max(3,104*(v||0)/mx);
    hlTipAt('hlStepTip',6+bw*(h+.5),top,'<b>'+(v||0).toLocaleString('sv-SE')+' steg</b><small>kl '+hpad(h)+'–'+hpad(h+1)+'</small>',r.width);}
  else if(hlHit.hr){let b=null,bd=1e9;hlHit.hr.forEach(x=>{const d=Math.abs(x[0]*60+x[1]-min);if(d<bd){bd=d;b=x;}});if(!b)return;
    $('hlTip').textContent='Kl '+hpad(b[0])+':'+hpad(b[1])+': '+b[2]+' slag/min';
    if(!hlHrGeo)return;const X=hlHrGeo.px(b),Y=hlHrGeo.py(b[2]),G=goals();
    const dot=$('hlDot');dot.classList.remove('show');void dot.offsetWidth;dot.style.left=X+'px';dot.style.top=Y+'px';dot.classList.add('show');
    const zone=G.hrMax?' · '+Math.round(b[2]/G.hrMax*100)+' % av max':'';
    hlTipAt('hlHrTip',X,Y-10,'<b>'+b[2]+' slag/min</b><small>kl '+hpad(b[0])+':'+hpad(b[1])+zone+'</small>',r.width);}
}
// ---------- förklaringar ----------
function hlRange(min,max,segs,val,unit,label){
  const pos=v=>Math.max(0,Math.min(100,(v-min)/(max-min)*100));
  let h='<div class="hr-bar">';let from=min;segs.forEach((s,i)=>{h+='<i class="'+(i===0?'first':i===segs.length-1?'last':'')+'" style="left:'+pos(from)+'%;width:'+(pos(Math.min(s.to,max))-pos(from))+'%;background:'+s.c+'"><span>'+s.t+'</span></i>';from=s.to;});
  h+=(val!=null?'<span class="hr-run" data-p="'+pos(val)+'"><b class="hr-mark"><em>'+(label||String(val).replace('.',',')+(unit||''))+'</em></b></span>':'')+'</div>';return h;
}
function hlInfoBody(k){
  const G=goals(),day=HL.days[hymd(hdayAgo(hlSel))],when=hlSel===0?'i dag':hlLabel(hlSel).toLowerCase();
  const need=G.has?'':'<p class="hi-need">Fyll i <button class="lnk" data-me>Om dig</button> så anpassas målen efter din ålder, längd och vikt.</p>';
  if(k==='steps'){const tot=hlTotal(day);
    const kcal=tot&&G.w?Math.round(tot*0.00057*G.w):null;
    return '<div class="hi-art a-steps">'+HIC.steps+HIC.steps+'</div><h2>Steg</h2>'+
      '<p class="hi-val">'+(tot==null?'Inga steg sparade '+when:nf(tot)+' steg '+when)+(kcal?' · ungefär '+kcal+' kcal':'')+'</p>'+
      hlRange(0,Math.max(G.steps*1.5,tot||0),[{to:5000,t:'Lite',c:'#f6c58a'},{to:G.steps,t:'På väg',c:'#f5df85'},{to:1e9,t:'Målet',c:'#8fe6b5'}],tot,'')+
      '<h3>Vad betyder det?</h3><p>Klockan räknar armens svängar när du går och sparar en summa varje timme. Diagrammet visar hur mycket du rört dig under dagens timmar.</p>'+
      '<h3>Sikta på</h3><ul><li><b>'+nf(G.steps)+' steg om dagen</b>'+(+meGet().goal?' (ditt eget mål)':'')+'.</li><li>Forskning visar att risken för hjärt- och kärlsjukdom sjunker med fler steg, upp till ungefär 8 000–10 000 per dag för vuxna under 60 år och 6 000–8 000 för äldre.</li><li>Takten spelar roll: en rask promenad där du blir lite andfådd ger mer än samma steg i lugn takt.</li>'+(G.bmi&&G.bmi>=25?'<li>Vill du gå ner i vikt hjälper det att lägga till 2 000–3 000 steg, till exempel en promenad på 20–30 minuter.</li>':'')+'</ul>'+need;}
  if(k==='hr'){const v=day&&day.hr&&day.hr.length?day.hr.map(r=>r[2]):null,lo=v?Math.min(...v):null,hi=v?Math.max(...v):null,mx=G.hrMax||190;
    const z=G.hrMax?'<h3>Dina pulszoner</h3><div class="hi-zones">'+[[50,60,'Återhämtning','#9fd8f5'],[60,70,'Grund',  '#8fe6b5'],[70,80,'Kondition','#f5df85'],[80,90,'Tröskel','#f6b07a'],[90,100,'Max','#f08497']].map(a=>'<div><i style="background:'+a[3]+'"></i><b>'+a[2]+'</b><span>'+Math.round(G.hrMax*a[0]/100)+'–'+Math.round(G.hrMax*a[1]/100)+'</span></div>').join('')+'</div><p class="hi-small">Maxpuls ungefär '+G.hrMax+' (208 − 0,7 × ålder). Den riktiga kan skilja 10–15 slag åt båda hållen.'+(hi?' Högsta pulsen '+when+' var '+Math.round(hi/G.hrMax*100)+' % av max.':'')+'</p>':need;
    return '<div class="hi-art a-hr">'+HIC.hr+'<svg class="ecg" viewBox="0 0 120 30"><path d="M0 15h30l6-10 8 22 6-12h70" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/></svg></div><h2>Puls</h2>'+
      '<p class="hi-val">'+(v?'Lägst '+lo+', högst '+hi+' slag/min '+when:'Ingen puls sparad '+when)+'</p>'+
      hlRange(40,Math.max(120,Math.min(mx,200)),[{to:60,t:'Vältränad',c:'#9fd8f5'},{to:100,t:'Normal vila',c:'#8fe6b5'},{to:1e9,t:'Rörelse',c:'#f6c58a'}],lo,'')+
      '<p class="hi-small">Markören visar dygnets lägsta puls. Den ligger nära din vilopuls, särskilt om den mättes på natten.</p>'+
      '<h3>Vad betyder det?</h3><p>Pulsen är hur många gånger hjärtat slår per minut. Klockan mäter ungefär varannan halvtimme, och oftare när du startar en mätning själv.</p>'+
      '<h3>Sikta på</h3><ul><li>Normal vilopuls för vuxna är <b>60–100</b>. Vältränade har ofta 50–60, ibland lägre.</li><li>En vilopuls som sakta sjunker över veckor brukar betyda bättre kondition.</li><li>Är vilopulsen plötsligt 5–10 slag högre än vanligt kan det vara trötthet, stress eller en förkylning på väg. Ta det lugnt den dagen.</li></ul>'+z;}
  if(k==='o2'){const v=day&&day.o2&&day.o2.length?day.o2.map(r=>r[2]):null,a=v?Math.round(v.reduce((x,y)=>x+y,0)/v.length):null;
    return '<div class="hi-art a-o2">'+HIC.o2+'<i></i><i></i><i></i></div><h2>Syremättnad</h2>'+
      '<p class="hi-val">'+(v?'Snitt '+a+' %, lägst '+Math.min(...v)+' % '+when:'Ingen mätning sparad '+when)+'</p>'+
      hlRange(85,100,[{to:90,t:'Lågt',c:'#f08497'},{to:95,t:'Lite lågt',c:'#f5df85'},{to:101,t:'Normalt',c:'#8fe6b5'}],a,' %')+
      '<h3>Vad betyder det?</h3><p>Hur mycket av blodets syrebärare som faktiskt bär syre. Klockan mäter med ljus genom huden.</p>'+
      '<h3>Sikta på</h3><ul><li>Friska har oftast <b>95–100 %</b>.</li><li>Klockor på handleden mäter mindre exakt än vårdens mätare, särskilt om du rör dig eller har kalla händer. Sitt still under mätningen.</li><li>Visar den under 90 % flera gånger när du sitter still, och du känner dig andfådd eller dålig: kontakta vården.</li></ul>';}
  if(k==='sleep'){const ok=day&&day.sleep&&day.sleep.length>1,s=ok?hlSleepSum(day.sleep):null,hrs=s&&s.sleep?Math.round(s.sleep/6)/10:null;
    const pct=x=>Math.round(x/s.sleep*100)+' %';
    return '<div class="hi-art a-sleep">'+HIC.sleep+'<i></i><i></i><i></i></div><h2>Sömn</h2>'+
      '<p class="hi-val">'+(hrs?hhm(s.sleep)+' '+when:'Ingen sömn sparad '+when)+'</p>'+
      hlRange(3,11,[{to:6,t:'Kort',c:'#f08497'},{to:7,t:'Lite kort',c:'#f5df85'},{to:G.sleepHi,t:'Lagom',c:'#8fe6b5'},{to:99,t:'Lång',c:'#b9a8f5'}],hrs,' h',s&&s.sleep?hhm(s.sleep):'')+
      (hrs?'<div class="hi-zones s"><div><i style="background:#b9a8f5"></i><b>Lätt</b><span>'+pct(s.light)+'</span></div><div><i style="background:#6a4fc9"></i><b>Djup</b><span>'+pct(s.deep)+'</span></div><div><i style="background:#f3a6c8"></i><b>REM</b><span>'+pct(s.rem)+'</span></div></div>':'')+
      '<h3>Vad betyder det?</h3><p>Klockan gissar sömnens stadier utifrån rörelser och puls. <b>Djupsömn</b> återhämtar kroppen, <b>REM</b> är drömsömnen som hjälper minnet, <b>lätt sömn</b> är resten.</p>'+
      '<h3>Sikta på</h3><ul><li>Vuxna 18–64 år behöver <b>7–9 timmar</b>, från 65 år 7–8.</li><li>Djupsömn är ofta 15–25 % av natten och REM 20–25 %. Klockans uppdelning är en grov uppskattning.</li><li>Samma tid för läggdags och uppvaknande, även på helger, ger oftast bäst sömn.</li><li>Sov med klockan på, så finns natten här nästa gång appen hämtar.</li></ul>';}
  if(k==='me'){const m=meGet();
    const bmi=G.bmi?'<h3>Ditt BMI</h3><p class="hi-val">'+G.bmi.toFixed(1).replace('.',',')+'</p>'+hlRange(15,35,[{to:18.5,t:'Under',c:'#9fd8f5'},{to:25,t:'Normal',c:'#8fe6b5'},{to:30,t:'Över',c:'#f5df85'},{to:99,t:'Fetma',c:'#f6b07a'}],Math.round(G.bmi*10)/10,'')+'<p class="hi-small">BMI skiljer inte på muskler och fett. Tränar du styrka kan BMI bli högt fast du har lite fett. Midjemåttet säger ofta mer.</p>':'';
    const bmr=G.bmr?'<p class="hi-small">Kroppen gör av med ungefär <b>'+nf(G.bmr)+' kcal</b> per dygn i vila. Med vardagsrörelse och träning blir det ofta '+nf(G.bmr*1.4)+'–'+nf(G.bmr*1.7)+'.</p>':'';
    return '<div class="hi-art a-me">'+HIC.me+'</div><h2>Om dig</h2><p>Används bara här i telefonen för att räkna fram mål och pulszoner. Inget skickas någonstans.</p>'+
      '<div class="hi-form"><label>Ålder<input id="meAge" type="number" inputmode="numeric" min="10" max="100" value="'+(m.age||'')+'"></label>'+
      '<label>Längd (cm)<input id="meH" type="number" inputmode="numeric" min="100" max="230" value="'+(m.h||'')+'"></label>'+
      '<label>Vikt (kg)<input id="meW" type="number" inputmode="decimal" min="30" max="250" value="'+(m.w||'')+'"></label>'+
      '<label>Kön<select id="meSex"><option value="">Vill inte ange</option><option value="m"'+(m.sex==='m'?' selected':'')+'>Man</option><option value="k"'+(m.sex==='k'?' selected':'')+'>Kvinna</option></select></label>'+
      '<label class="w2">Eget stegmål (valfritt)<input id="meGoal" type="number" inputmode="numeric" min="1000" max="40000" step="500" placeholder="'+nf(G.age>=60?7000:8000)+'" value="'+(m.goal||'')+'"></label></div>'+
      '<button class="cta" id="btnMeSave">Spara</button>'+bmi+bmr;}
  return '';
}
function hlSheet(){
  let s=$('hsheet');if(s)return s;
  s=document.createElement('div');s.id='hsheet';s.innerHTML='<div class="hs-bg"></div><div class="hs-card"><div class="hs-top"><button class="hs-x" aria-label="Stäng">‹</button></div><div class="hs-body"></div></div>';
  document.body.appendChild(s);s.querySelector('.hs-bg').onclick=hlInfoClose;s.querySelector('.hs-x').onclick=hlInfoClose;
  s.addEventListener('click',e=>{if(e.target.closest('[data-me]'))hlInfo('me');
    if(e.target.id==='btnMeSave'){const n=id=>{const v=parseFloat(String($(id).value).replace(',','.'));return isFinite(v)&&v>0?v:'';};
      const o={age:n('meAge'),h:n('meH'),w:n('meW'),sex:$('meSex').value,goal:n('meGoal')};try{localStorage.setItem(PROFLS,JSON.stringify(o));}catch(e){}
      toast('Sparat. Målen är anpassade efter dig');hlRender(true);hlInfo('me');}});
  return s;
}
function hlInfo(k){
  const s=hlSheet(),b=s.querySelector('.hs-body');b.innerHTML=hlInfoBody(k);b.parentElement.style.setProperty('--hc',HCOL[k]);b.scrollTop=0;
  s.classList.add('open');document.body.classList.add('hs-open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>b.querySelectorAll('.hr-run').forEach(m=>{m.style.transform='translate3d('+m.dataset.p+'%,0,0)';m.firstChild.classList.add('in');})));
}
function hlInfoClose(){const s=$('hsheet');if(s)s.classList.remove('open');document.body.classList.remove('hs-open');}

$('hlDays').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;hlSel=+b.dataset.i;$('hlTip').textContent='Tryck på ett kort för att se vad det betyder';hlRender(true);
  const nb=$('hlDays').querySelector('[data-i="'+hlSel+'"]');if(nb){nb.classList.add('pop');if(nb.scrollIntoView)nb.scrollIntoView({inline:'center',block:'nearest',behavior:HFX?'smooth':'auto'});}});
$('hlStepC').addEventListener('click',e=>hlTap('hlStepC',e));
$('hlHrC').addEventListener('click',e=>hlTap('hlHrC',e));
$('btnHlSync').addEventListener('click',()=>hlSync(true));
$('btnHlMe').addEventListener('click',()=>hlInfo('me'));
$('hlMeHint').addEventListener('click',()=>hlInfo('me'));
let hlRz=0;window.addEventListener('resize',()=>{clearTimeout(hlRz);hlRz=setTimeout(()=>hlRender(false),150);});
if('IntersectionObserver' in window)new IntersectionObserver(es=>{es.forEach(e=>$('grpHealth').classList.toggle('off',!e.isIntersecting));}).observe($('grpHealth'));
// diagrammen ritas fram först när de syns
if('IntersectionObserver' in window&&HFX){let seen=false;new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&!seen){seen=true;hlDraw(hlDay,true);}});},{threshold:.3}).observe($('hlHrC'));}
hlRender(false);
