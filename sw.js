const V='mozg-v2';
const FILES=['./','index.html','manifest.webmanifest','css/app.css?v=1','img/bg.webp','img/icon-192.png','fonts/nunito.woff2','fonts/unbounded.woff2','js/core.js?v=1','js/neuron.js?v=1','js/map.js?v=1','js/island1.js?v=1','js/island2.js?v=1','js/mlp.js?v=1','js/island3.js?v=1','js/academy.js?v=1','js/lessons.js?v=1','js/main.js?v=1'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(V).then(ch=>ch.put(e.request,c));return res}).catch(()=>caches.match('index.html'))))});
