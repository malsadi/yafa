import { useState } from 'react';
import { useText } from '../../../app/language/use-text';
import { RoleSelect } from '../officers/role-select';
import type { NewHandover } from './handovers.api';
import { PersonSelect } from './person-select';

const EMPTY: NewHandover = { roleId: '', outgoingPersonId: '', incomingPersonId: '' };

interface CreateHandoverFormProps {
  unitId: string;
  busy: boolean;
  onCreate: (handover: NewHandover) => void;
}

/** Brief 14 C2: set up a handover; its checklist starts from the handover items list (25 B3). */
export function CreateHandoverForm({ unitId, busy, onCreate }: CreateHandoverFormProps) {
  const t = useText().services['committee-register'].handovers;
  const [handover, setHandover] = useState(EMPTY);
  const set = (field: keyof NewHandover) => (value: string) => {
    setHandover((current) => ({ ...current, [field]: value }));
  };
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onCreate(handover);
        setHandover(EMPTY);
      }}
    >
      <RoleSelect unitId={unitId} value={handover.roleId} onChange={set('roleId')} />
      <PersonSelect
        unitId={unitId}
        label={t.outgoing}
        value={handover.outgoingPersonId}
        onChange={set('outgoingPersonId')}
      />
      <PersonSelect
        unitId={unitId}
        label={t.incoming}
        value={handover.incomingPersonId}
        onChange={set('incomingPersonId')}
      />
      <button type="submit" className="rounded bg-slate-900 px-3 py-2 text-white" disabled={busy}>
        {t.setUp}
      </button>
    </form>
  );
}
