// Prov av skärm/ljusstyrka och aviseringar: i webbläsaren och inne i en låtsad app.
const { chromium } = require('playwright'); const fs=require('fs'); const http=require('http'); const path=require('path');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
const s5=fs.readFileSync('ui/e2e5.js','utf8');const native0=eval('('+s5.slice(s5.indexOf('function native(){'),s5.indexOf('const MIME=')).trim().replace(/^function native\(\)/,'function()')+')');
function extra(){const add=()=>{const N=window.MinKlockaNative;if(!N)return setTimeout(add,0);
  window.__perm={notif:false,sms:false,contacts:false,on:true,bright:false};window.__bright=null;
  N.perms=()=>JSON.stringify(window.__perm);N.openNotifyAccess=()=>{window.__nativeCalls.push('notif');window.__perm.notif=true;};
  N.askSms=()=>{window.__nativeCalls.push('sms');window.__perm.sms=true;window.__perm.contacts=true;setTimeout(()=>window.__mkPerms(),10);};
  N.setNotify=on=>{window.__perm.on=on;};N.setBright=(on,d,n,f,t)=>{window.__bright=[on,d,n,f,t];window.__perm.bright=on;};};add();}
const MIME={'.html':'text/html; charset=utf-8','.json':'application/json','.js':'text/javascript','.png':'image/png','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=q.url.split('?')[0];if(f.endsWith('/'))f+='index.html';const fp=path.join('dist',f);fs.readFile(fp,(e,d)=>{if(e){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':MIME[path.extname(fp)]||'application/octet-stream'});r.end(d);});});
let pass=0,fail=0;const ok=(n,c,x)=>{c?pass++:fail++;console.log((c?'ok   ':'FEL  ')+n+(x!==undefined?'  → '+x:''));};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const URL0='http://localhost:'+srv.address().port+'/';
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  // 1. i webbläsaren
  let ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Stockholm'});
  let p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.exposeFunction('__report',s=>{});await p.addInitScript(fake);
  await p.goto(URL0+'#k=ba20001200b7ef01830001000da1a2a3a4a5a6b1b2b3b4b5b600');await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:40000});
  await p.click('#btnConnect');await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten'&&!busy&&!hlBusy,null,{timeout:30000});
  await p.waitForFunction(()=>/Hämtat|svarade/.test($('hlState').textContent)&&!busy,null,{timeout:30000});
  await p.click('#tabs [data-v="tools"]');
  ok('i webbläsaren: aviseringar kräver appen',/bara i Android-appen/.test(await p.textContent('#stNotif')));
  await p.click('#btnDispRead');await p.waitForFunction(()=>/Klockan svarade/.test($('stDisp').textContent),null,{timeout:10000});
  ok('läser skärminställningen',/Ljusstyrka 25, skärmen tänd 15 s, lyft handleden för att tända: på/.test(await p.textContent('#stDisp')),await p.textContent('#stDisp'));
  ok('valen visas: procentskala, skärmtider ur klockans lista',await p.evaluate(()=>!$('dispBox').hidden&&$('segDay').children.length===7&&$('segScreen').textContent.includes('60 s')&&$('segScreen').querySelector('.on').textContent==='15 s'));
  await p.click('#segScreen [data-v="4"]');await p.click('#segDay button:has-text("85")');await p.click('#segNight button:has-text("10")');
  await p.evaluate(()=>{window.__sent.length=0;});await p.click('#btnDispSave');await p.waitForFunction(()=>/Klockan tog emot/.test($('stDisp').textContent),null,{timeout:10000});
  const ee=await p.evaluate(()=>window.__sent.filter(s=>s.startsWith('2/ee')));
  const h=new Date().getHours();const lum=(h>=7&&h<21)?'55':'0a';
  ok('skickar bara ljus och skärmtid ändrat, resten som klockan sa (start/slut tillbaka)',ee.length===1&&(ee[0]==='2/ee:'+'55'+'04ff0100009f05'||ee[0]==='2/ee:'+'0a'+'04ff0100009f05'),ee.join(' '));
  await p.click('#btnDispOff');await p.waitForFunction(()=>/Automatiken är av/.test($('stDisp').textContent),null,{timeout:10000});
  ok('återställ skickar klockans förra värden',await p.evaluate(()=>window.__sent.filter(s=>s.startsWith('2/ee')).pop())==='2/ee:1902ff0100009f05');
  await p.screenshot({path:'ui/v14_skarm.png'});
  ok('inga sidfel i webbläsaren',errs.length===0,JSON.stringify(errs));
  await ctx.close();
  // 2. inne i appen
  ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,timezoneId:'Europe/Stockholm'});
  p=await ctx.newPage();const errs2=[];p.on('pageerror',e=>errs2.push(e.message));
  await p.exposeFunction('__report',s=>{});await p.addInitScript(()=>{window.__nokey=true;window.__quick=false;});await p.addInitScript(fake);await p.addInitScript(native0);await p.addInitScript(extra);
  await p.goto(URL0);await p.waitForFunction(()=>window.__galleryReady===true&&document.getElementById('stVer').textContent!=='–',null,{timeout:40000});
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:30000}).catch(async e=>{console.log('ERRS',JSON.stringify(errs2),await p.textContent('#stConn'),(await p.textContent('#log')).slice(-800));throw e;});
  await p.waitForFunction(()=>/Hämtat|svarade/.test($('hlState').textContent)&&!busy,null,{timeout:30000});
  await p.click('#tabs [data-v="tools"]');
  ok('i appen: knappar för lov syns',await p.evaluate(()=>!$('btnNotifAccess').hidden&&!$('btnSmsPerm').hidden),await p.textContent('#stNotif'));
  await p.click('#btnSmsPerm');await p.waitForTimeout(200);
  ok('efter lov för sms försvinner knappen och texten säger det',await p.evaluate(()=>$('btnSmsPerm').hidden&&/Sms skickas med avsändarens nummer/.test($('stNotif').textContent)));
  await p.click('#segNotif [data-n="0"]');ok('av-knappen stänger av',await p.evaluate(()=>window.__perm.on===false&&/Avstängt/.test($('stNotif').textContent)));
  await p.click('#btnDispRead');await p.waitForFunction(()=>/Klockan svarade/.test($('stDisp').textContent),null,{timeout:10000});
  await p.click('#segNight button:has-text("10")');await p.click('#btnDispSave');await p.waitForFunction(()=>/byter själv/.test($('stDisp').textContent),null,{timeout:10000});
  const br=await p.evaluate(()=>window.__bright);
  ok('appen får dag- och nattskrivningen och tiderna',br&&br[0]===true&&br[1]==='1902ff0100009f05'&&br[2]==='0a02ff0100009f05'&&br[3]===420&&br[4]===1260,JSON.stringify(br));
  ok('inga sidfel i appen',errs2.length===0,JSON.stringify(errs2));
  console.log('\n'+pass+' ok, '+fail+' fel');await b.close();srv.close();process.exit(fail?1:0);
})().catch(e=>{console.error('E2E-FEL',e);process.exit(1);});
