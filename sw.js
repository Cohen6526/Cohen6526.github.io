const version = 'v128';  // change this everytime you update the service worker
                          // to force the browser to also update it.

// Define cache names
const CACHE_NAME = 'my-app-cache-v1';
const DYNAMIC_CACHE_NAME = 'my-app-dynamic-cache-v1';

// Files to cache during install
const STATIC_ASSETS = [
  '/',
    'index.html',
    'style.css',
    'apiexample.js',
    'icons/icon192-192.png',
    'icons/icon512-512.png',
    'background.jpg'
  // Add other static files you want to cache
];

// Install event: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network fetch is successful, cache the response
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          console.log("IT WORKED!!!!");
          return networkResponse;
          
        });
      })
      .catch(() => {
        // If network fetch fails, fallback to cache
        return caches.match(event.request);
      })
  );
});