import type { Branding } from '../../../shared/administration-panel/branding';
import type { LetterheadUnit } from '../../../shared/resources-library/letter-template';
import { replaceFields } from '../../../shared/resources-library/letter-template-fields';
import type { LetterheadInput } from '../../../pdf-templates/letterhead/letterhead-input';
import { getTextBundle } from '../../text';
import type { LetterTemplateDraft } from './library.api';

/** D-102: how a field shows in the preview — its name, marked as a placeholder. */
const placeholder = (name: string) => `[${name}]`;

/**
 * D-102: the template on the real letterhead, in its own language, with its
 * fields shown as placeholders. Null until the branding it needs is set.
 * The logo's place is marked, as on the branding screen's preview (T-124).
 */
export function templateLetterhead(
  draft: LetterTemplateDraft,
  branding: Branding,
  unit: LetterheadUnit,
): LetterheadInput | null {
  const { organisationName, mainColour, accentColour, logoPosition } = branding;
  if (!organisationName || !mainColour || !accentColour || !logoPosition) return null;
  const ar = draft.language === 'ar';
  const sample = getTextBundle(draft.language).services['resources-library'].letterTemplates.sample;
  const unitName = ar ? unit.nameAr : unit.nameEn;
  return {
    language: draft.language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    mainColour,
    accentColour,
    logoPosition,
    logoSrc: null,
    logoPlaceholder: sample.logo,
    unit: { name: unitName, address: (ar ? unit.addressAr : null) ?? unit.addressEn },
    letter: {
      subject: replaceFields(draft.subject, placeholder),
      paragraphs: replaceFields(draft.body, placeholder).split(/\n\s*\n/),
      signer: { ...sample.signer, unit: unitName },
    },
  };
}
