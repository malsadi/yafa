import { beforeEach, describe, expect, it } from 'vitest';
import {
  listRegisteredRoutes,
  registerRoute,
  resetRegistryForTests,
} from '../../../src/worker/core/permissions';

describe('route registry', () => {
  beforeEach(() => {
    resetRegistryForTests();
  });

  it('accepts a capability route', () => {
    registerRoute({
      method: 'GET',
      path: '/api/treasury/entries',
      access: { kind: 'capability', capability: 'treasury.entries.read' },
    });

    expect(listRegisteredRoutes()).toHaveLength(1);
  });

  it('accepts each of the four fixed access classes (brief section 7.4, D-004)', () => {
    registerRoute({
      method: 'POST',
      path: '/api/webhooks/clerk',
      access: { kind: 'signed-webhook' },
    });
    registerRoute({ method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } });
    registerRoute({
      method: 'GET',
      path: '/calendar/feed/:token.ics',
      access: { kind: 'calendar-feed-token' },
    });
    registerRoute({
      method: 'GET',
      path: '/api/treasury/entries',
      access: { kind: 'capability', capability: 'treasury.entries.read' },
    });

    expect(listRegisteredRoutes()).toHaveLength(4);
  });

  it('rejects a capability that does not match <service>.<resource>.<action>', () => {
    expect(() => {
      registerRoute({
        method: 'GET',
        path: '/api/treasury/entries',
        access: { kind: 'capability', capability: 'not-a-capability' },
      });
    }).toThrow();
  });

  it('rejects an access kind outside the four fixed classes', () => {
    expect(() => {
      registerRoute({
        method: 'GET',
        path: '/manifest.webmanifest',
        // "public" is not a confirmed access class yet (O-004 is still open).
        access: { kind: 'public' } as never,
      });
    }).toThrow();
  });

  it('rejects registering the same method and path twice', () => {
    registerRoute({ method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } });

    expect(() => {
      registerRoute({ method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } });
    }).toThrow();
  });

  it('rejects a path that does not start with /', () => {
    expect(() => {
      registerRoute({ method: 'GET', path: 'api/me', access: { kind: 'signed-in-only' } });
    }).toThrow();
  });

  it('lists nothing after a reset', () => {
    registerRoute({ method: 'GET', path: '/api/me', access: { kind: 'signed-in-only' } });
    resetRegistryForTests();

    expect(listRegisteredRoutes()).toHaveLength(0);
  });
});
