const CACHE_NAME = 'postflow-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/manifest.json'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate SW
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NETWORK ONLY for APIs (Gemini, Firebase, etc)
  // This prevents the SW from returning cached/stale API responses or failing on POST requests
  if (url.origin.includes('googleapis.com') || url.pathname.includes('firestore')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. STALE-WHILE-REVALIDATE for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});