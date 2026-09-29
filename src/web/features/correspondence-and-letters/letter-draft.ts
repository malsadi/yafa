import type { Branding } from '../../../shared/administration-panel/branding';
import { filledLetter } from '../../../shared/correspondence-and-letters/filled-letter';
import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { buildDisplayLocale } from '../../../shared/core/build-display-locale';
import { formatDateLondon } from '../../../shared/core/format-date-london';
import type { LetterheadInput } from '../../../pdf-templates/letterhead/letterhead-input';
import { getTextBundle } from '../../text';
import { fillText } from '../../text/fill-text';
import { LETTERHEAD_LOGO } from '../../app/branding/letterhead-logo';

export type Template = WritingChoices['templates'][number];

/** Brief 23 A2 and D-214: a letter as it is being written — nothing is saved until it is generated (O-142). */
export interface LetterDraft {
  templateId: string;
  recipientName: string;
  recipientAddress: string;
  fieldValues: Record<string, string>;
  /** Null until the writer types their own; until then it follows the template's subject (O-139). */
  subject: string | null;
  signerRoleId: string;
  replyToLetterInId: string;
}

export function emptyDraft(choices: WritingChoices, replyTo: string | null): LetterDraft {
  const answerable = replyTo && choices.answerable.some((l) => l.id === replyTo) ? replyTo : '';
  const [onlyRole] = choices.signerRoles.length === 1 ? choices.signerRoles : [];
  return {
    templateId: '',
    recipientName: '',
    recipientAddress: '',
    fieldValues: {},
    subject: null,
    signerRoleId: onlyRole?.roleId ?? '',
    replyToLetterInId: answerable,
  };
}

/** D-213 choice: the register's subject starts as the template's, filled in as the fields are typed. */
export function draftSubject(draft: LetterDraft, template: Template | undefined): string {
  if (draft.subject !== null) return draft.subject;
  return template ? (filledLetter(template, draft.fieldValues).subject ?? '') : '';
}

/** What is sent to generate the letter (23 A2). */
export function generateBody(draft: LetterDraft, template: Template | undefined) {
  return {
    templateId: draft.templateId,
    recipientName: draft.recipientName,
    recipientAddress: draft.recipientAddress.trim() || null,
    subject: draftSubject(draft, template),
    fieldValues: draft.fieldValues,
    signerRoleId: draft.signerRoleId,
    replyToLetterInId: draft.replyToLetterInId || null,
  };
}

/**
 * D-214 (O-142) and D-090: the letter as it stands, on the unit's
 * letterhead, in the template's language — the reference shown where it
 * will go. Null until a template is chosen and the branding is set.
 */
export function previewLetterhead(
  draft: LetterDraft,
  choices: WritingChoices,
  branding: Branding,
): LetterheadInput | null {
  const template = choices.templates.find((t) => t.id === draft.templateId);
  const { organisationName, mainColour, accentColour, logoPosition } = branding;
  if (!template || !organisationName || !mainColour || !accentColour || !logoPosition) return null;
  const ar = template.language === 'ar';
  const bundle = getTextBundle(template.language);
  const t = bundle.services['correspondence-and-letters'].letterPdf;
  const role = choices.signerRoles.find((r) => r.roleId === draft.signerRoleId);
  const unit = choices.letterheadUnit;
  const unitName = ar ? unit.nameAr : unit.nameEn;
  return {
    language: template.language,
    organisationName: (ar ? organisationName.ar : null) ?? organisationName.en,
    mainColour,
    accentColour,
    logoPosition,
    logoSrc: LETTERHEAD_LOGO,
    unit: { name: unitName, address: (ar ? unit.addressAr : null) ?? unit.addressEn },
    letter: {
      heading: {
        reference: fillText(t.reference, { reference: t.referenceToCome }),
        date: fillText(t.date, {
          date: formatDateLondon(
            new Date().toISOString(),
            buildDisplayLocale(template.language, null),
            {
              dateStyle: 'long',
            },
          ),
        }),
        recipient: [draft.recipientName, ...draft.recipientAddress.split('\n')].filter(Boolean),
      },
      ...filledLetter(template, draft.fieldValues),
      signer: {
        name: choices.signerName,
        role: (ar ? role?.nameAr : role?.nameEn) ?? '',
        unit: unitName,
      },
    },
  };
}
