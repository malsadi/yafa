import { useState } from 'react';
import type { CalendarItem, CalendarKind } from '../../../shared/calendar/calendar-records';
import { todayInLondon } from '../../app/language/today-in-london';
import type { CalendarQuery } from './calendar.api';
import { periodFor, type CalendarViewKind } from './calendar-period';

/** What the officer has chosen to see: the view, the period, the scope and the filters (19 B1 to B3). */
export function useCalendarState() {
  const [view, setView] = useState<CalendarViewKind>('month');
  const [anchor, setAnchor] = useState(todayInLondon);
  // Brief 19 rules: each branch sees its own calendar by default.
  const [scope, setScope] = useState<CalendarQuery['scope']>('branch');
  const [hiddenKinds, setHiddenKinds] = useState<CalendarKind[]>([]);
  const [hiddenUnits, setHiddenUnits] = useState<string[]>([]);
  return {
    view,
    setView,
    anchor,
    setAnchor,
    scope,
    setScope,
    hiddenKinds,
    setHiddenKinds,
    hiddenUnits,
    setHiddenUnits,
    period: periodFor(view, anchor),
  };
}

export type CalendarState = ReturnType<typeof useCalendarState>;

/** Brief 19 B3: the items left once hidden kinds, and hidden branches across all branches, are taken out. */
export function filtered(items: CalendarItem[], state: CalendarState): CalendarItem[] {
  return items.filter(
    (item) =>
      !state.hiddenKinds.includes(item.kind) &&
      (state.scope === 'branch' || !state.hiddenUnits.includes(item.unitId)),
  );
}

/** Adds or removes one value from a list of hidden ones. */
export function toggled<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
