import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { TextField } from '../../../components/text-field';
import type { NewOfficer } from './officers.api';
import { RoleSelect } from './role-select';

const EMPTY = { name: '', email: '', phone: '', roleId: '', startDate: '', endDate: '' };

interface AddOfficerFormProps {
  unitId: string;
  busy: boolean;
  onAdd: (officer: NewOfficer) => void;
}

/**
 * Brief 14 B1: add an officer with a term. A known email adds a term to
 * that person (P5); a new person is invited to sign in (brief 6.2).
 */
export function AddOfficerForm({ unitId, busy, onAdd }: AddOfficerFormProps) {
  const t = useText().services['committee-register'].register;
  const [officer, setOfficer] = useState(EMPTY);
  const set = (field: keyof typeof EMPTY) => (value: string) => {
    setOfficer((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd({ ...officer, endDate: officer.endDate || null });
        setOfficer(EMPTY);
      }}
    >
      <TextField label={t.name} value={officer.name} onChange={set('name')} />
      <TextField label={t.email} type="email" value={officer.email} onChange={set('email')} />
      <TextField label={t.phone} type="tel" value={officer.phone} onChange={set('phone')} />
      <RoleSelect unitId={unitId} value={officer.roleId} onChange={set('roleId')} />
      <TextField
        label={t.startDate}
        type="date"
        value={officer.startDate}
        onChange={set('startDate')}
      />
      <TextField
        label={t.endDateOptional}
        type="date"
        optional
        value={officer.endDate}
        onChange={set('endDate')}
      />
      <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={busy}>
        {t.addOfficer}
      </button>
    </form>
  );
}
