import { Link } from 'react-router';
import type { MeetingSummary } from '../../../shared/meeting-recorder/meeting-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';

/** Brief 22: one page of the unit's meetings, each with its type, status, date and time. */
export function MeetingList({ meetings }: { meetings: MeetingSummary[] }) {
  const t = useText().services['meeting-recorder'];
  const date = useFormatDate();
  const { language } = useLanguage();
  return (
    <ul className="flex flex-col gap-2">
      {meetings.map((m) => (
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
  );
}
