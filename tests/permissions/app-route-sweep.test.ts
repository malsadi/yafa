import { describe, expect, it } from 'vitest';
import { listRegisteredRoutes } from '../../src/worker/core/permissions';
import { buildTestApp } from '../app/app-fixtures';
import { ADMINISTRATION_PANEL_SWEEP_ENTRIES } from './sweep-entries/administration-panel';
import { COMMITTEE_REGISTER_SWEEP_ENTRIES } from './sweep-entries/committee-register';
import { DOCUMENTS_ARCHIVE_SWEEP_ENTRIES } from './sweep-entries/documents-archive';
import { RESOURCES_LIBRARY_SWEEP_ENTRIES } from './sweep-entries/resources-library';
import { TREASURY_SWEEP_ENTRIES } from './sweep-entries/treasury';

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
  { method: 'GET', path: '/api/texts/access-not-active', access: { kind: 'signed-in-only' } },
  { method: 'GET', path: '/api/texts/help', access: { kind: 'signed-in-only' } },

  ...ADMINISTRATION_PANEL_SWEEP_ENTRIES,
  ...COMMITTEE_REGISTER_SWEEP_ENTRIES,
  ...DOCUMENTS_ARCHIVE_SWEEP_ENTRIES,
  ...RESOURCES_LIBRARY_SWEEP_ENTRIES,
  ...TREASURY_SWEEP_ENTRIES,
  // Brief 9.5 and D-031: each officer's own inbox — nothing to grant (D-004).
  { method: 'GET', path: '/api/notifications', access: { kind: 'signed-in-only' } },
  {
    method: 'POST',
    path: '/api/notifications/:notificationId/read',
    access: { kind: 'signed-in-only' },
  },
  { method: 'POST', path: '/api/notifications/read-all', access: { kind: 'signed-in-only' } },
  { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
  // D-088: the only files served without a sign-in, each with its own class.
  { method: 'GET', path: '/manifest.webmanifest', access: { kind: 'public-install-file' } },
  { method: 'GET', path: '/branding/icon-192.png', access: { kind: 'public-install-icon' } },
  { method: 'GET', path: '/branding/icon-512.png', access: { kind: 'public-install-icon' } },
  { method: 'GET', path: '/branding/fonts/latin', access: { kind: 'public-font-file' } },
  { method: 'GET', path: '/branding/fonts/arabic', access: { kind: 'public-font-file' } },
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
