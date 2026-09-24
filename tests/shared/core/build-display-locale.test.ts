import { describe, expect, it } from 'vitest';
import { buildDisplayLocale } from '../../../src/shared/core/build-display-locale';
import { formatMoneyGBP } from '../../../src/shared/core/format-money-gbp';

describe('buildDisplayLocale (brief section 8.5, D-048)', () => {
  it('uses UK English for English', () => {
    expect(buildDisplayLocale('en', null)).toBe('en-GB');
  });

  it('shows Western digits in Arabic until the administrator chooses', () => {
    expect(formatMoneyGBP(123456, buildDisplayLocale('ar', null))).toMatch(/1,?234[.,]56|1٬234٫56/);
    expect(formatMoneyGBP(123456, buildDisplayLocale('ar', null))).not.toMatch(/[٠-٩]/);
  });

  it('shows Arabic-Indic digits once the administrator chooses them', () => {
    expect(formatMoneyGBP(123456, buildDisplayLocale('ar', 'arabic-indic'))).toMatch(/[٠-٩]/);
  });

  it('shows Western digits when the administrator chooses them', () => {
    expect(buildDisplayLocale('ar', 'western')).toBe('ar-u-nu-latn');
  });
});
