import type { ElectionPosition } from '../../../../shared/committee-register/election-record';
import { useLanguage } from '../../../app/language/use-language';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';
import { AddCandidateForm } from './add-candidate-form';
import type { CandidateInput } from './elections.api';

interface PositionCardProps {
  unitId: string;
  position: ElectionPosition;
  /** A Draft, for someone who records elections: the ballot can still change. */
  editable: boolean;
  busy: boolean;
  onRemovePosition: () => void;
  onAddCandidate: (input: CandidateInput) => void;
  onRemoveCandidate: (candidateId: string) => void;
}

/** Brief 14 C1: one position, its seats, and its candidates with any results. */
export function PositionCard(props: PositionCardProps) {
  const { language } = useLanguage();
  const t = useText().services['committee-register'].elections;
  const { position } = props;
  const role = { en: position.roleNameEn, ar: position.roleNameAr }[language];
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p className="font-medium">
        {role} · {fillText(t.seatCount, { seats: position.seats })}
      </p>
      <ul className="flex flex-col gap-1 ps-4">
        {position.candidates.map((c) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2">
            <span>{c.name}</span>
            {c.votes !== null && <span>· {fillText(t.votes, { votes: c.votes })}</span>}
            {c.elected && <span className="rounded bg-green-100 px-2 text-sm">{t.elected}</span>}
            {props.editable && (
              <button
                type="button"
                className="text-sm underline"
                disabled={props.busy}
                onClick={() => {
                  props.onRemoveCandidate(c.id);
                }}
              >
                {fillText(t.removeCandidate, { name: c.name })}
              </button>
            )}
          </li>
        ))}
      </ul>
      {props.editable && (
        <div className="flex flex-wrap items-end gap-2">
          <AddCandidateForm unitId={props.unitId} busy={props.busy} onAdd={props.onAddCandidate} />
          <button
            type="button"
            className="rounded border px-3 py-2"
            disabled={props.busy}
            onClick={props.onRemovePosition}
          >
            {fillText(t.removePosition, { role })}
          </button>
        </div>
      )}
    </li>
  );
}
