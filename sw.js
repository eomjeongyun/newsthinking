const CACHE='newsthinking-v6';
const SHELL=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./fonts/memomentKkukKkuk.woff2','./fonts/Pretendard-Regular.woff2','./fonts/Pretendard-SemiBold.woff2','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
const valid=response=>response&&response.ok&&!response.headers.has('ngrok-error-code');

self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));

async function refresh(request,cache){
  try{const response=await fetch(request);if(valid(response))await cache.put(request,response.clone());}catch(_error){}
}
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.hostname==='raw.githubusercontent.com')return;
  if(event.request.method!=='GET'||url.origin!==location.origin)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(event.request.mode==='navigate'){
      const cached=await cache.match('./index.html',{ignoreSearch:true});
      event.waitUntil((async()=>{try{const response=await fetch(event.request);if(valid(response))await cache.put('./index.html',response.clone());}catch(_error){}})());
      return cached||fetch(event.request);
    }
    const cached=await cache.match(event.request,{ignoreSearch:true});
    if(cached){event.waitUntil(refresh(event.request,cache));return cached;}
    const response=await fetch(event.request);
    if(valid(response))await cache.put(event.request,response.clone());
    return response;
  })());
});
