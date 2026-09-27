import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { ForbiddenError } from '../../core/errors';
import { can, type RequestContext } from '../../core/permissions';
import { requireMeetingUnit, requireWritable } from './meeting-access';
import { requireUnitMeeting } from './meetings/meeting-guards';

const MANAGE = 'meeting-recorder.meetings.manage';

/**
 * D-200: the meeting's chair or secretary, with no capability, or anyone
 * who manages the unit's meetings — in a unit that can be written to.
 */
export async function requireChairSecretaryOrManager(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; meetingId: string },
): Promise<MeetingSummary> {
  requireWritable(await requireMeetingUnit(db, params.unitId));
  const meeting = await requireUnitMeeting(db, params.unitId, params.meetingId);
  if (meeting.chairPersonId === ctx.personId || meeting.secretaryPersonId === ctx.personId)
    return meeting;
  if (!(await can(db, ctx, MANAGE, { unitId: params.unitId })))
    throw new ForbiddenError('permission.denied');
  return meeting;
}
