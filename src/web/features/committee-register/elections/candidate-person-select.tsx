import { useQuery } from '@tanstack/react-query';
import { useApiRequest } from '../../../app/api/use-api-request';
import { useText } from '../../../app/language/use-text';
import { fetchOfficers, fetchPastOfficers } from '../officers/officers.api';

/** The value that picks "someone new" rather than a person in the register (P3). */
export const SOMEONE_NEW = 'new';

interface CandidatePersonSelectProps {
  unitId: string;
  value: string;
  onChange: (value: string) => void;
}

/** Brief 14 C1 and P3: a candidate from the unit's officers and past officers, or someone new. */
export function CandidatePersonSelect({ unitId, value, onChange }: CandidatePersonSelectProps) {
  const request = useApiRequest();
  const t = useText().services['committee-register'].elections;
  const people = useQuery({
    queryKey: ['committee-register', unitId, 'candidate-people'],
    queryFn: async () => {
      const [current, past] = await Promise.all([
        fetchOfficers(request, unitId),
        fetchPastOfficers(request, unitId),
      ]);
      const byId = new Map([...current, ...past].map((o) => [o.personId, o.name]));
      return [...byId].sort(([, a], [, b]) => a.localeCompare(b));
    },
  });
  return (
    <label className="flex flex-col gap-1">
      <span>{t.candidate}</span>
      <select
        className="rounded border border-slate-400 p-2"
        required
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="" disabled>
          {t.chooseCandidate}
        </option>
        {(people.data ?? []).map(([personId, name]) => (
          <option key={personId} value={personId}>
            {name}
          </option>
        ))}
        <option value={SOMEONE_NEW}>{t.someoneNew}</option>
      </select>
    </label>
  );
}
