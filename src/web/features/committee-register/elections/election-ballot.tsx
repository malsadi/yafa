import type { ElectionRecord } from '../../../../shared/committee-register/election-record';
import { useText } from '../../../app/language/use-text';
import { AddPositionForm } from './add-position-form';
import { addCandidate, addPosition, removeCandidate, removePosition } from './elections.api';
import { PositionCard } from './position-card';
import type { ElectionChange } from './use-election';

interface ElectionBallotProps {
  election: ElectionRecord;
  editable: boolean;
  busy: boolean;
  onChange: (change: ElectionChange) => void;
}

/** Brief 14 C1: the positions and candidates, changed while the election is a Draft. */
export function ElectionBallot({ election, editable, busy, onChange }: ElectionBallotProps) {
  const t = useText().services['committee-register'].elections;
  const electionId = election.id;
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{t.positions}</h2>
      {election.positions.length === 0 && <p>{t.noPositions}</p>}
      <ul className="flex flex-col gap-2">
        {election.positions.map((position) => (
          <PositionCard
            key={position.id}
            unitId={election.unitId}
            position={position}
            editable={editable}
            busy={busy}
            onRemovePosition={() => {
              onChange((r) => removePosition(r, electionId, position.id));
            }}
            onAddCandidate={(input) => {
              onChange((r) => addCandidate(r, { electionId, positionId: position.id, input }));
            }}
            onRemoveCandidate={(candidateId) => {
              onChange((r) => removeCandidate(r, electionId, candidateId));
            }}
          />
        ))}
      </ul>
      {editable && (
        <AddPositionForm
          unitId={election.unitId}
          busy={busy}
          onAdd={(input) => {
            onChange((r) => addPosition(r, electionId, input));
          }}
        />
      )}
    </section>
  );
}
