import type {
  ImportFiles,
  ImportReport,
} from '../../../../shared/administration-panel/data-import';
import { IMPORT_COLUMNS } from '../../../../shared/administration-panel/data-import';
import type { Language } from '../../../../shared/core/languages';
import { buildAuditStatement } from '../../../core/audit';
import type { RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { requirePortalCapability } from '../operations-access';
import { checkImportAccounts } from './check-import-accounts';
import { checkImportPeople } from './check-import-people';
import { checkImportUnits } from './check-import-units';
import { readExisting } from './import-existing';
import { emptyReport, type ImportPlan } from './import-plan';
import { importStatements } from './import-statements';
import { readImportTable } from './import-table';

const CAPABILITY = 'administration-panel.data-import.run';

/** Every file checked against the database — what would be added, what is there, and what stops it. */
async function planImport(db: D1Database, files: ImportFiles) {
  const report = emptyReport();
  if (!files.units && !files.people && !files.accounts)
    report.errors.push('Choose at least one file.');
  const table = (name: keyof ImportFiles) =>
    files[name]
      ? readImportTable(`${name}.csv`, files[name] ?? '', IMPORT_COLUMNS[name], report.errors)
      : [];
  const existing = await readExisting(db);
  const units = checkImportUnits(table('units'), existing, report);
  const people = checkImportPeople(table('people'), existing, units.codes, report);
  const accounts = checkImportAccounts(table('accounts'), existing, units.codes, report);
  const language = await getSetting<Language>(db, 'administration-panel.new_officer_language');
  if (people.plan.length && language.status === 'not-configured')
    report.errors.push(
      '"Language new officers start with" is not set yet, so no one can be added.',
    );
  const plan: ImportPlan = {
    units: units.plan,
    people: people.plan,
    terms: people.terms,
    accounts,
  };
  return { report, plan, language: language.status === 'configured' ? language.value : null };
}

/** Brief 25 D4 and O-165: the dry run — nothing is written. */
export async function dryRunImport(
  db: D1Database,
  ctx: RequestContext,
  files: ImportFiles,
): Promise<ImportReport> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  return (await planImport(db, files)).report;
}

/**
 * Brief 25 D4 and D-217: the import, checked again, then written in one
 * batch with its audit entry — only when there are no problems. What is
 * there already is left alone, so it is safe to run again. Nobody is
 * invited, and no opening balance is imported (O-166).
 */
export async function runImport(
  db: D1Database,
  ctx: RequestContext,
  files: ImportFiles,
): Promise<{ report: ImportReport; imported: boolean }> {
  await requirePortalCapability(db, ctx, CAPABILITY);
  const { report, plan, language } = await planImport(db, files);
  if (report.errors.length || !language) return { report, imported: false };
  await db.batch([
    ...importStatements(db, plan, { language, actor: ctx.personId }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'data-import.run',
      entityType: 'data-import',
      entityId: new Date().toISOString(),
      after: {
        units: plan.units.length,
        people: plan.people.length,
        terms: plan.terms.length,
        accounts: plan.accounts.length,
      },
    }),
  ]);
  return { report, imported: true };
}
