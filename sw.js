const CACHE_NAME = 'jordan-radios-cache-v5'; // تم تغيير الإصدار لتفعيل التحديث
const urlsToCache = [
  // --- Core App Shell ---
  './',
  'index.html',
  'manifest.json',
  'icon-1024.png',
  
  // --- External Libraries (CSS & JS) ---
  'https://cdn.tailwindcss.com',
  'https://cdn.plyr.io/3.7.8/plyr.css',
  'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js',
  'https://unpkg.com/@phosphor-icons/web',
  'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js',
  'https://cdn.jsdelivr.net/npm/hls.js@latest',

  // --- Fonts and Icons (The missing files) ---
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2', // Inter Regular
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa7ZL7.woff2', // Inter Medium
  'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa25L7.woff2', // Inter Bold
  'https://unpkg.com/@phosphor-icons/web@2.1.1/src/fonts/Phosphor.woff2?v=2.1.1', // Phosphor Icons Font

  // --- Default Stations List ---
  'https://iofahmawi.github.io/jo-radios/stations_list_inverse.json'
];

// Install: Opens the cache and adds the app shell files.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files.');
        // Use individual add requests to see which one fails.
        const promises = urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.error(`Failed to cache: ${url}`, err);
          });
        });
        return Promise.all(promises);
      })
  );
});

// Activate: Deletes old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Handles requests.
self.addEventListener('fetch', event => {
  // Strategy: Cache First, then Network. Also cache new successful requests.
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return from cache if found.
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from the network.
        return fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              if (networkResponse.type === 'cors' || (networkResponse.status === 0 && networkResponse.type === 'opaque')) {
                 // For CORS or opaque responses, clone and cache them.
              } else {
                 return networkResponse;
              }
          }

          // IMPORTANT: Clone the response. A response is a stream
          // and because we want the browser to consume the response
          // as well as the cache consuming the response, we need
          // to clone it so we have two streams.
          const responseToCache = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              // Cache the new response for future use.
              cache.put(event.request, responseToCache);
            });

          return networkResponse;
        }).catch(error => {
          // Handle fetch errors, e.g., when offline and not in cache.
          console.error('Fetch failed:', error);
          // You could return a fallback offline page here if you had one.
        });
      })
  );
});