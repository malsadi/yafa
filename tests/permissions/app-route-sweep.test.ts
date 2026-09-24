import { describe, expect, it } from 'vitest';
import { listRegisteredRoutes } from '../../src/worker/core/permissions';
import { buildTestApp } from '../app/app-fixtures';

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
  {
    method: 'GET',
    path: '/api/administration-panel/system-administrators',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/system-administrators',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'DELETE',
    path: '/api/administration-panel/system-administrators/:personId',
    access: { kind: 'capability', capability: 'administration-panel.system-administrators.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/permissions-matrix',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/permissions-matrix/cells',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/permissions-matrix/versions',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/permissions-matrix/versions/:number/restore',
    access: { kind: 'capability', capability: 'administration-panel.permissions-matrix.manage' },
  },
  { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
  { method: 'GET', path: '/progress.html', access: { kind: 'public-progress-page' } },
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

  it('declares the root as the public progress page only where the switch is on (D-047)', async () => {
    await buildTestApp({ ROOT_SHOWS_PROGRESS_PAGE: true });

    expect([...listRegisteredRoutes()]).toEqual([
      ...SWEEP_ENTRIES,
      { method: 'GET', path: '/', access: { kind: 'public-progress-page' } },
    ]);
  });
});
