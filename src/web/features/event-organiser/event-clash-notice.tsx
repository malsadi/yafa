import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../app/api/use-api-request';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { titleInLanguage } from '../../app/language/title-in-language';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { fetchEventClashes } from './event-organiser.api';
import { EVENTS_KEY } from './event-keys';

const isDay = (text: string) => /^\d{4}-\d{2}-\d{2}$/.test(text);

/**
 * Brief 19 B4 and D-189: the unit's other meetings and events on any day the
 * event covers, each with its day — a notice only; nothing is blocked.
 */
export function EventClashNotice(props: {
  unitId: string;
  firstDay: string;
  lastDay: string;
  eventId?: string;
}) {
  const t = useText().services.calendar;
  const formatDate = useFormatDate();
  const { language } = useLanguage();
  const request = useApiRequest();
  const valid =
    isDay(props.firstDay) &&
    (props.lastDay === '' || (isDay(props.lastDay) && props.lastDay >= props.firstDay));
  const clashes = useQuery({
    queryKey: [
      ...EVENTS_KEY,
      props.unitId,
      'clashes',
      props.firstDay,
      props.lastDay,
      props.eventId,
    ],
    queryFn: () => fetchEventClashes(request, props.unitId, props),
    enabled: valid,
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
