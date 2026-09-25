import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { insertSystemAdministrator } from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/service-switches`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69SWNV';

let admin: { clerkUserId: string; personId: string; unitId: string };
let officer: { clerkUserId: string; personId: string };

async function call(clerkUserId: string, method: string, path = PATH, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const change = (service: string, body: object) =>
  call(admin.clerkUserId, 'PUT', `${PATH}/${service}`, body);

// Tests build on each other in order within this file's shared storage.
describe('service switches (brief 25 C2, 8.4)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'SW1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'SW2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('shows every service, which are always on, and what each needs', async () => {
    const view = await (
      await call(admin.clerkUserId, 'GET')
    ).json<{
      services: { slug: string; alwaysOn: boolean; needs: string[] }[];
    }>();

    expect(view.services.find((s) => s.slug === 'event-organiser')?.needs).toEqual(['treasury']);
    expect(view.services.filter((s) => s.alwaysOn).map((s) => s.slug)).toEqual([
      'committee-register',
      'documents-archive',
      'administration-panel',
    ]);
    expect((await call(officer.clerkUserId, 'GET')).status).toBe(403);
  });

  it('refuses a switch that breaks a dependency, or an always-on service, with its reason', async () => {
    expect(await (await change('event-organiser', { enabled: true })).json()).toEqual({
      error: { code: 'service-switches.needs-service' },
    });
    expect(await (await change('committee-register', { enabled: false })).json()).toEqual({
      error: { code: 'service-switches.always-on' },
    });
    expect((await change('no-such-service', { enabled: true })).status).toBe(404);
  });

  it('switches portal-wide and per unit, and returns a unit to the portal-wide value', async () => {
    expect((await change('treasury', { enabled: true })).status).toBe(204);
    expect((await change('treasury', { enabled: false, unitId: admin.unitId })).status).toBe(204);
    expect((await change('treasury', { enabled: null, unitId: admin.unitId })).status).toBe(204);
    const view = await (
      await call(admin.clerkUserId, 'GET')
    ).json<{
      rows: { service: string; scope: string; enabled: boolean }[];
    }>();

    expect(view.rows.filter((r) => r.service === 'treasury')).toEqual([
      expect.objectContaining({ enabled: true }),
    ]);
  });
});
