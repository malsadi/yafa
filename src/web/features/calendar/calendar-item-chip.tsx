import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';

/** Brief 19 B2: one item in its unit's colour — its time, title, and (across branches) its branch. */
export function CalendarItemChip(props: {
  item: CalendarItem;
  showUnit: boolean;
  onChoose: (item: CalendarItem) => void;
}) {
  const t = useText().services.calendar;
  const { language } = useLanguage();
  const { item } = props;
  return (
    <button
      type="button"
      className="w-full rounded border-s-4 bg-slate-50 px-1 text-start text-sm"
      style={item.colour ? { borderInlineStartColor: item.colour } : undefined}
      onClick={() => {
        props.onChoose(item);
      }}
    >
      {item.startTime && <span className="me-1 font-medium">{item.startTime}</span>}
      <span className={item.retiredAt ? 'line-through' : undefined}>{item.title}</span>
      <span className="sr-only"> ({t.kinds[item.kind]})</span>
      {props.showUnit && (
        <span className="block text-xs text-slate-600">
          {language === 'ar' ? item.unitNameAr : item.unitNameEn}
        </span>
      )}
    </button>
  );
}
