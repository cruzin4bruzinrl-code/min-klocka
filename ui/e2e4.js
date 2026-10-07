// Prov av det nya: nyckel, favoriter, provläge, vakt och räddning, återanslutning, väder, mål, lapp, dagens, QR, delning och användning utan nät.
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
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Stockholm',locale:'sv-SE',permissions:['clipboard-write','clipboard-read']});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('konsol: '+m.text());});
  let last=null;await p.exposeFunction('__report',s=>{last=Buffer.from(s,'base64');});
  await p.addInitScript(()=>{window.__nokey=true;window.__quick=false;});await p.addInitScript(fake);
  await ctx.route('https://geocoding-api.open-meteo.com/**',r=>r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify({results:[{name:'Provstad',latitude:59.3293,longitude:18.0686}]})}));
  await ctx.route('https://api.open-meteo.com/**',r=>r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'application/json',body:JSON.stringify({current:{temperature_2m:-3.4,weather_code:73},daily:{time:['a','b','c','d','e','f','g'],weather_code:[73,0,3,61,95,45,86],temperature_2m_max:[-1.2,4,5,6,7,8,9],temperature_2m_min:[-7.6,-2,0,1,2,3,4]}})}));
  const ready=()=>p.waitForFunction(()=>window.__galleryReady===true&&document.getElementById('stVer').textContent!=='–',null,{timeout:40000});
  const sheetBtn=async(txt,ms)=>{await p.waitForSelector('#shade:not([hidden])',{timeout:ms||30000});await p.click('#shB button:has-text("'+txt+'")');};
  const connected=()=>p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});
  const sent=pre=>p.evaluate(x=>window.__sent.filter(s=>s.startsWith(x)),pre);

  // --- nyckel
  await p.goto(URL0);await ready();
  ok('utan nyckel: rutan syns',await p.evaluate(()=>!document.getElementById('keyBox').hidden));
  await p.goto(URL0+'#k='+KEY);await p.reload();await ready();
  ok('nyckel ur länken sparas och rutan försvinner',await p.evaluate(k=>localStorage.getItem('minklocka.nyckel.v1')===k&&document.getElementById('keyBox').hidden,KEY));
  ok('nyckeln står inte kvar i adressen',!(await p.evaluate(()=>location.href)).includes('k='),await p.evaluate(()=>location.href));
  ok('sidan innehåller inte nyckeln',!fs.readFileSync('dist/index.html','utf8').includes('a1a2a3a4a5a6'));
  await p.click('#btnConnect');await connected();await p.waitForTimeout(500);
  const s83=await sent('83/');ok('hälsningen är nyckeln',s83.length===1&&s83[0]==='83/1:a1a2a3a4a5a6b1b2b3b4b5b600',s83[0]);
  const s44=await sent('4/44');ok('bindningen kommer ur nyckeln',s44[0]==='4/44:a1a2a3a4a5a6b1b2b3b4b5b601',s44[0]);
  ok('versionen visas',await p.textContent('#stVer')==='19');
  await p.evaluate(()=>{window.__push(0x0D,7,[]);window.__push(0x0D,4,[]);window.__push(0x21,3,[1,2]);});await p.waitForTimeout(200);
  ok('musikknappar och okända paket syns i loggen',await p.evaluate(()=>{const t=document.getElementById('log').textContent;return /Knapp på klockan: nästa låt \(0d\/7\)/.test(t)&&/spela eller pausa/.test(t)&&/inte känner till: 21\/3 01 02/.test(t);}));

  // --- favoriter, slumpa, nästa oprovade
  await p.click('#tabs [data-v="dials"]');await p.waitForTimeout(400);
  await p.click('#dialGrid [data-k="d:omlopp"]');await p.click('#btnFav');await p.click('#cats [data-c="f"]');await p.waitForTimeout(200);
  ok('favorit sparas och filtret visar den',await p.evaluate(()=>document.querySelectorAll('#dialGrid [data-k]').length===1&&!!JSON.parse(localStorage.getItem('minklocka.fav.v1'))['d:omlopp']));
  await p.click('#cats [data-c="all"]');const before=await p.evaluate(()=>cur.gk);await p.click('#btnRand');await p.waitForTimeout(200);
  ok('slumpa byter urtavla och väljer aldrig experiment',await p.evaluate(b=>cur.gk!==b&&!cur.exp,before),await p.evaluate(()=>cur.name));
  await p.click('#btnNext');await p.waitForTimeout(300);
  const nx=await p.evaluate(()=>({k:cur.gk,exp:cur.exp,st:statusOf(cur)}));ok('nästa oprovade ger en oprovad som inte är experiment',nx.st==='ny'&&!nx.exp,JSON.stringify(nx));
  await p.screenshot({path:'ui/v1_dials.png'});

  // --- skicka oprovad: vakten frågar klockan, sedan frågas användaren
  const n40=(await sent('4/40')).length;last=null;await p.click('#btnSend');
  await p.waitForSelector('#shade:not([hidden])',{timeout:60000});await p.screenshot({path:'ui/v2_sheet.png'});
  ok('vakten frågade klockan efter överföringen',(await sent('4/40')).length>n40&&!!last);
  await p.click('#shB button:has-text("Fungerar")');await p.waitForTimeout(300);
  ok('svaret sparas som provad',await p.evaluate(k=>RES[k]==='ok'&&statusOf(findDial(k))==='ok',nx.k));
  // samma urtavla igen: ingen fråga
  await p.click('#btnSend');await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:60000});await p.waitForTimeout(600);
  ok('provad urtavla skickas utan fråga',await p.evaluate(()=>document.getElementById('shade').hidden));

  // --- experiment: varning, avbryt, sedan hänger klockan sig och räddas
  await p.click('#dialGrid [data-k="d:kugghjul"]');const c5=(await sent('1/c5')).length;await p.click('#btnSend');await p.waitForSelector('#shade:not([hidden])');await p.screenshot({path:'ui/v3_exp.png'});
  await p.click('#shB button:has-text("Avbryt")');await p.waitForTimeout(400);
  ok('avbryt på varningen skickar inget',(await sent('1/c5')).length===c5&&(await sent('16/3:0103')).length===2);
  await p.evaluate(()=>{window.__hangNext=true;window.__dropOnHang=true;window.__heal=true;});
  await p.click('#btnSend');await sheetBtn('Skicka ändå');
  await p.waitForFunction(()=>/räddades|svarar inte/.test(document.getElementById('shT').textContent)&&!document.getElementById('shade').hidden,null,{timeout:90000});
  const t=await p.textContent('#shT');await p.screenshot({path:'ui/v4_rescued.png'});
  const sw=await sent('16/3:0100');ok('hängd klocka räddas av sig själv',t==='Klockan räddades'&&sw[sw.length-1]==='16/3:0100b05e2963',t+' '+sw[sw.length-1]);
  await p.click('#shB button:has-text("Ja, den blev svart")');
  ok('resultatet sparas som svart',await p.evaluate(()=>RES['d:kugghjul']==='svart'));
  await connected();ok('ansluten igen efter räddningen',true);
  ok('märkt i listan',await p.evaluate(()=>!!document.querySelector('#dialGrid [data-k="d:kugghjul"] em.bad')));

  // --- klockan tappas: sidan ansluter igen av sig själv
  const c0=await p.evaluate(()=>window.__connects);await p.evaluate(()=>{window.__away=1;window.__drop();});
  await p.waitForFunction(()=>document.getElementById('stConn').textContent!=='Ansluten',null,{timeout:5000});await connected();
  ok('återanslutning utan att fråga',await p.evaluate(c=>window.__connects>c,c0));
  // koppla från själv: ingen återanslutning
  await p.click('#tabs [data-v="home"]');await p.click('#btnDisconnect');await p.waitForTimeout(3500);
  ok('eget frånkopplande står kvar',await p.evaluate(()=>document.getElementById('stConn').textContent!=='Ansluten'));
  await p.click('#btnConnect');await connected();

  // --- verktyg
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtOrt','Provstad');await p.click('#btnWeather');
  await p.waitForFunction(()=>/Provstad: /.test(document.getElementById('stWeather').textContent),null,{timeout:10000});await p.waitForTimeout(500);
  const w30=(await sent('3/30')).pop(),w37=(await sent('3/37')).pop();
  ok('väder i dag: lägst -8, högst -1, snö, nu -3',w30==='3/30:f8ff03fd',w30);
  const cityHex=Buffer.from('Provstad','utf16le').toString('hex');
  ok('väder sju dagar med ort',w37.slice(13,15)==='10'&&w37.includes(cityHex)&&w37.endsWith('f8ff03fd'+'fe0400fd'+'000501fd'+'010602fd'+'020702fd'+'030801fd'+'040903fd'),w37);
  ok('vädertexten',/-3°, snö/.test(await p.textContent('#stWeather')),await p.textContent('#stWeather'));
  await p.click('#segSym [data-s="2"]');await p.fill('#numFree','42');await p.click('#btnFree');await p.waitForTimeout(500);
  ok('fri siffra 42 med regn',(await sent('3/30')).pop()==='3/30:292a022a',(await sent('3/30')).pop());
  await p.fill('#numGoal','9000');await p.click('#btnGoal');await p.waitForTimeout(400);
  ok('stegmål 9000',(await sent('2/22')).pop()==='2/22:282300005e01000088130000e0010000',(await sent('2/22')).pop());
  ok('träningstakt',await p.evaluate(()=>SIG.intervall(39)==='KÖR'&&SIG.intervall(40)==='VILA'&&SIG.tabata(19)==='KÖR'&&SIG.tabata(20)==='VILA'&&SIG.tabata(30)==='KÖR'&&SIG.pomodoro(24*60+59)==='FOKUS'&&SIG.pomodoro(25*60)==='PAUS'&&SIG.pomodoro(30*60)==='FOKUS'));
  ok('veckonummer',await p.evaluate(()=>isoWeek(new Date(2026,9,7))===41&&isoWeek(new Date(2027,0,1))===53&&isoWeek(new Date(2026,0,1))===1&&isoWeek(new Date(2024,11,30))===1));
  const sun=await p.evaluate(()=>[sunTimes(59.33,18.07,new Date(2026,9,7)),sunTimes(59.33,18.07,new Date(2026,5,21)),sunTimes(68.4,18.1,new Date(2026,5,21)),sunTimes(68.4,18.1,new Date(2026,11,21))]);
  const near=(a,b)=>{const m=x=>+x.slice(0,2)*60+ +x.slice(3);return Math.abs(m(a)-m(b))<=6;};
  ok('solens tider stämmer mot almanackan, och blir tomma vid midnattssol och polarnatt',near(sun[0][0],'07:06')&&near(sun[0][1],'18:05')&&near(sun[1][0],'03:31')&&near(sun[1][1],'22:08')&&sun[2]===null&&sun[3]===null,JSON.stringify(sun));
  await p.screenshot({path:'ui/v5_tools.png',fullPage:false});
  await p.evaluate(()=>document.getElementById('view-tools').scrollTo(0,9999));await p.waitForTimeout(300);await p.screenshot({path:'ui/v6_tools2.png'});
  // lapp
  await p.fill('#txtNote','Mjölk\nBröd\nHämta paket');await p.click('#btnNote');await p.waitForTimeout(600);
  ok('lappen hamnar under Mina och är vald',await p.evaluate(()=>cur.kind==='m'&&/^Lapp/.test(cur.name)&&document.getElementById('view-dials').classList.contains('on')),await p.evaluate(()=>cur.name));
  await p.screenshot({path:'ui/v7_note.png'});
  last=null;await p.click('#btnSend');await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:60000});
  ok('lappen går att skicka, utan fråga',!!last&&await p.evaluate(()=>document.getElementById('shade').hidden));if(last)fs.writeFileSync('ui/sent/_lapp.bin',last.subarray(53));
  // dagens
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtCount','Jul');await p.fill('#datCount','2026-12-24');await p.click('#btnToday');await p.waitForTimeout(600);
  ok('dagens urtavla skapas med nedräkning och soltider',await p.evaluate(()=>{const t=cur.def.deco.map(d=>d.txt||'').join('|');return /DAGAR TILL JUL/.test(t)&&/SOL \d\d:\d\d TILL \d\d:\d\d/.test(t)&&/ V \d+/.test(t);}),await p.evaluate(()=>cur.def.deco.map(d=>d.txt||'').filter(x=>x).join(' | ')));
  await p.screenshot({path:'ui/v8_today.png'});
  last=null;await p.click('#btnSend');await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:60000});if(last)fs.writeFileSync('ui/sent/_dagens.bin',last.subarray(53));
  // QR
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtQR','https://exempel.se/medlem/1234567890');await p.click('#btnQR');await p.waitForTimeout(600);
  last=null;await p.click('#btnSend');await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:60000});
  ok('QR-urtavlan skickas',!!last);if(last)fs.writeFileSync('ui/sent/_qr.bin',last.subarray(53));await p.screenshot({path:'ui/v9_qr.png'});
  ok('egna urtavlor: tre nya',await p.evaluate(()=>MINE.length===3),await p.evaluate(()=>MINE.map(m=>m.name).join(', ')));

  // --- dela som länk och öppna länken
  await p.evaluate(()=>{navigator.share=undefined;});await p.click('#dialGrid [data-k="'+await p.evaluate(()=>'m:'+MINE.find(m=>/^Lapp/.test(m.name)).id)+'"]');await p.click('#btnShare');await p.waitForTimeout(500);
  const link=await p.evaluate(()=>navigator.clipboard.readText());ok('länken kopieras',/#u=[zj]/.test(link),link.length+' tecken');
  await p.evaluate(()=>{MINE=[];saveMine();});await p.goto(link);await p.reload();await ready();await p.waitForTimeout(500);
  ok('länken ger urtavlan tillbaka',await p.evaluate(()=>MINE.length===1&&/^Lapp/.test(MINE[0].name)&&cur.kind==='m'&&!location.hash),await p.evaluate(()=>MINE.map(m=>m.name).join(',')+' '+location.href));
  ok('trasig länk tål sidan',await (async()=>{await p.goto(URL0+'#u=zAAAA');await p.reload();await ready();return await p.evaluate(()=>MINE.length===1);})());
  ok('senast valda urtavlan minns',await p.evaluate(()=>cur.kind==='m'));

  // --- provresultat
  await p.click('#tabs [data-v="log"]');await p.click('#btnCopyRes');await p.waitForTimeout(300);const res=await p.evaluate(()=>navigator.clipboard.readText());
  ok('provresultaten går att kopiera',/Svart skärm: Kugghjul/.test(res)&&/Fungerar: /.test(res),res.split('\n').slice(1,4).join(' / ').slice(0,200));

  // --- känd klocka: ansluter utan att fråga när sidan öppnas
  await p.addInitScript(()=>{window.__known=true;});await p.reload();await ready();await connected();ok('känd klocka ansluts direkt när sidan öppnas',true);

  // --- utan nät
  await p.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,null,{timeout:15000}).catch(()=>{});
  await ctx.setOffline(true);let off=false;try{await p.reload();await ready();off=await p.evaluate(()=>allDials().length>90);}catch(e){off=false;}
  ok('sidan öppnas utan nät',off);await ctx.setOffline(false);
  const noise=errs.filter(e=>!/ERR_INTERNET_DISCONNECTED|Failed to load resource|version\.json/.test(e));
  ok('inga sidfel',noise.length===0,JSON.stringify(noise));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.log('E2E4-FEL',e);process.exit(1);});
