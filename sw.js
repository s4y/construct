const getCache = caches.open("cache");
const cacheURLs = [
  "/",
  "/style.css",
];

self.addEventListener("install", e => {
  e.waitUntil(async function() {
    const cache = await getCache;
    await cache.addAll(cacheURLs);
    await self.skipWaiting();
  }());
});

self.addEventListener("activate", e => {
  if ("navigationPreload" in self.registration)
    e.waitUntil(self.registration.navigationPreload.enable())
});

self.addEventListener("fetch", e => {
  e.respondWith(async function() {
    const r = 
      (e.preloadResponse && await e.preloadResponse)
      || await fetch(e.request);
    if (!r)
      return (await getCache).match(e.request);
    (async function() {
      const cache = await getCache;
      if (await cache.match(e.request))
        cache.put(e.request, r);
    }());
    return r.clone();
  }());
});
