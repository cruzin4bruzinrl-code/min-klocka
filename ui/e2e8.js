// Prov av lappen: samma urtavla skrivs över, texten finns kvar, och den skickas direkt.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fake=eval('('+src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{')).trim().replace(/^function fake\(\)/,'function()')+')');
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f==='/')f='/index.html';fs.readFile(path.join('dist',f),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let n=0;await p.exposeFunction('__report',s=>{n++;});await p.addInitScript(fake);
  // en gammal lapp finns sedan förut, med slumpat nummer
  await p.addInitScript(()=>{if(!sessionStorage.getItem('x')){sessionStorage.setItem('x','1');localStorage.setItem('minklocka.mina.v1',JSON.stringify([{id:0x86B21234,name:'Lapp Gammal',def:{bg:{t:'solid',c:'#ffd84a'},deco:[{k:'rect',x:0,y:0,w:240,h:46,r:0,c:'#f2c230'},{k:'note',lines:['Gammal','Rad två'],x:120,y:54,w:212,h:216,s:44,f:'pb',c:'#1b1a12'}],els:[]}}]));}});
  await p.goto(U+'#k=ba20001200b7ef01830001000da1a2a3a4a5a6b1b2b3b4b5b600');await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});await p.waitForTimeout(800);
  ok('den gamla lappens text fylls i',await p.inputValue('#txtNote')==='Gammal\nRad två',JSON.stringify(await p.inputValue('#txtNote')));
  await p.click('#btnConnect');await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten'&&!busy&&!hlBusy,null,{timeout:40000});
  await p.waitForFunction(()=>/Hämtat|svarade/.test($('hlState').textContent)&&!busy,null,{timeout:30000});
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtNote','Mjölk\nBröd');await p.click('#btnNote');
  await p.waitForFunction(()=>/finns nu på klockan/.test($('stProg').textContent)&&!busy,null,{timeout:60000});
  ok('lappen skickas direkt',n===1,n);
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtNote','Mjölk\nBröd\nÄgg');await p.click('#btnNote');
  await p.waitForFunction(()=>/finns nu på klockan/.test($('stProg').textContent)&&!busy,null,{timeout:60000});await p.waitForTimeout(300);
  const m=await p.evaluate(()=>MINE.filter(x=>x.id===0x86B2F005).map(x=>x.def.deco[1].lines.join('|')));
  ok('samma lapp skrivs över, ingen ny',m.length===1&&m[0]==='Mjölk|Bröd|Ägg'&&n===2,JSON.stringify(m)+' '+n);
  await p.reload();await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});
  ok('texten finns kvar efter omstart',await p.inputValue('#txtNote')==='Mjölk\nBröd\nÄgg');
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.error('E2E-FEL',e);process.exit(1);});
