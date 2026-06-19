// PRAMA Service Worker — Cache-first with network fallback
const CACHE_NAME = 'prama-v1';

const ASSETS_TO_CACHE = [
  './welcome.html',
  './login.html',
  './home.html',
  './tracking.html',
  './bodymap.html',
  './doctors.html',
  './articles.html',
  './community.html',
  './quiz.html',
  './side-effects.html',
  './side-effect-detail.html',

  // CSS
  './welcome.css',
  './login.css',
  './home.css',
  './tracking.css',
  './bodymap.css',
  './doctors.css',
  './articles.css',
  './community.css',
  './quiz.css',
  './side-effects.css',
  './side-effect-detail.css',

  // JS
  './welcome.js',
  './login.js',
  './home.js',
  './tracking.js',
  './bodymap.js',
  './doctors.js',
  './articles.js',
  './community.js',
  './quiz.js',
  './side-effects.js',
  './side-effect-detail.js',

  // Images
  './background_image.png',
  './background_image2.png',
  './background_image3.png',
  './bodymap-women.png',
  './leafs_background.png',

  // Icons
  './icons/icon-192.png',
  './icons/icon-512.png',

  // Manifest
  './manifest.json'
];

// ── INSTALL: Cache all assets ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching all PRAMA assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: Clean up old caches ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: Cache-first, fallback to network ────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and cross-origin requests (e.g. Google Fonts, CDN)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For cross-origin requests (fonts, icons CDN), try network first
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // For same-origin: cache first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Cache a clone of valid responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
