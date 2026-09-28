import type { ImportReport } from '../../../../shared/administration-panel/data-import';
import { BRANCH_ACCOUNT_TYPES } from '../../../../shared/treasury/treasury-statuses';
import { generateId } from '../../../core/ids';
import { accountKey, type ExistingRecords } from './import-existing';
import type { ImportPlan } from './import-plan';
import type { ImportRow } from './import-table';

/**
 * Brief 25 D4 and O-166: the accounts file — a branch account matched by
 * its unit and name, left alone if it is there. No opening balance is
 * imported: each treasurer enters their own in the Treasury (D-217).
 */
export function checkImportAccounts(
  rows: ImportRow[],
  existing: ExistingRecords,
  codes: Map<string, string>,
  report: ImportReport,
): ImportPlan['accounts'] {
  const plan: ImportPlan['accounts'] = [];
  const types: readonly string[] = BRANCH_ACCOUNT_TYPES;
  for (const { line, values: v } of rows) {
    const where = `accounts.csv row ${String(line)}`;
    const unitId = codes.get(v.unit_code ?? '');
    const name = v.name ?? '';
    if (!unitId) report.errors.push(`${where}: unit_code ${v.unit_code ?? ''} is not a unit.`);
    if (!name) report.errors.push(`${where}: name is required.`);
    if (!types.includes(v.account_type ?? ''))
      report.errors.push(`${where}: account_type must be ${types.join(' or ')}.`);
    if (!unitId || !name || !types.includes(v.account_type ?? '')) continue;
    const key = accountKey(unitId, name);
    const label = `${v.unit_code ?? ''}: ${name}`;
    if (existing.accounts.has(key)) report.accounts.present.push(label);
    else if (plan.some((a) => accountKey(a.unitId, a.name) === key))
      report.errors.push(`${where}: ${label} is listed twice.`);
    else {
      plan.push({ id: generateId(), unitId, name, branchType: v.account_type ?? '' });
      report.accounts.added.push(label);
    }
  }
  return plan;
}
