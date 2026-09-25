import { useText } from '../../../app/language/use-text';
import { useUnitPeople } from '../use-unit-people';

interface PersonSelectProps {
  unitId: string;
  label: string;
  value: string;
  onChange: (personId: string) => void;
}

/** A required choice among the people who hold or have held a term in the unit. */
export function PersonSelect({ unitId, label, value, onChange }: PersonSelectProps) {
  const t = useText().services['committee-register'].handovers;
  const people = useUnitPeople(unitId);
  return (
    <label className="flex flex-col gap-1">
      <span>{label}</span>
      <select
        className="rounded border border-slate-400 p-2"
        required
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      >
        <option value="" disabled>
          {t.choosePerson}
        </option>
        {(people.data ?? []).map(([personId, name]) => (
          <option key={personId} value={personId}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
