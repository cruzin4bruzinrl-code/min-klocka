// Kör appen i Chromium mot en falsk klocka: galleri (analoga + digitala), redigerare, verktyg, mätning.
const { chromium } = require('playwright'); const fs=require('fs');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
const FILE=process.argv[2]||'dist/index.html';const W=+(process.argv[3]||390),H=+(process.argv[4]||844);
const analog=JSON.parse(fs.readFileSync('ui/keys.json','utf8'));
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:W,height:H},deviceScaleFactor:2,hasTouch:true,permissions:['clipboard-write','clipboard-read']});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('konsol: '+m.text());});
  let last=null;await p.exposeFunction('__report',s=>{last=Buffer.from(s,'base64');});
  await p.addInitScript(fake);
  await p.goto('file://'+process.cwd()+'/'+FILE);
  await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:30000});await p.waitForTimeout(400);
  await p.screenshot({path:'ui/t1_home.png'});
  await p.click('#btnConnect');
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:20000});await p.waitForTimeout(600);
  await p.click('#tabs [data-v="dials"]');await p.waitForTimeout(600);await p.screenshot({path:'ui/t2_dials.png'});
  const send=async()=>{last=null;await p.click('#btnSend');await p.waitForFunction(()=>!document.getElementById('btnSend').disabled,null,{timeout:60000});};
  let okA=0;
  for(const k of (+(process.env.DFROM||0)>0?[]:analog)){await p.click('#dialGrid [data-k="a:'+k+'"]');await send();if(last&&last.equals(fs.readFileSync('wrap_'+k+'.bin')))okA++;else console.log('AVVIKER analog',k);}
  console.log('analoga identiska med facit:',okA,'av',analog.length);
  const dk=(await p.evaluate(()=>DIGITAL.map(d=>d.key))).slice(+(process.env.DFROM||0),+(process.env.DTO||999));let okD=0;fs.mkdirSync('ui/sent',{recursive:true});
  for(const k of dk){await p.click('#dialGrid [data-k="d:'+k+'"]');await send();
    const exp=Buffer.from(await p.evaluate(()=>{let s='';const f=window.__lastSent;for(let i=0;i<f.length;i+=8192)s+=String.fromCharCode.apply(null,f.subarray(i,i+8192));return btoa(s);}),'base64');
    if(last&&last.equals(exp)){okD++;fs.writeFileSync('ui/sent/'+k+'.bin',last.subarray(53));}else console.log('AVVIKER digital',k,last&&last.length,exp.length);}
  console.log('digitala mottagna oförändrade:',okD,'av',dk.length);
  // redigeraren: ny urtavla, lägg till delar, ändra, dra, byt bakgrund, spara och skicka
  await p.click('#dialGrid [data-new]');await p.waitForTimeout(700);await p.screenshot({path:'ui/t3_editor.png'});
  await p.click('#edChips [data-kind="battv"]');await p.click('#edChips [data-kind="weather"]');await p.click('#edChips [data-kind="time"]');await p.waitForTimeout(200);
  await p.click('#edProps [data-set="f"][data-v="se"]');await p.click('#edProps [data-set="c"][data-v="#ffc83c"]');await p.click('#edProps [data-set="lay"][data-v="stack"]');await p.waitForTimeout(200);
  const box=await (await p.$('#faceC')).boundingBox();
  await p.mouse.move(box.x+box.width*.5,box.y+box.height*.42);await p.mouse.down();await p.mouse.move(box.x+box.width*.36,box.y+box.height*.36,{steps:6});await p.mouse.up();await p.waitForTimeout(200);
  await p.screenshot({path:'ui/t4_editor2.png'});
  await p.click('#edMode [data-m="bg"]');await p.click('#edBgProps [data-set="bg.t"][data-v="grad"]');await p.waitForTimeout(250);await p.screenshot({path:'ui/t5_editor_bg.png'});
  await p.fill('#edName','Provurtavla');console.log('redigerare:',await p.textContent('#edSize'));
  last=null;await p.click('#edSend');await p.waitForTimeout(600);
  await p.waitForFunction(()=>!document.getElementById('btnSend').disabled,null,{timeout:60000});
  if(last){fs.writeFileSync('ui/sent/_egen.bin',last.subarray(53));}
  console.log('egen urtavla skickad:',!!last,last?last.length:0,'|',await p.textContent('#stProg'),'| sparade:',await p.evaluate(()=>MINE.map(m=>m.name).join(',')));
  await p.waitForTimeout(500);await p.screenshot({path:'ui/t6_mine.png'});
  // ladda om: den egna urtavlan ska finnas kvar
  await p.reload();await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:30000});
  console.log('efter omladdning, sparade:',await p.evaluate(()=>MINE.map(m=>m.name).join(',')));
  console.log('sidfel:',errs);
  await b.close();
})().catch(e=>{console.log('E2E-FEL',e);process.exit(1);});
