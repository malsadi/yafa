import { beforeEach, describe, expect, it } from 'vitest';
import {
  listRegisteredRoutes,
  registerRoute,
  resetRegistryForTests,
  type RouteDeclaration,
} from '../../src/worker/core/permissions';

// Brief section 7.4: "Every route declares a capability. A route without one
// fails a test." Real routes arrive with each service's phase; this proves
// the sweep's machinery — the fixed set of access classes from D-004
// (capability, signed-in-only, signed-webhook, calendar-feed-token), plus
// D-040's public-progress-page — against
// fixture routes standing in for routes that don't exist yet.
const FIXTURE_ROUTES: RouteDeclaration[] = [
  {
    method: 'GET',
    path: '/api/treasury/entries',
    access: { kind: 'capability', capability: 'treasury.entries.read' },
  },
  {
    method: 'POST',
    path: '/api/treasury/entries',
    access: { kind: 'capability', capability: 'treasury.entries.create' },
  },
  { method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } },
  { method: 'POST', path: '/api/webhooks/clerk', access: { kind: 'signed-webhook' } },
  { method: 'GET', path: '/calendar/feed/:token.ics', access: { kind: 'calendar-feed-token' } },
  { method: 'GET', path: '/progress.html', access: { kind: 'public-progress-page' } },
];

describe('permission sweep', () => {
  beforeEach(() => {
    resetRegistryForTests();
    for (const route of FIXTURE_ROUTES) {
      registerRoute(route);
    }
  });

  it('has a declared access class, from the fixed set, for every route', () => {
    const routes = listRegisteredRoutes();

    expect(routes).toHaveLength(FIXTURE_ROUTES.length);
    for (const route of routes) {
      expect([
        'capability',
        'signed-in-only',
        'signed-webhook',
        'calendar-feed-token',
        'public-progress-page',
      ]).toContain(route.access.kind);
    }
  });

  it('never lets a capability route through with a malformed capability name', () => {
    expect(() => {
      registerRoute({
        method: 'DELETE',
        path: '/api/treasury/entries/:id',
        access: { kind: 'capability', capability: 'delete-everything' },
      });
    }).toThrow();
  });
});

// Brief section 7.4's behavioural half — signing in as a Branch A officer and
// attempting Branch B's records, a branch officer attempting a national
// action, an administrator attempting to read content, every attempt failing
// with 403/404 — is `route-sweep-behavioural.test.ts`, over real HTTP through
// the real Clerk-session middleware and `can()`, once both existed.
