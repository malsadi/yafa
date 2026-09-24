/**
 * Builds a throwaway RS256 keypair and signs a Clerk-shaped session token
 * with it, so middleware tests can verify a real token (`jwtKey`,
 * networkless) with no network call and no `.dev.vars` — never a real
 * Clerk instance. RS256 because `@clerk/backend`'s installed verifier only
 * supports RS256/384/512 (checked against its compiled source, not
 * assumed — T-023's lesson).
 */

function toBase64Url(bytes: Uint8Array | ArrayBuffer): string {
  const array = bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  let binary = '';
  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function wrapPem(base64: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----\n`;
}

export interface TestClerkKeyPair {
  publicKeyPem: string;
  privateKey: CryptoKey;
}

export async function generateTestClerkKeyPair(): Promise<TestClerkKeyPair> {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify'],
  )) as CryptoKeyPair;

  const spki = (await crypto.subtle.exportKey('spki', keyPair.publicKey)) as ArrayBuffer;
  const publicKeyPem = wrapPem(btoa(String.fromCharCode(...new Uint8Array(spki))));
  return { publicKeyPem, privateKey: keyPair.privateKey };
}

export interface TestSessionTokenClaims {
  sub: string;
  azp?: string;
  exp?: number;
  iat?: number;
  /** Clerk's factor verification ages, in minutes; -1 means never. */
  fva?: [number, number];
}

export async function signTestSessionToken(
  privateKey: CryptoKey,
  claims: TestSessionTokenClaims,
): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    iat: claims.iat ?? nowSeconds,
    exp: claims.exp ?? nowSeconds + 3600,
    sub: claims.sub,
    ...(claims.azp ? { azp: claims.azp } : {}),
    ...(claims.fva ? { fva: claims.fva } : {}),
  };

  const encoder = new TextEncoder();
  const headerB64 = toBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    encoder.encode(signingInput),
  );
  return `${signingInput}.${toBase64Url(signature)}`;
}
