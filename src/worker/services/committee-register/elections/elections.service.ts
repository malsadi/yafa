import { ElectionStatus } from '../../../../shared/committee-register/election-status';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import {
  requireCapability,
  requireRegisterReader,
  requireWritableUnit,
} from '../committee-register-guards';
import { buildInsertElectionStatement } from './election-statements.repo';
import { findElection, listUnitElections } from './elections.repo';
import type { ElectionRecord } from './elections.schema';

const MANAGE = 'committee-register.elections.manage';

export async function loadElection(db: D1Database, electionId: string): Promise<ElectionRecord> {
  const election = await findElection(db, electionId);
  if (!election) throw new NotFoundError('elections.not-found');
  return election;
}

/** D-066: a Draft can change; a Confirmed election is locked. */
export function requireDraft(election: ElectionRecord): void {
  if (election.status !== ElectionStatus.Draft)
    throw new ConflictError('elections.confirmed-is-locked');
}

/** Brief 14 C1: a unit's elections, newest first. */
export async function listElections(db: D1Database, ctx: RequestContext, unitId: string) {
  await requireRegisterReader(db, ctx, unitId);
  return listUnitElections(db, unitId);
}

export async function getElection(
  db: D1Database,
  ctx: RequestContext,
  electionId: string,
): Promise<ElectionRecord> {
  const election = await loadElection(db, electionId);
  await requireRegisterReader(db, ctx, election.unitId);
  return election;
}

/**
 * Brief 14 C1: start recording an election, as a Draft. A correction names
 * the Confirmed election of the same unit it corrects (D-066).
 */
export async function createElection(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
  input: { electionDate: string; correctsElectionId?: string },
): Promise<ElectionRecord> {
  await requireCapability(db, ctx, MANAGE, { unitId });
  await requireWritableUnit(db, unitId);
  if (input.correctsElectionId) {
    const corrected = await findElection(db, input.correctsElectionId);
    if (corrected?.unitId !== unitId || corrected.status !== ElectionStatus.Confirmed) {
      throw new ConflictError('elections.corrects-must-be-confirmed-of-unit');
    }
  }
  const election = {
    id: generateId(),
    unitId,
    electionDate: input.electionDate,
    correctsElectionId: input.correctsElectionId ?? null,
  };
  await db.batch([
    buildInsertElectionStatement(db, election, ctx.personId),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'election.created',
      entityType: 'election',
      entityId: election.id,
      after: election,
    }),
  ]);
  return loadElection(db, election.id);
}
