import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { setSetting } from '../../../../src/worker/core/settings';
import {
  insertRole,
  insertSystemAdministrator,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  fakeClerk,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69OANV';
const CHAIR = '01ARZ3NDEKTSV4RRFFQ69OARC';
const SECRETARY = '01ARZ3NDEKTSV4RRFFQ69OARS';
const ACCOUNTS = `${ORIGIN}/api/administration-panel/officer-accounts`;
const clerk = fakeClerk();

let admin: { clerkUserId: string; personId: string };
let bro: { clerkUserId: string; personId: string; unitId: string };

async function call(clerkUserId: string, method: string, path: string, body?: unknown) {
  const { app, tokenFor } = await buildTestApp({}, clerk);
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor: true })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const addOfficer = (email: string, roleId = CHAIR) =>
  call(bro.clerkUserId, 'POST', `${ORIGIN}/api/committee-register/units/${bro.unitId}/officers`, {
    name: 'Fictional Officer',
    email,
    phone: '07700 900321',
    roleId,
    startDate: '2026-02-01',
  });

async function stateOf(email: string): Promise<string | undefined> {
  const list = await (
    await call(admin.clerkUserId, 'GET', ACCOUNTS)
  ).json<{ email: string; state: string }[]>();
  return list.find((account) => account.email === email)?.state;
}

// Tests build on each other in order within this file's shared storage.
describe('invitations and officer accounts (brief 6.2, 25 A2; D-061)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    await insertRole(env.DB, { id: CHAIR, name: 'Chair' });
    await insertRole(env.DB, { id: SECRETARY, name: 'Secretary' });
    admin = await seedOfficer({ suffix: 'OA1', unitType: 'national' });
    await acknowledgeNotice(admin.personId, NOTICE);
    await insertSystemAdministrator(env.DB, admin.personId);
    bro = await seedOfficer({ suffix: 'OA2', designation: RoleDesignation.BranchRegisterOfficer });
    await acknowledgeNotice(bro.personId, NOTICE);
    await buildTestApp();
    await setSetting(env.DB, {
      key: 'administration-panel.new_officer_language',
      value: 'en',
      actorPersonId: admin.personId,
    });
  });

  it('invites a newly added officer once, and not again for a second term', async () => {
    const first = await (
      await addOfficer('lina.example@example.org')
    ).json<{ invitation: string }>();
    const second = await (
      await addOfficer('lina.example@example.org', SECRETARY)
    ).json<{ invitation: string }>();

    expect(first.invitation).toBe('sent');
    expect(second.invitation).toBe('not-needed');
    expect(clerk.invited).toEqual(['lina.example@example.org']);
    expect(await stateOf('lina.example@example.org')).toBe('Invited');
  });

  it('records a failed invitation, keeps the officer, and lets the administrator resend it', async () => {
    clerk.failNext();
    const added = await (
      await addOfficer('omar.example@example.org')
    ).json<{ personId: string; invitation: string }>();

    expect(added.invitation).toBe('failed');
    expect(await stateOf('omar.example@example.org')).toBe('Not invited');

    const resent = await call(
      admin.clerkUserId,
      'POST',
      `${ACCOUNTS}/${added.personId}/invitation`,
    );
    expect(await resent.json()).toEqual({ invitation: 'sent' });
    expect(await stateOf('omar.example@example.org')).toBe('Invited');
  });

  it('shows Active for a linked account, refuses to resend to it, and Not linked once Clerk deletes it', async () => {
    expect(await stateOf('OA2@example.org')).toBe('Active');
    expect(
      (await call(admin.clerkUserId, 'POST', `${ACCOUNTS}/${bro.personId}/invitation`)).status,
    ).toBe(409);

    await env.DB.prepare(
      "UPDATE people SET clerk_user_id = NULL, clerk_unlinked_at = '2026-09-24T12:00:00.000Z' WHERE id = ?",
    )
      .bind(bro.personId)
      .run();
    expect(await stateOf('OA2@example.org')).toBe('Not linked');
  });

  it('refuses the account screen to an officer without the capability', async () => {
    const officer = await seedOfficer({ suffix: 'OA3' });
    await acknowledgeNotice(officer.personId, NOTICE);

    expect((await call(officer.clerkUserId, 'GET', ACCOUNTS)).status).toBe(403);
    expect(
      (await call(officer.clerkUserId, 'POST', `${ACCOUNTS}/${officer.personId}/invitation`))
        .status,
    ).toBe(403);
  });

  it('keeps the invitation record as history', async () => {
    await expect(env.DB.prepare('DELETE FROM invitations').run()).rejects.toThrow(/append-only/);
    await expect(env.DB.prepare("UPDATE invitations SET status = 'sent'").run()).rejects.toThrow(
      /append-only/,
    );
  });
});
