import { useQuery } from '@tanstack/react-query';
import type { ListItem } from '../../../../shared/administration-panel/lists';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

/**
 * D-076: the unit's calendar colour, from the calendar colours list. A colour
 * since retired stays shown as the unit's own until another is chosen.
 */
export function CalendarColourSelect(props: { value: string; onChange: (value: string) => void }) {
  const request = useApiRequest();
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].units;
  const colours = useQuery({
    queryKey: ['units', 'calendar-colours'],
    queryFn: () => request<ListItem[]>('/api/committee-register/calendar-colours'),
  });
  const offered = colours.data ?? [];
  const keepsRetired = props.value !== '' && !offered.some((c) => c.id === props.value);
  return (
    <label className="flex flex-col gap-1">
      <span>{t.calendarColour}</span>
      <select
        className="rounded border border-slate-400 p-2"
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      >
        <option value="">{t.noCalendarColour}</option>
        {keepsRetired && <option value={props.value}>{t.retiredCalendarColour}</option>}
        {offered.map((colour) => (
          <option key={colour.id} value={colour.id}>
            {{ en: colour.nameEn, ar: colour.nameAr }[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
