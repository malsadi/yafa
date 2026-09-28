import type { ImportReport } from '../../../../shared/administration-panel/data-import';
import { generateId } from '../../../core/ids';
import type { ExistingRecords } from './import-existing';
import type { ImportPlan } from './import-plan';
import { blankToNull, type ImportRow } from './import-table';

// The same rule the branches API applies: the code goes into letter references.
const CODE = /^[A-Za-z0-9-]+$/;

function problemsOf(v: Record<string, string>): string[] {
  const problems: string[] = [];
  if (v.type !== 'national' && v.type !== 'branch')
    problems.push('type must be national or branch');
  if (!v.code || !CODE.test(v.code)) problems.push('code must be letters, digits and hyphens');
  if (!v.name_en || !v.name_ar) problems.push('name_en and name_ar are required');
  if (v.type === 'branch' && !v.area) problems.push('a branch needs its area');
  if (v.status !== 'active' && v.status !== 'inactive')
    problems.push('status must be active or inactive');
  return problems;
}

/**
 * Brief 25 D4 and O-165: the units file — a unit is matched by its code and
 * left alone if it is there; a new branch is added. The General Council
 * already exists (the seed), so a new national unit is refused.
 */
export function checkImportUnits(
  rows: ImportRow[],
  existing: ExistingRecords,
  report: ImportReport,
): { plan: ImportPlan['units']; codes: Map<string, string> } {
  const plan: ImportPlan['units'] = [];
  const codes = new Map([...existing.units].map(([code, u]) => [code, u.id]));
  for (const { line, values: v } of rows) {
    const where = `units.csv row ${String(line)}`;
    const problems = problemsOf(v);
    if (problems.length) {
      report.errors.push(`${where}: ${problems.join('; ')}.`);
      continue;
    }
    const code = v.code ?? '';
    if (existing.units.has(code)) {
      report.units.present.push(code);
    } else if (plan.some((u) => u.code === code)) {
      report.errors.push(`${where}: code ${code} is used twice.`);
    } else if (v.type === 'national') {
      report.errors.push(
        `${where}: the General Council already exists; another national unit cannot be added.`,
      );
    } else {
      const id = generateId();
      const status = v.status === 'inactive' ? 'inactive' : 'active';
      plan.push({
        id,
        code,
        nameEn: v.name_en ?? '',
        nameAr: v.name_ar ?? '',
        area: blankToNull(v.area),
        status,
      });
      codes.set(code, id);
      report.units.added.push(code);
    }
  }
  return { plan, codes };
}
