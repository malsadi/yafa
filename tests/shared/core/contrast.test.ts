import { describe, expect, it } from 'vitest';
import {
  contrastAgainstWhite,
  readsOnWhite,
} from '../../../src/shared/administration-panel/contrast';

describe('contrast against white (D-082, WCAG 2 AA)', () => {
  it('matches WCAG’s own figures', () => {
    expect(contrastAgainstWhite('#000000')).toBeCloseTo(21, 1);
    expect(contrastAgainstWhite('#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastAgainstWhite('#767676')).toBeCloseTo(4.54, 2);
  });

  it('accepts colours at normal reading contrast, and refuses paler ones', () => {
    expect(readsOnWhite('#1D4ED8')).toBe(true);
    expect(readsOnWhite('#767676')).toBe(true);
    expect(readsOnWhite('#777777')).toBe(false);
    expect(readsOnWhite('#FACC15')).toBe(false);
  });
});
