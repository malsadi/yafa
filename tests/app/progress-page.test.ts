import { describe, expect, it } from 'vitest';
import { buildTestApp, fakeStaticAssets, ORIGIN } from './app-fixtures';

// D-040: any use of this database fails the request, so a passing request
// proves the progress page never touches D1.
const DATABASE_THAT_MUST_NOT_BE_USED = new Proxy({} as D1Database, {
  get() {
    throw new Error('The progress page must never touch the database');
  },
});

describe('GET /progress.html (D-040)', () => {
  it('serves the static page publicly, not indexed, with the security headers', async () => {
    const { assets, requestedPaths } = fakeStaticAssets();
    const { app } = await buildTestApp({ ASSETS: assets });

    const res = await app.request(`${ORIGIN}/progress.html`);

    expect(res.status).toBe(200);
    expect(requestedPaths).toEqual(['/progress.html']);
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(res.headers.get('Content-Security-Policy')).toContain("frame-ancestors 'none'");
  });

  it('never touches the database', async () => {
    const { assets } = fakeStaticAssets();
    const { app } = await buildTestApp({ ASSETS: assets, DB: DATABASE_THAT_MUST_NOT_BE_USED });

    const res = await app.request(`${ORIGIN}/progress.html`);

    expect(res.status).toBe(200);
  });

  it('answers the root with the progress page where the switch is on (D-047)', async () => {
    const { assets, requestedPaths } = fakeStaticAssets();
    const { app } = await buildTestApp({ ASSETS: assets, ROOT_SHOWS_PROGRESS_PAGE: true });

    const res = await app.request(`${ORIGIN}/`);

    expect(res.status).toBe(200);
    expect(requestedPaths).toEqual(['/progress.html']);
    expect(res.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('leaves the root to the portal where the switch is off', async () => {
    const { assets, requestedPaths } = fakeStaticAssets();
    const { app } = await buildTestApp({ ASSETS: assets, ROOT_SHOWS_PROGRESS_PAGE: false });

    const res = await app.request(`${ORIGIN}/`);

    expect(requestedPaths).toEqual(['/']);
    expect(res.headers.get('X-Robots-Tag')).toBeNull();
  });
});
