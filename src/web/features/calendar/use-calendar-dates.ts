import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { useLanguage } from '../../app/language/use-language';

const MIDDAY = (date: string) => new Date(`${date}T12:00:00Z`);
// 2001-01-01 was a Monday: the week's day names, Monday first.
const A_WEEK = Array.from({ length: 7 }, (_, i) => `2001-01-0${String(i + 1)}`);

/** Month titles, weekday names and day numbers in the officer's language. */
export function useCalendarDates() {
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  const month = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const day = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  return {
    monthTitle: (date: string) => month.format(MIDDAY(date)),
    weekdays: A_WEEK.map((d) => weekday.format(MIDDAY(d))),
    weekdayOf: (date: string) => weekday.format(MIDDAY(date)),
    dayNumber: (date: string) => day.format(MIDDAY(date)),
  };
}
