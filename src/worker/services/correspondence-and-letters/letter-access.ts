import { ConflictError, ForbiddenError, NotFoundError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { isServiceEnabled } from '../../core/service-switches';
import { listUnits } from '../committee-register';

export type LetterUnitRow = Awaited<ReturnType<typeof listUnits>>[number];

export const READ = 'correspondence-and-letters.registers.read';
export const WRITE = 'correspondence-and-letters.letters-out.write';
export const RECORD = 'correspondence-and-letters.letters-in.record';

/** The unit, where Correspondence is on; switched off, it is hidden (8.4). */
export async function requireLetterUnit(db: D1Database, unitId: string): Promise<LetterUnitRow> {
  const unit = (await listUnits(db)).find((candidate) => candidate.id === unitId);
  if (!unit) throw new NotFoundError('branches.not-found');
  if (!(await isServiceEnabled(db, 'correspondence-and-letters', unitId)))
    throw new NotFoundError('service.switched-off');
  return unit;
}

/** An officer holding `capability` in the unit, where Correspondence is on (7.3: own unit only). */
export async function requireLetterCapability(
  db: D1Database,
  ctx: RequestContext,
  capability: string,
  unitId: string,
): Promise<LetterUnitRow> {
  if (!(await can(db, ctx, capability, { unitId }))) throw new ForbiddenError('permission.denied');
  return requireLetterUnit(db, unitId);
}

/** P4: an inactive branch is read-only everywhere; the General Council never is. */
export function requireWritable(unit: LetterUnitRow): void {
  if (unit.type === 'branch' && unit.status !== 'active')
    throw new ConflictError('branches.inactive');
}

/** Runs a letter batch, turning the database's refusals into the portal's (9.1; T-154). */
export async function runLetterBatch(
  db: D1Database,
  statements: D1PreparedStatement[],
): Promise<void> {
  try {
    await db.batch(statements);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('letter number taken')) throw new NumberTakenError();
    if (message.includes('stale')) throw new ConflictError('correspondence-and-letters.stale');
    if (message.includes('not answerable'))
      throw new ConflictError('correspondence-and-letters.not-answerable');
    if (message.includes('cannot move'))
      throw new ConflictError('correspondence-and-letters.wrong-status');
    if (message.includes('closed')) throw new ConflictError('correspondence-and-letters.closed');
    throw error;
  }
}

/** T-154: another letter took the predicted number first; the caller tries the next one. */
export class NumberTakenError extends ConflictError {
  constructor() {
    super('correspondence-and-letters.busy');
  }
}
