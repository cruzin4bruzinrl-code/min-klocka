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
function hlAfterConnect(){setTimeout(()=>hlSync(false),1200);}
setInterval(()=>{if(chW&&!busy&&!hlBusy&&document.visibilityState==='visible')hlSync(false);},20*60*1000);

// ---------- visning ----------
const HWD=['sön','mån','tis','ons','tors','fre','lör'];
function hlLabel(i){if(i===0)return 'Idag';if(i===1)return 'Igår';const d=hdayAgo(i);return HWD[d.getDay()]+' '+d.getDate();}
function hlRender(){
  const days=$('hlDays');if(!days)return;
  days.innerHTML='';
  for(let i=0;i<7;i++){const b=document.createElement('button');b.textContent=hlLabel(i);b.dataset.i=i;if(i===hlSel)b.className='on';days.appendChild(b);}
  const k=hymd(hdayAgo(hlSel)),day=HL.days[k];
  const tot=hlTotal(day);
  $('hlSteps').textContent=tot==null?'–':tot.toLocaleString('sv-SE');
  $('hlStepsSub').textContent=day&&day.live&&hlSel===0&&day.live.km!=null?day.live.km.toLocaleString('sv-SE')+' km, '+day.live.kcal+' kcal':'';
  if(day&&day.hr&&day.hr.length){const v=day.hr.map(r=>r[2]);$('hlHr').textContent=Math.round(v.reduce((a,b)=>a+b,0)/v.length)+' snitt';$('hlHrSub').textContent='lägst '+Math.min(...v)+', högst '+Math.max(...v);}
  else{$('hlHr').textContent='–';$('hlHrSub').textContent='';}
  if(day&&day.o2&&day.o2.length){const v=day.o2.map(r=>r[2]);$('hlO2').textContent=Math.round(v.reduce((a,b)=>a+b,0)/v.length)+' %';$('hlO2Sub').textContent='lägst '+Math.min(...v)+' %';}
  else{$('hlO2').textContent='–';$('hlO2Sub').textContent='';}
  if(day&&day.sleep&&day.sleep.length>1){const s=hlSleepSum(day.sleep);$('hlSleep').textContent=s.sleep?hhm(s.sleep):'–';$('hlSleepSub').textContent=s.sleep?'djup '+hhm(s.deep)+(s.rem?', REM '+hhm(s.rem):''):'';}
  else{$('hlSleep').textContent='–';$('hlSleepSub').textContent='';}
  hlDraw(day);
  // rutorna överst: visa sparade värden när klockan inte skickat något nytt
  const td=HL.days[hymd(new Date())];
  const t=hlTotal(td);if(t!=null&&$('stSteps').textContent==='–')$('stSteps').textContent=t.toLocaleString('sv-SE');
  if(td&&td.hr&&td.hr.length&&$('stPulse').textContent==='–'){const r=td.hr[td.hr.length-1];$('stPulse').textContent=r[2];$('stPulseAt').textContent='Senast '+hpad(r[0])+':'+hpad(r[1])+', sparat på klockan';}
}
function hlCss(n,f){const v=getComputedStyle(document.documentElement).getPropertyValue(n).trim();return v||f;}
function hlCanvas(id){
  const c=$(id),r=c.getBoundingClientRect(),dpr=window.devicePixelRatio||1,w=Math.max(200,Math.round(r.width||300)),h=110;
  c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,w,h);return {x:x,w:w,h:h};
}
function hlAxis(g,top){
  const x=g.x,L=6,R=g.w-6,B=g.h-18;x.strokeStyle='rgba(255,255,255,.10)';x.lineWidth=1;x.beginPath();x.moveTo(L,B+.5);x.lineTo(R,B+.5);x.stroke();
  x.fillStyle=hlCss('--dim','#9aa0b4');x.font='500 11px '+hlCss('--font','system-ui');x.textBaseline='top';
  [0,6,12,18,24].forEach(h=>{const px=L+(R-L)*h/24;x.textAlign=h===0?'left':h===24?'right':'center';x.fillText(String(h).padStart(2,'0'),px,B+5);});
  if(top){x.textAlign='right';x.textBaseline='top';x.fillText(top,R,0);}
  return {L:L,R:R,B:B,T:16};
}
let hlHit={steps:null,hr:null};
function hlDraw(day){
  const a1=hlCss('--a1','#3ba0ff'),a2=hlCss('--a2','#ff5aa0');
  // steg per timme: skillnaden mellan timvärdena
  let g=hlCanvas('hlStepC'),inc=null;
  if(day&&day.steps){inc=day.steps.map((v,h)=>{let p=0;for(let j=h-1;j>=0;j--){if(day.steps[j]){p=day.steps[j];break;}}return v?Math.max(0,v-p):0;});}
  const mx=inc?Math.max(...inc):0,ax=hlAxis(g,mx?'högst '+mx.toLocaleString('sv-SE'):'');
  hlHit.steps=inc;
  if(inc&&mx){const bw=(ax.R-ax.L)/24;g.x.fillStyle=a1;inc.forEach((v,h)=>{if(!v)return;const bh=Math.max(2,(ax.B-ax.T)*v/mx),x0=ax.L+h*bw+1,w=bw-2,y=ax.B-bh;
    g.x.beginPath();if(g.x.roundRect)g.x.roundRect(x0,y,w,bh,[Math.min(4,w/2),Math.min(4,w/2),0,0]);else g.x.rect(x0,y,w,bh);g.x.fill();});}
  else{g.x.fillStyle=hlCss('--dim','#9aa0b4');g.x.textAlign='center';g.x.textBaseline='middle';g.x.fillText('Inga steg sparade',g.w/2,(ax.B+ax.T)/2);}
  // puls under dagen
  g=hlCanvas('hlHrC');const hr=day&&day.hr&&day.hr.length?day.hr:null;
  hlHit.hr=hr;
  if(hr){const v=hr.map(r=>r[2]),lo=Math.min(...v)-5,hi=Math.max(...v)+5,ax2=hlAxis(g,'slag/min '+Math.min(...v)+'–'+Math.max(...v));
    const px=r=>ax2.L+(ax2.R-ax2.L)*(r[0]*60+r[1])/1440,py=r=>ax2.B-(ax2.B-ax2.T)*(r[2]-lo)/(hi-lo);
    g.x.strokeStyle=a2;g.x.lineWidth=2;g.x.lineJoin='round';g.x.beginPath();
    hr.forEach((r,i)=>{const prev=hr[i-1],gap=prev&&(r[0]*60+r[1])-(prev[0]*60+prev[1])>90;if(i===0||gap)g.x.moveTo(px(r),py(r));else g.x.lineTo(px(r),py(r));});g.x.stroke();
    if(hr.length<40){g.x.fillStyle=a2;hr.forEach(r=>{g.x.beginPath();g.x.arc(px(r),py(r),3,0,7);g.x.fill();});}
  }else{const ax2=hlAxis(g,'');g.x.fillStyle=hlCss('--dim','#9aa0b4');g.x.textAlign='center';g.x.textBaseline='middle';g.x.fillText('Ingen puls sparad',g.w/2,(ax2.B+ax2.T)/2);}
}
function hlTap(id,ev){
  const c=$(id),r=c.getBoundingClientRect(),f=Math.min(1,Math.max(0,(ev.clientX-r.left-6)/(r.width-12))),min=f*1440;
  if(id==='hlStepC'){const h=Math.min(23,Math.floor(f*24)),v=hlHit.steps?hlHit.steps[h]:0;$('hlTip').textContent='Kl '+hpad(h)+'–'+hpad(h+1)+': '+(v||0).toLocaleString('sv-SE')+' steg';}
  else if(hlHit.hr){let b=null,bd=1e9;hlHit.hr.forEach(x=>{const d=Math.abs(x[0]*60+x[1]-min);if(d<bd){bd=d;b=x;}});if(b)$('hlTip').textContent='Kl '+hpad(b[0])+':'+hpad(b[1])+': '+b[2]+' slag/min';}
}
$('hlDays').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;hlSel=+b.dataset.i;$('hlTip').textContent='Tryck i diagrammen för att se värdet';hlRender();});
$('hlStepC').addEventListener('click',e=>hlTap('hlStepC',e));
$('hlHrC').addEventListener('click',e=>hlTap('hlHrC',e));
$('btnHlSync').addEventListener('click',()=>hlSync(true));
window.addEventListener('resize',()=>hlRender());
hlRender();
