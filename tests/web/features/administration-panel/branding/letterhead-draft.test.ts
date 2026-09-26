import { describe, expect, it } from 'vitest';
import { letterheadFor } from '../../../../../src/web/features/administration-panel/branding/letterhead-draft';

const DRAFT = {
  nameEn: 'Example Council',
  nameAr: '',
  mainColour: '#1D4ED8',
  accentColour: '#B91C1C',
  logoPosition: 'right' as const,
};
const UNIT = {
  nameEn: 'General Council',
  nameAr: 'المجلس العام',
  addressEn: '1 Example Street',
  addressAr: null,
};

describe('the letterhead preview’s content (D-090, D-022)', () => {
  it('fills the design from the draft being edited, and the General Council’s address', () => {
    const input = letterheadFor(DRAFT, UNIT, 'en');
    expect(input).toMatchObject({
      organisationName: 'Example Council',
      logoPosition: 'right',
      unit: { name: 'General Council', address: '1 Example Street' },
    });
    expect(input.letter.paragraphs.length).toBeGreaterThan(1);
  });

  it('shows the Arabic in Arabic, and the English while an Arabic text is not written', () => {
    const input = letterheadFor(DRAFT, UNIT, 'ar');
    expect(input.organisationName).toBe('Example Council');
    expect(input.unit).toEqual({ name: 'المجلس العام', address: '1 Example Street' });
    expect(letterheadFor({ ...DRAFT, nameAr: 'مجلس تجريبي' }, UNIT, 'ar').organisationName).toBe(
      'مجلس تجريبي',
    );
  });
});
