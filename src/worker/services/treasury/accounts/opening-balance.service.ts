import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { requireEntryDate } from '../entries/entry-dates';
import { requireTreasuryWriter } from '../treasury-access';
import { buildOpeningBalanceStatement, findAccount } from './accounts.repo';
import type { OpeningBalance } from './accounts.schema';

/**
 * D-217 (O-166): an imported branch account arrives with no opening
 * balance; the treasurer, who knows the real figure, enters it — once, on
 * an open account, dated as any entry may be (D-122). Otherwise D-119
 * stands: an account opened on screen has its opening balance already.
 */
export async function enterOpeningBalance(
  db: D1Database,
  ctx: RequestContext,
  params: OpeningBalance & { unitId: string; accountId: string },
): Promise<void> {
  await requireTreasuryWriter(db, ctx, 'treasury.accounts.manage', params.unitId);
  const account = await findAccount(db, params.accountId);
  if (account?.unitId !== params.unitId || account.kind !== 'branch')
    throw new NotFoundError('treasury.account-not-found');
  if (account.status !== 'Open') throw new ConflictError('treasury.account-closed');
  if (account.hasOpeningBalance) throw new ConflictError('treasury.opening-balance-entered');
  await requireEntryDate(db, params.unitId, params.openingDate);
  const at = new Date().toISOString();
  await db.batch([
    buildOpeningBalanceStatement(db, {
      accountId: account.id,
      unitId: params.unitId,
      pence: params.openingBalancePence,
      date: params.openingDate,
      actor: ctx.personId,
      at,
    }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-account.opening-balance-entered',
      entityType: 'treasury-account',
      entityId: account.id,
      after: { openingBalancePence: params.openingBalancePence, openingDate: params.openingDate },
    }),
  ]);
}
