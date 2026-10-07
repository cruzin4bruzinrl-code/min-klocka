
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
