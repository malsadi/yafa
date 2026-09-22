import { describe, expect, it } from 'vitest';
import { formatMoneyGBP } from '../../../src/shared/core/format-money-gbp';

// T-017: money is built as an exact decimal string and passed to
// Intl.NumberFormat as that string, never as a float — proved here against
// the real workerd Intl implementation, not assumed from the spec.
describe('formatMoneyGBP', () => {
  it('formats a whole-pound amount', () => {
    expect(formatMoneyGBP(500000, 'en-GB')).toBe('£5,000.00');
  });

  it('formats sub-pound amounts without floating-point drift', () => {
    // 0.1 + 0.2 !== 0.3 in float arithmetic; pence is always an integer, so this must be exact.
    expect(formatMoneyGBP(1, 'en-GB')).toBe('£0.01');
    expect(formatMoneyGBP(99, 'en-GB')).toBe('£0.99');
  });

  it('formats a large amount without losing precision', () => {
    expect(formatMoneyGBP(123_456_789_00, 'en-GB')).toBe('£123,456,789.00');
  });

  it('formats a negative amount (a reversing entry)', () => {
    expect(formatMoneyGBP(-2500, 'en-GB')).toBe('-£25.00');
  });

  it('formats zero', () => {
    expect(formatMoneyGBP(0, 'en-GB')).toBe('£0.00');
  });

  it('formats in Arabic with no numbering-system extension, without throwing', () => {
    // The digit script here is this runtime's own Intl default for 'ar'
    // (T-017: "the browser's own default applies" when the setting is
    // unset) — not something this function chooses, so not asserted exactly.
    expect(formatMoneyGBP(1050, 'ar')).toContain('10.50');
  });

  it('formats in Arabic-Indic digits when the caller passes that numbering system explicitly', () => {
    expect(formatMoneyGBP(1050, 'ar-u-nu-arab')).toContain('١٠٫٥٠');
  });

  it('rejects a non-integer pence value', () => {
    expect(() => formatMoneyGBP(10.5, 'en-GB')).toThrow(RangeError);
  });

  it('rejects an unsafe integer', () => {
    expect(() => formatMoneyGBP(Number.MAX_SAFE_INTEGER + 1, 'en-GB')).toThrow(RangeError);
  });
});
