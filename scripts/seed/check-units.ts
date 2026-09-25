import { emptyToNull, type SeedTable } from './seed-table.ts';

export const UNIT_COLUMNS = ['type', 'code', 'name_en', 'name_ar', 'area', 'status'] as const;

export interface SeedUnit {
  type: 'national' | 'branch';
  code: string;
  nameEn: string;
  nameAr: string;
  area: string | null;
  status: 'active' | 'inactive';
}

// Letters, digits and hyphens: the code goes into letter reference numbers
// (brief 14 A1), the same rule the branches API applies.
const CODE = /^[A-Za-z0-9-]+$/;

function checkUnit(where: string, v: Record<string, string>, errors: string[]): void {
  if (v.type !== 'national' && v.type !== 'branch')
    errors.push(`${where}: type must be national or branch.`);
  if (!CODE.test(v.code ?? '')) errors.push(`${where}: code must be letters, digits and hyphens.`);
  if (!v.name_en) errors.push(`${where}: name_en is required.`);
  if (!v.name_ar) errors.push(`${where}: name_ar is required.`);
  if (v.type === 'branch' && !v.area) errors.push(`${where}: a branch needs an area.`);
  if (v.type === 'national' && v.area) errors.push(`${where}: the national row has no area.`);
  if (v.status !== 'active' && v.status !== 'inactive')
    errors.push(`${where}: status must be active or inactive.`);
  if (v.type === 'national' && v.status !== 'active')
    errors.push(`${where}: the national row must be active.`);
}

/** docs/seed-files.md section 1: exactly one national unit, unique codes, every value valid. */
export function checkUnits(table: SeedTable, errors: string[]): SeedUnit[] {
  const seen = new Set<string>();
  for (const { line, values } of table.rows) {
    const where = `${table.file} row ${String(line)}`;
    checkUnit(where, values, errors);
    if (seen.has(values.code ?? ''))
      errors.push(`${where}: code ${values.code ?? ''} is used twice.`);
    seen.add(values.code ?? '');
  }
  const national = table.rows.filter((r) => r.values.type === 'national').length;
  if (national !== 1)
    errors.push(`${table.file}: there must be exactly one national row, not ${String(national)}.`);
  return table.rows.map(({ values: v }) => ({
    type: v.type === 'national' ? 'national' : 'branch',
    code: v.code ?? '',
    nameEn: v.name_en ?? '',
    nameAr: v.name_ar ?? '',
    area: emptyToNull(v.area),
    status: v.status === 'inactive' ? 'inactive' : 'active',
  }));
}
