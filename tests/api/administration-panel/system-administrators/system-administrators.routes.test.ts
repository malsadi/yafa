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

const PATH = `${ORIGIN}/api/administration-panel/system-administrators`;
const NOTICE = '01ARZ3NDEKTSV4RRFFQ69SANV';

async function activeOfficer(suffix: string, unitType: 'national' | 'branch', admin = false) {
  const officer = await seedOfficer({ suffix, unitType });
  await acknowledgeNotice(officer.personId, NOTICE);
  if (admin) await insertSystemAdministrator(env.DB, officer.personId);
  return officer;
}

async function call(
  clerkUserId: string,
  method: string,
  path = PATH,
  body?: unknown,
  secondFactor = true,
) {
  const { app, tokenFor } = await buildTestApp();
  return app.request(path, {
    method,
    headers: {
      Authorization: `Bearer ${await tokenFor(clerkUserId, { secondFactor })}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function auditCount(action: string, personId: string): Promise<number> {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS n FROM audit_log WHERE action = ? AND entity_id = ?',
  )
    .bind(action, personId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

// One file's D1 storage is shared across its tests, so they build on each
// other in order: two administrators, then a third, then removals.
describe('system administrators (brief 25 A1, P21, D-046)', () => {
  let adminA: Awaited<ReturnType<typeof activeOfficer>>;
  let adminB: Awaited<ReturnType<typeof activeOfficer>>;
  let third: Awaited<ReturnType<typeof activeOfficer>>;
  const candidateIds = async () =>
    (
      await (
        await call(adminA.clerkUserId, 'GET', `${PATH}/candidates`)
      ).json<{ personId: string }[]>()
    ).map((c) => c.personId);

  beforeAll(async () => {
    await insertNoticeVersion(NOTICE, '2026-01-01T00:00:00.000Z');
    adminA = await activeOfficer('SA1', 'national', true);
    adminB = await activeOfficer('SA2', 'national', true);
  });

  it('lists the system administrators for a system administrator', async () => {
    const res = await call(adminA.clerkUserId, 'GET');
    const list = await res.json<{ personId: string }[]>();

    expect(res.status).toBe(200);
    expect(list.map((a) => a.personId)).toEqual([adminA.personId, adminB.personId]);
  });

  it('refuses a system administrator whose session had no second factor (brief 6.3)', async () => {
    const res = await call(adminA.clerkUserId, 'GET', PATH, undefined, false);

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: { code: 'session.second-factor-required' } });
  });

  it('refuses every action to an officer without the capability', async () => {
    const officer = await activeOfficer('SA3', 'branch');

    expect((await call(officer.clerkUserId, 'GET')).status).toBe(403);
    expect(
      (await call(officer.clerkUserId, 'POST', PATH, { personId: officer.personId })).status,
    ).toBe(403);
    expect((await call(officer.clerkUserId, 'DELETE', `${PATH}/${adminA.personId}`)).status).toBe(
      403,
    );
  });

  it('refuses someone with no current General Council term', async () => {
    const branchOfficer = await activeOfficer('SA4', 'branch');

    const res = await call(adminA.clerkUserId, 'POST', PATH, { personId: branchOfficer.personId });

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({
      error: { code: 'system-administrators.needs-general-council-term' },
    });
  });

  it('refuses to remove one of the last two (P21)', async () => {
    const res = await call(adminA.clerkUserId, 'DELETE', `${PATH}/${adminB.personId}`);

    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: { code: 'system-administrators.minimum-two' } });
  });

  it('offers as candidates only General Council officers not yet administrators', async () => {
    third = await activeOfficer('SA5', 'national');

    expect(await candidateIds()).toEqual([third.personId]);
  });

  it('appoints a General Council officer, once, and records it', async () => {
    const first = await call(adminA.clerkUserId, 'POST', PATH, { personId: third.personId });
    const again = await call(adminA.clerkUserId, 'POST', PATH, { personId: third.personId });

    expect(first.status).toBe(201);
    expect(again.status).toBe(409);
    expect(await auditCount('system-administrator.appointed', third.personId)).toBe(1);
    expect(await candidateIds()).toEqual([]);
  });

  it('removes one while more than two remain, and records it', async () => {
    const res = await call(adminA.clerkUserId, 'DELETE', `${PATH}/${adminB.personId}`);

    expect(res.status).toBe(204);
    expect(await auditCount('system-administrator.removed', adminB.personId)).toBe(1);
  });

  it('is backed by the database: a direct delete of one of the last two is refused', async () => {
    await expect(
      env.DB.prepare('DELETE FROM system_administrators WHERE person_id = ?')
        .bind(adminA.personId)
        .run(),
    ).rejects.toThrow(/P21/);
  });
});
