const CACHE_NAME = 'solo-cache-v2';
const STATIC_CACHE = 'solo-static-v2';
const API_CACHE = 'solo-api-v2';
const DYNAMIC_CACHE = 'solo-dynamic-v2';
const USER_CACHE = 'solo-user-v2';
const QUEUE_NAME = 'solo-offline-queue';

// Expand core routes to include all available pages
const CORE_ROUTES = [
  '/profile',
  '/sends',
  '/stats',
  '/sessions',
  '/about',
  '/standings',
  '/feedback',
  '/store',
  '/offline.html',
  '/'  // Add root route
];

// Expand core API routes
const CORE_API_ROUTES = [
  '/api/profile',
  '/api/sends',
  '/api/stats',
  '/api/sessions',
  '/api/user-data',
  '/standings',
  '/api/stats'
];

// Expand static assets to include all necessary resources
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/js/profile.js',
  '/static/js/sends.js',
  '/static/js/sort.js',
  '/static/js/stats.js',
  '/static/images/solo-clear.png',
  '/static/images/logo.png',
  '/static/images/white-solo-av.png',
  '/static/images/black-solo-av.png',
  '/static/images/gray-solo-av.png',
  '/static/images/purple-solo-av.png',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/@coreui/coreui@4.3.0/dist/css/coreui.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'
];

// IndexedDB interaction from service worker
class ServiceWorkerIndexedDB {
    static async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('soloClimbDB', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    }

    static async getAllPendingRequests() {
        const db = await this.openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['pending-forms', 'failed-requests'], 'readonly');
            const pendingStore = transaction.objectStore('pending-forms');
            const failedStore = transaction.objectStore('failed-requests');

            const pending = [];

            pendingStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    pending.push(cursor.value);
                    cursor.continue();
                }
            };

            failedStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    pending.push(cursor.value);
                    cursor.continue();
                }
            };

            transaction.oncomplete = () => resolve(pending);
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Enhanced offline queue with priority and retry
class EnhancedOfflineQueue extends OfflineQueue {
    static async addToQueue(request, priority = 'normal') {
        const queue = await caches.open(QUEUE_NAME);
        const serializedRequest = await this.serializeRequest(request);
        const timestamp = new Date().toISOString();

        await queue.put(`${priority}-${timestamp}-${Math.random()}`, new Response(JSON.stringify({
            ...serializedRequest,
            priority,
            retryCount: 0
        })));
    }

    static async processQueue() {
        const queue = await caches.open(QUEUE_NAME);
        const requests = await queue.keys();

        // Sort by priority
        requests.sort((a, b) => {
            const aPriority = a.url.split('-')[0];
            const bPriority = b.url.split('-')[0];
            return aPriority === 'high' ? -1 : bPriority === 'high' ? 1 : 0;
        });

        return Promise.all(
            requests.map(async (request) => {
                try {
                    const response = await queue.match(request);
                    const serializedRequest = JSON.parse(await response.text());

                    if (serializedRequest.retryCount >= 3) {
                        console.log('Max retries reached for:', serializedRequest.url);
                        await queue.delete(request);
                        return { success: false, url: serializedRequest.url, error: 'Max retries exceeded' };
                    }

                    const networkResponse = await fetch(new Request(serializedRequest.url, {
                        method: serializedRequest.method,
                        headers: new Headers(serializedRequest.headers),
                        body: serializedRequest.body,
                        mode: serializedRequest.mode,
                        credentials: serializedRequest.credentials,
                        cache: serializedRequest.cache
                    }));

                    if (networkResponse.ok) {
                        await queue.delete(request);
                        return { success: true, url: serializedRequest.url };
                    }

                    // Increment retry count
                    serializedRequest.retryCount = (serializedRequest.retryCount || 0) + 1;
                    await queue.put(request, new Response(JSON.stringify(serializedRequest)));

                    return { success: false, url: serializedRequest.url, willRetry: true };
                } catch (error) {
                    console.error('Failed to process queued request:', error);
                    return { success: false, url: request.url, error };
                }
            })
        );
    }
}

// Enhanced cache management with cleanup
class EnhancedCacheManager extends CacheManager {
    static async cleanup() {
        const caches = await self.caches.keys();
        const oldCaches = caches.filter(cache => !cache.includes(CACHE_NAME));

        await Promise.all([
            ...oldCaches.map(cache => self.caches.delete(cache)),
            this.cleanupOldEntries()
        ]);
    }

    static async cleanupOldEntries() {
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const cacheNames = [API_CACHE, DYNAMIC_CACHE];

        for (const cacheName of cacheNames) {
            const cache = await self.caches.open(cacheName);
            const requests = await cache.keys();

            for (const request of requests) {
                const response = await cache.match(request);
                const timestamp = response.headers.get('X-Cache-Timestamp');

                if (timestamp) {
                    const age = Date.now() - new Date(timestamp).getTime();
                    if (age > maxAge) {
                        await cache.delete(request);
                    }
                }
            }
        }
    }

    static async prefetchRoutes() {
        const cache = await caches.open(API_CACHE);

        // Predict likely next routes based on current route
        const currentPath = self.location.pathname;
        const likelyRoutes = this.getPredictedRoutes(currentPath);

        await Promise.all(
            likelyRoutes.map(async route => {
                try {
                    const response = await fetch(route);
                    if (response.ok) {
                        await cache.put(route, response.clone());
                    }
                } catch (error) {
                    console.error(`Failed to prefetch ${route}:`, error);
                }
            })
        );
    }

    static getPredictedRoutes(currentPath) {
        // Add logic to predict likely next routes based on current path
        const predictions = new Map([
            ['/profile', ['/sends', '/stats', '/sessions']],
            ['/sends', ['/stats', '/sessions', '/profile']],
            ['/stats', ['/sends', '/sessions', '/profile']],
            ['/sessions', ['/sends', '/stats', '/profile']]
        ]);

        return predictions.get(currentPath) || CORE_ROUTES;
    }
}


// Install Service Worker with enhanced error handling and user data caching
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(error => {
          console.error('Failed to cache static assets:', error);
          throw error;
        });
      }),
      caches.open(API_CACHE),
      caches.open(DYNAMIC_CACHE),
      caches.open(USER_CACHE),
      caches.open(QUEUE_NAME)
    ]).catch(error => {
      console.error('Service Worker installation failed:', error);
      throw error;
    })
  );
  self.skipWaiting();
});

// Activate with enhanced cache cleanup
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (![STATIC_CACHE, API_CACHE, DYNAMIC_CACHE, USER_CACHE, QUEUE_NAME].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Cache core route data after activation
      EnhancedCacheManager.cacheCoreRouteData(),
      clients.claim(),
      registerPeriodicSync() // Call the periodic sync registration function here
    ]).catch(error => {
      console.error('Service Worker activation failed:', error);
      throw error;
    })
  );
});

// Enhanced strategy selection with user data handling
function getCacheStrategy(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return 'network-only';
  }

  if (url.pathname.startsWith('/api/')) {
    if (url.pathname.includes('user-data')) {
      return 'user-data';
    }
    return 'api';
  }

  if (
    url.pathname.startsWith('/static/') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('jsdelivr.net') ||
    request.url.includes('bootstrap')
  ) {
    return 'static';
  }

  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    return 'page';
  }

  return 'network-first';
}

// Enhanced fetch event handler with comprehensive offline support
self.addEventListener('fetch', event => {
    const strategy = getCacheStrategy(event.request);

    event.respondWith(
        (async () => {
            try {
                // Always try network first for API calls when online
                if (strategy === 'api' && navigator.onLine) {
                    try {
                        const response = await fetch(event.request);
                        if (response.ok) {
                            await EnhancedCacheManager.cacheApiResponse(event.request, response.clone());
                            return response;
                        }
                    } catch (error) {
                        console.log('API fetch failed, falling back to cache');
                    }
                }

                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    // Trigger background refresh for stale cache
                    const cacheTime = new Date(cachedResponse.headers.get('X-Cache-Timestamp'));
                    if (Date.now() - cacheTime > 60 * 60 * 1000) { // 1 hour
                        event.waitUntil(
                            fetch(event.request)
                                .then(response => {
                                    if (response.ok) {
                                        EnhancedCacheManager.cacheApiResponse(event.request, response);
                                    }
                                })
                        );
                    }
                    return cachedResponse;
                }

                // Network request
                const response = await fetch(event.request);
                if (response.ok && event.request.method === 'GET') {
                    const cache = await caches.open(strategy === 'static' ? STATIC_CACHE : API_CACHE);
                    cache.put(event.request, response.clone());
                }
                return response;
            } catch (error) {
                // If offline and no cache, return offline page for navigation
                if (event.request.mode === 'navigate') {
                    const cache = await caches.open(STATIC_CACHE);
                    return cache.match('/offline.html');
                }
                throw error;
            }
        })()
    );
});

// Enhanced background sync with retry logic
self.addEventListener('sync', event => {
  if (event.tag === 'sync-climbs') {
    event.waitUntil(
      EnhancedOfflineQueue.processQueue()
        .then(results => {
          console.log('Sync results:', results);
          const failed = results.filter(r => !r.success);
          if (failed.length > 0) {
            console.log('Some requests failed to sync:', failed);
            // Retry failed requests in 5 minutes
            setTimeout(() => {
              self.registration.sync.register('sync-climbs');
            }, 5 * 60 * 1000);
          }
        })
    );
  }
});

// Handle periodic sync for background updates
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-leaderboard') {
    event.waitUntil(
      fetch('/api/leaderboard')
        .then(response => response.json())
        .then(data => {
          return caches.open(API_CACHE).then(cache => {
            return cache.put('/api/leaderboard', new Response(JSON.stringify(data)));
          });
        })
        .catch(error => {
          console.error('Failed to update leaderboard:', error);
        })
    );
  }
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(EnhancedCacheManager.cleanup());
    }
});

// Add periodic sync registration logic
async function registerPeriodicSync() {
  try {
    const registration = await navigator.serviceWorker.ready;
    if ('periodicSync' in registration) {
      // Try to register periodic sync with a minimum interval of 12 hours
      await registration.periodicSync.register('update-cache', {
        minInterval: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
      });

      // Register specific periodic syncs for different features
      await registration.periodicSync.register('update-leaderboard', {
        minInterval: 60 * 60 * 1000 // 1 hour for leaderboard
      });
        await registration.periodicSync.register('cache-cleanup', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours for cache cleanup
        });
    }
  } catch (error) {
    console.error('Periodic Sync could not be registered:', error);
  }
}