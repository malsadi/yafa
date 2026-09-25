import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  insertPerson,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const PATH = `${ORIGIN}/api/administration-panel/texts`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69TXNV';

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
describe('texts (brief 25 C5, 13; D-016, D-022, D-083)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'TX1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    officer = await seedOfficer({ suffix: 'TX2' });
    for (const person of [admin, officer]) await acknowledgeNotice(person.personId, NOTICE);
    // Signed in, but with no current term: access is not active (brief 6.2).
    await insertPerson(env.DB, {
      id: 'p-tx-inactive',
      email: 'tx3@example.org',
      clerkUserId: 'clerk_tx3',
    });
  });

  it('keeps the texts to those who may write them, and 404s a text not yet written', async () => {
    expect((await call(officer.clerkUserId, 'GET')).status).toBe(403);
    expect(
      await (await call(officer.clerkUserId, 'GET', `${ORIGIN}/api/texts/help`)).json(),
    ).toEqual({
      error: { code: 'texts.not-written' },
    });
  });

  it('writes the "access not active" message and help text, read by the right people', async () => {
    await call(admin.clerkUserId, 'PUT', `${PATH}/access-not-active`, {
      textEn: 'Ask your branch register officer.',
      textAr: null,
    });
    await call(admin.clerkUserId, 'PUT', `${PATH}/help`, { textEn: 'Help.', textAr: 'مساعدة.' });

    expect(
      await (await call('clerk_tx3', 'GET', `${ORIGIN}/api/texts/access-not-active`)).json(),
    ).toEqual({
      key: 'access-not-active',
      textEn: 'Ask your branch register officer.',
      textAr: null,
    });
    expect((await call('clerk_tx3', 'GET', `${ORIGIN}/api/texts/help`)).status).toBe(404);
    expect(
      await (await call(officer.clerkUserId, 'GET', `${ORIGIN}/api/texts/help`)).json(),
    ).toMatchObject({
      textAr: 'مساعدة.',
    });
    expect(
      (
        await call(admin.clerkUserId, 'PUT', `${PATH}/iphone-install-guide`, {
          textEn: 'x',
          textAr: null,
        })
      ).status,
    ).toBe(400);
  });

  it('publishes a new privacy notice version, which every officer reads again (D-016)', async () => {
    const published = await call(admin.clerkUserId, 'POST', `${PATH}/privacy-notice`, {
      textEn:
        'Clerk holds identity data in the United States; the portal’s data is held in the EU.',
      textAr: '',
    });
    const { id } = await published.json<{ id: string }>();
    const me = await (
      await call(officer.clerkUserId, 'GET', `${ORIGIN}/api/me`)
    ).json<{
      status: string;
    }>();

    expect(published.status).toBe(201);
    expect(me.status).toBe('notice-not-acknowledged');
    // D-027: administrators read the new version too before going on.
    expect((await call(admin.clerkUserId, 'GET')).status).toBe(403);
    await acknowledgeNotice(admin.personId, id);
    const view = await (
      await call(admin.clerkUserId, 'GET')
    ).json<{
      privacyNotice: { id: string; textAr: string | null }[];
    }>();
    expect(view.privacyNotice.map((v) => v.id)).toEqual([id, NOTICE]);
    expect(view.privacyNotice[0]?.textAr).toBeNull();
  });
});
