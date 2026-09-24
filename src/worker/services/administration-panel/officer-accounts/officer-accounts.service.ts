import {
  AccountState,
  type OfficerAccount,
} from '../../../../shared/administration-panel/account-state';
import type { ClerkAccounts } from '../../../clerk';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { can, type RequestContext } from '../../../core/permissions';
import {
  listAccountStates,
  lockAccount,
  removePushDevices,
  sendInvitation,
  signOutEverywhere,
  unlockAccount,
} from '../../committee-register';

const CAPABILITY = 'administration-panel.officer-accounts.manage';

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

/** Brief 25 A2: every person, with their account state. */
export async function listOfficerAccounts(
  db: D1Database,
  ctx: RequestContext,
): Promise<OfficerAccount[]> {
  await requireCapability(db, ctx);
  return listAccountStates(db);
}

/** Brief 25 A2: resend a person's invitation, unless they already have an account. */
export async function resendInvitation(
  db: D1Database,
  clerk: ClerkAccounts,
  ctx: RequestContext,
  personId: string,
): Promise<{ invitation: 'sent' | 'failed' }> {
  await requireCapability(db, ctx);
  const account = (await listAccountStates(db)).find((a) => a.personId === personId);
  if (!account) {
    throw new NotFoundError('officer-accounts.not-found');
  }
  if (account.state === AccountState.Active || account.state === AccountState.Locked) {
    throw new ConflictError('officer-accounts.already-has-account');
  }
  return { invitation: await sendInvitation(db, clerk, { personId, actorPersonId: ctx.personId }) };
}

export type AccountAction = 'lock' | 'unlock' | 'sign-out' | 'remove-push-devices';

/** Brief 25 A2: lock or unlock, sign out of all sessions, remove push devices. */
export async function runAccountAction(
  db: D1Database,
  clerk: ClerkAccounts,
  ctx: RequestContext,
  params: { personId: string; action: AccountAction },
): Promise<void> {
  await requireCapability(db, ctx);
  const target = { personId: params.personId, actorPersonId: ctx.personId };
  const actions: Record<AccountAction, () => Promise<void>> = {
    lock: () => lockAccount(db, clerk, target),
    unlock: () => unlockAccount(db, clerk, target),
    'sign-out': () => signOutEverywhere(db, clerk, target),
    'remove-push-devices': () => removePushDevices(db, target),
  };
  await actions[params.action]();
}
