import type { LoanChange } from '../../../../shared/resources-library/equipment';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { runLibraryBatch } from '../library-versioning';
import type { EquipmentRow } from './equipment.repo';
import type { LoanDetailsInput } from './equipment.schema';
import { requireManagedEquipment } from './equipment.service';
import {
  buildInsertLoanStatement,
  buildLoanHistoryStatement,
  buildUpdateLoanStatement,
  findLoan,
  outOnLoan,
} from './loans.repo';

interface ItemParams {
  unitId: string;
  equipmentId: string;
}

/** D-108: refuse more than is left, saying plainly what the numbers are. */
async function requireEnoughLeft(
  db: D1Database,
  item: EquipmentRow,
  quantity: number,
  exceptLoanId?: string,
) {
  const out = await outOnLoan(db, item.id, exceptLoanId);
  if (quantity > item.quantity - out) {
    throw new ConflictError('resources-library.over-lent', {
      requested: quantity,
      quantity: item.quantity,
      out,
      left: item.quantity - out,
    });
  }
}

function historyAndAudit(
  db: D1Database,
  ctx: RequestContext,
  row: LoanDetailsInput & {
    loanId: string;
    unitId: string;
    change: LoanChange;
    returnedOn: string | null;
    at: string;
  },
): D1PreparedStatement[] {
  return [
    buildLoanHistoryStatement(db, { ...row, actor: ctx.personId }),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: `loan.${row.change}`,
      entityType: 'loan',
      entityId: row.loanId,
      after: row,
    }),
  ];
}

/** Brief 16 C2, P20 and D-099: lend a quantity of an item, from the date borrowed until it is due back. */
export async function lendEquipment(
  db: D1Database,
  ctx: RequestContext,
  params: ItemParams & { loan: LoanDetailsInput },
): Promise<void> {
  const item = await requireManagedEquipment(db, ctx, params);
  if (item.retiredAt) throw new ConflictError('resources-library.equipment-retired');
  await requireEnoughLeft(db, item, params.loan.quantity);
  const at = new Date().toISOString();
  const loanId = generateId();
  await runLibraryBatch(db, [
    buildInsertLoanStatement(db, {
      ...params.loan,
      id: loanId,
      equipmentId: item.id,
      unitId: item.unitId,
      actor: ctx.personId,
      at,
    }),
    ...historyAndAudit(db, ctx, {
      ...params.loan,
      loanId,
      unitId: item.unitId,
      change: 'lent',
      returnedOn: null,
      at,
    }),
  ]);
}

/** An open loan of this item; a returned one is fixed (D-109). */
async function requireOpenLoan(db: D1Database, item: EquipmentRow, loanId: string) {
  const loan = await findLoan(db, loanId);
  if (loan?.equipmentId !== item.id) throw new NotFoundError('resources-library.loan-not-found');
  if (loan.returnedOn) throw new ConflictError('resources-library.loan-returned');
  return loan;
}

/** D-109: correct the borrower, quantity or dates until the return is recorded, from the version read. */
export async function correctLoan(
  db: D1Database,
  ctx: RequestContext,
  params: ItemParams & { loanId: string; version: number; loan: LoanDetailsInput },
): Promise<void> {
  const item = await requireManagedEquipment(db, ctx, params);
  const loan = await requireOpenLoan(db, item, params.loanId);
  await requireEnoughLeft(db, item, params.loan.quantity, loan.id);
  const at = new Date().toISOString();
  await runLibraryBatch(db, [
    buildUpdateLoanStatement(db, {
      ...params.loan,
      id: loan.id,
      returnedOn: null,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    ...historyAndAudit(db, ctx, {
      ...params.loan,
      loanId: loan.id,
      unitId: item.unitId,
      change: 'corrected',
      returnedOn: null,
      at,
    }),
  ]);
}

/** D-099: record the date it came back, closing the loan; it is fixed from then on (D-109). */
export async function returnLoan(
  db: D1Database,
  ctx: RequestContext,
  params: ItemParams & { loanId: string; version: number; returnedOn: string },
): Promise<void> {
  const item = await requireManagedEquipment(db, ctx, params);
  const loan = await requireOpenLoan(db, item, params.loanId);
  if (params.returnedOn < loan.borrowedOn)
    throw new ConflictError('resources-library.returned-before-borrowed');
  const at = new Date().toISOString();
  const details = {
    borrower: loan.borrower,
    quantity: loan.quantity,
    borrowedOn: loan.borrowedOn,
    dueBack: loan.dueBack,
  };
  await runLibraryBatch(db, [
    buildUpdateLoanStatement(db, {
      ...details,
      id: loan.id,
      returnedOn: params.returnedOn,
      version: params.version,
      actor: ctx.personId,
      at,
    }),
    ...historyAndAudit(db, ctx, {
      ...details,
      loanId: loan.id,
      unitId: item.unitId,
      change: 'returned',
      returnedOn: params.returnedOn,
      at,
    }),
  ]);
}
