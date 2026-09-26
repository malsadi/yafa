import type { Branding } from '../../../../shared/administration-panel/branding';
import type { LogoPosition } from '../../../../shared/administration-panel/branding-files';
import type { Language } from '../../../../shared/core/languages';
import type { LetterheadInput } from '../../../../pdf-templates/letterhead/letterhead-input';
import { getTextBundle } from '../../../text';

/** The branding as being edited, before it is saved (D-090: the preview follows it). */
export interface LetterheadDraft {
  nameEn: string;
  nameAr: string;
  mainColour: string;
  accentColour: string;
  logoPosition: LogoPosition | null;
}

/**
 * The letterhead's content for a preview in one language: the draft, the
 * General Council's name and address, and a sample letter in that language's
 * own words. The logo's place is marked; the PDF preview shows the logo.
 */
export function letterheadFor(
  draft: LetterheadDraft,
  unit: Branding['letterheadUnit'],
  language: Language,
): Omit<LetterheadInput, 'logoSrc'> & { logoSrc: null } {
  const sample = getTextBundle(language).services['administration-panel'].branding.sample;
  const ar = language === 'ar';
  return {
    language,
    organisationName: (ar && draft.nameAr) || draft.nameEn,
    mainColour: draft.mainColour,
    accentColour: draft.accentColour,
    logoPosition: draft.logoPosition ?? 'left',
    logoSrc: null,
    logoPlaceholder: sample.logo,
    unit: {
      name: unit ? (ar ? unit.nameAr : unit.nameEn) : '',
      address: unit ? ((ar ? unit.addressAr : null) ?? unit.addressEn) : null,
    },
    letter: { paragraphs: sample.paragraphs.split('\n\n'), signer: sample.signer },
  };
}
