import { useQuery } from '@tanstack/react-query';
import type { ClashNotice } from '../../../shared/calendar/calendar-records';
import { useApiRequest } from '../../app/api/use-api-request';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { titleInLanguage } from '../../app/language/title-in-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { unitPath } from './meeting-recorder.api';
import { MEETINGS_KEY } from './meeting-keys';

/** Brief 19 B4: the unit's other meetings and events on the chosen day — a notice only; nothing is blocked. */
export function MeetingClashNotice(props: { unitId: string; date: string; meetingId?: string }) {
  const t = useText().services.calendar;
  const formatDate = useFormatDate();
  const { language } = useLanguage();
  const request = useApiRequest();
  const query = new URLSearchParams({
    date: props.date,
    ...(props.meetingId ? { meetingId: props.meetingId } : {}),
  });
  const clashes = useQuery({
    queryKey: [...MEETINGS_KEY, props.unitId, 'clashes', props.date, props.meetingId],
    queryFn: () =>
      request<ClashNotice[]>(`${unitPath(props.unitId)}/meeting-clashes?${query.toString()}`),
    enabled: /^\d{4}-\d{2}-\d{2}$/.test(props.date),
  });
  if (!clashes.data?.length) return null;
  const items = clashes.data
    .map(
      (c) =>
        `${formatDate(c.date)}, ${t.kinds[c.kind]}: ${titleInLanguage(c, language)}${c.startTime ? ` (${c.startTime})` : ''}`,
    )
    .join('; ');
  return (
    <p role="status" className="rounded border border-amber-400 bg-amber-50 p-2 text-sm">
      {fillText(t.clash, { items })}
    </p>
  );
}
