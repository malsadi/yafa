import { addDaysToDate } from '../../../../shared/core/add-days-to-date';
import { londonTimeToUtc } from '../../../../shared/core/london-time-to-utc';
import { ConflictError } from '../../../core/errors';
import { listRoles } from '../../committee-register';
import type { VoteInput } from '../noticeboard/noticeboard.schema';
import { listCurrentOfficerIds } from './notice-votes.repo';

/** P11: the eligible voters, chosen now — all the unit's officers, those in the chosen roles, or the named ones. */
async function chooseVoters(
  db: D1Database,
  unitId: string,
  vote: VoteInput,
  today: string,
): Promise<string[]> {
  const { eligibility } = vote;
  if (eligibility.kind === 'roles') {
    const known = new Set((await listRoles(db, unitId)).map((role) => role.id));
    if (!eligibility.roleIds.every((id) => known.has(id)))
      throw new ConflictError('communication-hub.role-not-found');
    return listCurrentOfficerIds(db, { unitId, today, roleIds: eligibility.roleIds });
  }
  const officers = await listCurrentOfficerIds(db, { unitId, today });
  if (eligibility.kind === 'unit') return officers;
  if (!eligibility.personIds.every((id) => officers.includes(id)))
    throw new ConflictError('communication-hub.not-a-current-officer');
  return [...new Set(eligibility.personIds)];
}

/**
 * Brief 20 A2 and D-156: a vote ready to record — closing at the end of its
 * closing date in London (today or later), with at least one voter.
 */
export async function prepareVote(
  db: D1Database,
  unitId: string,
  vote: VoteInput,
  today: string,
): Promise<VoteInput & { closesAt: string; voterIds: string[] }> {
  if (vote.closesOn < today) throw new ConflictError('communication-hub.closing-date-past');
  const voterIds = await chooseVoters(db, unitId, vote, today);
  if (voterIds.length === 0) throw new ConflictError('communication-hub.no-eligible-voters');
  const closesAt = londonTimeToUtc(addDaysToDate(vote.closesOn, 1), '00:00').toISOString();
  return { ...vote, closesAt, voterIds };
}
