import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import type { CandidateInput } from './elections.api';
import { CandidatePersonSelect, SOMEONE_NEW } from './candidate-person-select';

const NO_ONE = { name: '', email: '', phone: '' };

interface AddCandidateFormProps {
  unitId: string;
  busy: boolean;
  onAdd: (input: CandidateInput) => void;
}

/**
 * Brief 14 C1 and P3: add a candidate. Someone new is recorded as a person
 * with no term and no invitation until they are elected and it is confirmed.
 */
export function AddCandidateForm({ unitId, busy, onAdd }: AddCandidateFormProps) {
  const t = useText().services['committee-register'];
  const [choice, setChoice] = useState('');
  const [person, setPerson] = useState(NO_ONE);
  const set = (field: keyof typeof NO_ONE) => (value: string) => {
    setPerson((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(choice === SOMEONE_NEW ? { newPerson: person } : { personId: choice });
        setChoice('');
        setPerson(NO_ONE);
      }}
    >
      <CandidatePersonSelect unitId={unitId} value={choice} onChange={setChoice} />
      {choice === SOMEONE_NEW && (
        <>
          <TextField label={t.register.name} value={person.name} onChange={set('name')} />
          <TextField
            label={t.register.email}
            type="email"
            value={person.email}
            onChange={set('email')}
          />
          <TextField
            label={t.register.phone}
            type="tel"
            value={person.phone}
            onChange={set('phone')}
          />
        </>
      )}
      <button type="submit" className="rounded border px-3 py-2" disabled={busy}>
        {t.elections.addCandidate}
      </button>
    </form>
  );
}
