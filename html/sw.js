const CACHE_NAME = "sadax-v1";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("sadax-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || /^\/(?:api|auth)\//.test(url.pathname) || url.pathname === "/sw.js") return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch (_) {
          // A cache write failure must not turn a successful response into an error.
        }
      }
      return response;
    } catch (error) {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch (_) {
        // Preserve the original network failure when cache access also fails.
      }
      throw error;
    }
  })());
});
