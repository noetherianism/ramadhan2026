/**
 * Service Worker — Jadwal Buka Puasa Masjid Jogja
 * ================================================
 *
 * Caching strategies:
 *  - App shell (HTML, CSS, JS):   Cache-First  → fast loads
 *  - Schedule data (jadwal.json): Stale-While-Revalidate → show cached, fetch fresh
 *  - Google Fonts:                Cache-First  → long expiry
 *  - Everything else:             Network-First → freshness priority
 *
 * How to update:
 *  1. Change CACHE_VERSION below (e.g. 'v1.0.0' → 'v1.0.1')
 *  2. Deploy
 *  3. Users see "Versi baru tersedia!" banner and can tap to update
 */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE  = `jadwal-static-${CACHE_VERSION}`;
const DATA_CACHE    = `jadwal-data-${CACHE_VERSION}`;
const FONT_CACHE    = `jadwal-fonts-${CACHE_VERSION}`;

// Files needed for the app to work completely offline
const APP_SHELL = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/data/jadwal.json',
  '/manifest.json'
];

// ════════════════════════════════════════════════════════════
//  INSTALL — Pre-cache the app shell on first visit
// ════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version', CACHE_VERSION);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting()) // activate immediately
  );
});

// ════════════════════════════════════════════════════════════
//  ACTIVATE — Delete old caches from previous versions
// ════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version', CACHE_VERSION);

  const currentCaches = [STATIC_CACHE, DATA_CACHE, FONT_CACHE];

  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((n) => n.startsWith('jadwal-') && !currentCaches.includes(n))
          .map((n) => {
            console.log('[SW] Removing old cache:', n);
            return caches.delete(n);
          })
      ))
      .then(() => self.clients.claim()) // take control of open tabs
  );
});

// ════════════════════════════════════════════════════════════
//  FETCH — Route each request to the right caching strategy
// ════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle GET requests over HTTP(S)
  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ── jadwal.json → Stale-While-Revalidate ──
  if (url.pathname.endsWith('/jadwal.json')) {
    event.respondWith(staleWhileRevalidate(event.request, DATA_CACHE));
    return;
  }

  // ── Google Fonts → Cache-First (rarely changes) ──
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, FONT_CACHE));
    return;
  }

  // ── App shell → Cache-First ──
  if (isAppShell(url.pathname)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // ── Everything else → Network-First ──
  event.respondWith(networkFirst(event.request, STATIC_CACHE));
});

// ════════════════════════════════════════════════════════════
//  CACHING STRATEGIES
// ════════════════════════════════════════════════════════════

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
  } catch {
    return offlineFallback();
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        // Tell open tabs that fresh data arrived
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'DATA_UPDATED', url: request.url });
          });
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

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

function isAppShell(pathname) {
  return ['/', '/index.html', '/css/style.css', '/js/app.js', '/manifest.json']
    .includes(pathname);
}

function offlineFallback() {
  return new Response(
    `<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline — Jadwal Iftar</title>
<style>
  body { font-family: 'DM Sans', sans-serif; display: flex; align-items: center;
         justify-content: center; min-height: 100vh; background: #0C3328;
         color: #FEFAF2; text-align: center; padding: 2rem; margin: 0; }
  h1 { font-size: 1.4rem; margin-bottom: 0.5rem; }
  p  { opacity: 0.7; font-size: 0.95rem; }
  button { margin-top: 1rem; padding: 8px 24px; border-radius: 8px;
           border: 1px solid #FEFAF2; background: transparent;
           color: #FEFAF2; cursor: pointer; font-size: 0.9rem; }
</style></head>
<body>
  <div>
    <h1>🌙 Tidak Ada Koneksi Internet</h1>
    <p>Jadwal buka puasa akan muncul kembali saat koneksi tersedia.</p>
    <p><button onclick="location.reload()">Coba Lagi</button></p>
  </div>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

// ════════════════════════════════════════════════════════════
//  BACKGROUND SYNC — refresh data when connectivity returns
// ════════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jadwal') {
    event.waitUntil(
      fetch('/data/jadwal.json')
        .then((res) => {
          if (res.ok) return caches.open(DATA_CACHE).then((c) => c.put('/data/jadwal.json', res));
        })
        .catch(() => console.log('[SW] Background sync will retry'))
    );
  }
});

// ════════════════════════════════════════════════════════════
//  MESSAGE HANDLER — manual cache control from the main app
// ════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'FORCE_REFRESH') {
    caches.delete(DATA_CACHE).then(() => console.log('[SW] Data cache cleared'));
  }
});
