import { describe, expect, it } from 'vitest';
import { londonTimeToUtc } from '../../../src/shared/core/london-time-to-utc';

describe('a London time as its UTC moment (brief 9.1)', () => {
  it('is the same in winter, and an hour earlier in summer', () => {
    expect(londonTimeToUtc('2026-01-15', '19:00').toISOString()).toBe('2026-01-15T19:00:00.000Z');
    expect(londonTimeToUtc('2026-07-15', '19:00').toISOString()).toBe('2026-07-15T18:00:00.000Z');
  });

  it('holds on the days the clocks change', () => {
    expect(londonTimeToUtc('2026-03-29', '12:00').toISOString()).toBe('2026-03-29T11:00:00.000Z');
    expect(londonTimeToUtc('2026-10-25', '12:00').toISOString()).toBe('2026-10-25T12:00:00.000Z');
  });
});
