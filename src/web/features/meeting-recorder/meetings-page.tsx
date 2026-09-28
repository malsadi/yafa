import { useState } from 'react';
import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { MeetingList } from './meeting-list';
import { useMeetings, useMeetingUnit } from './use-meeting-queries';

/** Brief 22 and D-199: the unit's meetings, soonest first, a page at a time (D-217). */
export function MeetingsPage() {
  const unitId = useMeetingUnit();
  const text = useText();
  const t = text.services['meeting-recorder'];
  const { context } = useActiveSession();
  const [page, setPage] = useState(1);
  const meetings = useMeetings(unitId, page);
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('meeting-recorder.meetings.manage');
  if (meetings.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (meetings.isError) return <ErrorAlert error={meetings.error} refusals={t.refusals} />;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.list.heading}</h2>
      {manages && (
        <Link
          to="/meeting-recorder/meetings/new"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        >
          {t.list.add}
        </Link>
      )}
      {meetings.data.items.length === 0 && <p>{t.list.none}</p>}
      <MeetingList meetings={meetings.data.items} />
      {meetings.data.pageCount > 1 && (
        <PageNav
          page={meetings.data.page}
          pageCount={meetings.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </section>
  );
}
