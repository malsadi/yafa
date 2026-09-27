import { Link } from 'react-router';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { StatusMessage } from '../../components/status-message';
import { useMeetings, useMeetingUnit } from './use-meeting-queries';

/** Brief 22 and D-199: the unit's meetings, soonest first, each with its type and status. */
export function MeetingsPage() {
  const unitId = useMeetingUnit();
  const text = useText();
  const t = text.services['meeting-recorder'];
  const date = useFormatDate();
  const { language } = useLanguage();
  const { context } = useActiveSession();
  const meetings = useMeetings(unitId);
  // Hints only (T-042): the portal decides each request itself.
  const manages = context.capabilities.includes('meeting-recorder.meetings.manage');
  if (meetings.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (meetings.isError) return <StatusMessage>{t.refusals['permission.denied']}</StatusMessage>;
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
      {meetings.data.length === 0 && <p>{t.list.none}</p>}
      <ul className="flex flex-col gap-2">
        {meetings.data.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center gap-3 rounded border border-slate-300 p-3"
          >
            <Link to={`/meeting-recorder/meetings/${m.id}`} className="font-medium underline">
              {language === 'ar' ? m.typeNameAr : m.typeNameEn}
            </Link>
            <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[m.status]}</span>
            <span className="ms-auto text-sm">{`${date(m.date)}, ${m.startTime}`}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
