// ================= favoriter, provresultat, delning, verktyg och annat runt omkring =================
const APPV=23;
const FAVLS='minklocka.fav.v1', RESLS='minklocka.resultat.v1', PLLS='minklocka.plats.v1', CNTLS='minklocka.nedrakning.v1', SELLS='minklocka.vald.v1';
function lsGet(k,def){try{const v=JSON.parse(localStorage.getItem(k));return v==null?def:v;}catch(e){return def;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}}
const NATIVE=window.MinKlockaNative||null;   // finns när sidan visas inne i Android-appen
let FAV=lsGet(FAVLS,{}), RES=lsGet(RESLS,{});
const lastSel=lsGet(SELLS,'');   // läses innan galleriet väljer sin första urtavla
if(typeof FAV!=='object')FAV={};if(typeof RES!=='object')RES={};

// ---------- läge för varje urtavla: ok (fungerar på klockan), ny (inte provad), fel eller svart ----------
function statusOf(d){const r=RES[d.gk];if(r==='ok'||r==='fel'||r==='svart')return r;return d.tested===false?'ny':'ok';}
// Experiment: delar som klockan aldrig setts rita. De kan i värsta fall få klockan att hänga sig.
function defExp(def){return !!(def&&Array.isArray(def.els)&&def.els.some(e=>e&&(e.k==='week'||(e.k==='orbit'&&e.style==='gear')||(e.k==='hands'&&e.small))));}
function badge(d){const st=statusOf(d);
  return st==='svart'?'<em class="bad">svart</em>':st==='fel'?'<em class="bad">fel</em>':(d.exp&&st!=='ok')?'<em class="exp">exp</em>':st==='ny'?'<em>ny</em>':'';}
function inCat(d){
  switch(cat){case 'all':return true;case 'l':return !!d.live;case 't':return !!d.toon;case 's':return !!d.sport;
    case 'x':return !!d.fresh;case 'f':return !!FAV[d.gk];case 'p':return statusOf(d)==='ok';case 'n':return statusOf(d)==='ny';default:return d.kind===cat;}
}
function syncActs(){
  const f=!!(cur&&FAV[cur.gk]);$('btnFav').textContent=(f?'★':'☆')+' Favorit';$('btnFav').classList.toggle('on',f);
  $('btnFav').disabled=!cur||cur.kind==='f';$('btnShare').disabled=!cur||!cur.def;
  if(cur&&cur.kind!=='f')lsSet(SELLS,cur.gk);
}
function scrollToCur(){const el=cur&&qs('#dialGrid [data-k="'+cur.gk+'"]');if(el&&el.scrollIntoView)el.scrollIntoView({block:'center',behavior:'smooth'});}
$('btnFav').addEventListener('click',()=>{if(!cur||cur.kind==='f')return;
  if(FAV[cur.gk])delete FAV[cur.gk];else FAV[cur.gk]=1;lsSet(FAVLS,FAV);renderGrid();syncActs();toast(FAV[cur.gk]?cur.name+' är en favorit':cur.name+' är inte längre en favorit');});
$('btnRand').addEventListener('click',()=>{if(busy)return;
  let list=allDials().filter(inCat).filter(d=>!d.exp&&statusOf(d)!=='fel'&&statusOf(d)!=='svart'&&(!cur||d.gk!==cur.gk));
  if(!list.length){toast('Det finns inget att slumpa bland här',true);return;}
  pickDial(list[Math.floor(Math.random()*list.length)].gk);scrollToCur();});
// Provläge: hoppar till nästa urtavla som inte är provad. Experimenten kommer sist.
$('btnNext').addEventListener('click',()=>{if(busy)return;
  const all=allDials().filter(d=>statusOf(d)==='ny'&&(!cur||d.gk!==cur.gk));
  const d=all.find(x=>!x.exp)||all[0];
  if(!d){toast('Alla urtavlor är provade');return;}
  if(!inCat(d)){cat='n';renderGrid();}
  pickDial(d.gk);scrollToCur();
  const left=all.filter(x=>!x.exp).length;toast(d.exp?'Bara experiment kvar: '+d.name:d.name+', '+left+' oprovade kvar');});

// ---------- ark med en fråga och några svar ----------
let sheetRes=null;
function sheet(title,txt,btns){
  return new Promise(res=>{if(sheetRes){const r=sheetRes;sheetRes=null;r('');}
    sheetRes=res;$('shT').textContent=title;$('shP').textContent=txt||'';
    $('shB').innerHTML=btns.map((b,i)=>'<button type="button" class="'+(b[2]||(i?'soft glass':'cta'))+'" data-r="'+b[1]+'">'+String(b[0]).replace(/</g,'&lt;')+'</button>').join('');
    $('shade').hidden=false;const f=qs('#shB button');if(f)f.focus({preventScroll:true});});
}
$('shB').addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;$('shade').hidden=true;const r=sheetRes;sheetRes=null;if(r)r(b.dataset.r);});

// ---------- skicka, med vakt efteråt ----------
// Efter en oprovad urtavla frågas klockan om den lever. Svarar den inte försöker sidan själv byta till inbyggd urtavla 1.
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function setResult(d,r){if(!d||d.kind==='f')return;RES[d.gk]=r;lsSet(RESLS,RES);renderGrid();hint();log('Provresultat för '+d.name+': '+({ok:'fungerar',fel:'ser fel ut',svart:'skärmen blev svart'}[r]||r),r==='ok'?'ok':'bad');}
async function watchAlive(){
  for(let i=0;i<14;i++){await pause(500);if(!chW)return false;}          // 7 sekunder: så länge tog det innan felet märktes förra gången
  try{await ask(0x04,0x40,[],0x04,0x41,4000);return true;}catch(e){}
  if(!chW)return false;
  try{await ask(0x04,0x40,[],0x04,0x41,4000);return true;}catch(e){return false;}
}
async function sendFlow(){
  if(busy||!cur)return;const d=cur,st=statusOf(d),quick=!!window.__quick;
  if(!quick&&d.exp&&st!=='ok'){
    const a=await sheet(d.name+' är ett experiment','Den innehåller något klockan aldrig har ritat förut. I värsta fall hänger sig klockan, som med Vinyl.\n\nHa laddaren nära. Sidan försöker själv byta tillbaka till en inbyggd urtavla om klockan slutar svara.',[['Avbryt',''],['Skicka ändå','go','soft glass bad']]);
    if(a!=='go')return;
  }else if(!quick&&st==='svart'){
    const a=await sheet(d.name+' gjorde skärmen svart','Du har tidigare svarat att skärmen blev svart av den här urtavlan.',[['Avbryt',''],['Skicka ändå','go','soft glass bad']]);
    if(a!=='go')return;
  }
  const ok=await sendCurrent();
  if(!ok||quick||d.kind==='f'||(st==='ok'&&!d.exp))return;
  $('stProg').textContent='Väntar på att klockan visar '+d.name+'…';
  const dev=device,alive=await watchAlive();
  if(!alive&&dev){
    log('Klockan svarar inte efter '+d.name+'. Försöker byta till inbyggd urtavla 1.','bad');toast('Klockan svarar inte. Försöker rädda den',true);
    wantConn=false;const saved=await rescueWith(dev,12);
    const a=await sheet(saved?'Klockan räddades':'Klockan svarar inte',saved?'Klockan slutade svara efter '+d.name+', och bytte sedan till inbyggd urtavla 1. Blev skärmen svart?':'Lägg klockan på laddaren och tryck sedan på Rädda den på fliken Klocka. Blev skärmen svart?',[['Ja, den blev svart','svart'],['Nej, urtavlan syntes','ok','soft glass'],['Vet inte','','soft glass']]);
    if(a)setResult(d,a==='ok'?'fel':'svart');
    if(saved){wantConn=true;reconnN=0;planReconnect();}
    return;
  }
  $('stProg').textContent=d.name+' finns nu på klockan';
  const a=await sheet('Hur ser '+d.name+' ut på klockan?','Titta på klockan. Tänd skärmen om den är släckt.',[['Fungerar','ok'],['Ser fel ut','fel','soft glass'],['Skärmen är svart','svart','soft glass bad'],['Svara senare','','soft glass']]);
  if(!a)return;
  setResult(d,a);
  if(a==='svart'&&device){wantConn=false;toast('Försöker rädda klockan',true);const saved=await rescueWith(device,12);if(saved){wantConn=true;reconnN=0;planReconnect();}}
  else if(a==='fel')toast('Noterat. Kopiera provresultaten på fliken Logg när du vill visa dem');
}
$('btnCopyRes').addEventListener('click',async()=>{
  const all=allDials(),by=k=>all.filter(d=>statusOf(d)===k&&(k!=='ok'||RES[d.gk]==='ok')).map(d=>d.name+(d.exp?' (exp)':'')).join(', ')||'inga';
  const t='Provresultat, version '+APPV+'\nFungerar: '+by('ok')+'\nSer fel ut: '+by('fel')+'\nSvart skärm: '+by('svart')+'\nInte provade: '+by('ny');
  try{await navigator.clipboard.writeText(t);toast('Provresultaten är kopierade');}catch(e){toast('Kunde inte kopiera',true);}log(t);});

// ---------- nyckel: hälsningen som klockan känner igen ----------
function keyState(){const has=!!pairKey();$('keyBox').hidden=has;return has;}
function storeKey(k){k=String(k||'').toLowerCase().replace(/[^0-9a-f]/g,'');if(!/^ba[0-9a-f]{50}$/.test(k))return false;try{localStorage.setItem(KEYLS,k);}catch(e){return false;}try{if(NATIVE)NATIVE.setKey(k);}catch(e){}keyState();return true;}
$('btnKey').addEventListener('click',()=>{if(storeKey($('txtKey').value)){$('txtKey').value='';toast('Nyckeln är sparad');log('Nyckeln är sparad i den här webbläsaren','ok');}else toast('Det där är inte en hel nyckel',true);});

// ---------- dela en urtavla som länk ----------
function b64u(a){let s='';for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode.apply(null,a.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64u(t){t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';return b64ToBytes(t);}
async function pipe(bytes,T){return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new T('deflate-raw'))).arrayBuffer());}
async function packDial(d){
  const u=new TextEncoder().encode(JSON.stringify({n:d.name,d:d.def,c1:d.c1,c2:d.c2}));
  if(window.CompressionStream){try{return 'z'+b64u(await pipe(u,CompressionStream));}catch(e){}}
  return 'j'+b64u(u);
}
async function unpackDial(t){
  let u=unb64u(t.slice(1));if(t[0]==='z'){if(!window.DecompressionStream)throw new Error('Webbläsaren kan inte packa upp länken');u=await pipe(u,DecompressionStream);}else if(t[0]!=='j')throw new Error('Okänd länk');
  if(u.length>60000)throw new Error('Länken är för stor');
  const o=JSON.parse(new TextDecoder().decode(u));
  if(!o||!o.d||!Array.isArray(o.d.els)||o.d.els.length>24)throw new Error('Länken innehåller ingen urtavla');
  if(o.d.bg&&o.d.bg.t==='photo')o.d.bg={t:'solid',c:'#000000'};
  const col=c=>/^#[0-9a-f]{6}$/i.test(c)?c:undefined;
  const rec={id:(0x86B30000+Math.floor(Math.random()*0xFFFF))>>>0,name:String(o.n||'Delad urtavla').slice(0,18),def:o.d,c1:col(o.c1),c2:col(o.c2)};
  const r=renderDial(rec.def,null);if(dialSize(r)>MAXBYTES)throw new Error('Urtavlan är för stor');const prob=dialProblem(r);if(prob)throw new Error(prob);
  return rec;
}
$('btnShare').addEventListener('click',async()=>{
  if(!cur||!cur.def)return;
  if(cur.def.bg&&cur.def.bg.t==='photo'){toast('Urtavlor med foto går inte att dela som länk',true);return;}
  try{const url=location.href.split('#')[0]+'#u='+await packDial(cur);
    if(NATIVE){NATIVE.share(url);return;}
    if(navigator.share){try{await navigator.share({title:cur.name,text:'Urtavla: '+cur.name,url:url});return;}catch(e){if(e&&e.name==='AbortError')return;}}
    await navigator.clipboard.writeText(url);toast('Länken till '+cur.name+' är kopierad');log('Länk till '+cur.name+' kopierad ('+url.length+' tecken)');
  }catch(e){toast('Det gick inte att dela',true);log('Dela: '+e.message,'bad');}
});
function addMine(rec,quiet){
  const i=MINE.findIndex(m=>m.id===rec.id);if(i>=0)MINE[i]=rec;else MINE.unshift(rec);
  if(!saveMine()){toast('Det gick inte att spara',true);return false;}
  RC.delete('m:'+rec.id);rec.tc=null;try{thumbOf(rec);}catch(e){}
  cat='m';renderGrid();pickDial('m:'+rec.id,true);showTab('dials');if(!quiet)toast(rec.name+' ligger under Mina');return true;
}
// Adressen kan bära en nyckel (#k=) eller en delad urtavla (#u=). Båda tas bort ur adressfältet direkt.
async function readHash(){
  const h=location.hash.replace(/^#/,'');if(!h)return;
  const q=new URLSearchParams(h),k=q.get('k'),u=q.get('u');
  if(k||u){try{history.replaceState(null,'',location.pathname+location.search);}catch(e){}}
  if(k){if(storeKey(k)){toast('Nyckeln är sparad. Nu räcker den vanliga adressen');log('Nyckeln är sparad i den här webbläsaren','ok');}else{toast('Nyckeln i länken är inte hel',true);log('Nyckeln i länken gick inte att läsa','bad');}}
  if(u){try{const rec=await unpackDial(u);rec.note='Delad urtavla.';addMine(rec,true);toast('Hämtade '+rec.name+' från länken');log('Delad urtavla hämtad: '+rec.name+(defExp(rec.def)?' (experiment)':''));}
    catch(e){toast('Länken gick inte att läsa',true);log('Delad länk: '+e.message,'bad');}}
}

// ---------- väder, fri siffra, stegmål ----------
async function askSoft(cmd,key,data,ms){const p=waitFor(cmd,key,ms||3000).catch(()=>null);await send(cmd,key,data);return p;}
function s8(v){v=Math.max(-99,Math.min(99,Math.round(v)));return v&255;}
// Som originalappen: först dagens väder (03/30), sedan ort och sju dagar (03/37). Varje dag är lägst, högst, vädertyp och temperatur nu.
// Vädertyp: 0 klart, 1 moln eller dimma, 2 regn eller åska, 3 snö.
async function sendWeather(days,city){
  const four=x=>[s8(x.lo>=x.hi?x.hi-1:x.lo),s8(x.hi),x.code&3,s8(x.cur)];
  const r1=await askSoft(0x03,0x30,four(days[0]),3000);
  const now=new Date(),cb=utf16le(String(city||'').slice(0,20));
  const body=[now.getFullYear()%100,now.getMonth()+1,now.getDate(),now.getHours(),cb.length,...cb];
  for(let i=0;i<7;i++)body.push(...four(days[Math.min(i,days.length-1)]));
  const r2=await askSoft(0x03,0x37,body,3000);
  log('Väder skickat: '+hex(four(days[0]))+'. Svar: '+(r1?'ja':'inget')+' och '+(r2?'ja':'inget'),(r1||r2)?'ok':'bad');
  return !!(r1||r2);
}
function wmo(c){return c<=1?0:(c<=48?1:((c>=71&&c<=77)||c===85||c===86?3:2));}
const WNAME=['klart','moln','regn','snö'];
async function getPlace(){
  const q=$('txtOrt').value.trim(),saved=lsGet(PLLS,null);
  if(q){const j=await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=sv&name='+encodeURIComponent(q))).json();
    const r=j&&j.results&&j.results[0];if(!r)throw new Error('Hittar inte orten '+q);return {lat:+r.latitude.toFixed(3),lon:+r.longitude.toFixed(3),name:String(r.name)};}
  try{const pos=await new Promise((res,rej)=>{if(!navigator.geolocation)return rej(new Error('ingen plats'));navigator.geolocation.getCurrentPosition(res,rej,{timeout:10000,maximumAge:600000});});
    const lat=+pos.coords.latitude.toFixed(3),lon=+pos.coords.longitude.toFixed(3);
    return {lat:lat,lon:lon,name:saved&&saved.name&&Math.abs(saved.lat-lat)<.3&&Math.abs(saved.lon-lon)<.6?saved.name:'Här'};}
  catch(e){if(saved&&typeof saved.lat==='number')return saved;throw new Error('Skriv en ort, eller låt sidan använda platsen');}
}
async function loadWeather(pl){
  const j=await (await fetch('https://api.open-meteo.com/v1/forecast?latitude='+pl.lat+'&longitude='+pl.lon+'&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7')).json();
  if(!j||!j.current||!j.daily)throw new Error('Vädertjänsten svarade inte som väntat');
  const cur=Math.round(j.current.temperature_2m);
  return j.daily.time.map((_,i)=>({lo:Math.round(j.daily.temperature_2m_min[i]),hi:Math.round(j.daily.temperature_2m_max[i]),code:wmo(i?j.daily.weather_code[i]:j.current.weather_code),cur:cur}));
}
$('btnWeather').addEventListener('click',async()=>{
  const b=$('btnWeather');b.disabled=true;$('stWeather').textContent='Hämtar vädret…';
  try{const pl=await getPlace();lsSet(PLLS,pl);const days=await loadWeather(pl),d=days[0];
    setLiveVal('temp',Math.abs(d.cur));
    $('stWeather').textContent=pl.name+': '+d.cur+'°, '+WNAME[d.code]+'. I dag '+d.lo+' till '+d.hi+'°.';log('Väder för '+pl.name+': '+d.cur+'°, '+WNAME[d.code]+', '+d.lo+' till '+d.hi+'°');
    if(!chW){toast('Vädret är hämtat. Anslut klockan för att skicka det',true);}
    else if(busy){toast('Vänta tills överföringen är klar',true);}
    else{const ok=await sendWeather(days,pl.name==='Här'?'':pl.name);toast(ok?'Vädret är skickat till klockan':'Klockan svarade inte på vädret',!ok);}
  }catch(e){$('stWeather').textContent=e.message;log('Väder: '+e.message,'bad');toast('Det gick inte att hämta vädret',true);}
  b.disabled=false;
});
let freeSym=0;
$('segSym').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;freeSym=+b.dataset.s;qsa('button',$('segSym')).forEach(x=>x.classList.toggle('on',x===b));});
$('btnFree').addEventListener('click',async()=>{if(!ready())return;
  const n=Math.round(+$('numFree').value);if(!isFinite(n)||n<-40||n>99){toast('Välj en siffra mellan -40 och 99',true);return;}
  try{const ok=await sendWeather([{lo:n-1,hi:n,code:freeSym,cur:n}],'');toast(ok?'Siffran '+n+' är skickad':'Klockan svarade inte',!ok);}
  catch(e){log('Fri siffra: '+e.message,'bad');toast('Det gick inte att skicka',true);}});
// Mål (02/22): steg, kalorier, meter och sömn i minuter. De tre sista lämnas som de var i klockans egen app.
$('btnGoal').addEventListener('click',async()=>{if(!ready())return;
  const n=Math.round(+$('numGoal').value);if(!isFinite(n)||n<1000||n>50000){toast('Välj ett mål mellan 1 000 och 50 000 steg',true);return;}
  try{const r=await askSoft(0x02,0x22,[...le32(n),...le32(350),...le32(5000),...le32(480)],3000);
    log('Stegmål '+n+' skickat. Svar: '+(r?(r.length?hex(r):'(tomt)'):'inget svar'),r?'ok':'bad');toast(r?'Stegmålet är '+n.toLocaleString('sv-SE')+' steg':'Klockan svarade inte',!r);}
  catch(e){log('Stegmål: '+e.message,'bad');toast('Det gick inte att skicka',true);}});

// ---------- träningssignal: samma takt som urtavlorna Intervall, Tabata och Pomodoro ----------
const SIG={intervall:s=>s%60<40?'KÖR':'VILA',tabata:s=>s%30<20?'KÖR':'VILA',pomodoro:s=>Math.floor(s/60)%30<25?'FOKUS':'PAUS'};
let sigMode='',sigLast='',sigT=0,wakeL=null;
function sigTick(){
  if(!sigMode)return;const d=new Date(),ph=SIG[sigMode](d.getMinutes()*60+d.getSeconds());
  if(ph===sigLast)return;const first=!sigLast;sigLast=ph;if(first||!chW||busy)return;
  ask(0x06,0x60,[0x18,...utf16le(ph)],0x06,0x60,3000).then(()=>log('Träningssignal: '+ph)).catch(e=>log('Träningssignal: '+e.message,'bad'));
}
$('segSig').addEventListener('click',async e=>{const b=e.target.closest('[data-g]');if(!b)return;
  sigMode=b.dataset.g;sigLast='';qsa('button',$('segSig')).forEach(x=>x.classList.toggle('on',x===b));clearInterval(sigT);
  if(wakeL){try{wakeL.release();}catch(_){}wakeL=null;}
  if(!sigMode){toast('Träningssignalen är av');return;}
  sigT=setInterval(sigTick,250);sigTick();
  try{if(navigator.wakeLock)wakeL=await navigator.wakeLock.request('screen');}catch(_){}
  toast(chW?'Signalen går vid nästa byte':'Anslut klockan, annars hörs ingen signal',!chW);log('Träningssignal: '+b.textContent);});

// ---------- urtavlor som skapas av text: lapp, dagens och QR-kod ----------
const DAYS=['SÖNDAG','MÅNDAG','TISDAG','ONSDAG','TORSDAG','FREDAG','LÖRDAG'],MONTHS=['januari','februari','mars','april','maj','juni','juli','augusti','september','oktober','november','december'];
function isoWeek(d){const t=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const n=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-n);return Math.ceil(((t-Date.UTC(t.getUTCFullYear(),0,1))/864e5+1)/7);}
// Solens upp- och nedgång för en plats och dag, i telefonens tidszon. Ger null när solen inte går upp eller ner alls.
function sunTimes(lat,lon,d){
  const rad=Math.PI/180,N=Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5),g=2*Math.PI/365*(N-1);
  const eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g));
  const dec=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g);
  const ch=(Math.cos(90.833*rad)-Math.sin(lat*rad)*Math.sin(dec))/(Math.cos(lat*rad)*Math.cos(dec));if(!(ch>=-1&&ch<=1))return null;
  const ha=Math.acos(ch)/rad,tz=-d.getTimezoneOffset(),f=m=>{m=((Math.round(m)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
  return [f(720-4*(lon+ha)-eq+tz),f(720-4*(lon-ha)-eq+tz)];
}
const newId=()=>(0x86B20000+Math.floor(Math.random()*0xFFFF))>>>0;
function noteDef(lines){return {bg:{t:'solid',c:'#ffd84a'},deco:[{k:'rect',x:0,y:0,w:240,h:46,r:0,c:'#f2c230'},{k:'note',lines:lines,x:120,y:54,w:212,h:216,s:44,f:'pb',c:'#1b1a12'}],els:[{k:'time',x:120,y:8,s:28,f:'pb',c:'#1b1a12'}]};}
$('btnNote').addEventListener('click',()=>{
  const lines=$('txtNote').value.split('\n').map(t=>t.trim().slice(0,24)).filter(t=>t).slice(0,9);
  if(!lines.length){toast('Skriv något på lappen först',true);return;}
  addMine({id:newId(),name:('Lapp '+lines[0]).slice(0,18),def:noteDef(lines),c1:'#ffd84a',c2:'#f2a030',note:'Lapp: '+lines.join(', ').slice(0,60)});log('Lapp skapad: '+lines.length+' rader');});
function todayDef(d,cnt,sun){
  const deco=[{k:'text',txt:DAYS[d.getDay()],x:120,y:16,s:25,f:'pb',c:'#ffc83c',al:'c',tr:1},{k:'text',txt:d.getDate()+' '+MONTHS[d.getMonth()].toUpperCase()+'  V '+isoWeek(d),x:120,y:50,s:15,f:'pb',c:'#c9cee0',al:'c',tr:.5},
    {k:'line',x:30,y:162,x2:210,y2:162,c:'#ffffff',w:1,a:.2}];
  let y=172;const fit=t=>Math.max(11,Math.min(16,Math.floor(214/(t.length*.74))));
  if(sun){const t='SOL '+sun[0]+' TILL '+sun[1];deco.push({k:'text',txt:t,x:120,y:y,s:fit(t),f:'pb',c:'#ffe9a8',al:'c',tr:.5});y+=25;}
  if(cnt){deco.push({k:'text',txt:cnt,x:120,y:y,s:fit(cnt),f:'pb',c:'#7fe3b0',al:'c',tr:.5});y+=25;}
  const vy=Math.max(y+4,222);
  return {bg:{t:'grad',c:'#131a2e',c2:'#07090f',a:180},deco:deco,els:[{k:'time',x:120,y:76,s:68,f:'pb',c:'#ffffff'},{k:'steps',x:72,y:vy,s:24,f:'pb',c:'#ffffff',lab:'STEG'},{k:'battv',x:172,y:vy,s:24,f:'pb',c:'#ffffff',lab:'BATT'}]};
}
$('btnToday').addEventListener('click',()=>{
  const d=new Date(),name=$('txtCount').value.trim().slice(0,14),dv=$('datCount').value;let cnt='';
  if(name&&dv){const t=new Date(dv+'T00:00:00'),n=Math.round((t-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/864e5);
    cnt=n>1?n+' DAGAR TILL '+name.toUpperCase():n===1?'I MORGON: '+name.toUpperCase():n===0?'I DAG: '+name.toUpperCase():'';lsSet(CNTLS,{n:name,d:dv});}
  else if(name||dv){toast('Fyll i både namn och datum för nedräkningen',true);return;}
  const pl=lsGet(PLLS,null),sun=pl&&typeof pl.lat==='number'?sunTimes(pl.lat,pl.lon,d):null;
  addMine({id:0x86B2F002,name:'Dagens '+d.getDate()+'/'+(d.getMonth()+1),def:todayDef(d,cnt,sun),c1:'#ffc83c',c2:'#4ea1ff',note:'Gäller '+DAYS[d.getDay()].toLowerCase()+' '+d.getDate()+' '+MONTHS[d.getMonth()]+'. Skapa en ny i morgon.'});
  log('Dagens urtavla skapad'+(sun?', sol '+sun[0]+' till '+sun[1]:', utan soltider (hämta vädret en gång så sparas platsen)')+(cnt?', '+cnt:''));});
// IronSplit ligger under samma adress och lägger ut dagens eller nästa pass. Här blir det en urtavla att läsa av i gymmet.
function passData(){const p=lsGet('ironsplit.idag',null);return p&&typeof p.t==='string'&&Array.isArray(p.l)&&p.l.length?p:null;}
function syncPass(){const p=passData();$('blkPass').hidden=!p;if(p)$('stPass').textContent=(p.day?p.day+': ':'')+p.t+', '+p.l.length+' övningar';}
$('btnPass').addEventListener('click',()=>{
  const p=passData();if(!p){toast('Öppna IronSplit först',true);return;}
  const lines=p.l.slice(0,9).map(t=>{t=String(t);const m=t.match(/^(.*?)\s+(\d+)[×x](\d+)[–-](\d+)$/);
    const nm=(m?m[1]:t).replace(/ i maskin| i kabel( med rep)?|, smalt grepp|, högt drag|, brett grepp| över huvudet/g,'').trim();
    return m?nm.slice(0,19).trim()+' '+m[2]+'x'+m[3]+'-'+m[4]:nm.slice(0,28);});
  const def=noteDef(lines);def.bg={t:'solid',c:'#10131c'};def.deco[0].c='#1c2233';def.deco[1].c='#ffffff';def.els[0].c='#ffffff';
  addMine({id:0x86B2F004,name:('Pass '+p.t).slice(0,18),def:def,c1:'#7c6cf6',c2:'#2dd4bf',note:(p.day?p.day+': ':'')+p.t+'. Skapa en ny inför nästa pass.'});log('Urtavla av passet skapad: '+p.t+', '+lines.length+' rader');});
$('btnQR').addEventListener('click',()=>{
  const t=$('txtQR').value.trim();if(!t){toast('Skriv texten eller länken först',true);return;}
  try{qrMatrix(t);}catch(e){toast('Texten är för lång för en QR-kod här',true);return;}
  addMine({id:newId(),name:('QR '+t.replace(/^https?:\/\//,'')).slice(0,18),def:{bg:{t:'solid',c:'#ffffff'},deco:[{k:'qr',txt:t,x:10,y:8,size:220}],els:[{k:'time',x:120,y:240,s:32,f:'pb',c:'#111111'}]},c1:'#ffffff',c2:'#7c8cff',note:'QR-kod: '+t.slice(0,60)});
  log('QR-kod skapad ('+new TextEncoder().encode(t).length+' byte)');});

// ---------- version, installation och anslutning utan att fråga ----------
let swReg=null;
$('btnUpd').addEventListener('click',async()=>{
  try{const j=await (await fetch('version.json?t='+Date.now(),{cache:'no-store'})).json();
    if(j&&j.v>APPV){toast('Version '+j.v+' finns. Laddar om…');log('Ny version finns: '+j.v);try{if(swReg)await swReg.update();}catch(e){}setTimeout(()=>location.reload(),900);}
    else toast('Du har den senaste versionen');
  }catch(e){toast('Det gick inte att kolla just nu',true);log('Versionskoll: '+e.message,'bad');}
});
// Har webbläsaren redan fått lov att använda klockan ansluter sidan direkt, utan att fråga. Finns inte i alla versioner av Chrome.
async function autoConnect(){
  if(!navigator.bluetooth||!navigator.bluetooth.getDevices||connected||reconnBusy||window.__quick)return;
  try{const list=await navigator.bluetooth.getDevices(),dev=list.find(d=>/^TRIARENA/.test(d.name||''));if(!dev)return;
    log('Klockan är känd sedan förut. Försöker ansluta utan att fråga.');wantConn=true;reconnN=0;reconnBusy=true;
    try{await connectDevice(dev,true);reconnN=0;}catch(e){log('Det gick inte den här gången: '+e.message);try{dev.gatt.disconnect();}catch(_){}chW=null;pill('','Inte ansluten');watchState('');setConnected(false);wantConn=false;}
    reconnBusy=false;
  }catch(e){}
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncPass();if(!document.hidden&&wantConn&&!connected&&device&&!reconnBusy&&!rescuing){reconnN=Math.min(reconnN,2);planReconnect();}
  if(!document.hidden&&sigMode&&!wakeL&&navigator.wakeLock)navigator.wakeLock.request('screen').then(l=>{wakeL=l;}).catch(()=>{});});
async function afterInit(){
  $('stVer').textContent=APPV+(NATIVE?' i appen':'');syncPass();
  if(NATIVE){
    // Appen och sidan delar nyckeln, så att den bara behöver läggas in på ett ställe
    try{const nk=NATIVE.getKey();if(!pairKey()&&nk)storeKey(nk);else if(pairKey()&&!nk)NATIVE.setKey(pairKey());}catch(e){}
    $('btnConnectAll').hidden=true;$('btnConnectAll').style.display='none';
    window.__mkAuto=()=>{if(!connected&&!reconnBusy&&!rescuing&&!busy)autoConnect();};
  }
  keyState();
  const c=lsGet(CNTLS,null);if(c&&c.n&&c.d){$('txtCount').value=c.n;$('datCount').value=c.d;}
  const pl=lsGet(PLLS,null);if(pl&&pl.name&&pl.name!=='Här')$('txtOrt').value=pl.name;
  if(lastSel&&findDial(lastSel))pickDial(lastSel,true);
  await readHash();
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){try{swReg=await navigator.serviceWorker.register('sw.js');}catch(e){log('Kunde inte förbereda för användning utan nät: '+e.message);}}
  autoConnect();
}
