
const CACHE_NAME = 'solo-cache-v1';
const urlsToCache = [
  '/',
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/images/solo-clear.png',
  '/static/images/logo.png'
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
