
const CACHE_NAME = 'mansa-cache-v2'; // Increment version to invalidate old cache
const urlsToCache = [
  '/',
  '/index.html',
  '/subject.html',
  '/admin-dashboard.html',
  '/css/styles.css',
  '/js/subject-logic.js',
  '/js/script.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

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
