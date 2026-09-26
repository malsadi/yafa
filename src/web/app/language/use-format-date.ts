import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../shared/core/format-date-london';
import { useLanguage } from './use-language';

/** Formats a calendar date (`YYYY-MM-DD`) as a long date in the officer's language. */
export function useFormatDate(): (date: string) => string {
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  // Midday UTC is the same calendar day in London, whatever the season.
  return (date) => formatDateLondon(`${date}T12:00:00Z`, locale, { dateStyle: 'long' });
}
