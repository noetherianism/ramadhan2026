/**
 * Service Worker — Jadwal Buka Puasa Masjid Jogja v2.0
 */

const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE  = `jadwal-static-${CACHE_VERSION}`;
const DATA_CACHE    = `jadwal-data-${CACHE_VERSION}`;
const FONT_CACHE    = `jadwal-fonts-${CACHE_VERSION}`;

const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/jadwal.json',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, DATA_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n.startsWith('jadwal-') && !currentCaches.includes(n))
          .map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  if (url.pathname.endsWith('/jadwal.json')) {
    event.respondWith(staleWhileRevalidate(event.request, DATA_CACHE));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, FONT_CACHE));
    return;
  }
  if (isAppShell(url.pathname)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch { return offlineFallback(); }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => client.postMessage({ type: 'DATA_UPDATED', url: request.url }));
        });
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

function isAppShell(pathname) {
  return ['/', '/index.html', '/css/style.css', '/js/app.js', '/manifest.json'].includes(pathname);
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0C3328;color:#FEFAF2;text-align:center;padding:2rem;margin:0}h1{font-size:1.4rem;margin-bottom:.5rem}p{opacity:.7;font-size:.95rem}button{margin-top:1rem;padding:8px 24px;border-radius:8px;border:1px solid #FEFAF2;background:0 0;color:#FEFAF2;cursor:pointer;font-size:.9rem}</style></head><body><div><h1>🌙 Tidak Ada Koneksi Internet</h1><p>Jadwal buka puasa akan muncul kembali saat koneksi tersedia.</p><p><button onclick="location.reload()">Coba Lagi</button></p></div></body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jadwal') {
    event.waitUntil(
      fetch('/data/jadwal.json')
        .then((res) => { if (res.ok) return caches.open(DATA_CACHE).then((c) => c.put('/data/jadwal.json', res)); })
        .catch(() => {})
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'FORCE_REFRESH') caches.delete(DATA_CACHE);
});
