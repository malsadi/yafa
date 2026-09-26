import type { AccountsView } from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireEntryDate } from '../entries/entry-dates';
import { requireTreasuryCapability, requireTreasuryWriter } from '../treasury-access';
import {
  buildCloseAccountStatement,
  buildOpenBranchAccountStatement,
  buildOpeningBalanceStatement,
  findAccount,
  listAccountsOf,
} from './accounts.repo';
import type { OpenBranchAccount } from './accounts.schema';

const READ = 'treasury.accounts.read';
const MANAGE = 'treasury.accounts.manage';

/** Brief 17 C1 and D-127: every account with its live balance, and the total of the open ones. */
export async function listAccounts(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<AccountsView> {
  await requireTreasuryCapability(db, ctx, READ, unitId);
  const accounts = await listAccountsOf(db, unitId);
  const unitTotalPence = accounts
    .filter((account) => account.status === 'Open')
    .reduce((total, account) => total + account.balancePence, 0);
  return { accounts, unitTotalPence };
}

/** Brief 17 A1, P6 and D-117, D-119: open a branch account with its opening balance, in one batch. */
export async function openBranchAccount(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: OpenBranchAccount,
): Promise<{ accountId: string }> {
  await requireTreasuryWriter(db, ctx, MANAGE, unitId);
  await requireEntryDate(db, unitId, input.openingDate);
  const at = new Date().toISOString();
  const accountId = generateId();
  await db.batch([
    buildOpenBranchAccountStatement(db, {
      id: accountId,
      unitId,
      name: input.name,
      branchType: input.branchType,
      actor: ctx.personId,
      at,
    }),
    buildOpeningBalanceStatement(db, {
      accountId,
      unitId,
      pence: input.openingBalancePence,
      date: input.openingDate,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-account.opened',
      entityType: 'treasury-account',
      entityId: accountId,
      after: input,
    }),
  ]);
  return { accountId };
}

/**
 * D-118: close a branch account at a zero balance with nothing awaiting
 * approval. Event accounts are closed through the Event organiser only (17).
 */
export async function closeBranchAccount(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; accountId: string },
): Promise<void> {
  await requireTreasuryWriter(db, ctx, MANAGE, params.unitId);
  const account = await findAccount(db, params.accountId);
  if (account?.unitId !== params.unitId) throw new NotFoundError('treasury.account-not-found');
  if (account.kind === 'event')
    throw new ConflictError('treasury.event-account-by-event-organiser');
  if (account.status === 'Closed') throw new ConflictError('treasury.account-closed');
  if (account.balancePence !== 0 || account.awaitingCount > 0) {
    throw new ConflictError('treasury.not-zero', {
      balance: account.balancePence,
      awaiting: account.awaitingCount,
    });
  }
  await db.batch([
    buildCloseAccountStatement(db, {
      accountId: account.id,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-account.closed',
      entityType: 'treasury-account',
      entityId: account.id,
      before: account,
    }),
  ]);
}
