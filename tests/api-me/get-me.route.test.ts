import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';
import { handleAppError } from '../../src/worker/core/errors';
import { listRegisteredRoutes, resetRegistryForTests } from '../../src/worker/core/permissions';
import { registerGetMeRoute } from '../../src/worker/api-me';
import type { SignedInVariables } from '../../src/worker/middleware/require-signed-in';
import {
  generateTestClerkKeyPair,
  signTestSessionToken,
} from '../middleware/clerk-session-fixtures';

const ORIGIN = 'https://portal.example.org';

function buildApp(jwtKey: string): Hono<{ Variables: SignedInVariables }> {
  const app = new Hono<{ Variables: SignedInVariables }>();
  app.onError(handleAppError);
  registerGetMeRoute(app, env.DB, { jwtKey });
  return app;
}

describe('registerGetMeRoute', () => {
  beforeEach(() => {
    resetRegistryForTests();
  });

  it('registers itself as signed-in-only', () => {
    buildApp('unused-key-for-registration-only');

    expect(listRegisteredRoutes()).toEqual([
      { method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } },
    ]);
  });

  it('reports not-active for a signed-in user with no linked person', async () => {
    const { publicKeyPem, privateKey } = await generateTestClerkKeyPair();
    const token = await signTestSessionToken(privateKey, {
      sub: 'clerk_getme_unlinked',
      azp: ORIGIN,
    });
    const app = buildApp(publicKeyPem);

    const res = await app.request(`${ORIGIN}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'not-active' });
  });

  it('returns 401 for a request with no Authorization header at all', async () => {
    const { publicKeyPem } = await generateTestClerkKeyPair();
    const app = buildApp(publicKeyPem);

    const res = await app.request(`${ORIGIN}/api/me`);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: { code: 'session.missing' } });
  });
});
