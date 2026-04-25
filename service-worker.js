/**
 * Service Worker - MANSA Platform
 * Handles caching for offline access and faster loading
 */

const CACHE_NAME = 'mansa-cache-v6'; // Increment version to invalidate old cache

const urlsToCache = [
    // HTML Pages
    '/',
    '/index.html',
    '/admin-dashboard.html',
    '/join-us.html',
    '/maintenance.html',
    '/suggest.html',
    '/ahmed.html',
    '/ibrahim.html',
    
    // Data Files
    '/src/data/questions-schema.js',
    
    // Core CSS
    '/src/css/pages/home.css',
    '/src/css/components/shared.css',
    '/src/css/themes/ramadan.css',
    
    // Module Entry Points
    '/src/js/pages/index-page.js',
    '/src/js/pages/admin-dashboard-page.js',
    '/src/js/pages/suggest-page.js',
    '/src/js/pages/join-us-page.js',
    '/src/js/pages/maintenance-page.js',
    '/src/js/pages/ahmed-page.js',
    '/src/js/pages/ibrahim-page.js',
    
    // ES6 Modules - Utils
    '/src/js/utils/navbar.js',
    '/src/js/utils/themes.js',
    '/src/js/utils/scroll.js',
    '/src/js/utils/error-handler.js',
    
    // Config
    '/src/js/config/firebase.js',
    
    // Features
    '/src/js/features/user-profile.js',
    '/src/js/features/essay.js',
    
    // Pages
    '/src/js/pages/home.js',

    // Optional legacy entry still present in repository
    '/src/js/main.js'
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
