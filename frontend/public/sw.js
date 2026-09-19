// PataCard service worker: network first; with no network, answer same-origin GETs from the
// cache that SharedView fills (page files + the per-link offline copy). No library.
// ignoreVary: hosts send "Vary: Origin" and module scripts carry an Origin header, so a strict match misses.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req).catch(async () => {
      const hit = await caches.match(req, { ignoreSearch: true, ignoreVary: true });
      if (hit) return hit;
      // Any page URL (/s/{token}) is the same single-page app.
      if (req.mode === "navigate") {
        const page = await caches.match("/index.html", { ignoreVary: true });
        if (page) return page;
      }
      return Response.error();
    }),
  );
});
