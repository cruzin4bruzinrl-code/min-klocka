// Prov av påminnelser på lappen, inne i en låtsad app.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fake=eval('('+src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{')).trim().replace(/^function fake\(\)/,'function()')+')');
const s5=fs.readFileSync('ui/e2e5.js','utf8');const native0=eval('('+s5.slice(s5.indexOf('function native(){'),s5.indexOf('const MIME=')).trim().replace(/^function native\(\)/,'function()')+')');
function extra(){const add=()=>{const N=window.MinKlockaNative;if(!N)return setTimeout(add,0);window.__rem=[];N.setReminders=j=>{window.__rem.push(JSON.parse(j));};};add();}
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f.endsWith('/'))f+='index.html';fs.readFile(path.join('dist',f),(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const U='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const ctx=await b.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Stockholm'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let n=0;await p.exposeFunction('__report',s=>{n++;});await p.addInitScript(()=>{window.__nokey=true;window.__quick=false;});await p.addInitScript(fake);await p.addInitScript(native0);await p.addInitScript(extra);
  await p.goto(U);await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});
  await p.waitForFunction(()=>/Hämtat|svarade/.test($('hlState').textContent)&&!busy,null,{timeout:30000});
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtNote','Tandläkare\nMjölk\nRing mamma');await p.waitForTimeout(400);
  ok('varje rad får en påminnelseknapp',await p.evaluate(()=>$('remList').querySelectorAll('.rb').length===3));
  // välj en tid i morgon 14:30 för första raden
  await p.evaluate(()=>{const orig=HTMLInputElement.prototype.showPicker;HTMLInputElement.prototype.showPicker=function(){};});
  await p.click('#remList .rr:nth-child(1) .rb');
  const at=await p.evaluate(()=>{const d=new Date();d.setDate(d.getDate()+1);d.setHours(14,30,0,0);const v=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,16);
    const i=$('remPick');i.value=v;i.dispatchEvent(new Event('change'));return d.getTime();});
  await p.waitForTimeout(200);
  const last=await p.evaluate(()=>window.__rem[window.__rem.length-1]);
  ok('appen får påminnelsen med text och tid',last&&last.length===1&&last[0].t==='Tandläkare'&&last[0].at===at,JSON.stringify(last));
  ok('raden visar tiden',/imorgon 14:30/.test(await p.textContent('#remList .rr:nth-child(1) .rb')),await p.textContent('#remList .rr:nth-child(1) .rb'));
  await p.click('#btnNote');await p.waitForFunction(()=>/finns nu på klockan/.test($('stProg').textContent)&&!busy,null,{timeout:60000});
  const lines=await p.evaluate(()=>MINE.find(m=>m.id===0x86B2F005).def.deco.find(d=>d.k==='note').lines);
  ok('lappen visar tiden bredvid saken',/^Tandläkare  \d+\/\d+ 14:30$/.test(lines[0])&&lines[1]==='Mjölk',JSON.stringify(lines));
  await p.click('#tabs [data-v="tools"]');await p.click('#segRemShow [data-v="0"]');await p.click('#btnNote');await p.waitForFunction(()=>/finns nu på klockan/.test($('stProg').textContent)&&!busy,null,{timeout:60000});
  ok('utan tid när det är valt',await p.evaluate(()=>MINE.find(m=>m.id===0x86B2F005).def.deco.find(d=>d.k==='note').lines[0])==='Tandläkare');
  await p.click('#tabs [data-v="tools"]');await p.click('#remList .rr:nth-child(1) .rx');await p.waitForTimeout(200);
  ok('påminnelsen går att ta bort',await p.evaluate(()=>window.__rem[window.__rem.length-1].length===0&&!$('remList .rr:nth-child(1) .rx')));
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.error('E2E-FEL',e);process.exit(1);});
