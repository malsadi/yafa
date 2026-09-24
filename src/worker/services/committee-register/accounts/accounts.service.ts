import type { ClerkAccounts } from '../../../clerk';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError, ServiceUnavailableError } from '../../../core/errors';
import { findCurrentTerms, getTodayInLondon } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import {
  buildRemovePushDevicesStatement,
  buildSetLockedStatement,
  findAccount,
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

/**
 * Brief 6.2 setting: lock the account when the person's last current term
 * has ended. Unset means no automatic lock (rule 5: the lock is the action
 * that waits). Only for an end already reached (T-087).
 */
export async function lockIfLastTermEnded(
  db: D1Database,
  clerk: ClerkAccounts,
  params: ActionParams,
): Promise<boolean> {
  const setting = await getSetting<boolean>(
    db,
    'committee-register.lock_account_when_last_term_ends',
  );
  if (setting.status !== 'configured' || !setting.value) return false;
  if ((await findCurrentTerms(db, params.personId, getTodayInLondon())).length > 0) return false;
  const account = await findAccount(db, params.personId);
  if (!account?.clerkUserId || account.accountLockedAt) return false;
  await lockAccount(db, clerk, params);
  return true;
}
