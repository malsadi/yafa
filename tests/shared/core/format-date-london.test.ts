import { describe, expect, it } from 'vitest';
import { formatDateLondon } from '../../../src/shared/core/format-date-london';

describe('formatDateLondon', () => {
  it('formats a date-only value in en-GB', () => {
    const result = formatDateLondon('2026-03-15T12:00:00Z', 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toBe('15 March 2026');
  });

  it('applies the Europe/London offset during British Summer Time', () => {
    // 23:30 UTC on 2026-06-15 is already 00:30 on 2026-06-16 in Europe/London (BST).
    const result = formatDateLondon('2026-06-15T23:30:00Z', 'en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    expect(result).toBe('16/06/2026');
  });

  it('applies no offset in winter, when London is on UTC', () => {
    const result = formatDateLondon('2026-01-15T23:30:00Z', 'en-GB', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    expect(result).toBe('15/01/2026');
  });

  it('formats without throwing in Arabic', () => {
    const result = formatDateLondon('2026-03-15T12:00:00Z', 'ar', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result.length).toBeGreaterThan(0);
  });
});
