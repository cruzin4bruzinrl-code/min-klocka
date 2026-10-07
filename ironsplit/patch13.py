# IronSplit v12 -> v13: klockan (puls, signal när vilan är slut), inläsning av kopia vid första start
import sys
s=open('v12.html',encoding='utf8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(s.count(a),a[:70]); s=s.replace(a,b)

# ---------- stil ----------
rep(".co-restbar b{font-size:1.5rem;font-variant-numeric:tabular-nums}",
    ".co-restbar b{font-size:1.5rem;font-variant-numeric:tabular-nums}\n.co-hr{display:block;font-size:1rem;font-weight:700;color:var(--ink2);font-variant-numeric:tabular-nums}\n.co-hr[data-on='1']{color:var(--hard)}\n.co-hr:empty{display:none}\n.co-hr2{text-align:center;font-size:1.3rem;font-weight:700;color:var(--ink);margin-top:.6rem;font-variant-numeric:tabular-nums}\n.co-hr2:empty{display:none}")

# ---------- klockmodulen: läggs före passets kod ----------
WATCH=r'''/* ═════════ KLOCKAN ═════════
   Egen klocka (TRIARENALI1) över Bluetooth i Chrome på Android. Helt frivilligt: utan klocka fungerar allt som förut.
   Klockan ger pulsen medan den mäter, och får en kort text när vilan är slut så att den vibrerar på handleden. */
const W_SVC='4cdabaa0-2cea-c0c1-b38d-a0481ae60a97',W_TX='4cdabaa1-2cea-c0c1-b38d-a0481ae60a97',W_RX='4cdabaa2-2cea-c0c1-b38d-a0481ae60a97';
const WATCH={on:false,busy:false,hr:0,hrAt:0};
let wDev=null,wCh=null,wBuf=new Uint8Array(0),wSeq=0x0700,wWant=false,wTries=0,wTimer=0,wQueue=Promise.resolve();
const wCan=()=>!!navigator.bluetooth;
function wCrc(p){let c=0xFFFF;for(const b of p){c^=b<<8;for(let i=0;i<8;i++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF}return c}
function wFrame(cmd,key,data){
  data=data||[];const n=data.length,p=new Uint8Array(5+n);p[0]=cmd;p[1]=n?1:0;p[2]=key;p[3]=(n>>8)&255;p[4]=n&255;p.set(data,5);
  const c=wCrc(p),f=new Uint8Array(8+p.length);f[0]=0xBA;f[1]=0x21;f[2]=(p.length>>8)&255;f[3]=p.length&255;f[4]=c>>8;f[5]=c&255;f[6]=wSeq&255;f[7]=(wSeq>>8)&255;wSeq=(wSeq+1)&0xFFFF;f.set(p,8);return f;
}
const wHex=h=>Uint8Array.from(h.match(/../g).map(x=>parseInt(x,16)));
/* Nyckeln som klockan känner igen. Sparas av appen Min klocka i samma webbläsare. Saknas den går det oftast ändå. */
function wKey(){try{const k=(localStorage.getItem('minklocka.nyckel.v1')||'').toLowerCase();return /^ba[0-9a-f]{50}$/.test(k)?k:''}catch(e){return ''}}
function wSend(bytes){
  wQueue=wQueue.then(async()=>{if(!wCh)return;for(let o=0;o<bytes.length;o+=180)await wCh.writeValueWithoutResponse(bytes.slice(o,o+180))}).catch(()=>{});
  return wQueue;
}
function wNotify(ev){
  const v=new Uint8Array(ev.target.value.buffer),n=new Uint8Array(wBuf.length+v.length);n.set(wBuf);n.set(v,wBuf.length);wBuf=n;
  while(wBuf.length>=8){
    if(wBuf[0]!==0xBA){const i=wBuf.indexOf(0xBA,1);wBuf=i<0?new Uint8Array(0):wBuf.slice(i);continue}
    const len=(wBuf[2]<<8)|wBuf[3];if(wBuf.length<8+len)break;
    const f=wBuf.slice(0,8+len);wBuf=wBuf.slice(8+len);if(f.length>=13)wGot(f[8],f[10],f.slice(13));
  }
  if(wBuf.length>8192)wBuf=new Uint8Array(0);
}
function wGot(cmd,key,d){
  // 0A/AB: pulsen, skickas av klockan medan den mäter
  if(cmd===0x0A&&key===0xAB&&d.length>=8&&d[0]>0){
    WATCH.hr=d[0];WATCH.hrAt=Date.now();
    const C=S.coach;if(C&&coIsOpen&&C.i>0){const h=C.hr=C.hr||{n:0,sum:0,max:0};h.n++;h.sum+=d[0];h.max=Math.max(h.max,d[0])}
    wPaint();
  }
}
const wFresh=()=>WATCH.on&&WATCH.hr>0&&Date.now()-WATCH.hrAt<20000;
function wPaint(){
  const a=document.getElementById('co-hr'),b=document.getElementById('co-hr2');
  if(a){a.textContent=wFresh()?'♥ '+WATCH.hr:(WATCH.on?'⌚ ansluten':'');a.dataset.on=wFresh()?'1':'0'}
  if(b)b.textContent=wFresh()?'Puls '+WATCH.hr:'';
}
async function wOpen(){
  const sv=await wDev.gatt.connect(),svc=await sv.getPrimaryService(W_SVC);
  wCh=await svc.getCharacteristic(W_TX);const rx=await svc.getCharacteristic(W_RX);
  await rx.startNotifications();if(!rx._h){rx.addEventListener('characteristicvaluechanged',wNotify);rx._h=1}
  wBuf=new Uint8Array(0);wQueue=Promise.resolve();
  const k=wKey();if(k){await wSend(wHex(k));await wSend(wFrame(0x04,0x44,[...wHex(k.slice(26,50)),1]))}
  WATCH.on=true;wTries=0;
}
function wLost(){
  WATCH.on=false;wCh=null;wPaint();clearTimeout(wTimer);
  if(!wWant||!wDev||wTries>=6)return;
  wTimer=setTimeout(async()=>{if(!wWant||WATCH.on)return;try{await wOpen();wPaint()}catch(e){try{wDev.gatt.disconnect()}catch(_){}wLost()}},[2,4,8,15,30,60][wTries++]*1000);
}
function wRefresh(){if(coIsOpen)coRender();else if(tab==='settings')render();wPaint()}
async function wToggle(){
  if(WATCH.busy)return;
  if(WATCH.on||wWant){wWant=false;clearTimeout(wTimer);S.watch=false;save();try{wDev&&wDev.gatt.disconnect()}catch(e){}WATCH.on=false;wCh=null;wRefresh();toast('Klockan är frånkopplad');return}
  if(!wCan()){toast('Klockan kräver Chrome på Android');return}
  WATCH.busy=true;
  try{
    if(!wDev){wDev=await navigator.bluetooth.requestDevice({filters:[{namePrefix:'TRIARENA'}],optionalServices:[W_SVC]});wDev.addEventListener('gattserverdisconnected',wLost)}
    wWant=true;wTries=0;await wOpen();S.watch=true;save();toast('Klockan är ansluten ✓');
  }catch(e){wWant=false;WATCH.on=false;if(!(e&&e.name==='NotFoundError'))toast('Det gick inte att ansluta klockan')}
  WATCH.busy=false;wRefresh();
}
/* En kort text till klockan. Den visas som en avisering, och klockan vibrerar. */
function wSay(t){
  if(!WATCH.on||!wCh||!t)return;const a=[0x18];t=String(t).slice(0,40);
  for(let i=0;i<t.length;i++){const c=t.charCodeAt(i);a.push(c&255,c>>8)}
  wSend(wFrame(0x06,0x60,a));
}
/* Har klockan använts förut ansluts den igen när passet öppnas, utan att fråga, om webbläsaren tillåter det. */
async function wResume(){
  try{
    if(!wDev&&navigator.bluetooth&&navigator.bluetooth.getDevices){const d=(await navigator.bluetooth.getDevices()).find(x=>/^TRIARENA/.test(x.name||''));if(d){wDev=d;d.addEventListener('gattserverdisconnected',wLost)}}
    if(!wDev||WATCH.on||wWant)return;
    wWant=true;wTries=0;await wOpen();wRefresh();
  }catch(e){wLost()}
}
function watchSwitch(){
  if(!wCan())return '';
  return `<button class="co-switch" role="switch" aria-checked="${WATCH.on}" onclick="wToggle()"><span><b>Använd klockan</b><small>${WATCH.on?'Ansluten. Klockan vibrerar när vilan är slut, och pulsen visas här när klockan mäter.':'Klockan vibrerar när vilan är slut, och pulsen visas här när klockan mäter.'}</small></span><i></i></button>`;
}
/* Dagens pass läggs där appen Min klocka kan läsa det och göra en urtavla av det. */
function wPublishToday(){
  try{const now=sessionFor(new Date().getDay()),s=now||nextSession();
    localStorage.setItem('ironsplit.idag',JSON.stringify({d:today(),t:s.title,day:now?'Idag':s.day,l:allEx(s).map(ex=>`${ex.sv} ${setsFor(ex)}×${ex.r}`)}));
  }catch(e){}
}

'''
rep("/* ─── passets steg ─── */", WATCH+"/* ─── passets steg ─── */")

# ---------- visa pulsen ----------
rep('''<div class="co-where">${where}</div>''','''<div class="co-where">${where}<span class="co-hr" id="co-hr" data-on="${wFresh()?1:0}">${wFresh()?'♥ '+WATCH.hr:(WATCH.on?'⌚ ansluten':'')}</span></div>''')
rep('''<div class="co-where">Kondition</div>''','''<div class="co-where">Kondition<span class="co-hr" id="co-hr" data-on="${wFresh()?1:0}">${wFresh()?'♥ '+WATCH.hr:(WATCH.on?'⌚ ansluten':'')}</span></div>''')
rep('''    <p class="co-center co-tip">${REST_TIPS[(C.i)%REST_TIPS.length]}</p>''','''    <div class="co-hr2" id="co-hr2">${wFresh()?'Puls '+WATCH.hr:''}</div>
    <p class="co-center co-tip">${REST_TIPS[(C.i)%REST_TIPS.length]}</p>''')
rep('''      <div class="co-clock big" id="c-left">${fmt(Math.max(0,left))}</div>''','''      <div class="co-clock big" id="c-left">${fmt(Math.max(0,left))}</div>
      <div class="co-hr2" id="co-hr2">${wFresh()?'Puls '+WATCH.hr:''}</div>''')

# ---------- reglaget på startskärmarna ----------
rep('''    ${voiceSwitch()}
  </div>${foot(`<button class="co-btn" onclick="coNext()">Starta uppvärmningen</button>`)}`;''','''    ${voiceSwitch()}${watchSwitch()}
  </div>${foot(`<button class="co-btn" onclick="coNext()">Starta uppvärmningen</button>`)}`;''')
rep('''      ${voiceSwitch()}</div>${foot(`<button class="co-btn" onclick="cGo()">Starta</button>`)}`;''','''      ${voiceSwitch()}${watchSwitch()}</div>${foot(`<button class="co-btn" onclick="cGo()">Starta</button>`)}`;''')

# ---------- signaler till klockan ----------
rep('''    if(r<=0){C.wt=null;ping();say('Bra. Vi går vidare.');coNext();return}''','''    if(r<=0){C.wt=null;ping();say('Bra. Vi går vidare.');wSay('Vidare till nästa steg');coNext();return}''')
rep('''      if(full){coRender();const st=coSteps(C)[C.i];say(st.t==='set'&&!st.w?`Dags för set ${st.k+1}.`:'Dags igen.')}
      else{const b=document.querySelector('.co-restbar');if(b)b.remove();say('Vilan är klar.')}''','''      if(full){coRender();const st=coSteps(C)[C.i];say(st.t==='set'&&!st.w?`Dags för set ${st.k+1}.`:'Dags igen.');wSay(st.t==='set'&&!st.w?`Dags för set ${st.k+1}`:'Dags igen')}
      else{const b=document.querySelector('.co-restbar');if(b)b.remove();say('Vilan är klar.');wSay('Vilan är klar')}''')
rep('''    if(C.p>=ph.length-1){C.acc=ph[C.p].sec;C.run=false;C.i=2;save();ping();coRender();say('Bra jobbat! Konditionspasset är klart.');return}''','''    if(C.p>=ph.length-1){C.acc=ph[C.p].sec;C.run=false;C.i=2;save();ping();coRender();say('Bra jobbat! Konditionspasset är klart.');wSay('Passet är klart');return}''')
rep('''  if(changed){save();ping();coRender();coSay();return}''','''  if(changed){save();ping();coRender();coSay();wSay(ph[C.p].n+(ph[C.p].rep?' '+ph[C.p].rep+' av 6':''));return}''')
# pulsen ritas om varje tick, så att den försvinner när den blivit gammal
rep('''function coTick(){
  const C=S.coach;if(!C||!coIsOpen)return;''','''function coTick(){
  const C=S.coach;if(!C||!coIsOpen)return;
  wPaint();''')

# ---------- pulsen i sammanfattningen, och sparad med passet ----------
rep('''    ${prs.length?`<div class="co-sug"><b>Nya rekord 🏆</b><br>${prs.join('<br>')}</div>`:''}
    <div class="co-card"><h3>Nu</h3><p class="co-p" style="margin:0">Ät din måltid efter träningen''','''    ${prs.length?`<div class="co-sug"><b>Nya rekord 🏆</b><br>${prs.join('<br>')}</div>`:''}
    ${C.hr&&C.hr.n?`<div class="co-card"><h3>Puls under passet</h3><p class="co-p" style="margin:0">I snitt <b>${Math.round(C.hr.sum/C.hr.n)}</b> och som högst <b>${C.hr.max}</b> slag per minut.</p></div>`:''}
    <div class="co-card"><h3>Nu</h3><p class="co-p" style="margin:0">Ät din måltid efter träningen''')
rep('''      <div class="co-card"><h3>Nu</h3><p class="co-p" style="margin:0">Drick vatten och ät som vanligt.''','''      ${C.hr&&C.hr.n?`<div class="co-card"><h3>Puls under passet</h3><p class="co-p" style="margin:0">I snitt <b>${Math.round(C.hr.sum/C.hr.n)}</b> och som högst <b>${C.hr.max}</b> slag per minut.</p></div>`:''}
      <div class="co-card"><h3>Nu</h3><p class="co-p" style="margin:0">Drick vatten och ät som vanligt.''')
rep('''function coSave(){
  const C=S.coach;''','''function coSave(){
  const C=S.coach;
  if(C.hr&&C.hr.n){S.pulse=S.pulse||{};S.pulse[today()]={avg:Math.round(C.hr.sum/C.hr.n),max:C.hr.max}}''')
# har klockan använts förut i den här sidan ansluts den igen när passet öppnas, utan att fråga
rep('''  keepAwake(true);coRender();coSay();clearInterval(coInt);coInt=setInterval(coTick,250);''','''  keepAwake(true);coRender();coSay();clearInterval(coInt);coInt=setInterval(coTick,250);
  if(S.watch&&!WATCH.on&&!wWant&&!WATCH.busy)wResume();''')

# ---------- inställningar ----------
rep('''    <h2>Mat</h2>
    <div class="card"><div class="set"><span class="set-t">Kalorier per dag</span>''','''    ${wCan()?`<h2>Klocka</h2>
    <div class="card"><div class="set"><button class="switch" role="switch" aria-checked="${WATCH.on}" onclick="wToggle()"><span><span class="set-t">Använd klockan</span><p>${WATCH.on?'Klockan är ansluten.':'Klockan vibrerar när vilan är slut. Pulsen visas under passet när klockan mäter.'}</p></span><i></i></button></div></div>`:''}
    <h2>Mat</h2>
    <div class="card"><div class="set"><span class="set-t">Kalorier per dag</span>''')

# ---------- läs in en kopia redan på välkomstskärmen ----------
rep('''placeholder="Ditt förnamn" autocomplete="given-name" onkeydown="if(event.key==='Enter')obNext()">`}''','''placeholder="Ditt förnamn" autocomplete="given-name" onkeydown="if(event.key==='Enter')obNext()">
      ${OB.first?`<p style="margin-top:1.4rem"><button class="lnk" onclick="document.getElementById('ob-imp').click()">Har du använt IronSplit förut? Läs in din kopia</button></p><input type="file" id="ob-imp" accept="application/json,.json" style="display:none" onchange="obImport(this.files[0])">`:''}`}''')
rep('''function obBack(){''','''function obImport(file){
  if(!file)return;const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||typeof d!=='object'||!('log' in d))throw 0;
      S=Object.assign(DEF(),d);if(!S.profile&&hasHistory(S))S.profile={name:'',sex:'m',age:35,h:170,w:70,goal:'recomp',act:'low',auto:true};
      TRAIN_TIME=S.trainTime||TRAIN_TIME;save();obClose();tab='today';applyLook();render();toast('Kopian är inläst ✓');
      if(!S.profile)openOnb(true)}
    catch(e){toast('Filen är ingen IronSplit-kopia')}};
  r.readAsText(file);
}
function obBack(){''')

# ---------- start ----------
rep('''save();render();
if(!S.profile){openOnb(true)}''','''save();render();wPublishToday();
if(!S.profile){openOnb(true)}''')
open('index.html','w',encoding='utf8').write(s)
print('klart',len(s))
