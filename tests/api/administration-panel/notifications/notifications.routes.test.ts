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

const PATH = `${ORIGIN}/api/administration-panel/notifications`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69NTNV';

let admin: { clerkUserId: string; personId: string };
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

// Tests build on each other in order within this file's shared storage.
describe('notifications (brief 25 C4, 20 C1)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'NT1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'NT2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('shows nothing set yet, and refuses anyone without the capability', async () => {
    expect(await (await call(admin.clerkUserId, 'GET')).json()).toEqual({
      alertTypesForNewOfficers: null,
      installGuide: null,
    });
    expect((await call(officer.clerkUserId, 'GET')).status).toBe(403);
  });

  it('sets the alert types new officers start with, never including circulars (always on)', async () => {
    const put = (types: string[]) =>
      call(admin.clerkUserId, 'PUT', `${PATH}/alert-types`, { types });

    expect((await put(['circulars'])).status).toBe(400);
    expect((await put(['notices', 'votes'])).status).toBe(204);
    expect(
      (await (await call(admin.clerkUserId, 'GET')).json<{ alertTypesForNewOfficers: string[] }>())
        .alertTypesForNewOfficers,
    ).toEqual(['notices', 'votes']);
  });

  it('keeps the install guide in both languages, the Arabic able to wait, audited (D-022)', async () => {
    const put = (body: object) => call(admin.clerkUserId, 'PUT', `${PATH}/install-guide`, body);

    expect((await put({ textEn: '', textAr: null })).status).toBe(400);
    expect(
      await (await put({ textEn: 'Add the portal to your home screen.', textAr: '' })).json(),
    ).toEqual({
      key: 'iphone-install-guide',
      textEn: 'Add the portal to your home screen.',
      textAr: null,
    });
    await put({
      textEn: 'Add the portal to your home screen.',
      textAr: 'أضف البوابة إلى الشاشة الرئيسية.',
    });
    const audit = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM audit_log WHERE action = 'admin-text.written' AND entity_id = 'iphone-install-guide'",
    ).first<{ n: number }>();

    expect(
      (await (await call(admin.clerkUserId, 'GET')).json<{ installGuide: { textAr: string } }>())
        .installGuide.textAr,
    ).toBe('أضف البوابة إلى الشاشة الرئيسية.');
    expect(audit?.n).toBe(2);
  });
});
