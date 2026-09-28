import type { RecordingChoices } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { SelectField } from '../../components/select-field';
import { TextField } from '../../components/text-field';
import { AnswersLetterField } from './answers-letter-field';
import { DateReceivedField } from './date-received-field';
import type { LetterInDetails } from './use-record-letter';

/** Brief 23 B3 and D-214 (O-143, O-146): when it came, from whom, about what, who handles it, and what it answers. */
export function RecordLetterFields(props: {
  details: LetterInDetails;
  choices: RecordingChoices;
  set: (change: Partial<LetterInDetails>) => void;
}) {
  const t = useText().services['correspondence-and-letters'].record;
  const { details, set } = props;
  return (
    <>
      <DateReceivedField
        label={t.dateReceived}
        value={details.dateReceived}
        onChange={(dateReceived) => {
          set({ dateReceived });
        }}
      />
      <TextField
        label={t.sender}
        value={details.sender}
        onChange={(sender) => {
          set({ sender });
        }}
      />
      <TextField
        label={t.subject}
        value={details.subject}
        onChange={(subject) => {
          set({ subject });
        }}
      />
      <SelectField
        label={t.handler}
        value={details.handlerPersonId}
        emptyLabel={t.choose}
        options={props.choices.officers.map((o) => ({ value: o.personId, label: o.name }))}
        onChange={(handlerPersonId) => {
          set({ handlerPersonId });
        }}
      />
      <AnswersLetterField
        value={details.answersLetterOutId}
        lettersOut={props.choices.lettersOut}
        onChange={(answersLetterOutId) => {
          set({ answersLetterOutId });
        }}
      />
    </>
  );
}
