import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { handleAppError } from '../../../src/worker/core/errors';
import { requireSameOrigin } from '../../../src/worker/core/security-headers';

function buildApp(): Hono {
  const app = new Hono();
  app.onError(handleAppError);
  app.use('*', requireSameOrigin);
  app.get('/', (c) => c.text('ok'));
  return app;
}

describe('requireSameOrigin', () => {
  it('allows a request with no Origin header (server-to-server, e.g. a webhook)', async () => {
    const res = await buildApp().request('http://portal.example/');
    expect(res.status).toBe(200);
  });

  it('allows a request whose Origin matches the request URL', async () => {
    const res = await buildApp().request('http://portal.example/', {
      headers: { Origin: 'http://portal.example' },
    });
    expect(res.status).toBe(200);
  });

  it('rejects a request whose Origin differs from the request URL', async () => {
    const res = await buildApp().request('http://portal.example/', {
      headers: { Origin: 'https://attacker.example' },
    });
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'request.origin-mismatch' } });
  });
});
