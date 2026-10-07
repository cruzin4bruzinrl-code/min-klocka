const $=id=>document.getElementById(id);
let chW=null, chN=null, device=null, seq=0x0300, rxBuf=new Uint8Array(0), waiters=[], dial=null, chunk=512, busy=false;

function hexToBytes(h){const a=new Uint8Array(h.length/2);for(let i=0;i<a.length;i++)a[i]=parseInt(h.substr(i*2,2),16);return a;}
function hex(a,max){a=Array.from(a);const s=a.slice(0,max||a.length).map(b=>b.toString(16).padStart(2,'0')).join(' ');return s+(max&&a.length>max?' …':'');}
function log(msg,cls){const t=new Date().toTimeString().slice(0,8);const el=$('log');const line=document.createElement('span');if(cls)line.className=cls;line.textContent=t+'  '+msg+'\n';el.appendChild(line);el.scrollTop=el.scrollHeight;}
function b64ToBytes(b){const s=atob(b);const a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a;}
function idHex(a){return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();}

