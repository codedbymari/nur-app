// public/sw.js (Service Worker)
const CACHE_NAME = 'nur-v1';
const urlsToCache = [
  '/',
  '/soknad',
  '/status',
  '/app',
  '/offline'
];

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
                  return cache.put(url, response);
                } else {
                  console.warn(`Failed to cache ${url}: ${response.status}`);
                  return Promise.resolve();
                }
              })
              .catch(error => {
                console.warn(`Failed to fetch ${url}:`, error);
                return Promise.resolve();
              });
          })
        );
      })
      .then(() => {
        console.log('Service worker installation completed');
        self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('Service worker installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all clients
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
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
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Prevent screenshots in sensitive areas
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'BLOCK_SCREENSHOT') {
    // Signal to block screenshots - handled by client
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'BLOCK_SCREENSHOT_ACTIVE'
        });
      });
    });
  }
});

// Handle background sync (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      console.log('Background sync triggered')
    );
  }
});

// Handle push notifications (optional)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    };

    event.waitUntil(
      self.registration.showNotification('NUR App', options)
    );
  }
});