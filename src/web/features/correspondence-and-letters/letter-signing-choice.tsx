import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { fillText } from '../../text/fill-text';
import type { LetterDraft } from './letter-draft';

/** D-214 (O-140, O-144): the role the writer signs with, and the letter in it answers, if any. */
export function LetterSigningChoice(props: {
  draft: LetterDraft;
  choices: WritingChoices;
  set: (change: Partial<LetterDraft>) => void;
}) {
  const t = useText().services['correspondence-and-letters'].write;
  const { language } = useLanguage();
  const { draft, choices, set } = props;
  return (
    <>
      <SelectField
        label={t.signAs}
        value={draft.signerRoleId}
        emptyLabel={t.choose}
        options={choices.signerRoles.map((r) => ({
          value: r.roleId,
          label: language === 'ar' ? r.nameAr : r.nameEn,
        }))}
        onChange={(signerRoleId) => {
          set({ signerRoleId });
        }}
      />
      <SelectField
        label={t.replyTo}
        value={draft.replyToLetterInId}
        optional
        emptyLabel={t.notAReply}
        options={choices.answerable.map((l) => ({
          value: l.id,
          label: fillText(t.answerable, {
            reference: l.referenceNumber,
            sender: l.sender,
            subject: l.subject,
          }),
        }))}
        onChange={(replyToLetterInId) => {
          set({ replyToLetterInId });
        }}
      />
    </>
  );
}
