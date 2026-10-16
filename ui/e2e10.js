// Prov av det nya gränssnittet: rundtur, verktyg som kort, blad med bild och steg, tips om urtavlor.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fake=eval('('+src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{')).trim().replace(/^function fake\(\)/,'function()')+')');
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';fs.readFile(path.join('dist',f),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));let n=0;await p.exposeFunction('__report',s=>{n++;});
  await p.addInitScript(()=>{window.__newTools=true;});await p.addInitScript(fake);
  await p.goto(U+'#k=ba20001200b7ef01830001000da1a2a3a4a5a6b1b2b3b4b5b600');await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});
  await p.waitForSelector('#tour .tr-next',{timeout:5000});ok('guiden visas första gången',true);
  const nst=await p.evaluate(()=>window.__obSteps());ok('guiden har steg för anslutning, urtavla och tema (utan app inget steg för lov)',nst===5,nst);
  await p.click('#tour .tr-next');await p.waitForTimeout(250);
  ok('steget anslut har en knapp i webbläsaren',await p.evaluate(()=>!!document.querySelector('#tour [data-a="conn"]')));
  await p.click('#tour .tr-next');await p.waitForTimeout(400);
  ok('urtavlor att välja bland, ritade',await p.evaluate(()=>document.querySelectorAll('#tour .ob-faces canvas').length===6));
  await p.click('#tour .ob-faces button[data-k="astronauten"]');await p.waitForTimeout(200);
  ok('ett tryck väljer urtavlan',await p.evaluate(()=>cur&&cur.key==='astronauten'));
  await p.click('#tour .tr-back');await p.waitForTimeout(200);ok('tillbaka fungerar',await p.evaluate(()=>!!document.querySelector('#tour [data-a="conn"]')));
  await p.click('#tour .tr-next');await p.click('#tour .tr-next');await p.waitForTimeout(250);
  await p.click('#tour .themes button[data-th="mint"]');await p.waitForTimeout(200);ok('tema väljs i guiden',await p.evaluate(()=>document.documentElement.dataset.theme==='mint'));
  await p.click('#tour .tr-next');await p.waitForTimeout(200);await p.click('#tour .tr-next');
  await p.waitForTimeout(500);ok('guiden går att gå igenom och stängs',await p.evaluate(()=>!document.getElementById('tour')&&lsGet('minklocka.start.v2',false)===true));
  await p.reload();await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});await p.waitForTimeout(1300);
  ok('guiden visas inte igen',await p.evaluate(()=>!document.getElementById('tour')));
  await p.click('#btnConnect');await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten'&&!busy,null,{timeout:40000});
  await p.waitForFunction(()=>/Hämtat|svarade/.test($('hlState').textContent)&&!busy&&!hlBusy,null,{timeout:30000});
  await p.click('#tabs [data-v="tools"]');await p.waitForTimeout(700);
  const cards=await p.evaluate(()=>[...document.querySelectorAll('.tcard')].filter(c=>!c.hidden).map(c=>c.dataset.tool));
  ok('verktygen är kort i grupper',cards.length>=12&&!cards.includes('disp')&&!cards.includes('free'),cards.join(','));
  ok('Mer-fliken har bytt namn',(await p.textContent('#tabs [data-v="log"]')).trim()==='Mer');
  // varje verktyg öppnas med bild och steg, och stängs med innehållet tillbaka
  let all=true,bad=[];
  for(const k of cards.filter(c=>c!=='own')){await p.evaluate(k=>openTool(k),k);await p.waitForTimeout(80);
    const s=await p.evaluate(()=>({on:$('tsheet').classList.contains('on'),scene:!!document.querySelector('#tsheet .sc'),steps:document.querySelectorAll('#tsheet .tsh-steps li').length,body:document.querySelector('#tsheet .tsh-body').children.length}));
    await p.evaluate(()=>closeTool());await p.waitForTimeout(380);
    const back=await p.evaluate(()=>document.querySelector('#tsheet .tsh-body').children.length===0);
    if(!(s.on&&s.scene&&s.steps>=2&&s.body===1&&back)){all=false;bad.push(k+JSON.stringify(s));}}
  ok('varje verktyg: blad, bild, steg, och innehållet går tillbaka',all,bad.join(' '));
  // använd lappen genom bladet
  await p.click('.tcard[data-tool="note"]');await p.waitForTimeout(500);await p.fill('#txtNote','Mjölk\nBröd');await p.click('#btnNote');
  await p.waitForFunction(()=>/finns nu på klockan/.test($('stProg').textContent)&&!busy,null,{timeout:60000});ok('lappen skickas från bladet',n>=1,n);
  ok('bladet stängs när appen byter flik',await p.evaluate(()=>!$('tsheet').classList.contains('on')&&$('view-dials').classList.contains('on')));
  await p.click('#tabs [data-v="tools"]');await p.waitForTimeout(300);
  
  // tillbaka-knappen stänger bladet
  await p.click('.tcard[data-tool="msg"]');await p.waitForTimeout(400);await p.goBack();await p.waitForTimeout(500);
  ok('tillbaka stänger bladet',await p.evaluate(()=>!$('tsheet').classList.contains('on')));
  // tips om urtavlor
  await p.click('#tabs [data-v="dials"]');ok('tips om hur man byter urtavla',await p.evaluate(()=>!!document.querySelector('#view-dials .hint')));
  await p.click('#view-dials .hint-x');await p.waitForTimeout(400);await p.reload();await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});
  ok('tipset kommer inte tillbaka',await p.evaluate(()=>!document.querySelector('#view-dials .hint')));
  await p.click('#tabs [data-v="log"]');await p.click('#btnTour');await p.waitForTimeout(300);ok('guiden går att se igen',await p.evaluate(()=>!!document.getElementById('tour')));
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.error('E2E-FEL',e);process.exit(1);});
