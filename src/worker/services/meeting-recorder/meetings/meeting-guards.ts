import type { MeetingSummary } from '../../../../shared/meeting-recorder/meeting-records';
import { MeetingStatus } from '../../../../shared/meeting-recorder/meeting-statuses';
import { ConflictError, NotFoundError } from '../../../core/errors';
import { getTodayInLondon } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { listCurrentOfficersOf } from '../../committee-register';
import { findMeeting } from './meetings.repo';

/** D-198: a type from the meeting types list, not retired — or the one the meeting already has. */
export async function requireMeetingType(db: D1Database, typeItemId: string, current?: string) {
  if (typeItemId === current) return;
  const types = await listChoicesOf(db, 'meeting-types');
  if (!types.some((t) => t.id === typeItemId))
    throw new ConflictError('meeting-recorder.type-not-in-list');
}

/** D-198 and D-203: people chosen for a meeting are the unit's current officers (brief 22: "the officers list"). */
export async function requireOfficers(
  db: D1Database,
  unitId: string,
  personIds: string[],
  already: string[] = [],
): Promise<void> {
  const officers = new Set(
    (await listCurrentOfficersOf(db, unitId, getTodayInLondon())).map((o) => o.personId),
  );
  if (personIds.some((id) => !officers.has(id) && !already.includes(id)))
    throw new ConflictError('meeting-recorder.not-an-officer');
}

/** A meeting of this unit's; another unit's is not found (D-199). */
export async function requireUnitMeeting(
  db: D1Database,
  unitId: string,
  meetingId: string,
): Promise<MeetingSummary> {
  const meeting = await findMeeting(db, meetingId);
  if (meeting?.unitId !== unitId) throw new NotFoundError('meeting-recorder.meeting-not-found');
  return meeting;
}

/** The meeting must be in this status for the change asked (D-201). */
export function requireStatus(meeting: MeetingSummary, status: MeetingStatus): void {
  if (meeting.status !== status) throw new ConflictError('meeting-recorder.wrong-status');
}
