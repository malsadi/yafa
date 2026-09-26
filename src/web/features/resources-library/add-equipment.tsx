import { useState } from 'react';
import type { EquipmentView } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { EquipmentForm } from './equipment-form';
import type { useEquipment } from './use-equipment';

const EMPTY = { item: '', quantity: 1, location: '', conditionId: '' };

/** Brief 16 C1: add an item to the unit's register. */
export function AddEquipment(props: {
  conditions: EquipmentView['conditions'];
  create: ReturnType<typeof useEquipment>['create'];
}) {
  const t = useText().services['resources-library'].equipment;
  const [adding, setAdding] = useState(false);
  const done = () => {
    setAdding(false);
  };
  if (!adding) {
    return (
      <button
        type="button"
        className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        onClick={() => {
          setAdding(true);
        }}
      >
        {t.add}
      </button>
    );
  }
  return (
    <EquipmentForm
      initial={EMPTY}
      conditions={props.conditions}
      busy={props.create.isPending}
      error={props.create.error}
      onCancel={done}
      onSave={(item) => {
        props.create.mutate(item, { onSuccess: done });
      }}
    />
  );
}
