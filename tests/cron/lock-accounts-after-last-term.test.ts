import { env } from 'cloudflare:workers';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  getCronJobHandler,
  LOCK_ACCOUNTS_JOB,
  registerCronJobs,
  resetCronJobRegistryForTests,
} from '../../src/worker/cron';
import { getTodayInLondon } from '../../src/worker/core/permissions';
import { resetSettingsRegistryForTests, setSetting } from '../../src/worker/core/settings';
import {
  lockAccountsWhoseLastTermEnded,
  registerCommitteeRegisterSettings,
} from '../../src/worker/services/committee-register';
import { fakeClerk } from '../app/app-fixtures';
import {
  insertPerson,
  insertRole,
  insertTerm,
  insertUnit,
} from '../core/permissions/permission-fixtures';

const UNIT = 'lj-unit';
const ROLE = 'lj-role';

function shiftDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function person(
  id: string,
  terms: { start: string; end: string | null }[],
  linked = true,
): Promise<void> {
  await insertPerson(env.DB, {
    id,
    email: `${id}@example.org`,
    clerkUserId: linked ? `clerk_${id}` : undefined,
  });
  for (const [index, term] of terms.entries()) {
    await insertTerm(env.DB, {
      id: `${id}-t${String(index)}`,
      personId: id,
      roleId: ROLE,
      unitId: UNIT,
      startDate: term.start,
      endDate: term.end,
    });
  }
}

describe('daily lock of accounts whose last term has ended (brief 6.2, D-063)', () => {
  const today = getTodayInLondon();
  const yesterday = shiftDays(today, -1);

  beforeAll(async () => {
    resetSettingsRegistryForTests();
    registerCommitteeRegisterSettings();
    await insertUnit(env.DB, { id: UNIT, type: 'branch', code: 'lj', name: 'Fictional' });
    await insertRole(env.DB, { id: ROLE, name: 'Fictional role' });
    await person('ended', [{ start: '2025-01-01', end: yesterday }]);
    await person('starts-later', [
      { start: '2025-01-01', end: yesterday },
      { start: shiftDays(today, 30), end: null },
    ]);
    await person('serving', [{ start: '2025-01-01', end: null }]);
    await person('unlinked', [{ start: '2025-01-01', end: yesterday }], false);
    await person('already-locked', [{ start: '2025-01-01', end: yesterday }]);
    await env.DB.prepare(
      "UPDATE people SET account_locked_at = 'earlier' WHERE id = 'already-locked'",
    ).run();
  });

  it('locks nothing while the setting is unset', async () => {
    const clerk = fakeClerk();

    expect(await lockAccountsWhoseLastTermEnded(env.DB, clerk.accounts, 'job')).toBe(0);
    expect(clerk.calls).toEqual([]);
  });

  it('locks exactly the account whose last term has ended, once the setting is on', async () => {
    await setSetting(env.DB, {
      key: 'committee-register.lock_account_when_last_term_ends',
      value: true,
      actorPersonId: 'job',
    });
    const clerk = fakeClerk();

    expect(await lockAccountsWhoseLastTermEnded(env.DB, clerk.accounts, 'job')).toBe(1);
    expect(clerk.calls).toEqual(['lock clerk_ended']);
    const locked = await env.DB.prepare(
      "SELECT account_locked_at AS at FROM people WHERE id = 'ended'",
    ).first<{ at: string | null }>();
    expect(locked?.at).not.toBeNull();
  });

  it('is registered under the name the schedule maps to', () => {
    resetCronJobRegistryForTests();
    registerCronJobs();

    expect(getCronJobHandler(LOCK_ACCOUNTS_JOB)).toBeDefined();
    expect(Object.values(env.CRON_JOBS)).toContain(LOCK_ACCOUNTS_JOB);
  });
});
