import { useState } from 'react';
import type { SystemAdministratorCandidate } from '../../../../shared/administration-panel/system-administrators';
import { useText } from '../../../app/language/use-text';

interface AppointAdministratorFormProps {
  candidates: SystemAdministratorCandidate[];
  busy: boolean;
  onAppoint: (personId: string) => void;
}

/** Brief 25 A1: appoint someone holding a current General Council term. */
export function AppointAdministratorForm(props: AppointAdministratorFormProps) {
  const t = useText().services['administration-panel'].systemAdministrators;
  const [personId, setPersonId] = useState('');
  if (props.candidates.length === 0) return <p>{t.noCandidates}</p>;
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        props.onAppoint(personId);
        setPersonId('');
      }}
    >
      <label className="flex flex-col gap-1">
        <span>{t.officer}</span>
        <select
          className="rounded border border-slate-400 p-2"
          value={personId}
          onChange={(event) => {
            setPersonId(event.target.value);
          }}
        >
          <option value="">{t.chooseOfficer}</option>
          {props.candidates.map((candidate) => (
            <option key={candidate.personId} value={candidate.personId}>
              {candidate.name} ({candidate.email})
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="rounded bg-slate-900 px-3 py-2 text-white disabled:opacity-50"
        disabled={props.busy || personId === ''}
      >
        {t.appoint}
      </button>
    </form>
  );
}
