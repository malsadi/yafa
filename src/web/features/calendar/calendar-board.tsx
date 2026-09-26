import { useState } from 'react';
import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import type { MeUnit } from '../../../shared/core/me-response';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { CalendarFilters } from './calendar-filters';
import { CalendarItemDetails } from './calendar-item-details';
import { CalendarPeriodView } from './calendar-period-view';
import { CalendarToolbar } from './calendar-toolbar';
import { CommunityDateAdder } from './community-date-adder';
import { filtered, useCalendarState } from './use-calendar-state';
import { useCalendarView } from './use-calendar-view';

const itemKey = (item: CalendarItem) => `${item.kind}:${item.id}`;

/** Brief 19 B: the calendar — its views, scope and filters — with a chosen item's details and adding a date. */
export function CalendarBoard(props: { unit: MeUnit }) {
  const text = useText();
  const t = text.services.calendar;
  // Hints only (T-042): the portal decides each request itself.
  const manages = useActiveSession().context.capabilities.includes(
    'calendar.community-dates.manage',
  );
  const state = useCalendarState();
  const [chosen, setChosen] = useState<string | null>(null);
  const calendar = useCalendarView(props.unit.id, { ...state.period, scope: state.scope });
  if (calendar.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (calendar.isError) return <ErrorAlert error={calendar.error} refusals={t.refusals} />;
  const items = filtered(calendar.data.items, state);
  const selected = items.find((item) => itemKey(item) === chosen);
  return (
    <section className="flex flex-col gap-3">
      <CalendarToolbar state={state} />
      <CalendarFilters state={state} units={calendar.data.units} />
      <CalendarPeriodView
        view={state.view}
        period={state.period}
        items={items}
        showUnit={state.scope === 'all'}
        onChoose={(item) => {
          setChosen(itemKey(item));
        }}
      />
      {selected && (
        <CalendarItemDetails
          item={selected}
          unit={props.unit}
          manages={manages && selected.kind === 'community' && selected.unitId === props.unit.id}
          onClose={() => {
            setChosen(null);
          }}
        />
      )}
      {manages && <CommunityDateAdder unit={props.unit} />}
    </section>
  );
}
