import { useState } from 'react';
import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { EventList } from './event-list';
import { useEvents } from './use-event-queries';
import { useEventUnit } from './use-event-unit';

/** Brief 21 and D-173: the unit's events, soonest first, a page at a time (D-217). */
export function EventsPage() {
  const unitId = useEventUnit();
  const text = useText();
  const t = text.services['event-organiser'];
  const { context } = useActiveSession();
  const [page, setPage] = useState(1);
  const events = useEvents(unitId, page);
  // Hints only (T-042): the portal decides each request itself.
  const creates = context.capabilities.includes('event-organiser.events.create');
  if (events.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (events.isError) return <ErrorAlert error={events.error} refusals={t.refusals} />;
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
      {events.data.items.length === 0 && <p>{t.list.none}</p>}
      <EventList events={events.data.items} />
      {events.data.pageCount > 1 && (
        <PageNav
          page={events.data.page}
          pageCount={events.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </section>
  );
}
