const { chromium } = require('playwright');const fs=require('fs');
// node ui/harness.js [från] [bildfil] [flera klockslag]
const FROM=+(process.argv[2]||0),IMG=process.argv[3]||'ui/digital_sheet.png',MANY=process.argv[4]==='1';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const p=await b.newPage({viewport:{width:1270,height:1200}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/ui/harness.html');
  const out=await p.evaluate(([f,m])=>window.run(f,m?[{h:10,m:9,s:37},{h:3,m:40,s:5}]:null),[FROM,MANY]);
  fs.mkdirSync('ui/built',{recursive:true});
  for(const o of out){fs.writeFileSync('ui/built/'+o.key+'.bin',Buffer.from(o.b64,'base64'));}
  console.log(out.map(o=>o.key+':'+o.size+(o.live?'*':'')+(o.size!==o.est?'(uppskattat '+o.est+')':'')+(o.size>409600?' FÖR STOR':'')).join('  '));
  await (await p.$('#sheet')).screenshot({path:IMG});console.log('fel:',errs);await b.close();})();
