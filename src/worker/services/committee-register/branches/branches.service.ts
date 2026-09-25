import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, ForbiddenError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { can, type RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import {
  buildInsertBranchStatement,
  buildUpdateUnitStatement,
  findUnit,
  listUnits,
} from './branches.repo';
import type { CreateBranchInput, UnitRecord, UpdateUnitInput } from './branches.schema';

// Brief 7.3 and 14: the national register officer alone adds or changes
// branches (a fixed rule on the designation, T-075).
const CAPABILITY = 'committee-register.branches.manage';

async function requireCapability(db: D1Database, ctx: RequestContext): Promise<void> {
  if (!(await can(db, ctx, CAPABILITY, { portalWide: true }))) {
    throw new ForbiddenError('permission.denied');
  }
}

async function runBatch(db: D1Database, statements: D1PreparedStatement[]): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      throw new ConflictError('branches.code-taken');
    }
    throw error;
  }
}

/**
 * D-076: a unit's calendar colour is chosen from the calendar colours list,
 * among those not retired (D-070). A unit keeps a colour it already has,
 * even once that colour is retired.
 */
async function requireOfferedColour(
  db: D1Database,
  colourId: string | null | undefined,
  current: string | null,
): Promise<void> {
  if (!colourId || colourId === current) return;
  const offered = await listChoicesOf(db, 'calendar-colours');
  if (!offered.some((colour) => colour.id === colourId)) {
    throw new ConflictError('branches.calendar-colour-not-offered');
  }
}

/** D-076: the calendar colours a unit may choose from, for whoever changes units. */
export async function listCalendarColourChoices(db: D1Database, ctx: RequestContext) {
  await requireCapability(db, ctx);
  return listChoicesOf(db, 'calendar-colours');
}

/** Brief 25 B1: the General Council and every branch. */
export async function listAllUnits(db: D1Database, ctx: RequestContext): Promise<UnitRecord[]> {
  await requireCapability(db, ctx);
  return listUnits(db);
}

/** Brief 14 A1: add a branch. */
export async function createBranch(
  db: D1Database,
  ctx: RequestContext,
  input: CreateBranchInput,
): Promise<UnitRecord> {
  await requireCapability(db, ctx);
  await requireOfferedColour(db, input.calendarColourId, null);
  const unit: UnitRecord = {
    id: generateId(),
    type: 'branch',
    ...input,
    letterheadAddressEn: input.letterheadAddressEn ?? null,
    letterheadAddressAr: input.letterheadAddressAr ?? null,
    calendarColourId: input.calendarColourId ?? null,
  };
  await runBatch(db, [
    buildInsertBranchStatement(db, unit),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'unit.created',
      entityType: 'unit',
      entityId: unit.id,
      after: unit,
    }),
  ]);
  return unit;
}

function checkUnitChanges(unit: UnitRecord, changes: UpdateUnitInput): void {
  if (unit.type === 'national' && changes.area !== undefined) {
    throw new ConflictError('branches.general-council-has-no-area');
  }
  // P4 is about branches: the General Council itself is never made inactive.
  if (unit.type === 'national' && changes.status === 'inactive') {
    throw new ConflictError('branches.general-council-always-active');
  }
}

/** Brief 14 A1 and 25 B1: change a unit's code, names, area or status. */
export async function updateUnit(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  changes: UpdateUnitInput,
): Promise<UnitRecord> {
  await requireCapability(db, ctx);
  const unit = await findUnit(db, unitId);
  if (!unit) {
    throw new NotFoundError('branches.not-found');
  }
  checkUnitChanges(unit, changes);
  await requireOfferedColour(db, changes.calendarColourId, unit.calendarColourId);
  if (Object.keys(changes).length === 0) {
    return unit;
  }
  const after: UnitRecord = { ...unit, ...changes };
  await runBatch(db, [
    buildUpdateUnitStatement(db, unitId, changes),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'unit.changed',
      entityType: 'unit',
      entityId: unitId,
      before: unit,
      after,
    }),
  ]);
  return after;
}
