const STATIC_CACHE = "static-v1";
const PROFILE_CACHE = "profile-cache-v1";
const WEATHER_CACHE = "weather-cache-v1";
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
      await Promise.all(keys.filter((name) => !keep.has(name)).map((name) => caches.delete(name)));
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request, cacheName, ttlMs) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response?.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set("sw-cached-at", String(Date.now()));
      await cache.put(request, new Response(await responseToCache.blob(), {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers
      }));
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreVary: true });
    if (!cached) return Response.error();

    if (!ttlMs) return cached;
    const cachedAt = Number(cached.headers.get("sw-cached-at"));
    if (!cachedAt || Date.now() - cachedAt <= ttlMs) return cached;

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

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request))
  );
});
