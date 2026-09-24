import { buildAuditStatement } from '../../../core/audit';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import type { RequestContext } from '../../../core/permissions';
import { requireCapability } from '../committee-register-guards';
import { buildInsertPersonStatement } from '../officers/officers-statements.repo';
import { findPersonByEmail } from '../officers/officers.repo';
import { newPersonLanguage } from '../officers/new-person-language';
import { listRoles } from '../roles/roles.repo';
import {
  buildInsertCandidateStatement,
  buildInsertPositionStatement,
  buildRecordResultStatement,
  buildRemoveCandidateStatement,
  buildRemovePositionStatements,
} from './election-statements.repo';
import type { AddCandidateInput, ElectionRecord } from './elections.schema';
import { loadElection, requireDraft } from './elections.service';

const MANAGE = 'committee-register.elections.manage';

async function editableElection(
  db: D1Database,
  ctx: RequestContext,
  electionId: string,
): Promise<ElectionRecord> {
  const election = await loadElection(db, electionId);
  await requireCapability(db, ctx, MANAGE, { unitId: election.unitId });
  requireDraft(election);
  return election;
}

function audit(
  db: D1Database,
  ctx: RequestContext,
  electionId: string,
  action: string,
  after?: unknown,
) {
  return buildAuditStatement(db, {
    actorPersonId: ctx.personId,
    action,
    entityType: 'election',
    entityId: electionId,
    after,
  });
}

/** D-066: a position is a role the unit uses, with its number of seats. */
export async function addPosition(
  db: D1Database,
  ctx: RequestContext,
  electionId: string,
  input: { roleId: string; seats: number },
) {
  const election = await editableElection(db, ctx, electionId);
  if (!(await listRoles(db, election.unitId)).some((role) => role.id === input.roleId))
    throw new NotFoundError('roles.not-found');
  await db.batch([
    buildInsertPositionStatement(db, electionId, input.roleId, input.seats),
    audit(db, ctx, electionId, 'election.position-added', input),
  ]);
  return loadElection(db, electionId);
}

export async function removePosition(
  db: D1Database,
  ctx: RequestContext,
  params: { electionId: string; positionId: string },
) {
  const election = await editableElection(db, ctx, params.electionId);
  if (!election.positions.some((p) => p.id === params.positionId))
    throw new NotFoundError('elections.position-not-found');
  await db.batch([
    ...buildRemovePositionStatements(db, params.positionId),
    audit(db, ctx, params.electionId, 'election.position-removed', params),
  ]);
  return loadElection(db, params.electionId);
}

/** Brief 14 C1 and P3: a candidate is an existing person, or a new one without access. */
export async function addCandidate(
  db: D1Database,
  ctx: RequestContext,
  params: { electionId: string; positionId: string; input: AddCandidateInput },
) {
  const election = await editableElection(db, ctx, params.electionId);
  const position = election.positions.find((p) => p.id === params.positionId);
  if (!position) throw new NotFoundError('elections.position-not-found');
  const statements: D1PreparedStatement[] = [];
  let personId: string;
  if ('personId' in params.input) {
    personId = params.input.personId;
  } else {
    const known = await findPersonByEmail(db, params.input.newPerson.email);
    personId = known?.id ?? generateId();
    if (!known)
      statements.push(
        buildInsertPersonStatement(db, {
          id: personId,
          ...params.input.newPerson,
          language: await newPersonLanguage(db),
        }),
      );
  }
  if (position.candidates.some((c) => c.personId === personId))
    throw new ConflictError('elections.already-a-candidate');
  await db.batch([
    ...statements,
    buildInsertCandidateStatement(db, params.positionId, personId),
    audit(db, ctx, params.electionId, 'election.candidate-added', { personId }),
  ]);
  return loadElection(db, params.electionId);
}

export async function removeCandidate(
  db: D1Database,
  ctx: RequestContext,
  params: { electionId: string; candidateId: string },
) {
  const election = await editableElection(db, ctx, params.electionId);
  if (!election.positions.some((p) => p.candidates.some((c) => c.id === params.candidateId)))
    throw new NotFoundError('elections.candidate-not-found');
  await db.batch([
    buildRemoveCandidateStatement(db, params.candidateId),
    audit(db, ctx, params.electionId, 'election.candidate-removed', params),
  ]);
  return loadElection(db, params.electionId);
}

/** D-055: each candidate's vote count, and who was elected. */
export async function recordResults(
  db: D1Database,
  ctx: RequestContext,
  params: {
    electionId: string;
    results: { candidateId: string; votes: number; elected: boolean }[];
  },
) {
  const election = await editableElection(db, ctx, params.electionId);
  const known = new Set(election.positions.flatMap((p) => p.candidates.map((c) => c.id)));
  if (params.results.some((r) => !known.has(r.candidateId)))
    throw new NotFoundError('elections.candidate-not-found');
  await db.batch([
    ...params.results.map((r) => buildRecordResultStatement(db, r)),
    audit(db, ctx, params.electionId, 'election.results-recorded', params.results),
  ]);
  return loadElection(db, params.electionId);
}
