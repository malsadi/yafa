import type { AccountRecord, EntryRecord } from '../../../../shared/treasury/treasury-records';
import { NotFoundError } from '../../../core/errors';
import type { RequestContext } from '../../../core/permissions';
import { findAccount } from '../accounts/accounts.repo';
import { listReceiptsOf } from '../receipts/receipts.repo';
import { requireTreasuryCapability } from '../treasury-access';
import { listEntriesOfAccount } from './entry-history.repo';

/** Brief 17 B and C1: one of the unit's accounts, its balance, and its entries in a period. */
export async function accountHistory(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; accountId: string; from?: string; to?: string },
): Promise<{ account: AccountRecord; entries: EntryRecord[] }> {
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
  return { account, entries };
}
