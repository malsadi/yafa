import { describe, expect, it } from 'vitest';
import {
  formatReference,
  referenceFormatProblems,
} from '../../../src/shared/correspondence-and-letters/reference-format';

describe('a reference number format (brief 23 B1; D-214, O-136 to O-138)', () => {
  it('writes the unit code, the year and the number, at least as many digits as asked', () => {
    const values = { unitCode: 'NTH', year: 2026, number: 7 };
    expect(formatReference('{unit_code}/OUT/{year}/{number:3}', values)).toBe('NTH/OUT/2026/007');
    expect(formatReference('{year}-{number}', { ...values, number: 1234 })).toBe('2026-1234');
  });

  it('accepts a format with one number and the year', () => {
    expect(referenceFormatProblems('{unit_code}/IN/{year}/{number:4}')).toEqual([]);
  });

  it('refuses a format without the year, since numbers restart each year (O-137)', () => {
    expect(referenceFormatProblems('{unit_code}/{number}')).toEqual(['no-year']);
  });

  it('refuses no number, two numbers, unknown placeholders, stray braces, or nothing', () => {
    expect(referenceFormatProblems('{year}')).toEqual(['no-number']);
    expect(referenceFormatProblems('{year}/{number}/{number:2}')).toEqual(['number-twice']);
    expect(referenceFormatProblems('{branch}/{year}/{number}')).toEqual(['unknown-placeholder']);
    expect(referenceFormatProblems('{year}/{number:0}')).toEqual([
      'unknown-placeholder',
      'no-number',
    ]);
    expect(referenceFormatProblems('{year}/{number}}')).toEqual(['stray-brace']);
    expect(referenceFormatProblems('  ')).toEqual(['empty']);
  });
});
