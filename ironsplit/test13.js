const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const SP='/tmp/claude-0/-home-claude/b29c96a8-dab9-56ae-a14f-98ce7e74f799/scratchpad/';
const src=fs.readFileSync(SP+'ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';fs.readFile(path.join(__dirname,f),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const URL0='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Stockholm',locale:'sv-SE'});
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/manifest|sw\.js|404|Failed to load resource/.test(m.text()))errs.push('konsol: '+m.text());});
  await p.exposeFunction('__report',()=>{});await p.addInitScript(fake);
  await p.goto(URL0);await p.waitForTimeout(600);
  ok('första start: välkomstskärmen med länk för att läsa in kopia',await p.evaluate(()=>document.getElementById('onb').classList.contains('show')&&!!document.querySelector('#ob-imp')));
  // en kopia som från den gamla appen
  const copy={log:{'Machine Chest Press':{'2026-10-05':[{kg:40,reps:8,ok:true},{kg:40,reps:8,ok:true},{kg:40,reps:7,ok:true}]}},done:{'2026-10-05':'upA'},rate:{},food:{},cardio:{},eaten:{},body:{'2026-10-05':{w:71.5}},meals:{},dayPlan:{},pantry:[],budget:2250,protein:150,start:'2026-09-07',plan:null,apiKey:'',profile:{name:'Prov',sex:'m',age:40,h:180,w:80,goal:'recomp',act:'low'},uiV:2,trainTime:'18:30'};
  fs.writeFileSync(path.join(__dirname,'kopia.json'),JSON.stringify(copy));
  await p.setInputFiles('#ob-imp',path.join(__dirname,'kopia.json'));await p.waitForTimeout(500);
  ok('kopian läses in och loggarna finns kvar',await p.evaluate(()=>!document.getElementById('onb').classList.contains('show')&&S.done['2026-10-05']==='upA'&&S.log['Machine Chest Press']['2026-10-05'].length===3&&S.budget===2250&&S.profile.name==='Prov'));
  await p.reload();await p.waitForTimeout(500);
  ok('kopian ligger kvar efter omladdning',await p.evaluate(()=>S.done['2026-10-05']==='upA'&&!document.getElementById('onb').classList.contains('show')));
  await p.screenshot({path:path.join(__dirname,'i1_today.png')});
  // starta ett pass
  await p.evaluate(()=>coStart('upA'));await p.waitForTimeout(400);
  ok('reglaget för klockan finns på startskärmen, avslaget',await p.evaluate(()=>{const b=[...document.querySelectorAll('#coach .co-switch')].find(x=>/Använd klockan/.test(x.textContent));return !!b&&b.getAttribute('aria-checked')==='false';}));
  await p.click('#coach .co-switch:has-text("Använd klockan")');
  await p.waitForFunction(()=>WATCH.on,null,{timeout:8000});await p.waitForTimeout(300);
  const sent=()=>p.evaluate(()=>window.__sent.slice());
  let s=await sent();ok('hälsning och bindning skickas med nyckeln',s.some(x=>x.startsWith('83/'))&&s.some(x=>x==='4/44:a1a2a3a4a5a6b1b2b3b4b5b601'),s.join(' ').slice(0,90));
  ok('reglaget visar ansluten',await p.evaluate(()=>[...document.querySelectorAll('#coach .co-switch')].find(x=>/Använd klockan/.test(x.textContent)).getAttribute('aria-checked')==='true'&&S.watch===true));
  await p.screenshot({path:path.join(__dirname,'i2_intro.png')});
  await p.evaluate(()=>window.__push(0x0A,0xAB,[97,0,0,0,0,16,45,0]));await p.waitForTimeout(400);
  ok('pulsen visas överst',await p.textContent('#co-hr')==='♥ 97',await p.textContent('#co-hr'));
  // fram till första riktiga setet
  await p.evaluate(()=>{const st=coSteps(S.coach);coGo(st.findIndex(x=>x.t==='set'&&!x.w));});await p.waitForTimeout(300);
  await p.evaluate(()=>window.__push(0x0A,0xAB,[121,0,0,0,0,16,46,0]));
  await p.evaluate(()=>coSetDone());await p.waitForTimeout(400);
  ok('viloskärmen visar pulsen',await p.textContent('#co-hr2')==='Puls 121',await p.textContent('#co-hr2'));
  await p.screenshot({path:path.join(__dirname,'i3_rest.png')});
  const n60=(await sent()).filter(x=>x.startsWith('6/60')).length;
  await p.evaluate(()=>{S.coach.rest.end=Date.now()+700;});await p.waitForTimeout(1500);
  s=(await sent()).filter(x=>x.startsWith('6/60'));
  const txt=s.length?Buffer.from(s[s.length-1].slice(7),'hex').toString('utf16le'):'';
  ok('när vilan är slut får klockan texten',s.length===n60+1&&txt==='Dags för set 2',JSON.stringify(txt));
  ok('efter vilan visas nästa set',await p.evaluate(()=>/Set 2 av/.test(document.querySelector('#coach .co-h').textContent)));
  // gammal puls försvinner
  await p.evaluate(()=>{WATCH.hrAt=Date.now()-30000;});await p.waitForTimeout(500);
  ok('gammal puls visas inte',await p.textContent('#co-hr')==='⌚ ansluten',await p.textContent('#co-hr'));
  // klockan tappas och kommer tillbaka
  await p.evaluate(()=>window.__drop());await p.waitForFunction(()=>!WATCH.on,null,{timeout:3000});
  await p.waitForFunction(()=>WATCH.on,null,{timeout:8000});ok('klockan ansluts igen av sig själv',true);
  // klart: pulsen i sammanfattningen och sparad
  await p.evaluate(()=>{coGo(coSteps(S.coach).length-1);});await p.waitForTimeout(300);
  ok('sammanfattningen visar pulsen',await p.evaluate(()=>/Puls under passet/.test(document.getElementById('coach').textContent)&&/som högst 121/.test(document.getElementById('coach').textContent.replace(/\s+/g,' '))));
  await p.screenshot({path:path.join(__dirname,'i4_done.png')});
  await p.evaluate(()=>coSave());await p.waitForTimeout(300);
  ok('pulsen sparas med passet',await p.evaluate(()=>{const x=S.pulse&&S.pulse[today()];return !!x&&x.max===121&&x.avg===121;}),await p.evaluate(()=>JSON.stringify(S.pulse)));
  ok('dagens pass läggs ut till Min klocka när det finns ett',await p.evaluate(()=>{const s=sessionFor(new Date().getDay())||nextSession(),v=JSON.parse(localStorage.getItem('ironsplit.idag'));return v.t===s.title&&v.l.length===allEx(s).length&&v.d===today();}),await p.evaluate(()=>localStorage.getItem('ironsplit.idag')));
  // inställningar
  await p.evaluate(()=>go('settings'));await p.waitForTimeout(300);
  ok('klockan finns under inställningar',await p.evaluate(()=>/Klocka/.test(document.body.textContent)&&!!document.querySelector('.switch[onclick="wToggle()"]')));
  await p.click('.switch[onclick="wToggle()"]');await p.waitForTimeout(400);
  ok('går att stänga av',await p.evaluate(()=>!WATCH.on&&S.watch===false));
  // konditionspass: fasbyte ger text
  await p.click('.switch[onclick="wToggle()"]');await p.waitForFunction(()=>WATCH.on,null,{timeout:8000});
  await p.evaluate(()=>{cStart('int');cGo();});await p.waitForTimeout(300);
  await p.evaluate(()=>{S.coach.acc=299.5;S.coach.t0=Date.now();});await p.waitForTimeout(1500);
  s=(await sent()).filter(x=>x.startsWith('6/60'));
  ok('kondition: fasbytet går till klockan',Buffer.from(s[s.length-1].slice(7),'hex').toString('utf16le')==='Hårt 1 av 6',Buffer.from(s[s.length-1].slice(7),'hex').toString('utf16le'));
  await p.screenshot({path:path.join(__dirname,'i5_cardio.png')});
  // utan Bluetooth: inget reglage, appen fungerar
  const p2=await ctx.newPage();const e2=[];p2.on('pageerror',e=>e2.push(e.message));
  await p2.addInitScript(()=>{Object.defineProperty(navigator,'bluetooth',{value:undefined,configurable:true});});
  await p2.goto(URL0);await p2.waitForTimeout(500);await p2.evaluate(()=>{S.coach=null;coStart('upA');});await p2.waitForTimeout(300);
  ok('utan Bluetooth: inget reglage och inga fel',await p2.evaluate(()=>![...document.querySelectorAll('#coach .co-switch')].some(x=>/klockan/.test(x.textContent))&&document.querySelectorAll('#coach .co-switch').length===1)&&e2.length===0,JSON.stringify(e2));
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.log('TESTFEL',e);process.exit(1);});
