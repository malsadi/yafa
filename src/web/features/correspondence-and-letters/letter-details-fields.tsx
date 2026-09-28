import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { TextField } from '../../components/text-field';
import { draftSubject, type LetterDraft } from './letter-draft';
import { LetterSigningChoice } from './letter-signing-choice';
import { LetterTemplateChoice } from './letter-template-choice';

/** Brief 23 A2 and D-214 (O-139): the template, recipient, each of its fields, the subject, signer and reply. */
export function LetterDetailsFields(props: {
  draft: LetterDraft;
  choices: WritingChoices;
  onChange: (draft: LetterDraft) => void;
}) {
  const t = useText().services['correspondence-and-letters'].write;
  const { draft, choices } = props;
  const set = (change: Partial<LetterDraft>) => {
    props.onChange({ ...draft, ...change });
  };
  const template = choices.templates.find((x) => x.id === draft.templateId);
  const dir = template?.language === 'ar' ? 'rtl' : undefined;
  return (
    <>
      <LetterTemplateChoice draft={draft} choices={choices} dir={dir} set={set} />
      {template?.fields.map((field) => (
        <TextField
          key={field}
          label={field}
          dir={dir}
          value={draft.fieldValues[field] ?? ''}
          onChange={(value) => {
            set({ fieldValues: { ...draft.fieldValues, [field]: value } });
          }}
        />
      ))}
      <TextField
        label={t.subject}
        value={draftSubject(draft, template)}
        dir={dir}
        onChange={(subject) => {
          set({ subject });
        }}
      />
      <p className="text-sm text-slate-600">{t.subjectHint}</p>
      <LetterSigningChoice draft={draft} choices={choices} set={set} />
    </>
  );
}
