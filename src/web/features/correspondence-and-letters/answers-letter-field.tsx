import type { RecordingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { fillText } from '../../text/fill-text';

/** D-214 (O-146): the unit's own letter out that this letter answers, if it answers one. */
export function AnswersLetterField(props: {
  value: string;
  lettersOut: RecordingChoices['lettersOut'];
  onChange: (value: string) => void;
}) {
  const t = useText().services['correspondence-and-letters'].record;
  return (
    <SelectField
      label={t.answers}
      value={props.value}
      optional
      emptyLabel={t.notAnAnswer}
      options={props.lettersOut.map((l) => ({
        value: l.id,
        label: fillText(t.letterOut, {
          reference: l.referenceNumber,
          recipient: l.recipientName,
          subject: l.subject,
        }),
      }))}
      onChange={props.onChange}
    />
  );
}
