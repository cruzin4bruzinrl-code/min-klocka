// Sidan inne i Android-appen: appen låtsas här, och pratar med samma låtsasklocka som de andra proven.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
function native(){
  // Android-sidan: tar emot skrivningar från sidan, skickar dem till klockan och lämnar tillbaka det klockan säger
  let chW=null,rdy=false;const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s);};
  const fb=navigator.bluetooth;
  (async()=>{const dev=await fb.requestDevice(),srv=await dev.gatt.connect(),svc=await srv.getPrimaryService('x');chW=await svc.getCharacteristic('baa1');const chN=await svc.getCharacteristic('baa2');
    chN.addEventListener('characteristicvaluechanged',ev=>{if(window.__mk)window.__mk.rx(b64(new Uint8Array(ev.target.value.buffer)));});
    window.__nativeUp=on=>{rdy=on;if(window.__mk)window.__mk.state(on);};setTimeout(()=>window.__nativeUp(true),900);})();
  window.__nativeCalls=[];
  window.MinKlockaNative={isReady:()=>rdy,start(){window.__nativeCalls.push('start');},
    write(id,t){const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);
      if(!rdy){setTimeout(()=>window.__mk.done(id,false),1);return;}
      chW.writeValueWithoutResponse(u).then(()=>setTimeout(()=>window.__mk.done(id,true),1),()=>window.__mk.done(id,false));},
    getKey:()=>'ba20001200b7ef01830001000dc1c2c3c4c5c6d1d2d3d4d5d600',setKey(k){window.__nativeCalls.push('setKey');},
    saveFile(n,b){window.__saved=[n,atob(b).length];return true;},share(t){window.__shared=t;}};
}
const MIME={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f.endsWith('/'))f+='index.html';const fp=path.join('dist',f);fs.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const URL0='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('konsol: '+m.text());});
  let last=null;await p.exposeFunction('__report',s=>{last=Buffer.from(s,'base64');});
  await p.addInitScript(()=>{window.__nokey=true;window.__quick=false;});await p.addInitScript(fake);await p.addInitScript(native);
  await p.goto(URL0);await p.waitForFunction(()=>window.__galleryReady===true&&document.getElementById('stVer').textContent!=='–',null,{timeout:40000});
  ok('sidan vet att den är i appen',await p.textContent('#stVer')==='22 i appen',await p.textContent('#stVer'));
  ok('nyckeln hämtas från appen',await p.evaluate(()=>localStorage.getItem('minklocka.nyckel.v1')==='ba20001200b7ef01830001000dc1c2c3c4c5c6d1d2d3d4d5d600'&&document.getElementById('keyBox').hidden));
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});
  ok('ansluter av sig själv när appen har kontakt, utan tryck',true);
  ok('hälsningen går genom appen',await p.evaluate(()=>window.__sent.some(s=>s==='83/1:c1c2c3c4c5c6d1d2d3d4d5d600')));
  ok('batteriet läses',await p.textContent('#stBatt')==='38 %',await p.textContent('#stBatt'));
  ok('Visa alla enheter är dold',await p.evaluate(()=>getComputedStyle(document.getElementById('btnConnectAll')).display==='none'));
  // skicka en urtavla genom appen
  await p.click('#tabs [data-v="dials"]');await p.click('#dialGrid [data-k="d:rutnat"]');last=null;await p.click('#btnSend');
  await p.waitForFunction(()=>/finns nu på klockan/.test(document.getElementById('stProg').textContent)&&!busy,null,{timeout:90000});
  const exp=Buffer.from(await p.evaluate(()=>{let s='';const f=window.__lastSent;for(let i=0;i<f.length;i+=8192)s+=String.fromCharCode.apply(null,f.subarray(i,i+8192));return btoa(s);}),'base64');
  ok('urtavlan kommer fram oförändrad genom appen',!!last&&last.equals(exp),last&&last.length);
  // musikknapp från klockan syns
  await p.evaluate(()=>window.__push(0x0D,7,[]));await p.waitForTimeout(200);
  ok('klockans knappar når sidan',await p.evaluate(()=>/Knapp på klockan: nästa låt/.test(document.getElementById('log').textContent)));
  await p.evaluate(()=>window.__mk.line('16:00:00  Klockan: nästa låt'));
  ok('appens logg visas på sidan',await p.evaluate(()=>/Appen: Klockan: nästa låt/.test(document.getElementById('log').textContent)));
  // appen tappar klockan och får tillbaka den
  await p.evaluate(()=>window.__nativeUp(false));await p.waitForFunction(()=>document.getElementById('stConn').textContent!=='Ansluten',null,{timeout:5000});
  await p.waitForTimeout(600);await p.evaluate(()=>window.__nativeUp(true));
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});ok('tappad kontakt kommer tillbaka av sig själv',true);
  // lång frånvaro: sidan ger upp, men ansluter när appen fått tillbaka klockan
  await p.evaluate(()=>{window.__nativeUp(false);wantConn=false;clearTimeout(reconnT);});await p.waitForTimeout(800);
  await p.evaluate(()=>window.__nativeUp(true));await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000});ok('ansluter igen även efter att sidan gett upp',true);
  // egna urtavlor till fil, och dela
  await p.click('#tabs [data-v="tools"]');await p.fill('#txtNote','Prov');await p.click('#btnNote');await p.waitForTimeout(500);
  await p.click('#btnExport');await p.waitForTimeout(300);ok('egna urtavlor sparas genom appen',await p.evaluate(()=>window.__saved&&window.__saved[0]==='mina-urtavlor.json'&&window.__saved[1]>50),JSON.stringify(await p.evaluate(()=>window.__saved)));
  await p.click('#btnShare');await p.waitForTimeout(400);ok('dela går genom appen',await p.evaluate(()=>/#u=[zj]/.test(window.__shared||'')));
  ok('inga sidfel',errs.length===0,JSON.stringify(errs));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.log('E2E5-FEL',e);process.exit(1);});
