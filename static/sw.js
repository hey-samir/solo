const CACHE_NAME = 'solo-cache-v2';
const STATIC_CACHE = 'solo-static-v2';
const API_CACHE = 'solo-api-v2';
const DYNAMIC_CACHE = 'solo-dynamic-v2';

// Assets that should be cached immediately during installation
const STATIC_ASSETS = [
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

// Install Service Worker and cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(API_CACHE),
      caches.open(DYNAMIC_CACHE)
    ])
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Clean up old caches when a new service worker becomes active
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, API_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients so the new service worker takes over immediately
      clients.claim()
    ])
  );
});

// Helper function to determine caching strategy based on request
function getCacheStrategy(request) {
  const url = new URL(request.url);

  // API requests (store and network)
  if (url.pathname.startsWith('/api/')) {
    return 'api';
  }

  // Static assets (cache first, network fallback)
  if (
    url.pathname.startsWith('/static/') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('jsdelivr.net') ||
    request.url.includes('bootstrap')
  ) {
    return 'static';
  }

  // HTML pages (network first, cache fallback)
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    return 'page';
  }

  // Default to network first for everything else
  return 'network-first';
}

// Fetch event handler with different strategies
self.addEventListener('fetch', event => {
  const strategy = getCacheStrategy(event.request);

  switch (strategy) {
    case 'api':
      // Network first, then cache for API requests
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
      break;

    case 'static':
      // Cache first, network fallback for static assets
      event.respondWith(
        caches.match(event.request)
          .then(response => {
            return response || fetch(event.request).then(networkResponse => {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(event.request, responseClone);
              });
              return networkResponse;
            });
          })
      );
      break;

    case 'page':
      // Network first, cache fallback for HTML pages
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return caches.match(event.request)
              .then(response => {
                return response || caches.match('/offline.html');
              });
          })
      );
      break;

    default:
      // Network first, cache fallback for everything else
      event.respondWith(
        fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-climbs') {
    event.waitUntil(
      // Implement background sync for climb submissions
      syncClimbs()
    );
  }
});

// Helper function to sync climbs when back online
async function syncClimbs() {
  try {
    const cache = await caches.open('climbs-sync');
    const requests = await cache.keys();

    return Promise.all(
      requests.map(async request => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
          }
          return response;
        } catch (error) {
          console.error('Sync failed for request:', request.url);
          return error;
        }
      })
    );
  } catch (error) {
    console.error('Error syncing climbs:', error);
  }
}