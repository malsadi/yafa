import { Link } from 'react-router';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { StatusMessage } from '../../components/status-message';
import { useEvents } from './use-event-queries';
import { useEventUnit } from './use-event-unit';

/** Brief 21 and D-173: the unit's events, soonest first, each with its type and status. */
export function EventsPage() {
  const unitId = useEventUnit();
  const text = useText();
  const t = text.services['event-organiser'];
  const date = useFormatDate();
  const { language } = useLanguage();
  const { context } = useActiveSession();
  const events = useEvents(unitId);
  // Hints only (T-042): the portal decides each request itself.
  const creates = context.capabilities.includes('event-organiser.events.create');
  if (events.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (events.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.list.heading}</h2>
      {creates && (
        <Link
          to="/event-organiser/events/new"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        >
          {t.list.add}
        </Link>
      )}
      {events.data.length === 0 && <p>{t.list.none}</p>}
      <ul className="flex flex-col gap-2">
        {events.data.map((event) => (
          <li
            key={event.id}
            className="flex flex-wrap items-center gap-3 rounded border border-slate-300 p-3"
          >
            <Link to={`/event-organiser/events/${event.id}`} className="font-medium underline">
              {event.name}
            </Link>
            <span className="text-sm">
              {language === 'ar' ? event.typeNameAr : event.typeNameEn}
            </span>
            <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[event.status]}</span>
            <span className="ms-auto text-sm">{date(event.firstDay)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
