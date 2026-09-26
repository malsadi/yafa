// The portal's service worker (brief section 26, Phase 0). It takes control
// straight away and caches nothing: the portal always reads live data.
// Phase 7 (brief 20 C1, 9.5): it shows phone alerts. An alert carries its
// words in both languages (D-162: only its kind and unit); it is shown in
// the officer's saved language, or else Arabic when the device asks for
// Arabic, otherwise English (D-026). Tapping it opens the portal there.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

function alertLanguage(saved) {
  if (saved === 'en' || saved === 'ar') return saved;
  const asked = self.navigator.languages || [self.navigator.language || ''];
  return asked.some((language) => /^ar\b/i.test(language)) ? 'ar' : 'en';
}

self.addEventListener('push', (event) => {
  const alert = event.data ? event.data.json() : null;
  if (!alert) return;
  const language = alertLanguage(alert.language);
  const words = alert[language];
  event.waitUntil(
    self.registration.showNotification(words.title, {
      body: words.body,
      lang: language,
      dir: language === 'ar' ? 'rtl' : 'ltr',
      data: { url: alert.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data.url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      return open
        ? open.navigate(url).then((client) => client && client.focus())
        : self.clients.openWindow(url);
    }),
  );
});
