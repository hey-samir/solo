const CACHE_NAME = 'solo-cache-v1';
const urlsToCache = [
  '/',
  '/about',
  '/sends',
  '/sessions',
  '/stats',
  '/standings',
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/js/profile.js',
  '/static/js/sends.js',
  '/static/js/sort.js',
  '/static/images/solo-clear.png',
  '/static/images/logo.png',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/@coreui/coreui@4.3.0/dist/css/coreui.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache if the URL includes certain patterns
                if (!event.request.url.includes('/api/') && 
                    !event.request.url.includes('/login') &&
                    !event.request.url.includes('/sign-up')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(() => {
            // If fetch fails (offline), try to return the cached homepage
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});