import type { ClerkAccounts } from '../../../clerk';
import { buildAuditStatement } from '../../../core/audit';
import { ConflictError } from '../../../core/errors';
import { generateId } from '../../../core/ids';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { lockIfLastTermEnded } from '../accounts/accounts.service';
import { requireCapability, requireWritableUnit } from '../committee-register-guards';
import { inviteIfNeeded } from '../invitations/invitations.service';
import { buildInsertTermStatement } from '../officers/officers-statements.repo';
import {
  buildConfirmElectionStatement,
  buildEndOutgoingTermsStatement,
  findOutgoingPeople,
} from './election-statements.repo';
import type { ElectionRecord } from './elections.schema';
import { loadElection, requireDraft } from './elections.service';

const CONFIRM = 'committee-register.elections.confirm';

/** Every candidate has results, and each position fills exactly its seats (D-055, D-066). */
function checkResults(election: ElectionRecord, termsStartDate: string): void {
  if (termsStartDate < election.electionDate)
    throw new ConflictError('elections.start-before-election');
  if (election.positions.length === 0) throw new ConflictError('elections.no-positions');
  for (const position of election.positions) {
    if (position.candidates.some((c) => c.votes === null || c.elected === null)) {
      throw new ConflictError('elections.results-incomplete');
    }
    if (position.candidates.filter((c) => c.elected).length !== position.seats) {
      throw new ConflictError('elections.seats-not-filled');
    }
  }
}

function confirmationBatch(
  db: D1Database,
  election: ElectionRecord,
  startDate: string,
  ctx: RequestContext,
) {
  const elected = election.positions.flatMap((p) =>
    p.candidates.filter((c) => c.elected).map((c) => ({ personId: c.personId, roleId: p.roleId })),
  );
  return [
    buildConfirmElectionStatement(db, {
      electionId: election.id,
      termsStartDate: startDate,
      confirmedBy: ctx.personId,
    }),
    ...election.positions.map((p) =>
      buildEndOutgoingTermsStatement(db, { unitId: election.unitId, roleId: p.roleId, startDate }),
    ),
    ...elected.map((e) =>
      buildInsertTermStatement(db, {
        id: generateId(),
        personId: e.personId,
        roleId: e.roleId,
        unitId: election.unitId,
        startDate,
        endDate: null,
      }),
    ),
    buildAuditStatement(db, {
      actorPersonId: ctx.personId,
      action: 'election.confirmed',
      entityType: 'election',
      entityId: election.id,
      after: { termsStartDate: startDate, elected },
    }),
  ];
}

/**
 * Brief 14 C1, D-066, D-068, P3: confirm an election. In one batch it is
 * locked, the outgoing terms end on the new start date and the elected
 * candidates' terms start on it. Then anyone elected without an account is
 * invited, and outgoing officers left with no term are locked if the date
 * has arrived and the setting says so.
 */
export async function confirmElection(
  db: D1Database,
  clerk: ClerkAccounts,
  ctx: RequestContext,
  params: { electionId: string; termsStartDate: string },
): Promise<ElectionRecord> {
  const election = await loadElection(db, params.electionId);
  await requireCapability(db, ctx, CONFIRM, { unitId: election.unitId });
  requireDraft(election);
  await requireWritableUnit(db, election.unitId);
  checkResults(election, params.termsStartDate);
  const outgoing = (
    await Promise.all(
      election.positions.map((p) =>
        findOutgoingPeople(db, {
          unitId: election.unitId,
          roleId: p.roleId,
          startDate: params.termsStartDate,
        }),
      ),
    )
  ).flat();
  await db.batch(confirmationBatch(db, election, params.termsStartDate, ctx));
  const elected = election.positions.flatMap((p) =>
    p.candidates.filter((c) => c.elected).map((c) => c.personId),
  );
  for (const personId of new Set(elected))
    await inviteIfNeeded(db, clerk, { personId, actorPersonId: ctx.personId });
  if (params.termsStartDate <= getTodayInLondon()) {
    for (const personId of new Set(outgoing))
      await lockIfLastTermEnded(db, clerk, { personId, actorPersonId: ctx.personId });
  }
  return loadElection(db, election.id);
}
