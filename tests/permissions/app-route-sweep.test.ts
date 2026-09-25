import { describe, expect, it } from 'vitest';
import { listRegisteredRoutes } from '../../src/worker/core/permissions';
import { buildTestApp } from '../app/app-fixtures';
import { ADMINISTRATION_PANEL_SWEEP_ENTRIES } from './sweep-entries/administration-panel';
import { COMMITTEE_REGISTER_SWEEP_ENTRIES } from './sweep-entries/committee-register';

// Brief section 7.4, layer 1, against the real assembled app rather than
// fixtures: every route Hono actually serves under /api has a declaration,
// and the declarations are exactly these sweep entries. A new route that
// is not added here fails this test.
const SWEEP_ENTRIES = [
  { method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } },
  { method: 'PUT', path: '/api/me/language', access: { kind: 'signed-in-only' } },
  { method: 'GET', path: '/api/privacy-notice', access: { kind: 'signed-in-only' } },
  {
    method: 'POST',
    path: '/api/privacy-notice/acknowledgements',
    access: { kind: 'signed-in-only' },
  },
  ...ADMINISTRATION_PANEL_SWEEP_ENTRIES,
  ...COMMITTEE_REGISTER_SWEEP_ENTRIES,
  { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
];

describe('permission sweep — the assembled app', () => {
  it('declares exactly the listed access class for every registered route', async () => {
    await buildTestApp();

    expect([...listRegisteredRoutes()]).toEqual(SWEEP_ENTRIES);
  });

  it('serves no /api route that has no declaration', async () => {
    const { app } = await buildTestApp();
    const declared = new Set(listRegisteredRoutes().map((r) => `${r.method} ${r.path}`));

    const served = app.routes
      .filter((route) => route.method !== 'ALL' && route.path.startsWith('/api/'))
      .map((route) => `${route.method} ${route.path}`);

    expect(served.length).toBeGreaterThan(0);
    for (const route of served) {
      expect(declared).toContain(route);
    }
  });
});
