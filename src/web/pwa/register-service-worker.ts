/**
 * Registers the portal's service worker (brief section 26, Phase 0), which
 * Phase 7 extends to receive phone notifications. Skipped where the browser
 * has no service worker support.
 */
export function registerServiceWorker(): void {
  if ('serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/service-worker.js');
  }
}
