import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { formatMoneyGBP } from '../../../shared/core/format-money-gbp';
import { useLanguage } from '../../app/language/use-language';

/** Integer pence as pounds in the officer's language (brief 28: £1,234.56). */
export function useFormatMoney(): (pence: number) => string {
  const { language } = useLanguage();
  // D-048: Western digits until the administrator's digits setting exists.
  const locale = buildDisplayLocale(language, null);
  return (pence) => formatMoneyGBP(pence, locale);
}
