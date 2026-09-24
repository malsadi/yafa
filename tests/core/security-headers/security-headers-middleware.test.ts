import { buildPublishableKey } from '@clerk/shared/keys';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { securityHeaders } from '../../../src/worker/core/security-headers';

const FIXTURE_KEY = buildPublishableKey('excited-mule-42.clerk.accounts.dev');

function buildApp(): Hono {
  const app = new Hono();
  app.use('*', securityHeaders(FIXTURE_KEY, { viteDevServer: false }));
  app.get('/', (c) => c.text('ok'));
  return app;
}

describe('securityHeaders', () => {
  it('sets a Content-Security-Policy including the Clerk Frontend API host', async () => {
    const res = await buildApp().request('/');
    expect(res.headers.get('Content-Security-Policy')).toContain(
      'https://excited-mule-42.clerk.accounts.dev',
    );
  });

  it('sets Strict-Transport-Security', async () => {
    const res = await buildApp().request('/');
    expect(res.headers.get('Strict-Transport-Security')).toContain('max-age=');
  });

  it('sets X-Content-Type-Options: nosniff', async () => {
    const res = await buildApp().request('/');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('sets a Referrer-Policy', async () => {
    const res = await buildApp().request('/');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });
});
