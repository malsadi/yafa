import { describe, expect, it } from 'vitest';
import { buildPushRequest } from '../../../src/worker/core/push';

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * workerd's generated `SubtleCrypto` types (`worker-configuration.d.ts`) are
 * untyped unions (`CryptoKey | CryptoKeyPair`, `ArrayBuffer | JsonWebKey`),
 * unlike lib.dom's overloaded signatures — these two helpers narrow them
 * back for a caller that already knows which algorithm it asked for.
 */
async function generateEcKeyPair(
  algorithm: 'ECDH' | 'ECDSA',
  keyUsages: string[],
): Promise<CryptoKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: algorithm, namedCurve: 'P-256' },
    true,
    keyUsages,
  );
  return keyPair as CryptoKeyPair;
}

async function exportRawPublicKey(key: CryptoKey): Promise<Uint8Array> {
  return new Uint8Array((await crypto.subtle.exportKey('raw', key)) as ArrayBuffer);
}

/** A throwaway client (fake browser) subscription keypair — never a real device. */
async function generateClientSubscriptionKeys(): Promise<{ p256dh: string; auth: string }> {
  const keyPair = await generateEcKeyPair('ECDH', ['deriveBits']);
  const publicKeyBytes = await exportRawPublicKey(keyPair.publicKey);
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return { p256dh: toBase64(publicKeyBytes), auth: toBase64(auth) };
}

/** A throwaway VAPID keypair — never `.dev.vars`, never a real portal identity. */
async function generateVapidKeys(): Promise<{
  subject: string;
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await generateEcKeyPair('ECDSA', ['sign', 'verify']);
  const publicKeyBytes = await exportRawPublicKey(keyPair.publicKey);
  const jwk = (await crypto.subtle.exportKey('jwk', keyPair.privateKey)) as JsonWebKey;
  if (typeof jwk.d !== 'string') {
    throw new Error('expected an exportable EC private key');
  }
  return {
    subject: 'mailto:admin@example.org',
    publicKey: toBase64(publicKeyBytes),
    privateKey: jwk.d,
  };
}

describe('buildPushRequest', () => {
  it('builds a VAPID-signed, encrypted POST request, TTL header included', async () => {
    const { p256dh, auth } = await generateClientSubscriptionKeys();
    const vapid = await generateVapidKeys();

    const request = await buildPushRequest(
      {
        endpoint: 'https://push.example.org/subscription/abc',
        expirationTime: null,
        keys: { p256dh, auth },
      },
      { data: { kind: 'test.notification' } },
      vapid,
      120,
    );

    expect(request.url).toBe('https://push.example.org/subscription/abc');
    expect(request.method.toLowerCase()).toBe('post');
    expect(request.headers.authorization).toMatch(/^vapid t=/);
    expect(request.headers['content-encoding']).toBe('aes128gcm');
    expect(request.headers.ttl).toBe('120');
    expect(request.body.length).toBeGreaterThan(0);
  });

  it.each([0, -5])('rejects a non-positive ttlSeconds (%i)', async (ttlSeconds) => {
    const { p256dh, auth } = await generateClientSubscriptionKeys();
    const vapid = await generateVapidKeys();

    await expect(
      buildPushRequest(
        {
          endpoint: 'https://push.example.org/subscription/abc',
          expirationTime: null,
          keys: { p256dh, auth },
        },
        { data: { kind: 'test.notification' } },
        vapid,
        ttlSeconds,
      ),
    ).rejects.toThrow('ttlSeconds must be a positive number of seconds');
  });
});
