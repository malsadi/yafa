import type { AccountRecord, TreasuryWarning } from '../../../../shared/treasury/treasury-records';
import type { ApprovalStatus } from '../../../../shared/treasury/treasury-statuses';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { findAccount } from '../accounts/accounts.repo';
import { approvalThreshold } from '../treasury-settings';

/** One of the unit's open accounts (a trigger also refuses the rest). */
export async function requireOpenAccount(
  db: D1Database,
  unitId: string,
  accountId: string,
): Promise<AccountRecord> {
  const account = await findAccount(db, accountId);
  if (account?.unitId !== unitId) throw new NotFoundError('treasury.account-not-found');
  if (account.status === 'Closed') throw new ConflictError('treasury.account-closed');
  return account;
}

/** P10: only an event account's entries are tagged, and only to its own budget lines. */
export async function requireBudgetLine(
  db: D1Database,
  account: AccountRecord,
  lineId: string | null,
): Promise<void> {
  if (lineId === null) return;
  const line = await db
    .prepare('SELECT id FROM treasury_budget_lines WHERE id = ? AND account_id = ?')
    .bind(lineId, account.id)
    .first<{ id: string }>();
  if (account.kind !== 'event' || !line)
    throw new ConflictError('treasury.budget-line-not-of-account');
}

/** Brief 17 B5, P7 and D-122: a debit or transfer above the unit's threshold waits for a second officer. */
export async function approvalFor(
  db: D1Database,
  unitId: string,
  amountPence: number,
): Promise<ApprovalStatus> {
  return amountPence > (await approvalThreshold(db, unitId)) ? 'Awaiting approval' : 'Not needed';
}

/** D-120: an account now below zero is allowed, with a clear warning. */
export async function belowZeroWarnings(
  db: D1Database,
  accountIds: string[],
): Promise<TreasuryWarning[]> {
  const warnings: TreasuryWarning[] = [];
  for (const accountId of accountIds) {
    const account = await findAccount(db, accountId);
    if (account && account.balancePence < 0) {
      warnings.push({ code: 'below-zero', accountId, balancePence: account.balancePence });
    }
  }
  return warnings;
}
