import type { Branding } from '../../../../shared/administration-panel/branding';
import { filledLetter } from '../../../../shared/correspondence-and-letters/filled-letter';
import type { WritingChoices } from '../../../../shared/correspondence-and-letters/letter-records';
import { buildDisplayLocale } from '../../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../../shared/core/format-date-london';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { getTextBundle } from '../../../../web/text';
import { fillText } from '../../../../web/text/fill-text';
import { ServiceUnavailableError } from '../../../core/errors';
import type { LetterUnitRow } from '../letter-access';

export interface WrittenLetter {
  template: WritingChoices['templates'][number];
  fieldValues: Record<string, string>;
  recipientName: string;
  recipientAddress: string | null;
  /** The reference printed on it, or the preview's placeholder for it. */
  reference: string;
  letterDate: string;
  signer: { name: string; roleNameEn: string; roleNameAr: string };
}

/**
 * D-213 choice: a real letter waits until the letterhead is complete —
 * the organisation's name, both colours, the logo and its position, and the
 * font for the template's language — rather than printing a marked gap.
 */
function requireLetterhead(branding: Branding, language: 'en' | 'ar') {
  const { organisationName, mainColour, accentColour, logoPosition, files } = branding;
  const font = language === 'ar' ? files['arabic-font'] : files['latin-font'];
  if (!organisationName || !mainColour || !accentColour || !logoPosition || !files.logo || !font)
    throw new ServiceUnavailableError('setting.not-configured');
  return { organisationName, mainColour, accentColour, logoPosition };
}

/**
 * Brief 23 A2, 9.4 and D-214 (O-139 to O-141): the letter on the generating
 * unit's letterhead, in its template's language — reference, date and
 * recipient, the filled-in text, and the signer's name, role and unit.
 */
export function letterOutDocument(
  letter: WrittenLetter,
  unit: LetterUnitRow,
  branding: Branding,
): Omit<LetterheadInput, 'logoSrc'> {
  const { language } = letter.template;
  const ar = language === 'ar';
  const head = requireLetterhead(branding, language);
  const t = getTextBundle(language).services['correspondence-and-letters'].letterPdf;
  const locale = buildDisplayLocale(language, null);
  const date = formatDateLondon(`${letter.letterDate}T12:00:00Z`, locale, { dateStyle: 'long' });
  const unitName = ar ? unit.nameAr : unit.nameEn;
  const address = letter.recipientAddress?.split('\n').filter((l) => l.trim() !== '') ?? [];
  return {
    language,
    organisationName: (ar ? head.organisationName.ar : null) ?? head.organisationName.en,
    mainColour: head.mainColour,
    accentColour: head.accentColour,
    logoPosition: head.logoPosition,
    logoPlaceholder: '',
    unit: {
      name: unitName,
      address: (ar ? unit.letterheadAddressAr : null) ?? unit.letterheadAddressEn,
    },
    letter: {
      heading: {
        reference: fillText(t.reference, { reference: letter.reference }),
        date: fillText(t.date, { date }),
        recipient: [letter.recipientName, ...address],
      },
      ...filledLetter(letter.template, letter.fieldValues),
      signer: {
        name: letter.signer.name,
        role: ar ? letter.signer.roleNameAr : letter.signer.roleNameEn,
        unit: unitName,
      },
    },
  };
}
