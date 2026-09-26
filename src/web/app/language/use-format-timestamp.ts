import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../shared/core/format-date-london';
import { useLanguage } from './use-language';

/** Formats a moment (an ISO timestamp) as its long London date, in the officer's language. */
export function useFormatTimestamp(): (timestamp: string) => string {
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  return (timestamp) => formatDateLondon(timestamp, locale, { dateStyle: 'long' });
}
