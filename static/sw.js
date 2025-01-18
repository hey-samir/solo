const CACHE_NAME = 'solo-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/images/solo-clear.png',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Failed to cache static assets:', error);
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
});

// Simplified fetch handler
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache GET requests for routes
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        return cachedResponse || cache.match('/offline.html');
      })
  );
});

// Basic background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-climbs') {
    event.waitUntil(
      syncPendingClimbs()
    );
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