// Gör att IronSplit öppnas även utan nät. Hämtar alltid senaste versionen när nätet finns.
const C='ironsplit-1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png','icon-512.png'])).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
  const key=u.origin+u.pathname;
  const net=fetch(u.href,{cache:'no-cache',credentials:'same-origin'}).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(C).then(c=>c.put(key,k));}return r;});
  const old=()=>caches.match(key);
  const slow=new Promise(res=>setTimeout(()=>old().then(m=>{if(m)res(m);}),4000));
  e.respondWith(Promise.race([net.catch(()=>old().then(m=>m||Response.error())),slow]));
});
