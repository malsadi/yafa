import { describe, expect, it } from 'vitest';
import { getTodayInLondon } from '../../../src/worker/core/permissions/today-in-london';

describe('getTodayInLondon', () => {
  it('formats a UTC instant as YYYY-MM-DD', () => {
    expect(getTodayInLondon(new Date('2026-03-15T12:00:00Z'))).toBe('2026-03-15');
  });

  it('applies the Europe/London offset near midnight UTC during British Summer Time', () => {
    // 2026-06-15T23:30:00Z is already 2026-06-16 in Europe/London (BST, UTC+1).
    expect(getTodayInLondon(new Date('2026-06-15T23:30:00Z'))).toBe('2026-06-16');
  });

  it('does not apply an offset in winter, when London is on UTC', () => {
    expect(getTodayInLondon(new Date('2026-01-15T23:30:00Z'))).toBe('2026-01-15');
  });
});
