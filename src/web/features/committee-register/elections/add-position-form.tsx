import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import { RoleSelect } from '../officers/role-select';

interface AddPositionFormProps {
  unitId: string;
  busy: boolean;
  onAdd: (input: { roleId: string; seats: number }) => void;
}

/** Brief 14 C1 and D-066: a position is a role the unit uses, with one or more seats. */
export function AddPositionForm({ unitId, busy, onAdd }: AddPositionFormProps) {
  const t = useText().services['committee-register'].elections;
  const [roleId, setRoleId] = useState('');
  const [seats, setSeats] = useState('');
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({ roleId, seats: Number(seats) });
        setRoleId('');
        setSeats('');
      }}
    >
      <RoleSelect unitId={unitId} value={roleId} onChange={setRoleId} />
      <TextField label={t.seats} type="number" value={seats} onChange={setSeats} />
      <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={busy}>
        {t.addPosition}
      </button>
    </form>
  );
}
