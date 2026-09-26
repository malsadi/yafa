import type {
  AccountHistory,
  BudgetLineRecord,
} from '../../../../shared/treasury/treasury-records';
import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { findAccount } from '../accounts/accounts.repo';
import { listReceiptsOf } from '../receipts/receipts.repo';
import { requireTreasuryCapability } from '../treasury-access';
import { listEntriesOfAccount } from './entry-history.repo';

/** Brief 17 B, C1 and P10: one of the unit's accounts, its balance, its entries in a period, and its budget lines. */
export async function accountHistory(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; accountId: string; from?: string; to?: string },
): Promise<AccountHistory> {
  await requireTreasuryCapability(db, ctx, 'treasury.accounts.read', params.unitId);
  const account = await findAccount(db, params.accountId);
  if (account?.unitId !== params.unitId) throw new NotFoundError('treasury.account-not-found');
  const rows = await listEntriesOfAccount(db, params);
  const receipts = await listReceiptsOf(
    db,
    rows.map((row) => row.id),
  );
  const entries = rows.map((row) => ({
    ...row,
    receipts: receipts
      .filter((r) => r.entryId === row.id)
      .map(({ id, fileName }) => ({ id, fileName })),
  }));
  const lines = await db
    .prepare(
      'SELECT id, name, amount_pence AS amountPence FROM treasury_budget_lines WHERE account_id = ? ORDER BY position',
    )
    .bind(account.id)
    .all<BudgetLineRecord>();
  return { account, entries, budgetLines: lines.results };
}
