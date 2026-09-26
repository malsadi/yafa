import type { EntryType } from './treasury-statuses';

/** Brief 17 C2 and D-128: one counted entry on a statement, and the balance after it. */
export interface StatementLine {
  entryId: string;
  entryDate: string;
  type: EntryType;
  /** Whether it undoes another entry (B6). */
  reversal: boolean;
  counterparty: string | null;
  description: string | null;
  /** The other account of a transfer, by name. */
  otherAccountName: string | null;
  inPence: number;
  outPence: number;
  balancePence: number;
}

/**
 * Brief 17 C2 and D-128: an account over a period — the balance at its
 * start, each entry that counts towards the balance, and the balance at
 * its end. Awaiting and declined entries are left out.
 */
export interface StatementData {
  accountId: string;
  accountName: string;
  from: string;
  to: string;
  openingBalancePence: number;
  lines: StatementLine[];
  closingBalancePence: number;
}
