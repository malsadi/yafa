import { describe, expect, it } from 'vitest';
import {
  financialYearOf,
  financialYearStartingIn,
  isFixedDayOfYear,
} from '../../../src/shared/treasury/financial-year';

describe('financial years (brief 17 C3; D-128)', () => {
  it('runs from the start day to the day before the next start', () => {
    expect(financialYearStartingIn(2026, { month: 4, day: 1 })).toEqual({
      start: '2026-04-01',
      end: '2027-03-31',
    });
    expect(financialYearStartingIn(2026, { month: 1, day: 1 })).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    });
    expect(financialYearStartingIn(2027, { month: 3, day: 1 })).toEqual({
      start: '2027-03-01',
      end: '2028-02-29',
    });
  });

  it('finds the year a date falls in', () => {
    const april = { month: 4, day: 1 };
    expect(financialYearOf('2026-03-31', april)).toEqual({
      start: '2025-04-01',
      end: '2026-03-31',
    });
    expect(financialYearOf('2026-04-01', april)).toEqual({
      start: '2026-04-01',
      end: '2027-03-31',
    });
  });

  it('accepts only a day every year has', () => {
    expect(isFixedDayOfYear({ month: 4, day: 1 })).toBe(true);
    expect(isFixedDayOfYear({ month: 2, day: 29 })).toBe(false);
    expect(isFixedDayOfYear({ month: 4, day: 31 })).toBe(false);
  });
});
