import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { setServiceSwitch } from '../../src/worker/core/service-switches';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../app/app-fixtures';

// One file's D1 storage is shared by its tests, so the notice set here is
// the current one for every test below.
const NOTICE_ID = '01ARZ3NDEKTSV4RRFFQ69MEN1';

describe('GET /api/me — the shell data (T-067)', () => {
  it('reports language and the notice version while the notice is unacknowledged', async () => {
    await insertNoticeVersion(NOTICE_ID, '2026-01-01T00:00:00.000Z');
    const officer = await seedOfficer({ suffix: 'ME1' });
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me`, {
      headers: { Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}` },
    });

    expect(await res.json()).toEqual({
      status: 'notice-not-acknowledged',
      language: null,
      noticeVersionId: NOTICE_ID,
    });
  });

  it("returns the officer's own units with each unit's switched-on services", async () => {
    const officer = await seedOfficer({ suffix: 'ME2', unitName: 'Fictional Branch' });
    await acknowledgeNotice(officer.personId, NOTICE_ID);
    await setServiceSwitch(env.DB, {
      service: 'treasury',
      enabled: true,
      unitId: officer.unitId,
      actorPersonId: officer.personId,
    });
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me`, {
      headers: { Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}` },
    });
    const body = await res.json<Record<string, unknown>>();

    expect(body.status).toBe('active');
    expect(body.maintenanceMode).toBe(false);
    expect(body.units).toEqual([
      {
        id: officer.unitId,
        type: 'branch',
        nameEn: 'Fictional Branch',
        nameAr: 'وحدة تجريبية',
        enabledServices: [
          'treasury',
          'committee-register',
          'documents-archive',
          'administration-panel',
        ],
      },
    ]);
  });
});

describe('PUT /api/me/language', () => {
  it("saves the officer's own language on their person record", async () => {
    const officer = await seedOfficer({ suffix: 'ME3' });
    const { app, tokenFor } = await buildTestApp();
    const headers = {
      Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}`,
      'Content-Type': 'application/json',
    };

    const put = await app.request(`${ORIGIN}/api/me/language`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ language: 'ar' }),
    });
    const me = await app.request(`${ORIGIN}/api/me`, { headers });

    expect(put.status).toBe(204);
    expect(await me.json()).toMatchObject({ language: 'ar' });
  });

  it('refuses a language the portal does not have', async () => {
    const officer = await seedOfficer({ suffix: 'ME4' });
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me/language`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${await tokenFor(officer.clerkUserId)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language: 'fr' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 404 for a signed-in user with no linked person', async () => {
    const { app, tokenFor } = await buildTestApp();

    const res = await app.request(`${ORIGIN}/api/me/language`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${await tokenFor('clerk_app_unlinked')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ language: 'en' }),
    });

    expect(res.status).toBe(404);
  });
});
