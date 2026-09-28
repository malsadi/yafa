import type { ImportReport } from '../../../../shared/administration-panel/data-import';
import { generateId } from '../../../core/ids';
import { termKey, type ExistingRecords } from './import-existing';
import type { ImportPlan } from './import-plan';
import { blankToNull, isDate, type ImportRow } from './import-table';

interface People {
  plan: ImportPlan['people'];
  terms: ImportPlan['terms'];
}

/** The row's own problems: required values, dates, and no system administrator appointed here. */
function problemsOf(v: Record<string, string>): string[] {
  const problems: string[] = [];
  if (!v.email?.includes('@')) problems.push('email must be an email address');
  if (!v.name || !v.phone) problems.push('name and phone are required');
  if (v.system_administrator === 'yes')
    problems.push(
      'system administrators are appointed on the System administrators screen, so this must be no',
    );
  else if (v.system_administrator !== 'no') problems.push('system_administrator must be no');
  if (!isDate(v.start_date ?? '')) problems.push('start_date must be YYYY-MM-DD');
  if (v.end_date && (!isDate(v.end_date) || v.end_date <= (v.start_date ?? '')))
    problems.push('end_date must be empty, or a YYYY-MM-DD after start_date');
  return problems;
}

/** A role by its English name: a standard role, or the unit's own. */
function roleIn(existing: ExistingRecords, name: string, unitId: string): string | null {
  const wanted = name.toLowerCase();
  const role = existing.roles.find(
    (r) => r.nameEn.toLowerCase() === wanted && (r.unitId === null || r.unitId === unitId),
  );
  return role?.id ?? null;
}

/** The person for this email: already registered, added earlier in the file, or new. */
function personFor(
  existing: ExistingRecords,
  out: People,
  v: Record<string, string>,
  report: ImportReport,
) {
  const email = (v.email ?? '').toLowerCase();
  const earlier = out.plan.find((p) => p.email === email);
  if (earlier && (earlier.name !== v.name || earlier.phone !== v.phone))
    report.errors.push(`people.csv: ${email} must have the same name and phone on every row.`);
  const known = existing.people.get(email) ?? earlier?.id;
  if (known) {
    if (existing.people.has(email) && !report.people.present.includes(email))
      report.people.present.push(email);
    return known;
  }
  const id = generateId();
  out.plan.push({ id, email, name: v.name ?? '', phone: v.phone ?? '' });
  report.people.added.push(email);
  return id;
}

/**
 * Brief 25 D4, 15 D4 and O-165: the people file — one row per term, past
 * ones included. A person is matched by email and a term by person, role,
 * unit and start date; whatever is there already is left alone.
 */
export function checkImportPeople(
  rows: ImportRow[],
  existing: ExistingRecords,
  codes: Map<string, string>,
  report: ImportReport,
): People {
  const out: People = { plan: [], terms: [] };
  for (const { line, values: v } of rows) {
    const where = `people.csv row ${String(line)}`;
    const problems = problemsOf(v);
    const unitId = codes.get(v.unit_code ?? '');
    if (!unitId) problems.push(`unit_code ${v.unit_code ?? ''} is not a unit`);
    const roleId = unitId ? roleIn(existing, v.role ?? '', unitId) : null;
    if (unitId && !roleId) problems.push(`role ${v.role ?? ''} is not a role of that unit`);
    if (problems.length || !unitId || !roleId) {
      report.errors.push(`${where}: ${problems.join('; ')}.`);
      continue;
    }
    const personId = personFor(existing, out, v, report);
    const key = termKey(v.email ?? '', roleId, unitId, v.start_date ?? '');
    if (existing.terms.has(key)) report.terms.present += 1;
    else if (
      !out.terms.some(
        (t) =>
          termKey(v.email ?? '', t.roleId, t.unitId, t.startDate) === key &&
          t.personId === personId,
      )
    ) {
      out.terms.push({
        id: generateId(),
        personId,
        roleId,
        unitId,
        startDate: v.start_date ?? '',
        endDate: blankToNull(v.end_date),
      });
      report.terms.added += 1;
    }
  }
  return out;
}
