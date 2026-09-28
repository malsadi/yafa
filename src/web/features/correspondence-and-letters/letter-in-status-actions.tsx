import { LETTER_IN_MOVES } from '../../../shared/correspondence-and-letters/letter-in-statuses';
import type { LetterInDetail } from '../../../shared/correspondence-and-letters/letter-records';
import { useText } from '../../app/language/use-text';
import { ActionButton } from '../../components/action-button';
import { ErrorAlert } from '../../components/error-alert';
import { fillText } from '../../text/fill-text';
import { letterInPath } from './correspondence.api';
import { useLetterAction } from './use-letter-action';

/** Brief 23 B4 and D-214 (O-144): the moves allowed from where the letter stands. */
export function LetterInStatusActions(props: { unitId: string; letter: LetterInDetail }) {
  const t = useText().services['correspondence-and-letters'];
  const action = useLetterAction();
  const { letter } = props;
  const moves = LETTER_IN_MOVES[letter.status];
  if (moves.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        {moves.map((status) => (
          <ActionButton
            key={status}
            label={fillText(t.letter.moveTo, { status: t.statuses[status] })}
            disabled={action.isPending}
            onClick={() => {
              action.mutate({
                path: `${letterInPath(props.unitId, letter.id)}/status`,
                body: { status, version: letter.version },
              });
            }}
          />
        ))}
      </div>
      <ErrorAlert error={action.error} refusals={t.refusals} />
    </div>
  );
}
