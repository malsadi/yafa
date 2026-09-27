import type { ListItem } from '../../../../shared/administration-panel/lists';
import { getTodayInLondon, type RequestContext } from '../../../core/permissions';
import { listChoicesOf } from '../../administration-panel';
import { checkClashes } from '../../calendar';
import { listCurrentOfficersOf } from '../../committee-register';
import { requireEventCapability } from '../event-access';
import { READ } from '../events/events.service';

/** D-172: the event types to choose from (15 B3), and the unit's current officers who may lead. */
export async function eventChoices(
  db: D1Database,
  ctx: RequestContext,
  unitId: string,
): Promise<{ types: ListItem[]; leads: { personId: string; name: string }[] }> {
  await requireEventCapability(db, ctx, READ, unitId);
  const [types, leads] = await Promise.all([
    listChoicesOf(db, 'event-types'),
    listCurrentOfficersOf(db, unitId, getTodayInLondon()),
  ]);
  return { types, leads };
}

/** Brief 19 B4 and D-151: the unit's meetings and events on the chosen days — a notice, never a block. */
export async function eventClashes(
  db: D1Database,
  ctx: RequestContext,
  params: { unitId: string; firstDay: string; lastDay: string | null; eventId: string | null },
) {
  await requireEventCapability(db, ctx, READ, params.unitId);
  return checkClashes(db, params.unitId, params.firstDay, {
    ...(params.lastDay ? { lastDate: params.lastDay } : {}),
    ...(params.eventId
      ? { except: { kind: 'event' as const, sourceRecordId: params.eventId } }
      : {}),
  });
}
