const CACHE_VERSION = "v2";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PROFILE_CACHE = `profile-cache-${CACHE_VERSION}`;
const WEATHER_CACHE = `weather-cache-${CACHE_VERSION}`;
const WEATHER_TTL_MS = 24 * 60 * 60 * 1000;

const PRECACHE_URLS = [
  "apple-touch-icon.png",
  "favicon-512-maskable.png",
  "favicon-512.png",
  "favicon.png",
  "favicon.svg",
  "index.html",
  "loading.svg",
  "screenshot.png",
  "SofiaSansCondensed-subset.woff2",
  "WixMadeforDisplay-subset.woff2"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, PROFILE_CACHE, WEATHER_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.map((name) => (keep.has(name) ? null : caches.delete(name))));
      await self.clients.claim();
    })()
  );
});

function isFreshByDateHeader(response, ttlMs) {
  if (!ttlMs) return true;
  const dateHeader = response.headers.get("date");
  if (!dateHeader) return true;
  const timestamp = Date.parse(dateHeader);
  if (!Number.isFinite(timestamp)) return true;
  return Date.now() - timestamp <= ttlMs;
}

async function networkFirst(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached && isFreshByDateHeader(cached, ttlMs)) return cached;
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.pathname === "/.netlify/functions/profile") {
    event.respondWith(networkFirst(request, PROFILE_CACHE));
    return;
  }

  if (url.pathname === "/.netlify/functions/weather") {
    event.respondWith(networkFirst(request, WEATHER_CACHE, WEATHER_TTL_MS));
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request)));
});
