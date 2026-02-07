const CACHE_NAME = 'quranin-v1';
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
    './img/Logo.jpeg'
];

// Install Event: Pre-cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching core assets');
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
                        console.log('[Service Worker] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event: Cache First, falling back to Network
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // If not in cache, try network
            return fetch(event.request).then(networkResponse => {
                // Return network response even if we don't cache it
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    // For external resources like CDN, we might still want to cache them if they are successful
                    if (networkResponse && networkResponse.status === 200 && (event.request.url.includes('google') || event.request.url.includes('tailwindcss'))) {
                        let responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }

                // Cache the new resource
                let responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // If offline and not in cache, you could return an offline page here
                // For this app, most pages are already in ASSETS_TO_CACHE
            });
        })
    );
});
