import { env } from 'cloudflare:workers';
import { vi } from 'vitest';
import type {
  NotificationsQueue,
  NotificationsQueueMessage,
} from '../../../src/worker/services/communication-hub';

/** A stand-in for the notifications Queue, keeping what was sent. */
export function fakeQueue() {
  const sent: NotificationsQueueMessage[] = [];
  const queue = {
    send: vi.fn((body: NotificationsQueueMessage) => {
      sent.push(body);
      return Promise.resolve();
    }),
    sendBatch: vi.fn((messages: { body: NotificationsQueueMessage }[]) => {
      sent.push(...messages.map((m) => m.body));
      return Promise.resolve();
    }),
  } as unknown as NotificationsQueue;
  return { queue, sent };
}

const base64url = (bytes: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

/** A fictional device's push subscription keys, made here, as a browser would. */
export async function registerDevice(
  id: string,
  personId: string,
  endpoint: string,
): Promise<void> {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ])) as CryptoKeyPair;
  const p256dh = base64url((await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer);
  const auth = base64url(crypto.getRandomValues(new Uint8Array(16)));
  await env.DB.prepare(
    'INSERT INTO push_subscriptions (id, person_id, endpoint, p256dh, auth, expiration_time, created_at) VALUES (?, ?, ?, ?, ?, NULL, ?)',
  )
    .bind(id, personId, endpoint, p256dh, auth, new Date().toISOString())
    .run();
}

/** Throwaway push keys for the portal, made here for the test only. */
export async function portalPushKeys() {
  const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
    'sign',
    'verify',
  ])) as CryptoKeyPair;
  const jwk = (await crypto.subtle.exportKey('jwk', pair.privateKey)) as JsonWebKey;
  return {
    VAPID_PUBLIC_KEY: base64url(
      (await crypto.subtle.exportKey('raw', pair.publicKey)) as ArrayBuffer,
    ),
    VAPID_PRIVATE_KEY: jwk.d ?? '',
    VAPID_SUBJECT: 'mailto:test@example.org',
  };
}
