import type { ListItem } from '../../../../shared/administration-panel/lists';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { getSetting } from '../../../core/settings';
import { listChoicesOf } from '../../administration-panel';
import { listCurrentOfficersOf } from '../../committee-register';
import { requireMeetingCapability } from '../meeting-access';
import { READ } from './meetings.service';

/**
 * D-198: the meeting types to choose from (15 B3) and the unit's current
 * officers, for chair, secretary and attendees. D-207: how often the
 * minutes save themselves (null while the setting is unset).
 */
export async function meetingChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<{
  types: ListItem[];
  officers: { personId: string; name: string }[];
  autosaveSeconds: number | null;
}> {
  await requireMeetingCapability(db, ctx, READ, unitId);
  const [types, officers, autosave] = await Promise.all([
    listChoicesOf(db, 'meeting-types'),
    listCurrentOfficersOf(db, unitId, getTodayInLondon()),
    getSetting<number>(db, 'meeting-recorder.minutes_autosave_seconds'),
  ]);
  return {
    types,
    officers,
    autosaveSeconds: autosave.status === 'configured' ? autosave.value : null,
  };
}
