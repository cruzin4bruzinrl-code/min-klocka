// ---------- Skärm och ljusstyrka ----------
// Ur originalappens kod (inte provat på klockan): läs 02/F0, svar 02/F1 =
// [ljus, tidsfönster, lyft handleden, valt index för skärmtid, antal N, N skärmtider i sekunder, start BE16, slut BE16].
// Skriv 02/EE = [ljus, index för skärmtid, tidsfönster, lyft handleden, start LE16, slut LE16]. Allt utom ljus och skärmtid skickas tillbaka oförändrat.
let DISP=null,dispDay=null,dispNight=null,dispIdx=null;
const DSLS='minklocka.skarm.v1';
function dispParse(d){
  if(!d||d.length<5)return null;const n=d[4];if(d.length<5+n)return null;
  const list=Array.from(d.slice(5,5+n)),o=5+n,be=i=>d.length>=i+2?(d[i]<<8)|d[i+1]:0;
  return {lum:d[0],dash:d[1],raise:d[2],idx:d[3],list:list,start:be(o),end:be(o+2),raw:Array.from(d)};
}
function dispPayload(lum,idx){const D=DISP;return [lum&255,idx&255,D.dash&255,D.raise&255,D.start&255,(D.start>>8)&255,D.end&255,(D.end>>8)&255];}
const dhex=a=>a.map(b=>b.toString(16).padStart(2,'0')).join('');
// Skalan är okänd (1–5 eller 0–100). Ett läst värde över 5 betyder procent.
function dispLevels(){const D=DISP;if(D.lum<=5)return [1,2,3,4,5];const s=[10,25,40,55,70,85,100];if(!s.includes(D.lum))s.push(D.lum);return s.sort((a,b)=>a-b);}
function dispSeg(id,vals,cur,fmt,on){
  const el=$(id);el.innerHTML='';vals.forEach((v,i)=>{const b=document.createElement('button');b.textContent=fmt(v,i);b.dataset.v=i;if(on(v,i))b.className='on';el.appendChild(b);});
}
function dispRender(){
  const D=DISP;$('dispBox').hidden=!D;if(!D)return;
  const L=dispLevels();
  if(dispDay==null)dispDay=D.lum;if(dispNight==null)dispNight=L[0];if(dispIdx==null)dispIdx=D.idx;
  dispSeg('segDay',L,dispDay,v=>String(v),v=>v===dispDay);
  dispSeg('segNight',L,dispNight,v=>String(v),v=>v===dispNight);
  dispSeg('segScreen',D.list,dispIdx,v=>v+' s',(v,i)=>i===dispIdx);
  const [f,t]=dispTimes();
  $('stDispTimes').textContent='Dag '+f+' till '+t+(lsGet(PLLS,null)?' (solens upp- och nedgång där du har vädret)':' (ange en ort under Väder för att följa solen)');
}
function dispTimes(){
  const pl=lsGet(PLLS,null),sun=pl&&typeof pl.lat==='number'?sunTimes(pl.lat,pl.lon,new Date()):null;
  return sun||['07:00','21:00'];
}
const hm2m=s=>{const p=s.split(':');return (+p[0])*60+(+p[1]);};
$('btnDispRead').addEventListener('click',async()=>{
  if(!ready())return;busy=true;const say=t=>{$('stDisp').textContent=t;};
  try{const d=await ask(0x02,0xF0,[],0x02,0xF1,4000);const D=dispParse(d);
    log('Skärminställning från klockan (02/F1): '+hex(d),D?'ok':'bad');
    if(!D){say('Klockan svarade, men svaret gick inte att läsa: '+hex(d));}
    else{DISP=D;try{localStorage.setItem(DSLS,JSON.stringify(D));}catch(e){}dispDay=dispNight=dispIdx=null;
      say('Klockan svarade. Ljusstyrka '+D.lum+', skärmen tänd '+(D.list[D.idx]!=null?D.list[D.idx]+' s':'?')+', lyft handleden för att tända: '+(D.raise?'på':'av')+'.');}
  }catch(e){say('Klockan svarade inte på frågan. Då styrs ljusstyrkan bara på klockan själv.');log('Skärminställning: '+e.message,'bad');}
  busy=false;dispRender();
});
$('segDay').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;dispDay=dispLevels()[+b.dataset.v];dispRender();});
$('segNight').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;dispNight=dispLevels()[+b.dataset.v];dispRender();});
$('segScreen').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;dispIdx=+b.dataset.v;dispRender();});
async function dispWriteNow(arr,what){
  if(!ready())return false;busy=true;let ok=false;
  try{const r=await ask(0x02,0xEE,arr,0x02,0xEF,4000);ok=true;log(what+': klockan svarade '+hex(r),'ok');}catch(e){log(what+': inget svar ('+e.message+')','bad');}
  busy=false;return ok;
}
$('btnDispSave').addEventListener('click',async()=>{
  if(!DISP)return;const [f,t]=dispTimes(),now=new Date(),m=now.getHours()*60+now.getMinutes(),day=m>=hm2m(f)&&m<hm2m(t);
  const pd=dispPayload(dispDay,dispIdx),pn=dispPayload(dispNight,dispIdx);
  if(NATIVE&&NATIVE.setBright){NATIVE.setBright(true,dhex(pd),dhex(pn),hm2m(f),hm2m(t));
    $('stDisp').textContent='Sparat. Appen byter ljusstyrka själv när det blir dag och natt, även i bakgrunden. Skickar nu…';}
  const ok=await dispWriteNow(day?pd:pn,'Ljusstyrka '+(day?dispDay:dispNight));
  $('stDisp').textContent=(ok?'Klockan tog emot det. ':'Klockan bekräftade inte. Titta på klockan om skärmen ändrades. ')+(NATIVE&&NATIVE.setBright?'Appen byter själv mellan dag och natt.':'Automatiken kräver appen. Här skickades bara det som gäller nu.');
});
$('btnDispOff').addEventListener('click',async()=>{
  if(!DISP)return;if(NATIVE&&NATIVE.setBright)NATIVE.setBright(false,'','',-1,-1);
  const ok=await dispWriteNow(dispPayload(DISP.lum,DISP.idx),'Tillbaka till klockans egen inställning');
  $('stDisp').textContent='Automatiken är av'+(ok?' och klockan har sin förra ljusstyrka igen.':'. Klockan bekräftade inte återställningen.');
});
try{const o=JSON.parse(localStorage.getItem(DSLS)||'null');if(o&&o.list){DISP=o;dispRender();}}catch(e){}

// ---------- Aviseringar och sms ----------
function permsNow(){try{return NATIVE&&NATIVE.perms?JSON.parse(NATIVE.perms()):null;}catch(e){return null;}}
window.__mkPerms=function(){
  const p=permsNow(),box=$('grpNotif');if(!box)return;
  if(!p){if(NATIVE){$('stNotif').innerHTML='Din app är den gamla. Ladda ner den nya och installera den över den gamla, så kommer aviseringar och sms till klockan. <a href="https://github.com/cruzin4bruzinrl-code/min-klocka/releases/latest/download/min-klocka.apk" style="display:block;margin-top:10px;padding:13px;border-radius:16px;text-align:center;background:linear-gradient(100deg,var(--a1),var(--a2));color:#08090d;font-weight:700;text-decoration:none">Ladda ner nya appen</a>';}
    else $('stNotif').textContent='Fungerar bara i Android-appen Min klocka.';
    $('btnNotifAccess').hidden=$('btnSmsPerm').hidden=true;$('segNotif').hidden=true;return;}
  $('btnNotifAccess').hidden=p.notif;$('btnSmsPerm').hidden=p.sms;$('segNotif').hidden=false;
  [...$('segNotif').children].forEach(b=>b.classList.toggle('on',(b.dataset.n==='1')===p.on));
  $('stNotif').textContent=(p.notif?'✓ Aviseringar skickas till klockan. ':'Aviseringar: ge appen lov först. ')+(p.sms?'✓ Sms skickas med avsändarens nummer, och svar från klockan blir sms.':'Sms: ge appen lov för att kunna svara från klockan.')+(p.on?'':' (Avstängt just nu.)');
};
$('btnNotifAccess').addEventListener('click',()=>{if(NATIVE&&NATIVE.openNotifyAccess)NATIVE.openNotifyAccess();});
$('btnSmsPerm').addEventListener('click',()=>{if(NATIVE&&NATIVE.askSms)NATIVE.askSms();});
$('segNotif').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!NATIVE||!NATIVE.setNotify)return;NATIVE.setNotify(b.dataset.n==='1');window.__mkPerms();});
window.__mkPerms();
