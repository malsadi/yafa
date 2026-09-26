import type { CalendarItem } from '../../../shared/calendar/calendar-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';

/** An item's kind, unit, whether it is for all branches or retired, its days and time, and description. */
export function CalendarItemFacts(props: { item: CalendarItem }) {
  const t = useText().services.calendar;
  const { language } = useLanguage();
  const formatDate = useFormatDate();
  const { item } = props;
  return (
    <>
      <p className="text-sm">
        {t.kinds[item.kind]} · {language === 'ar' ? item.unitNameAr : item.unitNameEn}
        {item.forAllBranches && ` · ${t.forAllBranches}`}
        {item.retiredAt && ` · ${t.retired}`}
      </p>
      <p className="text-sm">
        {formatDate(item.startDate)}
        {item.endDate !== item.startDate && ` – ${formatDate(item.endDate)}`}
        {item.startTime && ` · ${item.startTime}`}
      </p>
      {item.description && <p className="whitespace-pre-line text-sm">{item.description}</p>}
      {item.kind !== 'community' && <p className="text-sm text-slate-600">{t.readOnly}</p>}
    </>
  );
}
