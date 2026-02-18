const CACHE_NAME = "quranin-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./adhkar.html",
  "./ayah_detail.html",
  "./ayahs.html",
  "./favorites.html",
  "./search.html",
  "./main.js",
  "./search.js",
  "./settings.js",
  "./manifest.json",
  "./img/icon-512.png",
];

// Install Event: Pre-cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching core assets");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cache);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event with API exclusion
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // CRITICAL: Never cache API requests - always fetch fresh data
  const isApiRequest =
    event.request.url.includes("api.quran.com") ||
    event.request.url.includes("api.alquran.cloud") ||
    event.request.url.includes("everyayah.com");

  if (isApiRequest) {
    // Always fetch fresh data from network for API calls
    event.respondWith(fetch(event.request));
    return;
  }

  // For non-API requests: Cache First strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, try network
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache external resources (fonts, CDN)
          if (
            event.request.url.includes("google") ||
            event.request.url.includes("tailwindcss") ||
            event.request.url.includes("gstatic")
          ) {
            let responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback: Try to return cached index.html
          return caches.match("./index.html").then(response => {
            if (response) return response;
            // If index.html not in cache, show offline message
            return new Response(
              '<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>قرآنيات</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:2rem;background:#f5f5f5;margin:0}h1{color:#1B4332;margin:3rem 0 1rem}p{color:#666;font-size:1.1rem}p.hint{color:#999;margin-top:2rem}</style></head><body><h1>تحميل التطبيق</h1><p>يرجى الاتصال بالإنترنت لتحميل التطبيق للمرة الأولى</p><p class="hint">بعد التحميل الأول، سيعمل التطبيق بدون إنترنت</p></body></html>',
              { 
                headers: { 'Content-Type': 'text/html; charset=utf-8' },
                status: 200
              }
            );
          });
        });
    }),
  );
});
