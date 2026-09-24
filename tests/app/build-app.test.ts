import { describe, expect, it } from 'vitest';
import { buildTestApp, ORIGIN } from './app-fixtures';

describe('buildApp', () => {
  it('answers an unclaimed /api path with a JSON 404, never the single-page app', async () => {
    const { app } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/no-such-route`);

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: 'route.not-found' } });
  });

  it('puts the security headers on API error responses (brief section 12)', async () => {
    const { app } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me`);

    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(res.headers.get('Strict-Transport-Security')).not.toBeNull();
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('puts the security headers on single-page-app responses too (T-066)', async () => {
    const { app } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/treasury`);

    expect(res.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('rejects an API call from another origin (T-013)', async () => {
    const { app } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me`, {
      headers: { Origin: 'https://elsewhere.example.org' },
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'request.origin-mismatch' } });
  });
});
