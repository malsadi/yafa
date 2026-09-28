import { Link } from 'react-router';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';

/** Brief 21: one page of the unit's events, each with its type, status and first day. */
export function EventList({ events }: { events: EventSummary[] }) {
  const t = useText().services['event-organiser'];
  const date = useFormatDate();
  const { language } = useLanguage();
  return (
    <ul className="flex flex-col gap-2">
      {events.map((event) => (
        <li
          key={event.id}
          className="flex flex-wrap items-center gap-3 rounded border border-slate-300 p-3"
        >
          <Link to={`/event-organiser/events/${event.id}`} className="font-medium underline">
            {event.name}
          </Link>
          <span className="text-sm">{language === 'ar' ? event.typeNameAr : event.typeNameEn}</span>
          <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[event.status]}</span>
          <span className="ms-auto text-sm">{date(event.firstDay)}</span>
        </li>
      ))}
    </ul>
  );
}
