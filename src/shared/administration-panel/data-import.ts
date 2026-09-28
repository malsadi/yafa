/** Brief 25 D4 and D-217 (O-164 to O-166): the CSV files an import reads; any may be left out. */
export interface ImportFiles {
  units: string | null;
  people: string | null;
  accounts: string | null;
}

/** What an import would add, what is already there and left alone, and what stops it. */
export interface ImportReport {
  /** Every problem, by file and row; while any remain, nothing is imported. */
  errors: string[];
  units: { added: string[]; present: string[] };
  people: { added: string[]; present: string[] };
  terms: { added: number; present: number };
  accounts: { added: string[]; present: string[] };
}

/** D-217 (O-164): the columns each file has, in order — the seed files' own. */
export const IMPORT_COLUMNS = {
  units: ['type', 'code', 'name_en', 'name_ar', 'area', 'status'],
  people: [
    'email',
    'name',
    'phone',
    'system_administrator',
    'role',
    'unit_code',
    'start_date',
    'end_date',
  ],
  accounts: ['unit_code', 'name', 'account_type'],
} as const;
