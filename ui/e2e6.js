// Prov av historiken: hämtning dag för dag i flera delar, sparning, visning och att färdiga dagar inte hämtas igen.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
const KEY='ba20001200b7ef01830001000da1a2a3a4a5a6b1b2b3b4b5b600';
const MIME={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';const fp=path.join('dist',f);fs.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(name,c,extra)=>{if(c)pass++;else fail++;console.log((c?'ok   ':'FEL  ')+name+(extra!==undefined?'  → '+extra:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const URL0='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Stockholm',locale:'sv-SE'});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('konsol: '+m.text());});
  await p.exposeFunction('__report',s=>{});
  await p.addInitScript(fake);
  const ready=()=>p.waitForFunction(()=>window.__galleryReady===true&&document.getElementById('stVer').textContent!=='–',null,{timeout:40000});
  const connected=()=>p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});
  const done=()=>p.waitForFunction(()=>/Hämtat|svarade inte|Kunde inte/.test(document.getElementById('hlState').textContent)&&!hlBusy,null,{timeout:60000});
  await p.goto(URL0+'#k='+KEY);await ready();
  await p.click('#btnConnect');await connected();await done();
  const a0=await p.evaluate(()=>window.__sent.filter(s=>s.startsWith('a/a0')));
  const now=new Date(),yy=(now.getFullYear()-2000).toString(16).padStart(2,'0');
  ok('frågar sju dagar, fyra slag var, i originalappens form',a0.length===28&&a0.every(s=>new RegExp('^a/a0:0[1237]'+yy+'[0-9a-f]{10}01$').test(s)),a0.length+' '+a0[0]);
  ok('frågar dagens steg',await p.evaluate(()=>window.__sent.includes('a/a6:03')));
  const st=await p.evaluate(()=>({s:$('hlSteps').textContent,ss:$('hlStepsSub').textContent,h:$('hlHr').textContent,hs:$('hlHrSub').textContent,o:$('hlO2').textContent,sl:$('hlSleep').textContent,sls:$('hlSleepSub').textContent,tile:$('stSteps').textContent,state:$('hlState').textContent}));
  ok('steg: högsta timvärdet är dagens summa',st.s==='5 300'||st.s==='5 300',JSON.stringify(st));
  ok('sträcka och kalorier från klockan',/2,2 km, 70 kcal/.test(st.ss),st.ss);
  ok('puls: snitt, lägst och högst, nollor bortfiltrerade',/snitt$/.test(st.h)&&/lägst 60, högst 88/.test(st.hs),st.h+' / '+st.hs);
  ok('syre',st.o==='98 %',st.o);
  ok('sömn räknas från lägena',st.sl==='6 h 15 min'&&/djup 3 h 15 min, REM 50 min/.test(st.sls),st.sl+' / '+st.sls);
  const saved=await p.evaluate(()=>{const o=JSON.parse(localStorage.getItem('minklocka.halsa.v1'));const k=Object.keys(o.days).sort();return {n:k.length,hr:o.days[k[k.length-1]].hr.length,done:k.slice(0,-1).every(x=>o.days[x].done)};});
  ok('sju dagar sparas, 47 pulsmätningar per dag (en nolla bort, en post delad mellan delar)',saved.n===7&&saved.hr===47&&saved.done,JSON.stringify(saved));
  await p.screenshot({path:'ui/v13_historik.png',fullPage:false});
  await p.evaluate(()=>document.getElementById('grpHealth').scrollIntoView());await p.waitForTimeout(300);await p.screenshot({path:'ui/v13_historik2.png'});
  // tryck i diagrammet
  const bx=await p.locator('#hlStepC').boundingBox();await p.locator('#hlStepC').click({position:{x:6+(bx.width-12)*(12.5/24),y:50}});
  ok('tryck i stegdiagrammet visar timmen',/Kl 12–13: 420 steg/.test(await p.textContent('#hlTip')),await p.textContent('#hlTip'));
  const hx=await p.locator('#hlHrC').boundingBox();await p.locator('#hlHrC').click({position:{x:6+(hx.width-12)*(14*60+41)/1440,y:50}});
  ok('tryck i pulsdiagrammet visar mätningen',/Kl 14:41/.test(await p.textContent('#hlTip')),await p.textContent('#hlTip'));
  await p.click('#hlDays [data-i="1"]');ok('igår går att välja',await p.evaluate(()=>$('hlSteps').textContent!=='–'&&$('hlDays').children[1].classList.contains('on')));
  // ny anslutning: bara idag hämtas
  await p.evaluate(()=>{window.__sent.length=0;});await p.click('#btnDisconnect');await p.waitForTimeout(500);await p.click('#btnConnect');await connected();await p.waitForFunction(()=>window.__sent.includes('a/a6:03'),null,{timeout:10000});await done();
  const a1=await p.evaluate(()=>window.__sent.filter(s=>s.startsWith('a/a0')));
  ok('färdiga dagar hämtas inte igen',a1.length===4,a1.length);
  // efter omladdning, utan klocka: värdena finns kvar
  await p.reload();await ready();
  ok('historiken finns kvar efter omladdning',await p.evaluate(()=>$('hlSteps').textContent!=='–'&&$('stSteps').textContent!=='–'&&$('stPulse').textContent!=='–'),await p.evaluate(()=>$('stPulseAt').textContent));
  // klockan svarar inte: inget hänger, sändning fungerar efteråt
  await p.evaluate(()=>{localStorage.removeItem('minklocka.halsa.v1');HL={days:{}};window.__nohist=true;});
  await p.click('#btnConnect');await connected();await done();
  ok('utan svar: begripligt besked och sidan blir ledig',await p.evaluate(()=>/svarade inte/.test($('hlState').textContent)&&!busy),await p.textContent('#hlState'));
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.error('E2E-FEL',e);process.exit(1);});
