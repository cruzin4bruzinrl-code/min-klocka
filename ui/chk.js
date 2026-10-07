// Läser in alla skript tillsammans, som i appen, och rapporterar fel som annars bara syns i webbläsaren.
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+process.cwd()+'/ui/harness.html');await p.waitForTimeout(500);console.log('laddfel:',errs.length?errs:'inga','| run finns:',await p.evaluate(()=>typeof window.run));await b.close();})();
