// ---------- galleri: digitala (ritas här), analoga (färdiga filer) och egna ----------
const FONTLOAD=['500 20px PoppinsApp','700 20px PoppinsApp','300 20px PoppinsLight','700 20px LoraBold','700 20px MonoBold'];
const LSKEY='minklocka.mina.v1';
let MINE=[], cat='all', cur=null, photoCache={};
// Förhandsvisningen går som en riktig klocka: rätt tid varje sekund, och riktiga värden från klockan där de finns.
const LIVEV={};let liveVer=0,heroDial=null,heroCv=null,SCR=null,lastTick='';
const RC=new Map();   // de senast ritade urtavlorna, så att de inte behöver ritas om varje sekund
function setLiveVal(k,v){v=String(v);if(LIVEV[k]===v)return;LIVEV[k]=v;liveVer++;lastTick='';}
function nowT(){const d=new Date();return {h:d.getHours(),m:d.getMinutes(),s:d.getSeconds(),vals:Object.assign({day:String(d.getDate()),wd:['SÖN','MÅN','TIS','ONS','TOR','FRE','LÖR'][d.getDay()]},LIVEV),ver:liveVer*100+d.getDate()};}
function liveDef(def){return !!(def&&def.els&&def.els.some(e=>e.k==='orbit'||(e.k==='hands'&&e.sec)));}
function rOf(d){let r=RC.get(d.gk);if(r){RC.delete(d.gk);RC.set(d.gk,r);return r;}
  r=renderDial(d.def,photoOf(d.def));RC.set(d.gk,r);if(RC.size>16)RC.delete(RC.keys().next().value);return r;}
function paintAnalog(L,t,c){c.drawImage(L.base,0,0);const A=[((t.h%12)+t.m/60)*30,t.m*6,t.s*6];
  ['h','m','s'].forEach((k,i)=>{const im=L[k];c.save();c.translate(L.c[0],L.c[1]);c.rotate(A[i]*Math.PI/180);c.drawImage(im.img,-im.px,-im.py);c.restore();});c.drawImage(L.hub.img,L.hub.px,L.hub.py);}
// Ritar urtavlan som den ser ut just nu på en canvas av valfri storlek.
function paintFace(d,cv,t,r){
  if(!SCR)SCR=mk(DW,DH);const s=ctxOf(SCR);s.setTransform(1,0,0,1,0,0);
  if(d.def)composeDial(r||rOf(d),t,SCR);
  else if(d._lv)paintAnalog(d._lv,t,s);
  else if(d.kind==='f'){s.fillStyle='#0c0d12';s.fillRect(0,0,DW,DH);text(s,'EGEN FIL',120,126,13,'pb','#9aa0b4','c',2);text(s,String(d.name).slice(0,22),120,150,10,'pm','#5d6274','c',0);}
  else return false;
  const c=cv.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(SCR,0,0,cv.width,cv.height);return true;
}
function loadLive(d){const L=d.lv;if(!L||d._lv)return Promise.resolve();const ld=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src;});
  return Promise.all([ld(L.base),ld(L.h[0]),ld(L.m[0]),ld(L.s[0]),ld(L.hub[0])]).then(a=>{if(a.some(x=>!x))return;
    d._lv={base:a[0],h:{img:a[1],px:L.h[1],py:L.h[2]},m:{img:a[2],px:L.m[1],py:L.m[2]},s:{img:a[3],px:L.s[1],py:L.s[2]},hub:{img:a[4],px:L.hub[1],py:L.hub[2]},c:L.c};});}
function paintGrid(t,all){const H=window.innerHeight,m=t.h*60+t.m;
  qsa('#dialGrid canvas[data-cv]').forEach(cv=>{const b=cv.getBoundingClientRect();if(b.bottom<-40||b.top>H+40||!b.width)return;const d=cv._d;if(!d)return;
    if(!all&&!d.live&&cv._m===m&&cv._v===t.ver)return;try{if(paintFace(d,cv,t)){cv._m=m;cv._v=t.ver;}}catch(e){}});}
function tick(force){if(document.hidden)return;const t=nowT(),k=t.h+':'+t.m+':'+t.s+':'+t.ver;if(k===lastTick&&force!==true)return;lastTick=k;
  if(document.body.classList.contains('editing')){if(typeof edPaint==='function')edPaint(t);return;}
  try{if(heroDial&&heroCv)paintFace(heroDial,heroCv,t);}catch(e){}
  if($('view-dials').classList.contains('on'))paintGrid(t,false);}
function loadMine(){try{MINE=JSON.parse(localStorage.getItem(LSKEY)||'[]')||[];}catch(e){MINE=[];}}
function saveMine(){try{localStorage.setItem(LSKEY,JSON.stringify(MINE));return true;}catch(e){log('Kunde inte spara i telefonen: '+e.message,'bad');return false;}}
function allDials(){return DIGITAL.map(d=>Object.assign(d,{gk:'d:'+d.key})).concat(ANALOG.map(d=>Object.assign(d,{gk:'a:'+d.key,kind:'a',live:true})),MINE.map(d=>Object.assign(d,{gk:'m:'+d.id,kind:'m',desc:d.note||'Egen urtavla.',tested:true,exp:defExp(d.def),live:liveDef(d.def),toon:!!(d.def&&(d.def.deco||[]).some(x=>x.k==='toon'))})));}
function findDial(gk){return allDials().find(d=>d.gk===gk);}
function photoOf(def){const s=def&&def.bg&&def.bg.t==='photo'&&def.bg.src;return s?(photoCache[s]||null):null;}
function ensurePhoto(def){const s=def&&def.bg&&def.bg.t==='photo'&&def.bg.src;if(!s||photoCache[s])return Promise.resolve();
  return new Promise(res=>{const im=new Image();im.onload=()=>{photoCache[s]=im;res();};im.onerror=()=>res();im.src=s;});}
function thumbOf(d){ // en liten färdig bild per urtavla, som rutan visar tills den ritas levande
  const t=mk(DW,DH);let ok=false;
  try{ok=paintFace(d,t,nowT(),d.def?renderDial(d.def,photoOf(d.def)):null);}catch(e){}
  if(ok)d.tc=t;return d.tc;
}
function hint(){if(busy||!cur)return;
  const st=statusOf(cur);
  $('stProg').textContent=!connected?'Anslut klockan för att skicka':(cur.exp&&st!=='ok'?cur.name+' är ett experiment. Ha laddaren nära':st==='svart'?cur.name+' gjorde skärmen svart förra gången':st==='fel'?cur.name+' såg fel ut förra gången':st==='ny'?cur.name+' är ny och inte provad på klockan än':'Klar att skicka '+cur.name);}
function showFace(d){
  const a=$('faceA'),b=$('faceB');const inn=faceFlip?a:b,out=faceFlip?b:a;faceFlip=!faceFlip;
  try{paintFace(d,inn,nowT());}catch(e){log('Kunde inte rita '+d.name+': '+e.message,'bad');}
  heroDial=d;heroCv=inn;inn.classList.add('on');out.classList.remove('on');
  document.documentElement.style.setProperty('--a1',d.c1||'#7c8cff');document.documentElement.style.setProperty('--a2',d.c2||'#ff5aa0');
  $('heroName').textContent=d.name;$('heroDesc').textContent=d.desc||'';
}
function renderGrid(){
  const list=allDials().filter(inCat);
  let h='<button type="button" class="chip add" data-new="1"><i>+</i><span>Skapa egen</span></button>';
  h+=list.map(d=>'<button type="button" class="chip'+(cur&&cur.gk===d.gk?' on':'')+'" data-k="'+d.gk+'"><canvas width="240" height="286" data-cv="'+d.gk+'"></canvas><span>'+(FAV[d.gk]?'★ ':'')+d.name.replace(/</g,'&lt;')+badge(d)+'</span></button>').join('');
  if(!list.length&&cat!=='m')h+='<p class="empty">'+(cat==='f'?'Du har inga favoriter än. Välj en urtavla och tryck på Favorit.':cat==='p'?'Inga urtavlor är provade än.':'Här finns inget just nu.')+'</p>';
  if(cat==='m'&&!MINE.length)h+='<p class="empty">Du har inga egna urtavlor än. Tryck på Skapa egen, eller välj en digital urtavla och tryck Redigera.</p>';
  $('dialGrid').innerHTML=h;
  qsa('#dialGrid canvas[data-cv]').forEach(cv=>{const d=list.find(x=>x.gk===cv.dataset.cv);cv._d=d;if(d&&d.tc)cv.getContext('2d').drawImage(d.tc,0,0);});
  if(window.__galleryReady)paintGrid(nowT(),false);
  qsa('#cats button').forEach(b=>b.classList.toggle('on',b.dataset.c===cat));$('mineTools').hidden=cat!=='m';
}
// Ger filen som ska skickas. Analoga finns färdiga, digitala och egna byggs här i telefonen.
async function dialBytes(){
  if(!cur)return null;if(cur.bytes)return cur.bytes;if(cur.b64)return b64ToBytes(cur.b64);
  if(cur.def){await ensurePhoto(cur.def);const b=buildDial(cur.def,cur.id>>>0,photoOf(cur.def));if(b.length>MAXBYTES)throw new Error('Urtavlan är för stor: '+b.length+' byte');return b;}
  return null;
}
function pickDial(gk,quiet){
  const d=findDial(gk)||allDials()[0];cur=d;showFace(d);
  $('stFile').textContent=d.name;$('btnEdit').disabled=!d.def;$('btnEdit').textContent=d.def?(d.kind==='m'?'Redigera':'Redigera en kopia'):'Går inte att redigera';
  $('btnDelete').hidden=d.kind!=='m';
  qsa('.chip',$('dialGrid')).forEach(c=>c.classList.toggle('on',c.dataset.k===d.gk));hint();syncActs();
  if(!quiet)log('Urtavla vald: '+d.name+(statusOf(d)==='ny'?' (inte provad på klockan än)':''));
}
$('dialGrid').addEventListener('click',e=>{if(busy)return;const n=e.target.closest('[data-new]');if(n){openEditor(null);return;}const b=e.target.closest('[data-k]');if(b)pickDial(b.dataset.k);});
$('cats').addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;cat=b.dataset.c;renderGrid();});
$('btnEdit').addEventListener('click',()=>{if(cur&&cur.def&&!busy)openEditor(cur);});
$('btnDelete').addEventListener('click',()=>{if(!cur||cur.kind!=='m'||busy)return;const n=cur.name;MINE=MINE.filter(m=>m.id!==cur.id);saveMine();delete FAV[cur.gk];delete RES[cur.gk];lsSet(FAVLS,FAV);lsSet(RESLS,RES);renderGrid();pickDial(allDials()[0].gk,true);toast(n+' är borttagen');log('Egen urtavla borttagen: '+n);});
$('file').addEventListener('change',async e=>{
  const f=e.target.files[0];if(!f)return;const b=new Uint8Array(await f.arrayBuffer());
  if(b.length<64||b.length>MAXBYTES){log('Filen har fel storlek: '+b.length+' byte','bad');toast('Filen har fel storlek',true);return;}
  cur={gk:'f:'+f.name,name:f.name,kind:'f',bytes:b,tested:true,desc:'Egen fil, '+b.length.toLocaleString('sv-SE')+' byte.'};$('stFile').textContent=f.name;$('btnEdit').disabled=true;$('btnDelete').hidden=true;hint();syncActs();
  showFace(cur);qsa('.chip',$('dialGrid')).forEach(c=>c.classList.remove('on'));log('Egen fil vald: '+f.name+' ('+b.length+' byte)');
});
// Egna urtavlor sparas i webbläsaren och hör till just den här adressen. Filen gör att de går att flytta med.
$('btnExport').addEventListener('click',()=>{if(!MINE.length){toast('Du har inga egna urtavlor än',true);return;}
  const data=JSON.stringify({app:'min-klocka',v:1,mina:MINE.map(m=>({id:m.id,name:m.name,def:m.def,c1:m.c1,c2:m.c2}))});
  if(window.MinKlockaNative){const u=new TextEncoder().encode(data);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));
    const ok=window.MinKlockaNative.saveFile('mina-urtavlor.json',btoa(s));toast(ok?'Sparade '+MINE.length+' urtavlor i Nedladdningar':'Det gick inte att spara filen',!ok);return;}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));a.download='mina-urtavlor.json';document.body.appendChild(a);a.click();a.remove();
  toast('Sparade '+MINE.length+' urtavlor till en fil');log('Egna urtavlor sparade till fil: '+MINE.length);});
$('fileImport').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;
  try{const j=JSON.parse(await f.text());const list=(j&&j.mina)||[];let n=0;
    list.forEach(m=>{if(!m||!m.def||!Array.isArray(m.def.els))return;const rec={id:(m.id>>>0)||(0x86B20000+Math.floor(Math.random()*0xFFFF)),name:String(m.name||'Min urtavla').slice(0,18),def:m.def,c1:m.c1,c2:m.c2};
      const i=MINE.findIndex(x=>x.id===rec.id);if(i>=0)MINE[i]=rec;else MINE.push(rec);n++;});
    saveMine();await Promise.all(MINE.map(m=>ensurePhoto(m.def)));MINE.forEach(m=>{RC.delete('m:'+m.id);try{thumbOf(m);}catch(err){}});renderGrid();toast('Hämtade '+n+' urtavlor');log('Egna urtavlor hämtade från fil: '+n);
  }catch(err){toast('Filen gick inte att läsa',true);log('Hämta från fil: '+err.message,'bad');}
  e.target.value='';});
async function initGallery(){
  loadMine();cur=null;renderGrid();
  try{await Promise.all(FONTLOAD.map(f=>document.fonts.load(f,'0123456789ÅÄÖ')));}catch(e){}
  await Promise.all(MINE.map(m=>ensurePhoto(m.def)).concat(ANALOG.map(loadLive)));
  // rita miniatyrerna lite i taget så att sidan inte hänger sig
  const todo=allDials().filter(d=>!d.tc);let i=0;
  await new Promise(done=>{(function step(){const t0=performance.now();while(i<todo.length&&performance.now()-t0<24){try{thumbOf(todo[i]);}catch(e){log('Kunde inte rita '+todo[i].name+': '+e.message,'bad');}i++;}
    if(i<todo.length)setTimeout(step,0);else done();})();});
  renderGrid();pickDial('d:rutnat',true);window.__galleryReady=true;
  setInterval(tick,200);document.addEventListener('visibilitychange',()=>{lastTick='';tick();});
  let sc=0;const onScroll=()=>{if(sc)return;sc=requestAnimationFrame(()=>{sc=0;if(!document.body.classList.contains('editing'))paintGrid(nowT(),false);});};
  $('view-dials').addEventListener('scroll',onScroll,{passive:true});window.addEventListener('scroll',onScroll,{passive:true});
}
