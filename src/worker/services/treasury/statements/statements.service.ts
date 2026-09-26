import type { Language } from '../../../../shared/core/languages';
import type { StatementData } from '../../../../shared/treasury/statement';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { storeGeneratedFile, type FileStorage } from '../../../core/files';
import type { RequestContext } from '../../../core/permissions';
import { fileRecord } from '../../documents-archive';
import { findAccount } from '../accounts/accounts.repo';
import {
  requireTreasuryCapability,
  requireTreasuryWriter,
  type TreasuryUnit,
} from '../treasury-access';
import { buildStatementData } from './statement-data';
import { writtenStatement } from './statement-pdf';
import type { StatementRenderer } from './statement-renderer';

export interface StatementRequest {
  unitId: string;
  accountId: string;
  from: string;
  to: string;
}

async function accountOf(db: D1Database, unit: TreasuryUnit, accountId: string) {
  const account = await findAccount(db, accountId);
  if (account?.unitId !== unit.id) throw new NotFoundError('treasury.account-not-found');
  return account;
}

/** Brief 17 C2 and P9: any account's statement for any period, to view — freely. */
export async function viewStatement(
  db: D1Database,
  ctx: RequestContext,
  params: StatementRequest,
): Promise<StatementData> {
  const unit = await requireTreasuryCapability(db, ctx, 'treasury.accounts.read', params.unitId);
  return buildStatementData(db, await accountOf(db, unit, params.accountId), params);
}

/** Brief 17 C2, 9.4 and P9: the statement as a PDF in the officer's language, to download — freely. */
export async function statementPdf(
  db: D1Database,
  ctx: RequestContext,
  render: StatementRenderer,
  params: StatementRequest & { language: Language },
): Promise<Uint8Array> {
  const unit = await requireTreasuryCapability(db, ctx, 'treasury.accounts.read', params.unitId);
  const data = await buildStatementData(db, await accountOf(db, unit, params.accountId), params);
  return render(await writtenStatement(db, data, { unit, language: params.language }));
}

/**
 * Brief 17 C2, 10 ("Treasury statement filed") and P9, D-128: file the
 * statement to the archive's Finance category, dated the period's last day
 * — the PDF to R2 first, then locked and filed in one batch. Each period of
 * an account is filed once.
 */
export async function fileStatement(
  db: D1Database,
  ctx: RequestContext,
  deps: { storage: FileStorage; render: StatementRenderer },
  params: StatementRequest & { language: Language },
): Promise<void> {
  const unit = await requireTreasuryWriter(db, ctx, 'treasury.statements.file', params.unitId);
  const data = await buildStatementData(db, await accountOf(db, unit, params.accountId), params);
  const written = await writtenStatement(db, data, { unit, language: params.language });
  const pdf = await deps.render(written);
  const statements = await filedStatementStatements(db, deps.storage, {
    unit,
    data,
    title: `${written.title} (${written.period})`,
    pdf,
    actor: ctx.personId,
  });
  try {
    await db.batch([
      ...statements,
      buildAuditStatement(db, {
        actorPersonId: ctx.personId,
        action: 'treasury-statement.filed',
        entityType: 'treasury-account',
        entityId: data.accountId,
        after: { from: data.from, to: data.to },
      }),
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE'))
      throw new ConflictError('treasury.statement-already-filed');
    throw error;
  }
}

/** One statement's PDF stored, and filed to the archive (15 A1) — statements for the caller's batch. */
export async function filedStatementStatements(
  db: D1Database,
  storage: FileStorage,
  params: {
    unit: TreasuryUnit;
    data: StatementData;
    title: string;
    pdf: Uint8Array;
    actor: string;
  },
): Promise<D1PreparedStatement[]> {
  const { unit, data } = params;
  const recordId = `statement-${data.accountId}-${data.from}-${data.to}`;
  const { file, statement } = await storeGeneratedFile(storage.bucket, db, {
    unitId: unit.id,
    unitCode: unit.code,
    service: 'treasury',
    recordId,
    use: 'documents',
    fileName: `${recordId}.pdf`,
    contentType: 'application/pdf',
    body: params.pdf,
    createdBy: params.actor,
    locked: true,
  });
  return [
    statement,
    ...fileRecord(db, {
      file,
      categoryId: 'finance',
      sourceService: 'treasury',
      sourceRecordId: recordId,
      title: params.title,
      documentDate: data.to,
      filedBy: params.actor,
    }),
  ];
}
