import type {
  AccountKind,
  AccountStatus,
  ApprovalStatus,
  BranchAccountType,
  EntryType,
} from './treasury-statuses';

/** Brief 17 A1, A2 and C1: an account and its live balance, in pence. */
export interface AccountRecord {
  id: string;
  unitId: string;
  kind: AccountKind;
  name: string;
  branchType: BranchAccountType | null;
  eventId: string | null;
  status: AccountStatus;
  balancePence: number;
  /** Debits and transfers touching it that await a second officer (P7, D-122). */
  awaitingCount: number;
  openedAt: string;
  /** The day it opened: its first entry's date — an opening balance may be dated earlier than it was recorded. */
  openedOn: string;
  closedAt: string | null;
}

/** Brief 17 C1 and D-127: every account, and the total of the unit's open ones. */
export interface AccountsView {
  accounts: AccountRecord[];
  unitTotalPence: number;
}

/** Brief 17 B4: a receipt photo of an entry. */
export interface ReceiptRecord {
  id: string;
  fileName: string;
}

/** Brief 17 B: one entry, as an account's history shows it. */
export interface EntryRecord {
  id: string;
  type: EntryType;
  accountId: string;
  toAccountId: string | null;
  amountPence: number;
  entryDate: string;
  counterparty: string | null;
  description: string | null;
  budgetLineId: string | null;
  approvalStatus: ApprovalStatus;
  /** The entry this one reverses (B6), and the one that reverses it, if any. */
  reversesEntryId: string | null;
  reversedByEntryId: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  decidedByName: string | null;
  decidedAt: string | null;
  declineReason: string | null;
  receipts: ReceiptRecord[];
}

/**
 * D-120 and brief 28: warnings that inform and never block — an account
 * below zero, a credit or debit saved without a receipt, an overspent event
 * brought to zero from the branch (D-131).
 */
export type TreasuryWarning =
  { code: 'below-zero'; accountId: string; balancePence: number } | { code: 'no-receipt' };

export interface SavedEntry {
  entryId: string;
  approvalStatus: ApprovalStatus;
  warnings: TreasuryWarning[];
}

/** Brief 17 C3 and D-128: a financial year, and whether and how it can be closed. */
export interface FinancialYearRecord {
  start: string;
  end: string;
  closed: boolean;
  closedAt: string | null;
  closedByName: string | null;
  /** Whether its last day has passed. */
  ended: boolean;
  /** Debits and transfers dated in it that await approval. */
  awaitingCount: number;
}

/** D-130: one account's figures for a financial year, in pence. */
export interface YearFigures {
  startBalancePence: number;
  openingBalancesPence: number;
  creditsPence: number;
  debitsPence: number;
  transfersInPence: number;
  transfersOutPence: number;
  endBalancePence: number;
}

/** Brief 17 build notes and D-130: a unit's Treasury year, for the annual report (Phase 11). */
export interface YearEndSummary {
  start: string;
  end: string;
  /** Whether the year is closed (P18: otherwise the report's figures are provisional). */
  closed: boolean;
  accounts: (YearFigures & { accountId: string; name: string; kind: 'branch' | 'event' })[];
  totals: YearFigures;
}

/** P10 and D-131: an event account's budget line. */
export interface BudgetLineRecord {
  id: string;
  name: string;
  amountPence: number;
}

/** Brief 17 B and C1: an account, its entries in a period, and its budget lines if an event account. */
export interface AccountHistory {
  account: AccountRecord;
  entries: EntryRecord[];
  budgetLines: BudgetLineRecord[];
}
