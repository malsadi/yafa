/**
 * Formats integer pence as GBP for display (brief section 9.1: money is
 * integer pence, GBP only, never a float). Built as an exact decimal
 * string and passed to `Intl.NumberFormat` as that string, never as a
 * `number` — floating-point division (`pence / 100`) can't be trusted for
 * money (T-017). `locale` is a complete BCP-47 tag the caller builds,
 * including a `-u-nu-...` numbering-system extension when the Arabic-digits
 * setting is configured; unset, the caller passes plain `'ar'` and the
 * browser's own default numbering system applies (T-017).
 */
export function formatMoneyGBP(pence: number, locale: string): string {
  if (!Number.isSafeInteger(pence)) {
    throw new RangeError('formatMoneyGBP: pence must be a safe integer');
  }

  const sign = pence < 0 ? '-' : '';
  const absolutePence = Math.abs(pence);
  const pounds = String(Math.trunc(absolutePence / 100));
  const remainderPence = String(absolutePence % 100).padStart(2, '0');
  const decimal = `${sign}${pounds}.${remainderPence}`;

  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'GBP' }).format(
    decimal as Intl.StringNumericLiteral,
  );
}
