import { useState } from 'react';
import { OPEN_STATUSES } from '../../../shared/correspondence-and-letters/letter-in-statuses';
import type { LetterInDetail } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { SelectField } from '../../components/select-field';
import { letterInPath } from './correspondence.api';
import { useLetterAction } from './use-letter-action';
import { useRecordingChoices } from './use-letter-queries';

/** D-214 (O-145): who handles the letter, changed while it is open by those who record letters in. */
export function LetterInHandler(props: { unitId: string; letter: LetterInDetail }) {
  const t = useText().services['correspondence-and-letters'];
  const choices = useRecordingChoices(props.unitId);
  const action = useLetterAction();
  const [chosen, setChosen] = useState(props.letter.handlerPersonId);
  if (!OPEN_STATUSES.includes(props.letter.status) || !choices.data) return null;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        action.mutate({
          path: `${letterInPath(props.unitId, props.letter.id)}/handler`,
          body: { handlerPersonId: chosen, version: props.letter.version },
        });
      }}
    >
      <SelectField
        label={t.letter.handler}
        value={chosen}
        options={choices.data.officers.map((o) => ({ value: o.personId, label: o.name }))}
        onChange={setChosen}
      />
      <button
        type="submit"
        className="rounded border border-slate-400 px-3 py-2"
        disabled={action.isPending || chosen === props.letter.handlerPersonId}
      >
        {t.letter.changeHandler}
      </button>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </form>
  );
}
