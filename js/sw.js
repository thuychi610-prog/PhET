const CACHE_NAME = 'chemcloud-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './login.html',
  './module1.html',
  './module2.html',
  './module3.html',
  './module4.html',
  './module5.html',
  './module6.html',
  './module7.html',
  './module8.html',
  './module9.html',
  './quiz-bank.html',
  './smartlab.html',
  './molecule3d.html',
  './offline.html',
  './teacher-dashboard.html',
  './rules.html',
  './css/style.css',
  './css/module.css',
  './js/app.js',
  './js/offline-register.js',
  './assets/favicon.ico',
  './data/criteria.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map(async (asset) => {
          try {
            await cache.add(asset);
          } catch (e) {
            console.log('Cache miss for:', asset);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k.startsWith('chemcloud'))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Cache first strategy for static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            return response;
          })
          .catch(() => getOfflineResponse(req));
      })
    );
    return;
  }

  // Network first strategy for HTML documents
  event.respondWith(
    fetch(req)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        return getOfflineResponse(req);
      })
  );
});

function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.json', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function getOfflineResponse(req) {
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')) {
    return caches.match('./offline.html').catch(() => {
      return new Response(
        `<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>`,
        { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/html' } }
      );
    });
  }
  return new Response('', { status: 503, statusText: 'Service Unavailable' });
}