const CACHE_NAME = 'nur-v1';
const urlsToCache = [
  '/',
  '/soknad',
  '/status',
  '/app',
  '/offline'
];

// Helper function to check if URL should be cached
const shouldCache = (request) => {
  return !(
    request.url.startsWith('chrome-extension://') || 
    request.url.includes('chrome-extension')
  ) && request.url.startsWith('http');
};

// Helper function to safely cache a request/response pair
const safeCachePut = async (cache, request, response) => {
  if (!shouldCache(request)) {
    return false;
  }

  try {
    await cache.put(request, response.clone());
    return true;
  } catch (error) {
    console.error('Cache operation failed:', error);
    return false;
  }
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache URLs individually with error handling
        return Promise.allSettled(
          urlsToCache.map(url => {
            return fetch(url)
              .then(response => {
                if (response.ok) {
                  return safeCachePut(cache, new Request(url), response);
                } else {
                  console.warn(`Failed to cache ${url}: ${response.status}`);
                  return Promise.resolve(false);
                }
              })
              .catch(error => {
                console.warn(`Failed to fetch ${url}:`, error);
                return Promise.resolve(false);
              });
          })
        );
      })
      .then(() => {
        console.log('Service worker installation completed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        return self.clients.claim(); // Take control of all clients
      })
      .catch(error => {
        console.error('Service worker activation failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't cache chrome extension requests
  if (!shouldCache(event.request)) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        // Network first, then cache for dynamic content
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                safeCachePut(cache, event.request, responseToCache);
              })
              .catch(error => {
                console.error('Failed to open cache:', error);
              });

            return response;
          })
          .catch(() => {
            // If network fails, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return new Response('Offline', { 
              status: 503,
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
      .catch(error => {
        console.error('Cache match failed:', error);
        return new Response('Service Worker Error', { 
          status: 500,
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Prevent screenshots in sensitive areas
self.addEventListener('message', (event) => {
  if (event.data?.type === 'BLOCK_SCREENSHOT') {
    // Signal to block screenshots - handled by client
    self.clients.matchAll()
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'BLOCK_SCREENSHOT_ACTIVE'
          });
        });
      })
      .catch(error => {
        console.error('Failed to send screenshot block message:', error);
      });
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      new Promise((resolve) => {
        console.log('Background sync triggered');
        resolve();
      })
    );
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    };

    event.waitUntil(
      self.registration.showNotification('NUR App', options)
        .catch(error => {
          console.error('Failed to show notification:', error);
        })
    );
  }
});