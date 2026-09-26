import { parsePoundsToPence } from '../../../shared/core/parse-pounds';
import { todayInLondon } from '../../app/language/today-in-london';
import type { MoneyEntryFormDraft } from './money-entry-fields';
import type { MoneyEntryDraft } from './use-record-money-entry';

/** A new credit or debit's form: into this account, dated today (D-121). */
export function emptyMoneyEntry(accountId: string): MoneyEntryFormDraft {
  return {
    accountId,
    amount: '',
    entryDate: todayInLondon(),
    counterparty: '',
    description: '',
    budgetLineId: '',
  };
}

/** The form as the entry to save — the amount in pence (9.1) — or null while the amount can't be read. */
export function moneyEntryOf(draft: MoneyEntryFormDraft): MoneyEntryDraft | null {
  const amountPence = parsePoundsToPence(draft.amount);
  if (amountPence === null) return null;
  return {
    accountId: draft.accountId,
    amountPence,
    entryDate: draft.entryDate,
    counterparty: draft.counterparty,
    description: draft.description,
    budgetLineId: draft.budgetLineId || null,
  };
}
