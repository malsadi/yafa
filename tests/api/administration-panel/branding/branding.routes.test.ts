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

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69BDNV';

let admin: { clerkUserId: string; personId: string };
let officer: { clerkUserId: string; personId: string };

async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(`${ORIGIN}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
const put = (body: object) =>
  call(admin.clerkUserId, 'PUT', '/api/administration-panel/branding', body);

// Tests build on each other in order within this file's shared storage.
describe('branding (brief 25 C3; D-082)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'BD1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'BD2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('is empty until set, and readable by every active officer', async () => {
    expect(await (await call(officer.clerkUserId, 'GET', '/api/branding')).json()).toEqual({
      organisationName: null,
      mainColour: null,
      accentColour: null,
    });
  });

  it('refuses a colour that does not read on white, and anyone without the capability', async () => {
    expect((await put({ mainColour: '#FACC15' })).status).toBe(400);
    expect(
      (
        await call(officer.clerkUserId, 'PUT', '/api/administration-panel/branding', {
          mainColour: '#1D4ED8',
        })
      ).status,
    ).toBe(403);
  });

  it('sets the name and colours, which every officer then reads', async () => {
    expect(
      (
        await put({
          organisationName: { en: 'Example Council', ar: null },
          mainColour: '#1D4ED8',
          accentColour: '#B91C1C',
        })
      ).status,
    ).toBe(200);
    expect(await (await call(officer.clerkUserId, 'GET', '/api/branding')).json()).toEqual({
      organisationName: { en: 'Example Council', ar: null },
      mainColour: '#1D4ED8',
      accentColour: '#B91C1C',
    });
  });
});
