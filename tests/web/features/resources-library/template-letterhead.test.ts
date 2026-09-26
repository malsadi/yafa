import { describe, expect, it } from 'vitest';
import type { Branding } from '../../../../src/shared/administration-panel/branding';
import { buildLetterhead } from '../../../../src/pdf-templates/letterhead/build-letterhead';
import { templateLetterhead } from '../../../../src/web/features/resources-library/template-letterhead';

const BRANDING: Branding = {
  organisationName: { en: 'Example Council', ar: 'مجلس تجريبي' },
  mainColour: '#1D4ED8',
  accentColour: '#B91C1C',
  logoPosition: 'right',
  files: {
    logo: true,
    'icon-192': true,
    'icon-512': true,
    'latin-font': true,
    'arabic-font': true,
  },
  letterheadUnit: null,
};
const UNIT = {
  nameEn: 'North Branch',
  nameAr: 'فرع الشمال',
  addressEn: '1 Example Road',
  addressAr: null,
};
const DRAFT = {
  title: 'Thanks',
  subject: 'Thank you, {{venue}}',
  body: 'Dear {{ contact }},\n\nThank you.\n\nYours,',
  fields: ['venue', 'contact'],
  language: 'en' as const,
};

function INPUT_MISSING(): never {
  throw new Error('The branding is set, so the letterhead is built.');
}

describe('a letter template on the letterhead (D-102)', () => {
  it("shows the fields as placeholders, on the unit's letterhead, in the template's language", () => {
    const input = templateLetterhead(DRAFT, BRANDING, UNIT);
    expect(input?.letter).toMatchObject({
      subject: 'Thank you, [venue]',
      paragraphs: ['Dear [contact],', 'Thank you.', 'Yours,'],
      signer: { unit: 'North Branch' },
    });
    expect(input).toMatchObject({ organisationName: 'Example Council', logoPosition: 'right' });
    expect(input?.unit).toEqual({ name: 'North Branch', address: '1 Example Road' });
  });

  it('uses the Arabic names for an Arabic template, and the English address when there is no Arabic one', () => {
    const input = templateLetterhead({ ...DRAFT, language: 'ar' }, BRANDING, UNIT);
    expect(input).toMatchObject({ language: 'ar', organisationName: 'مجلس تجريبي' });
    expect(input?.unit).toEqual({ name: 'فرع الشمال', address: '1 Example Road' });
  });

  it('renders a template with no subject cleanly: no subject line, the letter straight after (D-112)', () => {
    const input = templateLetterhead({ ...DRAFT, subject: '  ' }, BRANDING, UNIT);
    expect(input?.letter.subject).toBeUndefined();
    const { bodyHtml } = buildLetterhead(input ?? INPUT_MISSING());
    expect(bodyHtml).not.toContain('lh-subject');
    expect(bodyHtml).toContain('<main class="lh-body"><p>Dear [contact],</p>');
  });

  it('waits for the branding it needs', () => {
    expect(templateLetterhead(DRAFT, { ...BRANDING, logoPosition: null }, UNIT)).toBeNull();
    expect(templateLetterhead(DRAFT, { ...BRANDING, organisationName: null }, UNIT)).toBeNull();
  });
});
