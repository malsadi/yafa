/** Whether this browser can receive phone alerts at all (Push API and a service worker). */
export const pushSupported = () =>
  typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

/** Brief 15 C4 and D-086: an iPhone that has not added the portal to its home screen can't receive alerts. */
export function iphoneNotInstalled(): boolean {
  const iphone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const installed =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iphone && !installed;
}

/** The portal's public key, as the Push API takes it. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/** This device's current subscription, if it has one. */
export async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/** Asks the browser for permission and subscribes this device with the portal's key. */
export async function subscribeThisDevice(publicKey: string): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: keyBytes(publicKey),
  });
}
