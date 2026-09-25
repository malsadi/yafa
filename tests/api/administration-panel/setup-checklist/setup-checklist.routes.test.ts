import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { getSetupChecklist } from '../../../../src/worker/services/administration-panel/setup-checklist/setup-checklist.service';
import {
  insertRole,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69SCNV';
const PATH = `${ORIGIN}/api/administration-panel/setup-checklist`;

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string; personId: string };

async function call(clerkUserId: string, method = 'GET', path = PATH, body?: unknown) {
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
const setting = (key: string, value: unknown) => ({ path: `${PATH}/settings/${key}`, value });

// Tests build on each other in order within this file's shared storage.
describe('set-up checklist (brief 25 C6, D-024)', () => {
  beforeAll(async () => {
    admin = await seedOfficer({ suffix: 'SC1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'SC2' });
  });

  it('puts the privacy notice first while none is set', async () => {
    await buildTestApp();
    const ctx = {
      personId: admin.personId,
      units: [],
      roles: [],
      capabilities: [],
      isSystemAdmin: true,
    };

    const items = await getSetupChecklist(env.DB, ctx);

    expect(items[0]).toEqual({ service: 'administration-panel', kind: 'privacy-notice' });
  });

  it('lists the missing designations and required settings', async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);

    expect(await (await call(admin.clerkUserId)).json()).toEqual([
      {
        service: 'committee-register',
        kind: 'designation',
        designation: 'Branch register officer',
      },
      {
        service: 'committee-register',
        kind: 'designation',
        designation: 'National register officer',
      },
      {
        service: 'administration-panel',
        kind: 'setting',
        key: 'administration-panel.new_officer_language',
        input: { kind: 'choice', options: ['en', 'ar'] },
      },
      {
        service: 'communication-hub',
        kind: 'setting',
        key: 'communication-hub.alert_types_for_new_officers',
        input: { kind: 'multi-choice', options: ['notices', 'votes', 'replies', 'requests'] },
      },
    ]);
  });

  it('is empty once they are all set', async () => {
    await insertRole(env.DB, {
      id: 'sc-bro',
      name: 'Branch Register Officer',
      designation: 'Branch register officer',
    });
    await insertRole(env.DB, {
      id: 'sc-nro',
      name: 'National Register Officer',
      designation: 'National register officer',
    });
    const language = setting('administration-panel.new_officer_language', 'en');
    const put = (who: string, value: unknown, path = language.path) =>
      call(who, 'PUT', path, { value });

    expect((await put(officer.clerkUserId, 'en')).status).toBe(403);
    expect(await (await put(admin.clerkUserId, 'fr')).json()).toEqual({
      error: { code: 'request.invalid' },
    });
    expect(
      await (
        await put(
          admin.clerkUserId,
          true,
          setting('committee-register.branches_may_add_roles', true).path,
        )
      ).json(),
    ).toEqual({ error: { code: 'setup-checklist.not-a-required-setting' } });
    expect((await put(admin.clerkUserId, 'en')).status).toBe(204);
    expect(await (await put(admin.clerkUserId, 'ar')).json()).toEqual({
      error: { code: 'setup-checklist.already-set' },
    });
    expect(
      (
        await put(
          admin.clerkUserId,
          ['notices', 'votes'],
          setting('communication-hub.alert_types_for_new_officers', null).path,
        )
      ).status,
    ).toBe(204);
    expect(await (await call(admin.clerkUserId)).json()).toEqual([]);
  });

  it('refuses an officer without the capability', async () => {
    expect((await call(officer.clerkUserId)).status).toBe(403);
  });
});
