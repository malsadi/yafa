import type { WritingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextAreaField } from '../../components/text-area-field';
import { TextField } from '../../components/text-field';
import { fillText } from '../../text/fill-text';
import type { LetterDraft } from './letter-draft';

type Change = (change: Partial<LetterDraft>) => void;

/** Brief 23 A1 and D-214 (O-139, O-141): the template, and who the letter is to. */
export function LetterTemplateChoice(props: {
  draft: LetterDraft;
  choices: WritingChoices;
  dir: 'rtl' | undefined;
  set: Change;
}) {
  const t = useText().services['correspondence-and-letters'].write;
  const { draft, set } = props;
  return (
    <>
      <SelectField
        label={t.template}
        value={draft.templateId}
        emptyLabel={t.choose}
        options={props.choices.templates.map((x) => ({
          value: x.id,
          label: x.national ? fillText(t.national, { title: x.title }) : x.title,
        }))}
        onChange={(templateId) => {
          set({ templateId, fieldValues: {}, subject: null });
        }}
      />
      <TextField
        label={t.recipientName}
        value={draft.recipientName}
        dir={props.dir}
        onChange={(recipientName) => {
          set({ recipientName });
        }}
      />
      <TextAreaField
        label={t.recipientAddress}
        value={draft.recipientAddress}
        dir={props.dir}
        onChange={(recipientAddress) => {
          set({ recipientAddress });
        }}
      />
    </>
  );
}
