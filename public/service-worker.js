// The portal's service worker (brief section 26, Phase 0). It takes control
// straight away; Phase 7 adds receiving phone notifications (Web Push). It
// caches nothing: the portal always reads live data.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
