/* global workbox */
// Minimal service worker for offline-first navigation and static assets.
// Base-path aware so it works under a subpath (e.g., GitHub Pages).
const BASE = new URL(self.registration.scope).pathname.replace(/\/+$/, '/') || '/';
function p(pth) { return (BASE + pth.replace(/^\//, '')); }
const CACHE_VERSION = 'v5';
const CACHE_NAME = `app-shell-${CACHE_VERSION}`;

const CORE_ASSETS = [
  'index.html',
  'offline.html',
  'manifest.webmanifest',
  'favicon.svg',
  'apple-touch-icon.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-512x512-maskable.png',
];

async function precacheCore(cache) {
  const urls = CORE_ASSETS.map((asset) => p(asset));
  await cache.addAll(urls);
}

async function precacheFromManifest(cache) {
  try {
    const res = await fetch(p('asset-manifest.txt'), { cache: 'no-store' });
    if (!res.ok) return false;
    const text = await res.text();
    const assets = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((asset) => (asset.startsWith('http') ? asset : p(asset)));
    if (assets.length === 0) return false;
    await cache.addAll(assets);
    return true;
  } catch {
    return false;
  }
}

async function clearOldCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((key) => key.startsWith('app-shell-') && key !== CACHE_NAME)
      .map((key) => caches.delete(key))
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await precacheCore(cache);
      await precacheFromManifest(cache);
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clearOldCaches();
      await clients.claim();
    })()
  );
});

// Network-first for navigation requests with fallback to offline.html
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        if (typeof self.navigator !== 'undefined' && self.navigator.onLine === false) {
          return (
            (await caches.match(p('offline.html'))) ||
            (await caches.match(p('index.html'))) ||
            new Response('Offline', { status: 503 })
          );
        }
        try {
          const networkResponse = await fetch(req, { cache: 'no-store' });
          if (networkResponse && networkResponse.ok) {
            return networkResponse;
          }
          throw new Error('offline');
        } catch {
          // Fallback to an offline page; if missing, fallback to the SPA shell
          return (
            (await caches.match(p('offline.html'))) ||
            (await caches.match(p('index.html'))) ||
            new Response('Offline', { status: 503 })
          );
        }
      })()
    );
    return;
  }
  // Cache-first for precached static assets
  if (url.origin === location.origin) {
    const staticAssets = new Set(CORE_ASSETS.map((asset) => p(asset)));
    if (staticAssets.has(url.pathname)) {
      event.respondWith(
        (async () => (await caches.match(url.pathname)) || fetch(req))()
      );
      return;
    }
    // Stale-while-revalidate for built assets (.js/.css) if present in cache
    if (/\.(?:js|css)$/.test(url.pathname)) {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(url.pathname);
        const fetchPromise = fetch(req).then((res) => {
          cache.put(url.pathname, res.clone()).catch(() => {});
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })());
      return;
    }
  }
});

// Accept skip waiting message to activate updated SW immediately
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic Background Sync to check for SW/app updates (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-updates') {
    event.waitUntil(
      (async () => {
        try {
          await self.registration.update();
        } catch {}
      })()
    );
  }
});
