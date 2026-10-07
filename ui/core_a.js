// Inne i Android-appen håller appen kontakten med klockan. Den här biten låter sidan använda den kontakten
// på samma sätt som webbläsarens Bluetooth, så att resten av sidan är likadan i appen och i Chrome.
(function(){
  const N=window.MinKlockaNative;if(!N)return;
  const b64=u=>{let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s);};
  const unb=t=>{const s=atob(t),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;};
  let ready=false,waiters=[],wid=0;const pend=new Map(),rxL=[],discL=[];
  const chN={startNotifications:async()=>chN,addEventListener:(t,f)=>{if(t==='characteristicvaluechanged'&&!rxL.includes(f))rxL.push(f);}};
  const chW={writeValueWithoutResponse(v){const u=v instanceof Uint8Array?v:new Uint8Array(v.buffer||v);
    return new Promise((res,rej)=>{if(!ready)return rej(new Error('Klockan är inte ansluten'));const id=++wid;
      pend.set(id,{res,rej,t:setTimeout(()=>{pend.delete(id);rej(new Error('Skrivningen tog för lång tid'));},15000)});N.write(id,b64(u));});}};
  chW.writeValue=chW.writeValueWithoutResponse;
  const svc={getCharacteristic:async u=>String(u).toLowerCase().includes('baa1')?chW:chN},server={getPrimaryService:async()=>svc};
  const fireGone=()=>discL.forEach(f=>{try{f({target:dev});}catch(e){}});
  const dev={name:'TRIARENALI1',native:true,addEventListener:(t,f)=>{if(t==='gattserverdisconnected'&&!discL.includes(f))discL.push(f);},
    gatt:{connected:false,
      connect:()=>new Promise((res,rej)=>{if(ready){dev.gatt.connected=true;return res(server);}
        try{N.start();}catch(e){}
        const w={res,rej};w.t=setTimeout(()=>{waiters=waiters.filter(x=>x!==w);rej(new Error('Appen når inte klockan just nu'));},30000);waiters.push(w);}),
      disconnect(){if(!dev.gatt.connected)return;dev.gatt.connected=false;setTimeout(fireGone,0);}}};
  window.__mk={
    rx(t){const u=unb(t),ev={target:{value:new DataView(u.buffer)}};rxL.forEach(f=>{try{f(ev);}catch(e){}});},
    done(id,ok){const p=pend.get(id);if(!p)return;pend.delete(id);clearTimeout(p.t);if(ok)p.res();else p.rej(new Error('Skrivningen gick inte fram'));},
    state(on){on=!!on;if(on===ready)return;ready=on;
      if(on){const had=waiters.length;waiters.splice(0).forEach(w=>{clearTimeout(w.t);dev.gatt.connected=true;w.res(server);});if(!had&&typeof window.__mkAuto==='function')setTimeout(window.__mkAuto,50);}
      else{pend.forEach(p=>{clearTimeout(p.t);p.rej(new Error('Klockan kopplades från'));});pend.clear();if(dev.gatt.connected){dev.gatt.connected=false;fireGone();}}},
    line(t){try{if(typeof log==='function')log('Appen: '+String(t).replace(/^\d\d:\d\d:\d\d\s+/,''));}catch(e){}}
  };
  try{Object.defineProperty(navigator,'bluetooth',{value:{requestDevice:async()=>dev,getDevices:async()=>[dev]},configurable:true});}catch(e){}
  try{ready=!!N.isReady();}catch(e){}
})();

// Protokollkärna: delas av HTML-verktyget och testet
function crc16(bytes){let c=0xFFFF;for(const b of bytes){c^=b<<8;for(let i=0;i<8;i++){c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF;}}return c;}
function buildFrame(cmd,key,data,seq){
  data=data||[];const n=data.length;
  const p=new Uint8Array(5+n);p[0]=cmd;p[1]=n?1:0;p[2]=key;p[3]=(n>>8)&255;p[4]=n&255;p.set(data,5);
  const c=crc16(p);const f=new Uint8Array(8+p.length);
  f[0]=0xBA;f[1]=0x21;f[2]=(p.length>>8)&255;f[3]=p.length&255;f[4]=c>>8;f[5]=c&255;f[6]=seq&255;f[7]=(seq>>8)&255;f.set(p,8);
  return f;
}
function be32(v){return [(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255];}
function le32(v){return [v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255];}
const CRCT=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
function crc32(parts){let c=0xFFFFFFFF;for(const a of parts){for(let i=0;i<a.length;i++)c=CRCT[(c^a[i])&255]^(c>>>8);}return (c^0xFFFFFFFF)>>>0;}
function wrapDial(data){
  const info=new Uint8Array(32).fill(255);info.set([0x6b,0x6b,0xb6,0xb6],0);info.set(le32(crc32([data])),4);info.set(le32(data.length),8);info.set([1,0,0,0],12);info[20]=100;
  const h=new Uint8Array(21).fill(255);h.set([0x5a,0x5a,0xa5,0xa5,0x15,0,1,1],0);h.set(le32(crc32([info,data])),8);h.set(le32(data.length+53),12);h[16]=100;h.set([0x15,0,0,0],17);
  const out=new Uint8Array(53+data.length);out.set(h,0);out.set(info,21);out.set(data,53);return out;
}


const SVC='4cdabaa0-2cea-c0c1-b38d-a0481ae60a97';
const CH_W='4cdabaa1-2cea-c0c1-b38d-a0481ae60a97';
const CH_N='4cdabaa2-2cea-c0c1-b38d-a0481ae60a97';
// Hälsning och bindning innehåller telefonens och klockans Bluetooth-adresser. De ligger inte i den här filen,
// utan sparas i telefonen första gången sidan öppnas med nyckeln i adressen (#k=...).
const KEYLS='minklocka.nyckel.v1';
// Nyckeln är hela hälsningen (26 byte som hexsiffror), precis som originalappen skickade den från den här telefonen.
function pairKey(){try{const k=(localStorage.getItem(KEYLS)||'').toLowerCase();return /^ba[0-9a-f]{50}$/.test(k)?k:'';}catch(e){return '';}}
function helloFrame(){const k=pairKey();return k?hexToBytes(k):null;}
function bindData(){const k=pairKey();return k?new Uint8Array([...hexToBytes(k.slice(26,50)),1]):null;}
