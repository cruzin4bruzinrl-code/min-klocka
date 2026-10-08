// Kör den riktiga sidan i Chromium mot en falsk klocka och jämför det klockan tar emot med facit.
const { chromium } = require('playwright'); const fs=require('fs');
const keys=JSON.parse(fs.readFileSync('ui/keys.json','utf8'));
const FILE=process.argv[2]||'index_v15.html';
function fake(){
  function crc16(b){let c=0xFFFF;for(const x of b){c^=x<<8;for(let i=0;i<8;i++)c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}return c;}
  let rx=new Uint8Array(0),notify=null,recv=[],wseq=1;window.__sent=[];
  function reply(cmd,key,data,more){const n=data.length;const p=new Uint8Array(5+n);p[0]=cmd;p[1]=0;p[2]=key;p[3]=n>>8;p[4]=n&255;p.set(data,5);const c=crc16(p);
    const f=new Uint8Array(8+p.length);f[0]=0xBA;f[1]=more?0x71:0x31;f[2]=p.length>>8;f[3]=p.length&255;f[4]=c>>8;f[5]=c&255;f[6]=wseq&255;f[7]=wseq>>8;wseq++;f.set(p,8);
    setTimeout(()=>notify({target:{value:{buffer:f.buffer}}}),3);}
  const be=v=>[(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255];
  function frame(f){const cmd=f[8],key=f[10],d=f.subarray(13);
    if(f[1]===0x21){const c=crc16(f.subarray(8));if(((f[4]<<8)|f[5])!==c)throw new Error('CRC-fel');}
    if(window.__hang){window.__ignored=(window.__ignored||0)+1;return;}
    window.__sent.push(cmd.toString(16)+'/'+key.toString(16)+(cmd===1&&key===0xC2?'':':'+Array.from(d).map(b=>b.toString(16).padStart(2,'0')).join('')));
    if(cmd===3&&(key===0x30||key===0x37))return reply(3,key,[]);
    if(cmd===2&&key===0x22)return reply(2,0x22,[]);
    if(cmd===0x83)return reply(0x83,2,Array.from(d));
    if(cmd===4&&key===0x44)return reply(4,0x45,[0]);
    if(cmd===0x16&&key===1){if(d[1]===0)return reply(0x16,2,[2,0,1,1,0,0x6a,0x86,0xb8,0xe2]);
      if(d[1]===0x81)return reply(0x16,2,[2,0x81,1,5,6,0x6a,0x86,0xb8,0xe2,0x63,0x29,0x5e,0xb0,0x63,0x29,0x5e,0xb1,0x63,0x29,0x5e,0xb2,0x63,0x29,0x5e,0xb3,0x63,0x29,0x5e,0xb4,0x6a,0x86,0xb8,0xe2,0,6,0x40,0]);
      if(d[1]===0x84)return reply(0x16,2,[2,0x84,0,0xf0,1,0x1e,0]);}
    if(cmd===2&&key===0x20)return reply(2,0x20,[0]);
    if(cmd===2&&key===0xF0){if(window.__nodisp)return;return reply(2,0xF1,[25,255,1,2,7,5,10,15,25,30,45,60,0,0,0x05,0x9f]);}
    if(cmd===2&&key===0xEE)return reply(2,0xEF,[0]);
    // historik: samma form som i trafiken från originalappen
    if(cmd===0x0A&&key===0xA6)return reply(0x0A,0xAC,[0,0,0x14,0xb4,0x42,0x8c,0,0,0x40,0x0c,0xcc,0xcd]);
    if(cmd===0x0A&&key===0xA0){window.__hist=(window.__hist||0)+1;const t=d[0],D=[d[1],d[2],d[3]];if(window.__nohist)return;
      if(t===3){const a=[...D,0];let c=0;for(let h=0;h<24;h++){c+=h>7&&h<20?300+h*10:0;a.push(...be(c));}a.push(0,0,0,0,0,0,0,0);reply(0x0A,0xA3,a,true);return reply(0x0A,0xA3,[]);}
      if(t===1)return reply(0x0A,0xA2,[...D,1,0,30,2,1,40,3,3,10,1,4,0,2,5,0,0,6,45]);
      if(t===2||t===7){const k2=t===2?0xA4:0xAF,r=[];for(let h=0;h<24;h++)for(const m of [11,41])r.push(...D,h,m,23,t===2?(h===3&&m===11?0:60+((h*7+m)%30)):96+(h%4));
        reply(0x0A,k2,r.slice(0,220),true);return reply(0x0A,k2,r.slice(220));}
      return reply(0x0A,{5:0xAD,8:0xBD}[t]||0xA2,[]);}
    if(cmd===4&&key===0x40)return reply(4,0x41,[0x26,0]);
    if(cmd===4&&key===0x4A)return reply(4,0x4A,[]);
    if(cmd===6&&key===0x60)return reply(6,0x60,[]);
    if(cmd===5&&key===0x50)return;
    if(cmd===0x16&&key===3)return reply(0x16,4,[2,d[1],1]);
    if(cmd===1&&key===0xC0){recv=Array.from(d);return reply(1,0xC1,[1,...be(0x3000),...be(recv.length)]);}
    if(cmd===1&&key===0xC2){const n=(d[0]<<24|d[1]<<16|d[2]<<8|d[3])>>>0,off=(d[4]<<24|d[5]<<16|d[6]<<8|d[7])>>>0;if(off!==recv.length)throw new Error('fel offset');
      for(let i=0;i<n;i++)recv.push(d[8+i]);return reply(1,0xC3,[0,...be(recv.length)]);}
    if(cmd===1&&key===0xC5){let s='';for(let i=0;i<recv.length;i+=8192)s+=String.fromCharCode.apply(null,recv.slice(i,i+8192));window.__report(btoa(s));reply(1,0xC5,[0]);if(window.__hangNext){window.__hangNext=false;setTimeout(()=>{window.__hang=true;if(window.__dropOnHang)dev.gatt.disconnect();},400);}return;}
  }
  window.__push=(cmd,key,data)=>reply(cmd,key,data);
  const chW={async writeValueWithoutResponse(part){if(part.length>512)throw new Error('för stor skrivning');const n=new Uint8Array(rx.length+part.length);n.set(rx);n.set(part,rx.length);rx=n;
    while(rx.length>=8){const len=(rx[2]<<8)|rx[3];if(rx.length<8+len)break;const f=rx.slice(0,8+len);rx=rx.slice(8+len);frame(f);}}};
  const chN={async startNotifications(){},addEventListener(ev,fn){notify=fn;}};
  // Klockan som enhet: går att koppla från, hänga och väcka, så att återanslutning och räddning kan provas.
  const srv={async getPrimaryService(){return {async getCharacteristic(u){return u.includes('baa1')?chW:chN;}};}};
  const dev={name:'TRIARENALI1',_l:{},addEventListener(ev,fn){this._l[ev]=fn;},gatt:{connected:false,
    async connect(){await new Promise(r=>setTimeout(r,60));if(window.__away>0){window.__away--;throw new Error('utom räckhåll');}if(window.__heal)window.__hang=false;this.connected=true;window.__connects=(window.__connects||0)+1;return srv;},
    disconnect(){if(!this.connected)return;this.connected=false;setTimeout(()=>{if(dev._l.gattserverdisconnected)dev._l.gattserverdisconnected({});},5);}}};
  window.__drop=()=>dev.gatt.disconnect();
  try{if(!localStorage.getItem('minklocka.nyckel.v1')&&!window.__nokey)localStorage.setItem('minklocka.nyckel.v1','ba20001200b7ef01830001000da1a2a3a4a5a6b1b2b3b4b5b600');}catch(e){}
  if(window.__quick===undefined)window.__quick=true;
  Object.defineProperty(navigator,'bluetooth',{value:{async requestDevice(){await new Promise(r=>setTimeout(r,700));return dev;},async getDevices(){return window.__known?[dev]:[];}},configurable:true});
}
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}).catch(()=>chromium.launch());
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,permissions:['clipboard-write','clipboard-read']});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let last=null;await p.exposeFunction('__report',s=>{last=Buffer.from(s,'base64');});
  await p.addInitScript(fake);
  await p.goto('file://'+process.cwd()+'/'+FILE);await p.waitForTimeout(500);
  await p.screenshot({path:'ui/s1_home.png'});
  await p.click('#btnConnect');await p.waitForTimeout(350);await p.screenshot({path:'ui/s2_connecting.png'});
  await p.waitForFunction(()=>document.getElementById('stConn').textContent==='Ansluten',null,{timeout:20000});await p.waitForTimeout(900);
  await p.evaluate(()=>{window.__push(0x0A,0xB2,[0x61,0x1a,0x0a,0x04,0x15,0x21,0x0b]);window.__push(0x0A,0xAC,[0,0,0x05,0x4e,0,0,0,0,0x3b,0xe5,0x60,0x42]);window.__push(0x0A,0xAB,[0x56,0,0x1a,0x0a,0x04,0x15,0x23,0x0b]);});await p.waitForTimeout(250);
  console.log('puls',await p.textContent('#stPulse'),'|',await p.textContent('#stPulseAt'),'| steg',await p.textContent('#stSteps'));
  await p.screenshot({path:'ui/s3_connected.png'});
  console.log('batteri',await p.textContent('#stBatt'),'| tid',await p.textContent('#stTime'),'| urtavla',await p.textContent('#stDial'),'| ledigt',await p.textContent('#stFree'));
  await p.click('#tabs [data-v="dials"]');await p.waitForTimeout(500);
  let allOk=true;
  for(const [i,k] of keys.entries()){
    await p.click('#dialGrid [data-i="'+i+'"]');await p.waitForTimeout(i===3?700:150);
    if(i===3)await p.screenshot({path:'ui/s4_dials.png'});
    last=null;await p.click('#btnSend');
    if(i===3){await p.waitForTimeout(160);await p.screenshot({path:'ui/s5_sending.png'});}
    await p.waitForFunction(()=>!document.getElementById('btnSend').disabled,null,{timeout:60000});
    const ok=last&&last.equals(fs.readFileSync('wrap_'+k+'.bin'));allOk=allOk&&ok;
    console.log(k.padEnd(9),'mottaget',last?last.length:0,'| identiskt:',ok,'|',await p.textContent('#stProg'));
  }
  await p.click('#tabs [data-v="tools"]');await p.waitForTimeout(700);
  await p.evaluate(()=>{window.__sent.length=0;});
  await p.click('#btnTime');await p.waitForTimeout(150);await p.click('#btnFind');await p.waitForTimeout(150);
  await p.click('#segWrist [data-w="0"]');await p.waitForTimeout(150);await p.click('#segBuiltin [data-id="63295EB2"]');await p.waitForTimeout(400);
  await p.fill('#txtMsg','Luke’sWatchhouse : LIVE nu');await p.click('#btnMsg');await p.waitForTimeout(300);
  await p.screenshot({path:'ui/s6_tools.png'});
  const sent=await p.evaluate(()=>window.__sent);console.log('verktygspaket:',sent.filter(s=>!s.startsWith('16/1')).join(' | '));
  // mätning: klockan börjar skicka puls -> handledsrörelsen ska stängas av, och slås på igen 15 s efter sista värdet
  await p.click('#tabs [data-v="tools"]');await p.waitForTimeout(500);await p.click('#segWrist [data-w="1"]');await p.waitForTimeout(300);
  await p.evaluate(()=>{window.__sent.length=0;});
  await p.click('#segAfter [data-t="10"]');
  for(let k=0;k<2;k++){await p.evaluate(v=>window.__push(0x0A,0xAB,[v,0,0x1a,0x0a,0x07,0x00,0x10,0x0b]),70+k);await p.waitForTimeout(900);}
  for(let k=0;k<2;k++){await p.evaluate(v=>window.__push(0x0A,0xB2,[v,0x1a,0x0a,0x07,0x00,0x10,0x0b]),97+k);await p.waitForTimeout(900);}
  console.log('under mätning:',(await p.evaluate(()=>window.__sent)).join(' | '));
  await p.waitForTimeout(10800);
  console.log('efter mätning:',(await p.evaluate(()=>window.__sent)).join(' | '));
  await p.click('#tabs [data-v="log"]');await p.waitForTimeout(700);await p.click('#btnCopy');await p.waitForTimeout(300);await p.screenshot({path:'ui/s7_log.png'});
  console.log((await p.textContent('#log')).split('\n').filter(l=>/Handled|Mätning|Puls från|Syre|Tid efter/.test(l)).join('\n'));
  console.log('sidfel:',errs,'| alla urtavlor identiska:',allOk);
  await b.close();
})().catch(e=>{console.log('E2E-FEL',e);process.exit(1);});
