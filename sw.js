importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
// Enable debug logs
workbox.setConfig({
  debug: true
});

// Precache static assets and the start page
workbox.precaching.precacheAndRoute([
  { url: '/', revision: '2' }, // replace '123456' with the actual version or hash
  { url: '/apple-touch-icon.png', revision: '1' },
  { url: '/favicon-16x16.png', revision: '1' },
  { url: '/favicon-32x32.png', revision: '1' },
  { url: '/favicon.ico', revision: '1' },
  { url: '/favicon.svg', revision: '1' },
  { url: '/icon-192x192.png', revision: '1' },
  { url: '/icon-512x512.png', revision: '1' },
  { url: '/icon-64x64.png', revision: '1' },
  { url: '/maskable-icon-512x512.png', revision: '1' }
], {
  cacheName: 'start-page-cache'
});

// Google Fonts caching with CacheOnly strategy
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.CacheOnly({
    cacheName: 'google-fonts-stylesheets'
  })
);

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheOnly({
    cacheName: 'google-fonts-webfonts'
  })
);

// API responses caching with NetworkFirst (fallback to cache) strategy
['weather', 'profile', 'calendar'].forEach(api => {
    workbox.routing.registerRoute(
      new RegExp(`^/.netlify/functions/${api}`),
      new workbox.strategies.NetworkFirst({
        cacheName: `${api}-api-cache`,
        plugins: [
          new workbox.expiration.ExpirationPlugin({
            maxAgeSeconds: 24 * 60 * 60 // One day
          })
        ]
      })
    );
  });
  
// JPEG images caching with CacheFirst (fallback to network) strategy
workbox.routing.registerRoute(
    new RegExp('^https://v5.airtableusercontent.com'),
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // One month
        })
      ]
    })
  );
  