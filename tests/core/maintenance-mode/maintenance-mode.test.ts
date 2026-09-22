import { env } from 'cloudflare:workers';
import { Hono } from 'hono';
import { describe, expect, it } from 'vitest';
import { handleAppError } from '../../../src/worker/core/errors';
import {
  isMaintenanceModeOn,
  maintenanceModeGate,
  setMaintenanceMode,
} from '../../../src/worker/core/maintenance-mode';

const ACTOR = '01ARZ3NDEKTSV4RRFFQ69G5MMA';

function buildApp(db: D1Database): Hono {
  const app = new Hono();
  app.onError(handleAppError);
  app.use('*', maintenanceModeGate(db));
  app.get('/', (c) => c.text('read ok'));
  app.post('/', (c) => c.text('write ok'));
  return app;
}

describe('isMaintenanceModeOn / setMaintenanceMode', () => {
  it('defaults to off with no row', async () => {
    expect(await isMaintenanceModeOn(env.DB)).toBe(false);
  });

  it('turns on, then off, and records an audit entry each time', async () => {
    await setMaintenanceMode(env.DB, { enabled: true, actorPersonId: ACTOR });
    expect(await isMaintenanceModeOn(env.DB)).toBe(true);

    await setMaintenanceMode(env.DB, { enabled: false, actorPersonId: ACTOR });
    expect(await isMaintenanceModeOn(env.DB)).toBe(false);

    const rows = await env.DB.prepare(
      'SELECT action FROM audit_log WHERE entity_type = ? AND actor_person_id = ? ORDER BY rowid ASC',
    )
      .bind('maintenance-mode', ACTOR)
      .all<{ action: string }>();

    expect(rows.results).toEqual([
      { action: 'maintenance-mode.enable' },
      { action: 'maintenance-mode.disable' },
    ]);
  });
});

describe('maintenanceModeGate', () => {
  it('always allows GET, maintenance mode on or off', async () => {
    await setMaintenanceMode(env.DB, { enabled: true, actorPersonId: ACTOR });

    const res = await buildApp(env.DB).request('/');
    expect(res.status).toBe(200);

    await setMaintenanceMode(env.DB, { enabled: false, actorPersonId: ACTOR });
  });

  it('allows a mutating request while maintenance mode is off', async () => {
    await setMaintenanceMode(env.DB, { enabled: false, actorPersonId: ACTOR });

    const res = await buildApp(env.DB).request('/', { method: 'POST' });
    expect(res.status).toBe(200);
  });

  it('refuses a mutating request with 503 while maintenance mode is on', async () => {
    await setMaintenanceMode(env.DB, { enabled: true, actorPersonId: ACTOR });

    const res = await buildApp(env.DB).request('/', { method: 'POST' });
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: 'maintenance-mode.read-only' } });

    await setMaintenanceMode(env.DB, { enabled: false, actorPersonId: ACTOR });
  });
});
