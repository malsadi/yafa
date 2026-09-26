import { useState } from 'react';
import type { EquipmentDetails, EquipmentView } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { TextField } from '../../components/text-field';
import { fillText } from '../../text/fill-text';
import { EditFormButtons } from './edit-form-buttons';
import { EquipmentConditionField } from './equipment-condition-field';

interface EquipmentFormProps {
  initial: EquipmentDetails;
  /** The conditions offered, plus the item's own if it has since been retired from the list. */
  conditions: EquipmentView['conditions'];
  busy: boolean;
  error: Error | null;
  onSave: (item: EquipmentDetails) => void;
  onCancel: () => void;
}

/** Brief 16 C1 and D-114: the item and how many; where it is kept and its condition (15 B3) optional. */
export function EquipmentForm(props: EquipmentFormProps) {
  const t = useText().services['resources-library'].equipment;
  const [item, setItem] = useState({
    item: props.initial.item,
    quantity: String(props.initial.quantity),
    location: props.initial.location ?? '',
    conditionId: props.initial.conditionId ?? '',
  });
  const set = (key: keyof typeof item) => (value: string) => {
    setItem((current) => ({ ...current, [key]: value }));
  };
  const optional = (label: string) => fillText(t.optional, { label });
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave({
          item: item.item,
          quantity: Number(item.quantity),
          location: item.location.trim() || null,
          conditionId: item.conditionId || null,
        });
      }}
    >
      <ErrorAlert error={props.error} refusals={t.refusals} />
      <TextField label={t.item} value={item.item} onChange={set('item')} />
      <TextField
        label={t.quantity}
        type="number"
        value={item.quantity}
        onChange={set('quantity')}
      />
      <TextField
        label={optional(t.location)}
        value={item.location}
        onChange={set('location')}
        optional
      />
      <EquipmentConditionField
        conditions={props.conditions}
        value={item.conditionId}
        onChange={set('conditionId')}
      />
      <EditFormButtons labels={t} busy={props.busy} onCancel={props.onCancel} />
    </form>
  );
}
