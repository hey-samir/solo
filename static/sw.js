const CACHE_NAME = 'solo-cache-v2';
const STATIC_CACHE = 'solo-static-v2';
const API_CACHE = 'solo-api-v2';
const DYNAMIC_CACHE = 'solo-dynamic-v2';
const QUEUE_NAME = 'solo-offline-queue';

// Assets that should be cached immediately during installation
const STATIC_ASSETS = [
  '/',
  '/about',
  '/sends',
  '/sessions',
  '/stats',
  '/standings',
  '/offline.html',
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
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0',
  'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700&display=swap'
];

// Enhanced offline request queue
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

// Install Service Worker with enhanced error handling
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
            if (![STATIC_CACHE, API_CACHE, DYNAMIC_CACHE, QUEUE_NAME].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      clients.claim()
    ]).catch(error => {
      console.error('Service Worker activation failed:', error);
      throw error;
    })
  );
});

// Enhanced strategy selection
function getCacheStrategy(request) {
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return 'network-only';
  }

  if (url.pathname.startsWith('/api/')) {
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

// Enhanced fetch event handler with offline support
self.addEventListener('fetch', event => {
  const strategy = getCacheStrategy(event.request);

  switch (strategy) {
    case 'network-only':
      event.respondWith(
        fetch(event.request.clone()).catch(async error => {
          console.log('Network request failed, queueing for later:', error);
          await OfflineQueue.addToQueue(event.request.clone());
          return new Response(
            JSON.stringify({ error: 'Currently offline, request queued for later' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
      break;

    case 'api':
      event.respondWith(
        fetch(event.request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(async () => {
            const cachedResponse = await caches.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ error: 'Currently offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          })
      );
      break;

    case 'static':
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
          .catch(() => caches.match(event.request))
      );
  }
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