const CACHE_NAME = 'quranin-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './adhkar.html',
    './ayah_detail.html',
    './ayahs.html',
    './favorites.html',
    './search.html',
    './main.js',
    './search.js',
    './settings.js',
    './manifest.json',
    './img/icon-512.png'
];

// Install Event: Pre-cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event with API exclusion
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // CRITICAL: Never cache API requests - always fetch fresh data
    const isApiRequest = event.request.url.includes('api.quran.com') || 
                        event.request.url.includes('api.alquran.cloud') ||
                        event.request.url.includes('everyayah.com');
    
    if (isApiRequest) {
        // Always fetch fresh data from network for API calls
        event.respondWith(fetch(event.request));
        return;
    }

    // For non-API requests: Cache First strategy
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // If not in cache, try network
            return fetch(event.request).then(networkResponse => {
                if (!networkResponse || networkResponse.status !== 200) {
                    return networkResponse;
                }

                // Cache external resources (fonts, CDN)
                if (event.request.url.includes('google') || 
                    event.request.url.includes('tailwindcss') ||
                    event.request.url.includes('gstatic')) {
                    let responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }

                return networkResponse;
            }).catch(() => {
                // Offline fallback
                return caches.match('./index.html');
            });
        })
    );
});
