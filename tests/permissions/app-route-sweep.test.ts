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
  {
    method: 'GET',
    path: '/api/administration-panel/role-designations',
    access: { kind: 'capability', capability: 'administration-panel.role-designations.manage' },
  },
  {
    method: 'PUT',
    path: '/api/administration-panel/role-designations',
    access: { kind: 'capability', capability: 'administration-panel.role-designations.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/officer-accounts',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/invitation',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/lock',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/unlock',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/sign-out',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/officer-accounts/:personId/remove-push-devices',
    access: { kind: 'capability', capability: 'administration-panel.officer-accounts.manage' },
  },
  {
    method: 'GET',
    path: '/api/administration-panel/lists',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'POST',
    path: '/api/administration-panel/lists/:list/items',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/administration-panel/lists/:list/items/:itemId',
    access: { kind: 'capability', capability: 'administration-panel.lists.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/branches',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/branches',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/branches/:unitId',
    access: { kind: 'capability', capability: 'committee-register.branches.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/roles',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/roles',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/roles/:roleId',
    access: { kind: 'capability', capability: 'committee-register.standard-roles.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/branches/:unitId/roles',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/branches/:unitId/roles',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/branches/:unitId/roles/:roleId',
    access: { kind: 'capability', capability: 'committee-register.branch-roles.manage' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/officers',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'GET',
    path: '/api/committee-register/units/:unitId/past-officers',
    access: { kind: 'capability', capability: 'committee-register.register.read' },
  },
  {
    method: 'POST',
    path: '/api/committee-register/units/:unitId/officers',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/people/:personId',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  {
    method: 'PATCH',
    path: '/api/committee-register/terms/:termId',
    access: { kind: 'capability', capability: 'committee-register.officers.manage' },
  },
  { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
  { method: 'GET', path: '/progress.html', access: { kind: 'public-progress-page' } },
  { method: 'GET', path: '/progress.ar.html', access: { kind: 'public-progress-page' } },
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
