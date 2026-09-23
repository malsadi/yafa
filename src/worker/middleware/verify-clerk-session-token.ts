import { verifyToken } from '@clerk/backend';
import { UnauthorizedError } from '../core/errors';

export interface ClerkVerificationKeys {
  /** Production: verified against Clerk's own API (JWKS, cached). */
  secretKey?: string;
  /** Tests: a throwaway PEM public key, verified with no network call. */
  jwtKey?: string;
}

/**
 * Brief section 6.3: "the `Authorization` header, not a cookie." Uses
 * `verifyToken()` directly rather than `@clerk/backend`'s own recommended
 * `authenticateRequest()` — that higher-level helper exists to manage a
 * cookie's handshake/refresh dance for browser navigation, which doesn't
 * apply here: the client always sends a fresh bearer token itself, so there
 * is no cookie to refresh and no handshake state to handle (confirmed by
 * reading the installed package's own source, not assumed — T-023's
 * lesson). `secretKey`/`jwtKey` are both accepted so a test can verify a
 * self-signed throwaway token with no network call and no `.dev.vars`,
 * while production always uses the existing `CLERK_SECRET_KEY` — no new
 * secret is added just to make tests possible.
 *
 * `verifyToken()` does throw on an invalid token, matching `index.d.ts`'s
 * declared signature — confirmed against the installed package's compiled
 * JS, not assumed (T-023's lesson, and a real trap here: the *internal*
 * primitive one file deeper, `tokens/verify.js`, resolves a `{ data } |
 * { errors }` object and never throws; the publicly exported `verifyToken`
 * wraps it with `withLegacyReturn`, which throws `errors[0]` — reading the
 * inner file first gives exactly the wrong answer for what's exported).
 */
export async function verifyClerkSessionToken(
  request: Request,
  keys: ClerkVerificationKeys,
): Promise<string> {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedError('session.missing');
  }
  const token = authorization.slice('Bearer '.length);

  let payload: { sub?: unknown };
  try {
    payload = await verifyToken(token, {
      secretKey: keys.secretKey,
      jwtKey: keys.jwtKey,
      authorizedParties: [new URL(request.url).origin],
    });
  } catch {
    throw new UnauthorizedError('session.invalid');
  }

  if (typeof payload.sub !== 'string') {
    throw new UnauthorizedError('session.invalid');
  }
  return payload.sub;
}
