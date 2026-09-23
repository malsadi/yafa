/**
 * Signs a webhook payload exactly the way `standardwebhooks` (the package
 * `@clerk/backend/webhooks` actually verifies against — not `svix`, T-003)
 * expects, per its own compiled source: `HMAC-SHA256(key, "id.timestamp.body")`,
 * base64, headers `svix-id`/`svix-timestamp`/`svix-signature: v1,<sig>`. A
 * throwaway secret, generated fresh per test — never a real Clerk secret.
 */

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

export function generateTestWebhookSecret(): string {
  const keyBytes = crypto.getRandomValues(new Uint8Array(24));
  return `whsec_${toBase64(keyBytes)}`;
}

async function signPayload(secret: string, msgId: string, timestampSeconds: number, body: string) {
  const rawSecret = secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret;
  const key = await crypto.subtle.importKey(
    'raw',
    base64ToBytes(rawSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const toSign = new TextEncoder().encode(`${msgId}.${String(timestampSeconds)}.${body}`);
  const signature = await crypto.subtle.sign('HMAC', key, toSign);
  return toBase64(new Uint8Array(signature));
}

export interface SignedWebhookRequestOptions {
  msgId?: string;
  timestampSeconds?: number;
  /** Deliberately wrong, for a "bad signature" test. */
  signatureOverride?: string;
}

export async function buildSignedWebhookRequest(
  url: string,
  secret: string,
  payload: unknown,
  options: SignedWebhookRequestOptions = {},
): Promise<Request> {
  const msgId = options.msgId ?? 'msg_test_1';
  const timestampSeconds = options.timestampSeconds ?? Math.floor(Date.now() / 1000);
  const body = JSON.stringify(payload);
  const signature =
    options.signatureOverride ?? (await signPayload(secret, msgId, timestampSeconds, body));

  return new Request(url, {
    method: 'POST',
    headers: {
      'svix-id': msgId,
      'svix-timestamp': String(timestampSeconds),
      'svix-signature': `v1,${signature}`,
      'content-type': 'application/json',
    },
    body,
  });
}
