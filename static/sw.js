const CACHE_NAME = 'solo-cache-v2';
const STATIC_CACHE = 'solo-static-v2';
const API_CACHE = 'solo-api-v2';
const DYNAMIC_CACHE = 'solo-dynamic-v2';
const USER_CACHE = 'solo-user-v2';
const QUEUE_NAME = 'solo-offline-queue';

// Core routes that should work offline
const CORE_ROUTES = [
  '/profile',
  '/sends',
  '/stats',
  '/sessions',
  '/about'
];

// Core API endpoints to cache
const CORE_API_ROUTES = [
  '/api/profile',
  '/api/sends',
  '/api/stats',
  '/api/sessions',
  '/api/user-data'
];

// Assets that should be cached immediately during installation
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/profile',
  '/sends',
  '/stats',
  '/sessions',
  '/about',
  '/static/css/custom.css',
  '/static/js/main.js',
  '/static/js/profile.js',
  '/static/js/sends.js',
  '/static/js/sort.js',
  '/static/js/stats.js',
  '/static/images/solo-clear.png',
  '/static/images/logo.png',
  '/static/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/@coreui/coreui@4.3.0/dist/css/coreui.min.css',
  'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Enhanced offline request queue with retry mechanism
class OfflineQueue {
  static async addToQueue(request) {
    const queue = await caches.open(QUEUE_NAME);
    const serializedRequest = await this.serializeRequest(request);
    const timestamp = new Date().toISOString();
    await queue.put(`${timestamp}-${Math.random()}`, new Response(JSON.stringify(serializedRequest)));
  }

  static async serializeRequest(request) {
    const body = await request.clone().text();
    return {
      url: request.url,
      method: request.method,
      headers: Array.from(request.headers.entries()),
      body,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache
    };
  }

  static async processQueue() {
    const queue = await caches.open(QUEUE_NAME);
    const requests = await queue.keys();

    return Promise.all(
      requests.map(async (request) => {
        try {
          const response = await queue.match(request);
          const serializedRequest = JSON.parse(await response.text());

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
          return { success: false, url: serializedRequest.url };
        } catch (error) {
          console.error('Failed to process queued request:', error);
          return { success: false, url: request.url, error };
        }
      })
    );
  }
}

// Enhanced cache management
class CacheManager {
  static async cacheApiResponse(request, response) {
    const cache = await caches.open(API_CACHE);
    const clonedResponse = response.clone();
    await cache.put(request, clonedResponse);
    return response;
  }

  static async getCachedApiResponse(request) {
    const cache = await caches.open(API_CACHE);
    return await cache.match(request);
  }

  static async cacheUserData(userData) {
    const cache = await caches.open(USER_CACHE);
    await cache.put('/api/user-data', new Response(JSON.stringify(userData)));
  }

  static async getCachedUserData() {
    const cache = await caches.open(USER_CACHE);
    const response = await cache.match('/api/user-data');
    return response ? response.json() : null;
  }

  // Cache core route data
  static async cacheCoreRouteData() {
    const cache = await caches.open(API_CACHE);
    await Promise.all(
      CORE_API_ROUTES.map(async route => {
        try {
          const response = await fetch(route);
          if (response.ok) {
            await cache.put(route, response.clone());
          }
        } catch (error) {
          console.error(`Failed to cache ${route}:`, error);
        }
      })
    );
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
      CacheManager.cacheCoreRouteData(),
      clients.claim()
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

// Enhanced fetch event handler with offline support and user data handling
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const strategy = getCacheStrategy(event.request);

  event.respondWith(
    (async () => {
      // Try to get from cache first
      const cachedResponse = await caches.match(event.request);

      if (!navigator.onLine) {
        if (cachedResponse) {
          return cachedResponse;
        }

        // If it's a page request, serve the offline page
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(STATIC_CACHE);
          return cache.match('/offline.html');
        }

        // For API requests when offline, return cached data with indicator
        if (url.pathname.startsWith('/api/')) {
          if (cachedResponse) {
            const headers = new Headers(cachedResponse.headers);
            headers.append('X-Data-Source', 'cache');
            return new Response(cachedResponse.body, {
              status: 200,
              headers: headers
            });
          }
          return new Response(JSON.stringify({
            error: 'Offline - Using cached data',
            cached: true,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      try {
        const response = await fetch(event.request);

        // Cache successful GET requests
        if (response.ok && event.request.method === 'GET') {
          const cache = await caches.open(strategy === 'static' ? STATIC_CACHE : API_CACHE);
          cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests, serve offline page
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
      OfflineQueue.processQueue()
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
});