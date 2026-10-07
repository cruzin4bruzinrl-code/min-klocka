function onNotify(ev){
  const v=new Uint8Array(ev.target.value.buffer);
  const n=new Uint8Array(rxBuf.length+v.length);n.set(rxBuf);n.set(v,rxBuf.length);rxBuf=n;
  while(rxBuf.length>=8){
    if(rxBuf[0]!==0xBA){let i=rxBuf.indexOf(0xBA,1);rxBuf=i<0?new Uint8Array(0):rxBuf.slice(i);continue;}
    const len=(rxBuf[2]<<8)|rxBuf[3];
    if(rxBuf.length<8+len)break;
    const f=rxBuf.slice(0,8+len);rxBuf=rxBuf.slice(8+len);
    handleFrame(f);
  }
}
function handleFrame(f){
  const cmd=f[8],key=f[10],data=f.slice(13);
  for(let i=0;i<waiters.length;i++){
    const w=waiters[i];
    if(w.cmd===cmd&&w.key===key){waiters.splice(i,1);clearTimeout(w.timer);w.resolve(data);return;}
  }
  if(typeof onWatchEvent==='function')onWatchEvent(cmd,key,data);   // oombedda paket: mätvärden från klockan
}
function waitFor(cmd,key,ms){
  return new Promise((resolve,reject)=>{
    const w={cmd,key,resolve};
    w.timer=setTimeout(()=>{const i=waiters.indexOf(w);if(i>=0)waiters.splice(i,1);reject(new Error('Inget svar på '+cmd.toString(16)+'/'+key.toString(16)+' inom '+ms+' ms'));},ms);
    waiters.push(w);
  });
}
async function writeRaw(bytes){
  let off=0;
  while(off<bytes.length){
    const part=bytes.slice(off,off+chunk);
    try{await chW.writeValueWithoutResponse(part);off+=part.length;}
    catch(e){
      // Skrivningen skickades inte. Prova mindre bitar från samma position.
      if(chunk>244)chunk=244;else if(chunk>180)chunk=180;else if(chunk>20)chunk=20;else throw e;
      log('Mindre paketstorlek: '+chunk+' byte');
    }
  }
}
async function send(cmd,key,data){await writeRaw(buildFrame(cmd,key,data||[],seq++));}
async function ask(cmd,key,data,rcmd,rkey,ms){const p=waitFor(rcmd,rkey,ms||5000);await send(cmd,key,data);return p;}

