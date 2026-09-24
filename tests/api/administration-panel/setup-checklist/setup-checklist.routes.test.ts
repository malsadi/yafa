import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { setSetting } from '../../../../src/worker/core/settings';
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

async function call(clerkUserId: string) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(PATH, {
    headers: { Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}` },
  });
}

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
    await setSetting(env.DB, {
      key: 'administration-panel.new_officer_language',
      value: 'en',
      actorPersonId: admin.personId,
    });

    expect(await (await call(admin.clerkUserId)).json()).toEqual([]);
  });

  it('refuses an officer without the capability', async () => {
    expect((await call(officer.clerkUserId)).status).toBe(403);
  });
});
