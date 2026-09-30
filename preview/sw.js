/* Dues Planner offline support: keeps the app page, the Firebase code and the font on this device.
   Your data itself is kept offline by Firebase (in the browser's database), not here. */
const V='dues-v2';
const FB='https://www.gstatic.com/firebasejs/10.12.2/';
const FBF=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(f=>FB+f);
const FONT_CSS='https://fonts.googleapis.com/',FONT_FILES='https://fonts.gstatic.com/';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>Promise.all([
    c.add('./index.html').catch(()=>{}),
    ...FBF.map(u=>fetch(u,{mode:'cors'}).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{}))
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
const keep=(r,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.url.startsWith(FB)||r.url.startsWith(FONT_FILES)){ // versioned files: the saved copy first
    e.respondWith(caches.match(r.url).then(m=>m||fetch(r).then(res=>keep(r.url,res))));return;
  }
  if(r.url.startsWith(FONT_CSS)){ // font stylesheet: fresh when online, saved copy offline
    e.respondWith(fetch(r).then(res=>keep(r.url,res)).catch(()=>caches.match(r.url)));return;
  }
  const scope=new URL(self.registration.scope);
  if(u.origin===scope.origin&&(u.pathname===scope.pathname||u.pathname===scope.pathname+'index.html')){
    // the app page: newest version when online, the saved copy when offline
    const key=new URL('index.html',scope).href;
    e.respondWith(fetch(r).then(res=>keep(key,res)).catch(()=>caches.match(key)));
  }
});
