import { useQuery } from '@tanstack/react-query';
import type { CalendarColourChoice } from '../../../../shared/committee-register/unit-record';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';

interface CalendarColourSelectProps {
  /** The unit being edited, or null for a new branch. */
  unitId: string | null;
  value: string;
  onChange: (value: string) => void;
}

/**
 * D-076 and D-078: the unit's calendar colour, from the calendar colours
 * list. A colour another unit uses is shown but can't be chosen, and when
 * none is free the screen says to add another colour to the list. A colour
 * since retired stays shown as the unit's own until another is chosen.
 */
export function CalendarColourSelect({ unitId, value, onChange }: CalendarColourSelectProps) {
  const request = useApiRequest();
  const { language } = useLanguage();
  const t = useText().services['administration-panel'].units;
  const colours = useQuery({
    queryKey: ['units', 'calendar-colours'],
    queryFn: () => request<CalendarColourChoice[]>('/api/committee-register/calendar-colours'),
  });
  const offered = colours.data ?? [];
  const takenByOther = (c: CalendarColourChoice) =>
    c.usedByUnitId !== null && c.usedByUnitId !== unitId;
  const keepsRetired = value !== '' && !offered.some((c) => c.id === value);
  const noneFree = colours.isSuccess && offered.every(takenByOther);
  return (
    <label className="flex flex-col gap-1">
      <span>{t.calendarColour}</span>
      <select
        className="rounded border border-slate-400 p-2"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="">{t.noCalendarColour}</option>
        {keepsRetired && <option value={value}>{t.retiredCalendarColour}</option>}
        {offered.map((colour) => (
          <option key={colour.id} value={colour.id} disabled={takenByOther(colour)}>
            {{ en: colour.nameEn, ar: colour.nameAr }[language]}
            {takenByOther(colour) && ` (${t.colourInUse})`}
          </option>
        ))}
      </select>
      {noneFree && (
        <span role="alert" className="max-w-xs rounded bg-amber-100 p-2 text-sm text-amber-950">
          {t.noColourFree}
        </span>
      )}
    </label>
  );
}
