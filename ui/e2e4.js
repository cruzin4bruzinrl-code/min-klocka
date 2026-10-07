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
  // en påhittad bildtjänst: ger en enkel bild och minns vad den fick
  let aiUrl='';const png=require('zlib');
  const pic=(()=>{const W=48,H=58,raw=Buffer.alloc((W*3+1)*H);for(let y=0;y<H;y++){raw[y*(W*3+1)]=0;for(let x=0;x<W;x++){const o=y*(W*3+1)+1+x*3;raw[o]=40+x*4;raw[o+1]=90+y*2;raw[o+2]=200;}}
    const crc=b=>{let c,n,k,t=[];for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}let r=0xffffffff;for(const x of b)r=t[(r^x)&255]^(r>>>8);return (r^0xffffffff)>>>0;};
    const chunk=(ty,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(ty),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
    const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=2;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',png.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);})();
  await ctx.route('https://image.pollinations.ai/**',r=>{aiUrl=r.request().url();r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'image/png',body:pic});});
  await ctx.route('https://text.pollinations.ai/**',r=>r.fulfill({status:200,headers:{'access-control-allow-origin':'*'},contentType:'text/plain',body:'A fox sleeping under a tree'}));
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
  ok('versionen visas',await p.textContent('#stVer')==='25');
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

  // --- skapa med AI: bildtjänsten låtsas här
  await p.click('#tabs [data-v="dials"]');await p.click('#cats [data-c="all"]');await p.click('#dialGrid [data-ai]');await p.waitForTimeout(400);
  ok('rutan Skapa med AI leder till verktyget',await p.evaluate(()=>document.getElementById('view-tools').classList.contains('on')));
  await p.fill('#txtAI','En räv som sover under ett träd');await p.click('#segAILay [data-l="brickor"]');await p.click('#btnAI');
  await p.waitForFunction(()=>/Klar\./.test(document.getElementById('stAI').textContent)||/gick inte|svarade|nå/.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('beskrivningen blir en egen urtavla med bilden som bakgrund',await p.evaluate(()=>cur.kind==='m'&&/^AI /.test(cur.name)&&cur.def.bg.t==='photo'&&/^data:image\/jpeg/.test(cur.def.bg.src)&&cur.def.els.some(e=>e.k==='steps')),await p.textContent('#stAI'));
  ok('beskrivningen översattes och skickades med stil och placering',/A%20fox%20sleeping%20under%20a%20tree/.test(aiUrl)&&/no%20text/.test(aiUrl)&&/width=480/.test(aiUrl),aiUrl.slice(0,120));
  last=null;await p.click('#btnSend');await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:60000});
  ok('AI-urtavlan går att skicka',!!last&&last.length>200000,last&&last.length);if(last)fs.writeFileSync('ui/sent/_ai.bin',last.subarray(53));await p.screenshot({path:'ui/v11_ai.png'});
  // första tjänsten säger "betala": då ska reserven ta över, med kö
  await ctx.unroute('https://image.pollinations.ai/**');await ctx.route('https://image.pollinations.ai/**',r=>r.fulfill({status:402,headers:{'access-control-allow-origin':'*'},body:'Payment Required'}));
  let hBody=null,hChecks=0,hHead=null;const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
  await ctx.route('https://aihorde.net/**',r=>{const q=r.request(),u=q.url();
    if(q.method()==='OPTIONS')return r.fulfill({status:204,headers:CORS});
    if(/\/async$/.test(u)){hBody=JSON.parse(q.postData());hHead=q.headers();return r.fulfill({status:202,headers:CORS,contentType:'application/json',body:'{"id":"abc","kudos":5}'});}
    if(/\/check\/abc$/.test(u)){hChecks++;return r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify(hChecks<3?{done:false,faulted:false,is_possible:true,queue_position:4,wait_time:22}:{done:true,faulted:false,is_possible:true})});}
    if(/\/status\/abc$/.test(u))return r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({done:true,generations:[{img:pic.toString('base64'),censored:false}]})});
    r.fulfill({status:404,headers:CORS,body:'{}'});});
  const nAI=await p.evaluate(()=>{AIHPOLL=250;return MINE.filter(m=>/^AI /.test(m.name)).length;});
  await p.click('#tabs [data-v="tools"]');await p.click('#btnAI');
  await p.waitForFunction(()=>/i kö hos reservtjänsten, plats 4/.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('säger första tjänsten nej tar reserven över och visar kön',true,await p.textContent('#stAI'));
  await p.waitForFunction(()=>/Klar\./.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('reserven ger en urtavla',await p.evaluate(n=>MINE.filter(m=>/^AI /.test(m.name)).length===n+1&&/^data:image\/jpeg/.test(cur.def.bg.src),nAI));
  ok('reserven fick beskrivning, mått och anonym nyckel',!!hBody&&/A fox sleeping under a tree/.test(hBody.prompt)&&/ ### /.test(hBody.prompt)&&hBody.params.width===512&&hBody.params.height===576&&hBody.nsfw===false&&hBody.r2===false&&hHead.apikey==='0000000000'&&/^min-klocka:/.test(hHead['client-agent']),hBody&&hBody.prompt.slice(0,90));
  // båda säger nej: ett begripligt besked, ingen ny urtavla
  await ctx.unroute('https://aihorde.net/**');await ctx.route('https://aihorde.net/**',r=>r.request().method()==='OPTIONS'?r.fulfill({status:204,headers:CORS}):r.fulfill({status:503,headers:CORS,body:'{}'}));
  await p.click('#tabs [data-v="tools"]');await p.click('#btnAI');await p.waitForFunction(()=>/Reservtjänsten svarade med fel 503/.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('när båda tjänsterna säger nej visas ett begripligt besked',await p.evaluate(n=>MINE.filter(m=>/^AI /.test(m.name)).length===n+1&&!document.getElementById('btnAI').disabled,nAI),await p.textContent('#stAI'));
  // kön tar för lång tid: ger upp med besked
  await ctx.unroute('https://aihorde.net/**');await ctx.route('https://aihorde.net/**',r=>{const q=r.request(),u=q.url();if(q.method()==='OPTIONS')return r.fulfill({status:204,headers:CORS});
    if(/\/async$/.test(u))return r.fulfill({status:202,headers:CORS,contentType:'application/json',body:'{"id":"abc"}'});
    r.fulfill({status:200,headers:CORS,contentType:'application/json',body:'{"done":false,"faulted":false,"is_possible":true,"queue_position":90,"wait_time":900}'});});
  await p.click('#btnAI');await p.waitForFunction(()=>/ungefär 15 minuter just nu, så jag avbröt/.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('orimligt lång kö avbryts direkt med besked och en annan väg',await p.evaluate(()=>!document.getElementById('btnAI').disabled&&/Välj färdig bild/.test(document.getElementById('stAI').textContent)),await p.textContent('#stAI'));
  await p.evaluate(()=>{AIHMAX=1500;AIHLONG=5000;});await p.click('#btnAI');await p.waitForFunction(()=>/Kön var för lång/.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('en kö som aldrig blir klar ger besked i stället för att hänga',await p.evaluate(()=>!document.getElementById('btnAI').disabled),await p.textContent('#stAI'));
  // egen väg: kopiera beskrivningen och välj en färdig bild
  await p.click('#btnAICopy');await p.waitForTimeout(300);const order=await p.evaluate(()=>navigator.clipboard.readText());
  ok('beskrivningen går att kopiera med stil, format och placering',/^En räv som sover under ett träd\. Style: /.test(order)&&/Portrait format/.test(order)&&/No text/.test(order),order.slice(0,80));
  await p.click('#segAILay [data-l="list"]');await p.setInputFiles('#fileAI',{name:'rav.png',mimeType:'image/png',buffer:pic});
  await p.waitForFunction(()=>/Klar\./.test(document.getElementById('stAI').textContent),null,{timeout:20000});
  ok('en färdig bild blir urtavla med värden ovanpå',await p.evaluate(n=>MINE.filter(m=>/^AI /.test(m.name)).length===n+2&&cur.kind==='m'&&/^data:image\/jpeg/.test(cur.def.bg.src)&&cur.def.els.some(e=>e.k==='steps'),nAI));
  await p.screenshot({path:'ui/v12_egenbild.png'});
  await p.setInputFiles('#fileAI',{name:'x.txt',mimeType:'text/plain',buffer:Buffer.from('hej')});await p.waitForFunction(()=>/ingen bild/.test(document.getElementById('stAI').textContent),null,{timeout:10000});
  ok('en fil som inte är en bild ger besked',true,await p.textContent('#stAI'));
  await p.evaluate(()=>{MINE=MINE.filter(m=>!/^AI /.test(m.name));saveMine();cat='m';renderGrid();pickDial('m:'+MINE[0].id,true);});
  // --- pass från IronSplit, som ligger under samma adress
  await p.evaluate(()=>{localStorage.setItem('ironsplit.idag',JSON.stringify({d:'2026-10-07',t:'Överkropp B',day:'Torsdag',l:['Lutande bröstpress i maskin 3×8–12','Butterfly i maskin 2×12–15','Latsdrag, smalt grepp 3×8–12','Rodd i maskin, högt drag 3×8–12','Sidolyft i maskin 3×12–20','Face pull i kabel med rep 3×15–20','Bicepscurl i kabel 3×10–15','Tricepsextension över huvudet 3×10–15']}));syncPass();});
  await p.click('#tabs [data-v="tools"]');await p.click('#btnPass');await p.waitForTimeout(600);
  ok('passet från IronSplit blir en urtavla',await p.evaluate(()=>cur.kind==='m'&&/^Pass /.test(cur.name)&&cur.def.deco[1].lines.length===8&&cur.def.deco[1].lines.every(l=>l.length<=28)),await p.evaluate(()=>cur.def.deco[1].lines.join(' | ')));
  await p.screenshot({path:'ui/v10_pass.png'});await p.evaluate(()=>{MINE=MINE.filter(m=>m.id!==0x86B2F004);saveMine();cat='m';renderGrid();pickDial('m:'+MINE[0].id,true);});
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
