/**
 * Service Worker - MANSA Platform
 * Handles caching for offline access and faster loading
 */

const CACHE_NAME = 'mansa-cache-v4'; // Increment version to invalidate old cache

const urlsToCache = [
    // HTML Pages
    '/',
    '/index.html',
    '/subject.html',
    '/admin-dashboard.html',
    
    // Core CSS
    '/src/css/pages/home.css',
    '/src/css/components/shared.css',
    '/src/css/themes/ramadan.css',
    
    // ES6 Module Entry Points
    '/src/js/main.js',
    '/src/js/subject-main.js',
    
    // ES6 Modules - Utils
    '/src/js/utils/navbar.js',
    '/src/js/utils/themes.js',
    '/src/js/utils/leaderboard.js',
    '/src/js/utils/scroll.js',
    '/src/js/utils/error-handler.js',
    
    // Config
    '/src/js/config/firebase.js',
    '/src/js/config/subjects.js',
    
    // Features
    '/src/js/features/user-profile.js',
    '/src/js/features/ai-chat.js',
    '/src/js/features/challenge.js',
    '/src/js/features/essay.js',
    
    // Pages
    '/src/js/pages/subject.js'
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
