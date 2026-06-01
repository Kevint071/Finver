const CACHE_NAME = "finver-v1";
const STATIC_ASSETS = ["/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      const deletions = [];
      for (const k of keys) {
        if (k !== CACHE_NAME) deletions.push(caches.delete(k));
      }
      return Promise.all(deletions);
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  // For navigation requests, try network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // For static assets, cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
