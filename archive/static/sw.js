const CACHE_NAME = 'solo-cache-v1';
const ROUTES_TO_CACHE = [
  '/',
  '/offline.html',
  '/profile',
  '/sends',
  '/stats',
  '/sessions',
  '/about',
  '/standings',
  '/feedback'
];

const STATIC_ASSETS = [
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/js/profile.js',
  '/static/js/sends.js',
  '/static/js/stats.js',
  '/static/images/solo-clear.png',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching routes and static assets');
        return Promise.all([
          cache.addAll(ROUTES_TO_CACHE),
          cache.addAll(STATIC_ASSETS)
        ]);
      })
      .catch(error => {
        console.error('Failed to cache assets:', error);
        throw error;
      })
  );
  self.skipWaiting();
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Enhanced fetch handler with route handling
self.addEventListener('fetch', event => {
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);

        // Cache successful GET requests
        if (response.ok && event.request.method === 'GET') {
          const responseClone = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseClone);
        }

        return response;
      } catch (error) {
        const cache = await caches.open(CACHE_NAME);

        // Check if this is a navigation request
        if (event.request.mode === 'navigate') {
          // Try to get the cached version of the requested page
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // If no cached version, return the offline page
          return cache.match('/offline.html');
        }

        // For non-navigation requests, try cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If nothing found in cache, return offline error
        throw error;
      }
    })()
  );
});

// Basic background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-climbs') {
    event.waitUntil(syncPendingClimbs());
  }
});

// Sync pending climbs
async function syncPendingClimbs() {
  const db = await openDB();
  const pendingClimbs = await db.getAll('pending-climbs');

  for (const climb of pendingClimbs) {
    try {
      const response = await fetch('/add_climb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(climb)
      });

      if (response.ok) {
        await db.delete('pending-climbs', climb.id);
      }
    } catch (error) {
      console.error('Failed to sync climb:', error);
    }
  }
}

// Simple IndexedDB setup
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('soloClimbDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-climbs')) {
        db.createObjectStore('pending-climbs', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}