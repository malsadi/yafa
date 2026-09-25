import type { SeedUnit } from './check-units.ts';
import type { SeedRole } from './check-roles.ts';
import { isSeedDate } from './seed-dates.ts';
import { emptyToNull, type SeedTable } from './seed-table.ts';

export const PEOPLE_COLUMNS = [
  'email',
  'name',
  'phone',
  'system_administrator',
  'role',
  'unit_code',
  'start_date',
  'end_date',
] as const;

export interface SeedTerm {
  email: string;
  name: string;
  phone: string;
  systemAdministrator: boolean;
  roleNameEn: string;
  unitCode: string;
  startDate: string;
  endDate: string | null;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function toTerm(v: Record<string, string>): SeedTerm {
  return {
    email: (v.email ?? '').toLowerCase(),
    name: v.name ?? '',
    phone: v.phone ?? '',
    systemAdministrator: v.system_administrator === 'yes',
    roleNameEn: v.role ?? '',
    unitCode: v.unit_code ?? '',
    startDate: v.start_date ?? '',
    endDate: emptyToNull(v.end_date),
  };
}

function checkRow(
  where: string,
  v: Record<string, string>,
  refs: { units: SeedUnit[]; roles: SeedRole[] },
  errors: string[],
) {
  if (!EMAIL.test(v.email ?? '')) errors.push(`${where}: email is not an email address.`);
  if (!v.name || !v.phone) errors.push(`${where}: name and phone are required.`);
  if (v.system_administrator !== 'yes' && v.system_administrator !== 'no')
    errors.push(`${where}: system_administrator must be yes or no.`);
  if (!refs.roles.some((r) => r.nameEn === v.role))
    errors.push(`${where}: role ${v.role ?? ''} is not a name_en in roles.csv.`);
  const unit = refs.units.find((u) => u.code === v.unit_code);
  if (!unit) errors.push(`${where}: unit_code ${v.unit_code ?? ''} is not a code in units.csv.`);
  if (unit?.status === 'inactive')
    errors.push(`${where}: unit ${unit.code} is inactive, so its register is read-only (P4).`);
  if (!isSeedDate(v.start_date ?? ''))
    errors.push(`${where}: start_date must be a date written YYYY-MM-DD.`);
  if (v.end_date && !isSeedDate(v.end_date))
    errors.push(`${where}: end_date must be empty or a date written YYYY-MM-DD.`);
  if (v.end_date && v.start_date && v.end_date <= v.start_date)
    errors.push(`${where}: end_date must come after start_date.`);
}

function checkSamePerson(
  where: string,
  term: SeedTerm,
  first: SeedTerm | undefined,
  errors: string[],
) {
  if (!first) return;
  if (
    first.name !== term.name ||
    first.phone !== term.phone ||
    first.systemAdministrator !== term.systemAdministrator
  ) {
    errors.push(
      `${where}: ${term.email} must have the same name, phone and system_administrator on every row.`,
    );
  }
}

/** docs/seed-files.md section 3, row by row: valid values, known roles and units, one person per email. */
export function checkPeople(
  table: SeedTable,
  refs: { units: SeedUnit[]; roles: SeedRole[] },
  errors: string[],
): SeedTerm[] {
  const terms: SeedTerm[] = [];
  for (const { line, values } of table.rows) {
    const where = `${table.file} row ${String(line)}`;
    checkRow(where, values, refs, errors);
    const term = toTerm(values);
    checkSamePerson(
      where,
      term,
      terms.find((t) => t.email === term.email),
      errors,
    );
    if (
      terms.some(
        (t) =>
          t.email === term.email &&
          t.roleNameEn === term.roleNameEn &&
          t.unitCode === term.unitCode,
      )
    ) {
      errors.push(
        `${where}: ${term.email} already holds ${term.roleNameEn} in ${term.unitCode} (P5: once per role).`,
      );
    }
    terms.push(term);
  }
  return terms;
}
