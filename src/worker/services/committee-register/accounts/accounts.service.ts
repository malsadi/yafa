import type { ClerkAccounts } from '../../../clerk';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError, ServiceUnavailableError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import {
  buildRemovePushDevicesStatement,
  buildSetLockedStatement,
  findAccount,
  findAccountsWhoseLastTermEnded,
  type AccountRecord,
} from './accounts.repo';

interface ActionParams {
  personId: string;
  actorPersonId: string;
}

async function linkedAccount(
  db: D1Database,
  personId: string,
): Promise<AccountRecord & { clerkUserId: string }> {
  const account = await findAccount(db, personId);
  if (!account) throw new NotFoundError('officer-accounts.not-found');
  if (!account.clerkUserId) throw new ConflictError('officer-accounts.no-account');
  return { ...account, clerkUserId: account.clerkUserId };
}

/** Clerk first; only once it has acted does the portal record it (T-087). */
async function callClerk(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch {
    console.error('clerk account action failed');
    throw new ServiceUnavailableError('clerk.unavailable');
  }
}

function audit(db: D1Database, params: ActionParams, action: string): D1PreparedStatement {
  return buildAuditStatement(db, {
    actorPersonId: params.actorPersonId,
    action,
    entityType: 'person',
    entityId: params.personId,
  });
}

/** Brief 25 A2: lock an account. The portal also refuses it at once (T-087). */
export async function lockAccount(
  db: D1Database,
  clerk: ClerkAccounts,
  params: ActionParams,
): Promise<void> {
  const account = await linkedAccount(db, params.personId);
  if (account.accountLockedAt) throw new ConflictError('officer-accounts.already-locked');
  await callClerk(() => clerk.lock(account.clerkUserId));
  await db.batch([
    buildSetLockedStatement(db, params.personId, new Date().toISOString()),
    audit(db, params, 'account.locked'),
  ]);
}

export async function unlockAccount(
  db: D1Database,
  clerk: ClerkAccounts,
  params: ActionParams,
): Promise<void> {
  const account = await linkedAccount(db, params.personId);
  if (!account.accountLockedAt) throw new ConflictError('officer-accounts.not-locked');
  await callClerk(() => clerk.unlock(account.clerkUserId));
  await db.batch([
    buildSetLockedStatement(db, params.personId, null),
    audit(db, params, 'account.unlocked'),
  ]);
}

/** Brief 25 A2: sign out of all sessions. */
export async function signOutEverywhere(
  db: D1Database,
  clerk: ClerkAccounts,
  params: ActionParams,
): Promise<void> {
  const account = await linkedAccount(db, params.personId);
  await callClerk(() => clerk.signOutEverywhere(account.clerkUserId));
  await db.batch([audit(db, params, 'account.signed-out-everywhere')]);
}

/** Brief 25 A2: remove the person's phone devices (push subscriptions). */
export async function removePushDevices(db: D1Database, params: ActionParams): Promise<void> {
  if (!(await findAccount(db, params.personId)))
    throw new NotFoundError('officer-accounts.not-found');
  await db.batch([
    buildRemovePushDevicesStatement(db, params.personId),
    audit(db, params, 'account.push-devices-removed'),
  ]);
}

async function autoLockOn(db: D1Database): Promise<boolean> {
  const setting = await getSetting<boolean>(
    db,
    'committee-register.lock_account_when_last_term_ends',
  );
  return setting.status === 'configured' && setting.value;
}

/**
 * Brief 6.2 setting: lock the account when the person's last current term
 * has ended, as soon as an officer ends it with a date already reached.
 * Unset means no automatic lock (rule 5: the lock is the action that waits).
 */
export async function lockIfLastTermEnded(
  db: D1Database,
  clerk: ClerkAccounts,
  params: ActionParams,
): Promise<boolean> {
  if (!(await autoLockOn(db))) return false;
  const due = await findAccountsWhoseLastTermEnded(db, getTodayInLondon(), params.personId);
  if (due.length === 0) return false;
  await lockAccount(db, clerk, params);
  return true;
}

/**
 * D-063: the daily job. Locks every account whose last term has ended by
 * today, including terms ended earlier with a date that has now arrived.
 * Tries everyone, then reports a failure so the job's run records it.
 */
export async function lockAccountsWhoseLastTermEnded(
  db: D1Database,
  clerk: ClerkAccounts,
  actorPersonId: string,
): Promise<number> {
  if (!(await autoLockOn(db))) return 0;
  const due = await findAccountsWhoseLastTermEnded(db, getTodayInLondon());
  const results = await Promise.allSettled(
    due.map((personId) => lockAccount(db, clerk, { personId, actorPersonId })),
  );
  if (results.some((result) => result.status === 'rejected')) {
    throw new Error('some accounts could not be locked');
  }
  return due.length;
}
