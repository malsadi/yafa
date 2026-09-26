import type { CalendarItem, CalendarView } from '../../../../shared/calendar/calendar-records';
import { can, type RequestContext } from '../../../core/permissions';
import { requireCalendarCapability } from '../calendar-access';
import { listCalendarUnits, listCommunityDates, listEntries } from './views.repo';
import type { CalendarQuery } from './views.schema';

const MANAGE = 'calendar.community-dates.manage';

/** D-147: a retired community date is shown only to those who can bring it back — its own unit's managers. */
async function withoutRetiredUnlessManaged(
  db: D1Database,
  ctx: RequestContext,
  items: CalendarItem[],
): Promise<CalendarItem[]> {
  const manages = new Map<string, boolean>();
  const shown: CalendarItem[] = [];
  for (const item of items) {
    if (item.retiredAt === null) {
      shown.push(item);
      continue;
    }
    if (!manages.has(item.unitId))
      manages.set(item.unitId, await can(db, ctx, MANAGE, { unitId: item.unitId }));
    if (manages.get(item.unitId)) shown.push(item);
  }
  return shown;
}

/**
 * Brief 19 B1 to B3 and D-146, D-150: the unit's own calendar — its meetings,
 * events and community dates, and the General Council's dates for all
 * branches — or every branch's, each in its colour; filtered by kind and
 * branch. Anyone who reads their unit's calendar can switch to all branches.
 */
export async function calendarView(
  db: D1Database,
  ctx: RequestContext,
  params: CalendarQuery & { unitId: string },
): Promise<CalendarView> {
  await requireCalendarCapability(db, ctx, 'calendar.calendar.read', params.unitId);
  const units = await listCalendarUnits(db);
  const all = params.scope === 'all';
  const inScope = all ? units.map((u) => u.id) : [params.unitId];
  const unitIds = params.units?.length
    ? inScope.filter((id) => params.units?.includes(id))
    : inScope;
  const period = { from: params.from, to: params.to };
  const [entries, dates] = await Promise.all([
    listEntries(db, unitIds, period),
    listCommunityDates(db, { unitIds, allBranches: !all && !params.units?.length, ...period }),
  ]);
  const kinds = params.kinds?.length ? params.kinds : null;
  const items = [...entries, ...dates]
    .filter((item) => kinds === null || kinds.includes(item.kind))
    .sort(
      (a, b) =>
        a.startDate.localeCompare(b.startDate) ||
        (a.startTime ?? '').localeCompare(b.startTime ?? ''),
    );
  return { items: await withoutRetiredUnlessManaged(db, ctx, items), units };
}
