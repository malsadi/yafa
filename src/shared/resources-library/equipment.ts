/** D-109: what each entry in a loan's history records. */
export const LOAN_CHANGES = ['lent', 'corrected', 'returned'] as const;
export type LoanChange = (typeof LOAN_CHANGES)[number];

/** Brief 16 C2, P20 and D-099: a loan's details — borrower in free text, dates as `YYYY-MM-DD`. */
export interface LoanDetails {
  borrower: string;
  quantity: number;
  borrowedOn: string;
  /** P20's "return date": when it is due back (D-099). */
  dueBack: string;
}

/** D-109: one state of a loan, in order. */
export interface LoanHistoryEntry extends LoanDetails {
  change: LoanChange;
  returnedOn: string | null;
  recordedByName: string | null;
  recordedAt: string;
}

export interface LoanRecord extends LoanDetails {
  id: string;
  equipmentId: string;
  /** The date it came back, closing the loan (D-099); fixed from then on (D-109). */
  returnedOn: string | null;
  version: number;
  history: LoanHistoryEntry[];
}

/** Brief 16 C1: an item, where it is kept and its condition (15 B3's list). */
export interface EquipmentDetails {
  item: string;
  quantity: number;
  location: string;
  conditionId: string;
}

export interface EquipmentRecord extends EquipmentDetails {
  id: string;
  unitId: string;
  /** The General Council's, shared with every branch (D-106). */
  national: boolean;
  conditionNameEn: string;
  conditionNameAr: string;
  retiredAt: string | null;
  version: number;
  /** How many are out on loan now (D-099). */
  outOnLoan: number;
  /** The item's loans — for its own unit's officers only (O-059). */
  loans: LoanRecord[] | null;
}

export interface EquipmentView {
  items: EquipmentRecord[];
  /** The conditions offered for new records (15 B3). */
  conditions: { id: string; nameEn: string; nameAr: string }[];
}
