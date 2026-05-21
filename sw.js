const CACHE = 'fx-v1';
const LOCAL_ASSETS = [
  '/fxStudy/',
  '/fxStudy/index.html',
  '/fxStudy/src/style.css',
  '/fxStudy/src/data.js',
  '/fxStudy/src/app.jsx',
  '/fxStudy/manifest.json',
  '/fxStudy/icons/icon-192.png',
  '/fxStudy/icons/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Network-first for CDN, cache-first for local assets
  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;

  if (isLocal) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
  // CDN requests fall through to network (browser cache handles them)
});
