import type { Language } from '../../../../shared/core/languages';
import type { FinancialYear } from '../../../../shared/treasury/financial-year';
import type { FileStorage } from '../../../core/files';
import { getTodayInLondon } from '../../../core/permissions';
import { isRecordFiled } from '../../documents-archive';
import { listAccountsOf } from '../accounts/accounts.repo';
import { buildStatementData } from '../statements/statement-data';
import { writtenStatement } from '../statements/statement-pdf';
import type { StatementRenderer } from '../statements/statement-renderer';
import { filedStatementStatements } from '../statements/statements.service';
import type { TreasuryUnit } from '../treasury-access';

/** The London date of a stored moment. */
const dateOf = (timestamp: string) => getTodayInLondon(new Date(timestamp));

/**
 * P9: the year-end close files a statement for every account open at some
 * point in the year — unless that very statement was filed already.
 */
export async function yearStatementStatements(
  db: D1Database,
  deps: { storage: FileStorage; render: StatementRenderer },
  params: { unit: TreasuryUnit; year: FinancialYear; language: Language; actor: string },
): Promise<D1PreparedStatement[]> {
  const { unit, year } = params;
  const accounts = (await listAccountsOf(db, unit.id)).filter(
    (a) => a.openedOn <= year.end && (a.closedAt === null || dateOf(a.closedAt) >= year.start),
  );
  const statements: D1PreparedStatement[] = [];
  for (const account of accounts) {
    const sourceRecordId = `statement-${account.id}-${year.start}-${year.end}`;
    if (await isRecordFiled(db, { sourceService: 'treasury', sourceRecordId })) continue;
    const data = await buildStatementData(db, account, { from: year.start, to: year.end });
    const written = await writtenStatement(db, data, { unit, language: params.language });
    const pdf = await deps.render(written);
    statements.push(
      ...(await filedStatementStatements(db, deps.storage, {
        unit,
        data,
        title: `${written.title} (${written.period})`,
        pdf,
        actor: params.actor,
      })),
    );
  }
  return statements;
}
