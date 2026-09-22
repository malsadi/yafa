import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateId } from '../../../src/worker/core/ids';

const CROCKFORD_BASE32 = /^[0-9A-HJKMNP-TV-Z]{26}$/;

describe('generateId', () => {
  it('returns a 26-character Crockford base32 string', () => {
    expect(generateId()).toMatch(CROCKFORD_BASE32);
  });

  it('generates a different id on every call', () => {
    const ids = new Set(Array.from({ length: 2000 }, () => generateId()));
    expect(ids.size).toBe(2000);
  });

  it('sorts lexicographically with generation time', async () => {
    const earlier = generateId();
    await new Promise((resolve) => {
      setTimeout(resolve, 5);
    });
    const later = generateId();

    expect(earlier < later).toBe(true);
  });

  describe('with the clock fixed', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-22T00:00:00.000Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('keeps the same time prefix for ids generated in the same millisecond', () => {
      const first = generateId();
      const second = generateId();

      expect(first.slice(0, 10)).toBe(second.slice(0, 10));
    });

    it('gives a later millisecond a greater time prefix', () => {
      const earlier = generateId();
      vi.setSystemTime(new Date('2026-09-22T00:00:00.001Z'));
      const later = generateId();

      expect(later.slice(0, 10) > earlier.slice(0, 10)).toBe(true);
    });
  });
});
