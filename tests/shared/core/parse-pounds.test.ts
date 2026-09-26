import { describe, expect, it } from 'vitest';
import {
  parsePoundsToPence,
  parseSignedPoundsToPence,
  penceToPoundsText,
} from '../../../src/shared/core/parse-pounds';

describe('pounds written by an officer, as pence (brief 9.1)', () => {
  it('reads whole pounds, and pounds with one or two decimal places', () => {
    expect(parsePoundsToPence('150')).toBe(15000);
    expect(parsePoundsToPence(' 150.5 ')).toBe(15050);
    expect(parsePoundsToPence('0.07')).toBe(7);
    expect(parsePoundsToPence('19.99')).toBe(1999);
  });

  it('refuses anything else', () => {
    for (const text of ['', '£5', '1.234', '-3', '1,000', 'abc', '.5']) {
      expect(parsePoundsToPence(text)).toBeNull();
    }
  });

  it('writes pence back as pounds for a field', () => {
    expect(penceToPoundsText(15050)).toBe('150.50');
    expect(penceToPoundsText(7)).toBe('0.07');
  });

  it('reads a negative amount too, for an opening balance (D-119)', () => {
    expect(parseSignedPoundsToPence('-20.50')).toBe(-2050);
    expect(parseSignedPoundsToPence('20')).toBe(2000);
    expect(parseSignedPoundsToPence('--2')).toBeNull();
  });
});
