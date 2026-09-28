import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { useLanguage } from './use-language';

const MB = 1024 * 1024;

/** A size in bytes as megabytes, in the officer's language — the unit the file settings use (9.3). */
export function useFormatSize(): (bytes: number) => string {
  const { language } = useLanguage();
  const format = new Intl.NumberFormat(buildDisplayLocale(language, null), {
    style: 'unit',
    unit: 'megabyte',
    maximumFractionDigits: 2,
  });
  return (bytes) => format.format(bytes / MB);
}
