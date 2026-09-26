/** Brief 17: an account's status — Open → Closed. */
export const ACCOUNT_STATUSES = ['Open', 'Closed'] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/** Brief 17 A1, A2: branch accounts, and event accounts made by the Event organiser. */
export const ACCOUNT_KINDS = ['branch', 'event'] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/** D-117: a branch account is a bank or a cash account. */
export const BRANCH_ACCOUNT_TYPES = ['bank', 'cash'] as const;
export type BranchAccountType = (typeof BRANCH_ACCOUNT_TYPES)[number];

/** Brief 17 B1 to B3, P6: what an entry records. A reversal (B6) is one of these, undoing another. */
export const ENTRY_TYPES = ['opening-balance', 'credit', 'debit', 'transfer'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

/**
 * P7 and D-122: whether an entry counts towards balances. One that needs no
 * approval counts at once; one above the threshold waits for a second officer.
 */
export const APPROVAL_STATUSES = [
  'Not needed',
  'Awaiting approval',
  'Approved',
  'Declined',
] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

/** The statuses whose entries count towards a balance (P7). */
export const COUNTED_STATUSES: readonly ApprovalStatus[] = ['Not needed', 'Approved'];
