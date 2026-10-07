// Gör att Min klocka öppnas även utan nät. Hämtar alltid senaste versionen när nätet finns.
const C='min-klocka-2';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','manifest.webmanifest','icon-192.png','icon-512.png'])).catch(()=>{}));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('min-klocka-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.endsWith('version.json'))return;
  const key=u.origin+u.pathname;   // varje sida för sig, så att en annan app under samma adress inte skriver över den här
  const net=fetch(u.href,{cache:'no-cache',credentials:'same-origin'}).then(r=>{if(r&&r.ok){const k=r.clone();caches.open(C).then(c=>c.put(key,k));}return r;});
  const old=()=>caches.match(key);
  // Segt nät: efter fyra sekunder visas den sparade sidan i stället
  const slow=new Promise(res=>setTimeout(()=>old().then(m=>{if(m)res(m);}),4000));
  e.respondWith(Promise.race([net.catch(()=>old().then(m=>m||Response.error())),slow]));
});
