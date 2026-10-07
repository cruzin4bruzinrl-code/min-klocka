// Prov av det rörliga: levande förhandsvisning, kategorin Rörliga, och visare/rörelse/timstreck i redigeraren.
const { chromium } = require('playwright'); const fs=require('fs');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
const FILE=process.argv[2]||'dist/index.html';const W=+(process.argv[3]||360),H=+(process.argv[4]||642);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:3,hasTouch:true});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('konsol: '+m.text());});
  let last=null;await p.exposeFunction('__report',s=>{last=Buffer.from(s,'base64');});
  await p.addInitScript(fake);await p.goto('file://'+process.cwd()+'/'+FILE);
  await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:30000});await p.waitForTimeout(300);
  const sig=sel=>p.evaluate(s=>{const c=document.querySelector(s),d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let h=0;for(let i=0;i<d.length;i+=16)h=(h*31+d[i]+d[i+1]*3+d[i+2]*7)>>>0;return h;},sel);
  await p.click('#tabs [data-v="dials"]');await p.click('#cats [data-c="l"]');await p.waitForTimeout(500);
  console.log('rörliga i listan:',await p.evaluate(()=>document.querySelectorAll('#dialGrid [data-k]').length),'| alla:',await p.evaluate(()=>allDials().length));
  await p.click('#dialGrid [data-k="d:omlopp"]');await p.waitForTimeout(700);
  const hero=await p.evaluate(()=>document.querySelector('.screen .face.on').id);
  const a=await sig('#'+hero),ga=await sig('#dialGrid canvas[data-cv="d:hybrid"]'),gk=await sig('#dialGrid canvas[data-cv="a:kontur"]');await p.waitForTimeout(1300);
  console.log('klockan på skärmen rör sig:',a!==await sig('#'+hero),'| ruta Hybrid rör sig:',ga!==await sig('#dialGrid canvas[data-cv="d:hybrid"]'),'| ruta Kontur rör sig:',gk!==await sig('#dialGrid canvas[data-cv="a:kontur"]'));
  await p.screenshot({path:'ui/u1_live.png'});
  await p.evaluate(()=>document.getElementById('view-dials').scrollTo(0,400));await p.waitForTimeout(700);await p.screenshot({path:'ui/u2_live_scrolled.png'});
  // anslut: riktiga värden ska synas i förhandsvisningen
  await p.click('#tabs [data-v="home"]');await p.click('#btnConnect');await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:20000});await p.waitForTimeout(800);
  console.log('riktiga värden:',JSON.stringify(await p.evaluate(()=>LIVEV)));
  // redigeraren
  await p.click('#tabs [data-v="dials"]');await p.click('#cats [data-c="all"]');await p.click('#dialGrid [data-new]');await p.waitForTimeout(500);
  for(const k of ['ticks','hands','orbit']){await p.click('#edChips [data-kind="'+k+'"]');await p.waitForTimeout(150);}
  await p.screenshot({path:'ui/u3_editor_orbit.png'});
  await p.evaluate(()=>{const r=document.querySelector('#edProps input[type=range][data-set="s"]');r.value=16;r.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(300);
  console.log('stor komet:',await p.textContent('#edSize'),'| skicka spärrad:',await p.evaluate(()=>document.getElementById('edSave').disabled));
  await p.evaluate(()=>{const r=document.querySelector('#edProps input[type=range][data-set="s"]');r.value=5;r.dispatchEvent(new Event('input',{bubbles:true}));});await p.waitForTimeout(200);
  await p.click('#edProps [data-set="style"][data-v="dot"]');await p.click('#edProps [data-set="c"][data-v="#ff5a6a"]');
  await p.click('#edChips [data-kind="hands"]');await p.waitForTimeout(150);await p.click('#edProps [data-set="style"][data-v="taper"]');await p.click('#edProps [data-set="hc"][data-v="#ffc83c"]');
  await p.click('#edChips [data-kind="ticks"]');await p.click('#edProps [data-set="n"][data-v="60"]');await p.click('#edProps [data-set="nums"][data-v="1"]');await p.waitForTimeout(300);
  const e1=await sig('#faceC');await p.waitForTimeout(1300);console.log('redigeraren rör sig:',e1!==await sig('#faceC'),'|',await p.textContent('#edSize'));
  await p.screenshot({path:'ui/u4_editor_hands.png'});
  // tryck mitt på klockan: tiden (flyttbar) ska väljas före visarna
  const box=await (await p.$('#faceC')).boundingBox();await p.mouse.click(box.x+box.width*.5,box.y+box.height*.44);await p.waitForTimeout(200);
  console.log('vald efter tryck i mitten:',await p.evaluate(()=>ed.def.els[edSel].k));
  await p.fill('#edName','Min visare');last=null;await p.click('#edSend');await p.waitForTimeout(600);
  await p.waitForFunction(()=>!document.getElementById('btnSend').disabled,null,{timeout:60000});
  if(last)fs.writeFileSync('ui/sent/_egen_visare.bin',last.subarray(53));
  console.log('skickad:',!!last,last&&last.length,'|',await p.textContent('#stProg'),'| rörlig:',await p.evaluate(()=>cur.live));
  await p.waitForTimeout(600);await p.screenshot({path:'ui/u5_mine.png'});
  console.log('sidfel:',errs);await b.close();
})().catch(e=>{console.log('E2E-FEL',e);process.exit(1);});
