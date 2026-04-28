/**
 * Service Worker - MANSA Platform
 * Handles caching for offline access and faster loading
 */

const CACHE_NAME = 'mansa-cache-v8'; // Increment version to invalidate old cache

const urlsToCache = [
    '/',
    '/index.html',
    '/admin-dashboard.html',
    '/subject.html',
    '/src/css/pages/index.css',
    '/src/css/pages/admin-dashboard.css',
    '/src/css/pages/subject.css',
    '/src/js/pages/index-page.js',
    '/src/js/pages/admin-dashboard-page.js',
    '/src/js/pages/subject-page.js',
    '/src/js/config/firebase.js',
    '/src/js/config/subjects-config.js',
    '/src/js/features/subjects-catalog.js',
];

// Install - cache all resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // HTML pages: network first, fallback to cache
    if (event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }
    
    // Everything else: cache first, fallback to network
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});

// Activate - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );
});
