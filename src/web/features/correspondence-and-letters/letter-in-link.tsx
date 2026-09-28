import { useState } from 'react';
import { OPEN_STATUSES } from '../../../shared/correspondence-and-letters/letter-in-statuses';
import type { LetterInDetail } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { AnswersLetterField } from './answers-letter-field';
import { letterInPath } from './correspondence.api';
import { useLetterAction } from './use-letter-action';
import { useRecordingChoices } from './use-letter-queries';

/** D-216: which of our letters this one answers, corrected while it is open. */
export function LetterInLink(props: { unitId: string; letter: LetterInDetail }) {
  const t = useText().services['correspondence-and-letters'];
  const choices = useRecordingChoices(props.unitId);
  const action = useLetterAction();
  const [chosen, setChosen] = useState(props.letter.answersLetterOutId ?? '');
  if (!OPEN_STATUSES.includes(props.letter.status) || !choices.data) return null;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        action.mutate({
          path: `${letterInPath(props.unitId, props.letter.id)}/answers`,
          body: { answersLetterOutId: chosen || null, version: props.letter.version },
        });
      }}
    >
      <AnswersLetterField
        value={chosen}
        lettersOut={choices.data.lettersOut}
        onChange={setChosen}
      />
      <button
        type="submit"
        className="rounded border border-slate-400 px-3 py-2"
        disabled={action.isPending || chosen === (props.letter.answersLetterOutId ?? '')}
      >
        {t.letter.saveLink}
      </button>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </form>
  );
}
