import { Link } from 'react-router';
import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { useText } from '../../app/language/use-text';

const PATHS = {
  meeting: (id: string) => `/meeting-recorder/meetings/${id}`,
  event: (id: string) => `/event-organiser/events/${id}`,
} as const;

/**
 * Brief 10.3 and 19 A1, A2: a meeting or event is changed only in its own
 * service, so the Calendar links to it there — for the unit's own items,
 * which are the ones its officers can open.
 */
export function CalendarSourceLink(props: { item: CalendarItem; unitId: string }) {
  const t = useText().services.calendar;
  const { item } = props;
  if (item.kind === 'community' || item.unitId !== props.unitId) return null;
  return (
    <Link to={PATHS[item.kind](item.id)} className="self-start underline">
      {item.kind === 'meeting' ? t.openMeeting : t.openEvent}
    </Link>
  );
}
