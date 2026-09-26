import type { Language } from '../../../../shared/core/languages';
import {
  financialYearOf,
  financialYearStartingIn,
  type FinancialYear,
} from '../../../../shared/treasury/financial-year';
import type { FinancialYearRecord } from '../../../../shared/treasury/treasury-records';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import type { FileStorage } from '../../../core/files';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { requireTreasuryCapability, requireTreasuryWriter } from '../treasury-access';
import { financialYearStart } from '../treasury-settings';
import type { StatementRenderer } from '../statements/statement-renderer';
import { yearStatementStatements } from './year-statements';
import {
  awaitingBetween,
  buildCloseYearStatement,
  earlierYearOpen,
  earliestEntryDate,
  listClosedYears,
} from './year-end-close.repo';

/** Brief 17 C3: the unit's financial years, from its first entry's to today's, newest first. */
export async function listFinancialYears(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<FinancialYearRecord[]> {
  await requireTreasuryCapability(db, ctx, 'treasury.accounts.read', unitId);
  const start = await financialYearStart(db, unitId);
  const today = getTodayInLondon();
  const closed = await listClosedYears(db, unitId);
  const years: FinancialYear[] = [];
  let year = financialYearOf((await earliestEntryDate(db, unitId)) ?? today, start);
  const last = financialYearOf(today, start);
  while (year.start <= last.start) {
    years.push(year);
    year = financialYearStartingIn(Number(year.start.slice(0, 4)) + 1, start);
  }
  const records = await Promise.all(
    years.map(async (y) => {
      const c = closed.find((row) => row.start === y.start);
      return {
        ...y,
        closed: Boolean(c),
        closedAt: c?.closedAt ?? null,
        closedByName: c?.closedByName ?? null,
        ended: y.end < today,
        awaitingCount: await awaitingBetween(db, unitId, y.start, y.end),
      };
    }),
  );
  return records.reverse();
}

/** D-128: the year starting on `start` can close — it has ended, the years before it are closed, nothing in it awaits approval. */
async function requireClosable(
  db: D1Database,
  unitId: string,
  start: string,
): Promise<FinancialYear> {
  const year = financialYearOf(start, await financialYearStart(db, unitId));
  if (year.start !== start) throw new ConflictError('treasury.not-a-year-start');
  if ((await listClosedYears(db, unitId)).some((row) => row.start === start))
    throw new ConflictError('treasury.year-closed');
  if (year.end >= getTodayInLondon()) throw new ConflictError('treasury.year-not-ended');
  if (await earlierYearOpen(db, unitId, start))
    throw new ConflictError('treasury.earlier-year-open');
  const awaiting = await awaitingBetween(db, unitId, year.start, year.end);
  if (awaiting > 0) throw new ConflictError('treasury.awaiting-in-year', { awaiting });
  return year;
}

/**
 * Brief 17 C3, 10 ("Financial year closed") and P9, D-128: close a year —
 * locking its entries — and file a statement for every account it saw, in
 * one batch, the PDFs written to R2 first.
 */
export async function closeFinancialYear(
  db: D1Database,
  ctx: RequestContext,
  deps: { storage: FileStorage; render: StatementRenderer },
  params: { unitId: string; start: string; language: Language },
): Promise<void> {
  const unit = await requireTreasuryWriter(db, ctx, 'treasury.year-end.close', params.unitId);
  const year = await requireClosable(db, unit.id, params.start);
  const statements = await yearStatementStatements(db, deps, {
    unit,
    year,
    language: params.language,
    actor: ctx.personId,
  });
  await db.batch([
    buildCloseYearStatement(db, {
      unitId: unit.id,
      ...year,
      actor: ctx.personId,
      at: new Date().toISOString(),
    }),
    ...statements,
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'treasury-year.closed',
      entityType: 'unit',
      entityId: unit.id,
      after: year,
    }),
  ]);
}
