import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { unitCalendarPath } from './calendar.api';
import { useCalendarAction } from './use-calendar-action';

/** D-147: retire a community date (hidden, never deleted), or bring a retired one back. */
export function CommunityDateRetireButton(props: { unitId: string; item: CalendarItem }) {
  const t = useText().services.calendar;
  const action = useCalendarAction();
  const retired = props.item.retiredAt !== null;
  const path = `${unitCalendarPath(props.unitId)}/community-dates/${props.item.id}/${retired ? 'restore' : 'retire'}`;
  return (
    <>
      <button
        type="button"
        disabled={action.isPending}
        className="rounded border border-slate-400 px-3 py-1 disabled:opacity-50"
        onClick={() => {
          action.mutate({ path, method: 'POST', body: { version: props.item.version } });
        }}
      >
        {retired ? t.restore : t.retire}
      </button>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </>
  );
}
