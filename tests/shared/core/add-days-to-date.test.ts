import { describe, expect, it } from 'vitest';
import { addDaysToDate } from '../../../src/shared/core/add-days-to-date';

describe('addDaysToDate', () => {
  it('moves a calendar date across month and year ends, and leap days', () => {
    expect(addDaysToDate('2026-09-25', 10)).toBe('2026-10-05');
    expect(addDaysToDate('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToDate('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('is unaffected by the clocks changing in London', () => {
    expect(addDaysToDate('2026-10-24', 2)).toBe('2026-10-26');
    expect(addDaysToDate('2026-03-28', 2)).toBe('2026-03-30');
  });
});
