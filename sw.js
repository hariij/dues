/* Dues Planner offline support: keeps the app and the Firebase code on this device.
   Your data itself is kept offline by Firebase (in the browser's database), not here. */
const V='dues-v1';
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const FBF=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(f=>FB+f);
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all([
    c.add('./index.html').catch(()=>{}),
    ...FBF.map(u=>fetch(u,{mode:'cors'}).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{}))
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.url.startsWith(FB)){ // versioned library files: use the saved copy, fetch once if missing
    e.respondWith(caches.match(r.url).then(m=>m||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r.url,cp))}return res})));
    return;
  }
  const scope=new URL('./',self.registration.scope);
  if(u.origin===scope.origin&&(r.mode==='navigate'||u.pathname===scope.pathname||u.pathname===scope.pathname+'index.html')){
    // the app page: newest version when online, the saved copy when offline
    e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(new URL('index.html',scope).href,cp))}return res})
      .catch(()=>caches.match(new URL('index.html',scope).href)));
  }
});
