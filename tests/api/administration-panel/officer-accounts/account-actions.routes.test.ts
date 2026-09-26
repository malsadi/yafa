import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import { RoleDesignation } from '../../../../src/shared/committee-register/role-designation';
import { getTodayInLondon } from '../../../../src/worker/core/permissions';
import { setSetting } from '../../../../src/worker/core/settings';
import {
  insertRole,
  insertSystemAdministrator,
  insertTerm,
} from '../../../core/permissions/permission-fixtures';
import {
  acknowledgeNotice,
  buildTestApp,
  fakeClerk,
  insertNoticeVersion,
  ORIGIN,
  seedOfficer,
} from '../../../app/app-fixtures';

const NOTICE = '01ARZ3NDEKTSV4RRFFQ69AANV';
const ACCOUNTS = `${ORIGIN}/api/administration-panel/officer-accounts`;
const clerk = fakeClerk();

let admin: { clerkUserId: string; personId: string };
let bro: { clerkUserId: string; personId: string; unitId: string };
let member: { clerkUserId: string; personId: string; unitId: string };

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

const act = (personId: string, action: string) =>
  call(admin.clerkUserId, 'POST', `${ACCOUNTS}/${personId}/${action}`);

// Tests build on each other in order within this file's shared storage.
describe('account actions (brief 25 A2, 6.2; T-087)', () => {
  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    admin = await seedOfficer({ suffix: 'AA1', unitType: 'national' });
    await insertSystemAdministrator(env.DB, admin.personId);
    bro = await seedOfficer({ suffix: 'AA2', designation: RoleDesignation.BranchRegisterOfficer });
    member = await seedOfficer({ suffix: 'AA3' });
    for (const person of [admin, bro, member]) await acknowledgeNotice(person.personId, NOTICE);
  });

  it('locks an account in Clerk and in the portal, which refuses it at once', async () => {
    expect((await act(member.personId, 'lock')).status).toBe(204);

    expect(clerk.calls).toContain(`lock ${member.clerkUserId}`);
    const me = await (
      await call(member.clerkUserId, 'GET', `${ORIGIN}/api/me`)
    ).json<{ status: string }>();
    expect(me.status).toBe('not-active');
    expect((await act(member.personId, 'lock')).status).toBe(409);
  });

  it('unlocks it again', async () => {
    expect((await act(member.personId, 'unlock')).status).toBe(204);

    const me = await (
      await call(member.clerkUserId, 'GET', `${ORIGIN}/api/me`)
    ).json<{ status: string }>();
    expect(me.status).toBe('active');
  });

  it('signs out everywhere and removes push devices', async () => {
    await env.DB.prepare(
      "INSERT INTO push_subscriptions (id, person_id, endpoint, p256dh, auth, created_at) VALUES ('ps1', ?, 'https://push.example/1', 'k', 'a', 'now')",
    )
      .bind(member.personId)
      .run();

    expect((await act(member.personId, 'sign-out')).status).toBe(204);
    expect((await act(member.personId, 'remove-push-devices')).status).toBe(204);
    expect(clerk.calls).toContain(`sign-out ${member.clerkUserId}`);
    const left = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM push_subscriptions WHERE person_id = ?',
    )
      .bind(member.personId)
      .first<{ n: number }>();
    expect(left?.n).toBe(0);
  });

  it("revokes an officer's calendar feed token (6.4)", async () => {
    await env.DB.prepare(
      `INSERT INTO calendar_feed_tokens (person_id, token_hash, created_at) VALUES (?, ?, 'now')`,
    )
      .bind(member.personId, 'a'.repeat(64))
      .run();
    expect((await act(member.personId, 'revoke-calendar-feed')).status).toBe(204);
    const left = await env.DB.prepare(
      'SELECT COUNT(*) AS n FROM calendar_feed_tokens WHERE person_id = ?',
    )
      .bind(member.personId)
      .first<{ n: number }>();
    expect(left?.n).toBe(0);
  });

  it('records nothing when Clerk fails, and says so', async () => {
    clerk.failNext();

    const res = await act(member.personId, 'lock');

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: { code: 'clerk.unavailable' } });
    const me = await (
      await call(member.clerkUserId, 'GET', `${ORIGIN}/api/me`)
    ).json<{ status: string }>();
    expect(me.status).toBe('active');
  });

  it('refuses the actions to an officer without the capability', async () => {
    expect(
      (await call(bro.clerkUserId, 'POST', `${ACCOUNTS}/${member.personId}/lock`)).status,
    ).toBe(403);
  });

  it('locks automatically when the last term ends, only once the administrator has said so', async () => {
    const termPath = (termId: string) => `${ORIGIN}/api/committee-register/terms/${termId}`;
    const role = '01ARZ3NDEKTSV4RRFFQ69AARX';
    await insertRole(env.DB, { id: role, name: 'Extra role' });
    await insertTerm(env.DB, {
      id: 'aa-term-2',
      personId: member.personId,
      roleId: role,
      unitId: bro.unitId,
      startDate: '2026-01-01',
    });
    await env.DB.prepare('UPDATE terms SET unit_id = ? WHERE person_id = ?')
      .bind(bro.unitId, member.personId)
      .run();
    const today = getTodayInLondon();

    const unset = await (
      await call(bro.clerkUserId, 'PATCH', termPath('01ARZ3NDEKTSV4RRFFQ69ATAA3'), {
        endDate: today,
      })
    ).json();
    expect(unset).toEqual({ accountLocked: false });

    await buildTestApp({}, clerk);
    await setSetting(env.DB, {
      key: 'committee-register.lock_account_when_last_term_ends',
      value: true,
      actorPersonId: admin.personId,
    });
    const last = await (
      await call(bro.clerkUserId, 'PATCH', termPath('aa-term-2'), { endDate: today })
    ).json();
    expect(last).toEqual({ accountLocked: true });
  });
});
