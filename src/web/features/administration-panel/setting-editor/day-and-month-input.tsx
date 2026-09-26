import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { useLanguage } from '../../../app/language/use-language';
import { DraftSelect } from './draft-select';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));

/** A day and month (such as 1 April), as the draft `month-day`. */
export function DayAndMonthInput(props: {
  label: string;
  draft: string;
  onChange: (draft: string) => void;
}) {
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const monthName = new Intl.DateTimeFormat(buildDisplayLocale(language, null), {
    month: 'long',
    timeZone: 'UTC',
  });
  const [month = '', day = ''] = props.draft ? props.draft.split('-') : [];
  const set = (m: string, d: string) => {
    props.onChange(m && d ? `${m}-${d}` : '');
  };
  const months = MONTHS.map(
    (m) => [String(m), monthName.format(new Date(Date.UTC(2001, m - 1, 1)))] as const,
  );
  return (
    <span className="flex gap-2" role="group" aria-label={props.label}>
      <DraftSelect
        value={day}
        options={DAYS.map((d) => [d, d] as const)}
        onChange={(d) => {
          set(month, d);
        }}
      />
      <DraftSelect
        value={month}
        options={months}
        onChange={(m) => {
          set(m, day);
        }}
      />
    </span>
  );
}
