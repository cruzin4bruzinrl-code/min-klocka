const { chromium } = require('playwright'); const fs=require('fs');
const src=fs.readFileSync('ui/e2e.js','utf8');const fakeSrc=src.slice(src.indexOf('function fake(){'),src.indexOf('(async()=>{'));
const fake=eval('('+fakeSrc.trim().replace(/^function fake\(\)/,'function()')+')');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:360,height:700},deviceScaleFactor:2,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.exposeFunction('__report',()=>{});await p.addInitScript(fake);await p.goto('file://'+process.cwd()+'/dist/index.html');
  await p.waitForFunction(()=>window.__galleryReady===true,null,{timeout:30000});
  await p.screenshot({path:'ui/x_home.png'});
  await p.click('#btnRescue');await p.waitForFunction(()=>/Räddningen/.test(document.getElementById('log').textContent),null,{timeout:30000});
  const t=await p.evaluate(()=>document.getElementById('log').innerText.split('\n').filter(l=>/Räddning/.test(l)).join(' | '));console.log(t);
  console.log('skickat byte:',await p.evaluate(()=>(window.__sent||[]).map(f=>Array.from(f).map(x=>x.toString(16).padStart(2,'0')).join('')).filter(h=>h.includes('1603')).slice(-1)[0]));
  // därefter vanlig anslutning
  await p.click('#tabs [data-v="home"]');await p.click('#btnConnect');await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:20000});
  console.log('vanlig anslutning efteråt: ok | urtavlor:',await p.evaluate(()=>allDials().length),'| fel:',errs);await b.close();})().catch(e=>{console.log('FEL',e.message);process.exit(1);});
