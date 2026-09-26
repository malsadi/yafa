import { useState } from 'react';
import type { EquipmentDetails, EquipmentView } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { SelectField } from '../../components/select-field';
import { StatusMessage } from '../../components/status-message';
import { TextField } from '../../components/text-field';
import { useNamedOptions } from '../../app/language/use-named-options';
import { EditFormButtons } from './edit-form-buttons';

interface EquipmentFormProps {
  initial: EquipmentDetails;
  /** The conditions offered, plus the item's own if it has since been retired from the list. */
  conditions: EquipmentView['conditions'];
  busy: boolean;
  error: Error | null;
  onSave: (item: EquipmentDetails) => void;
  onCancel: () => void;
}

/** Brief 16 C1: the item, how many, where it is kept, and its condition (15 B3). */
export function EquipmentForm(props: EquipmentFormProps) {
  const t = useText().services['resources-library'].equipment;
  const named = useNamedOptions();
  const [item, setItem] = useState({ ...props.initial, quantity: String(props.initial.quantity) });
  const set = (key: keyof typeof item) => (value: string) => {
    setItem((current) => ({ ...current, [key]: value }));
  };
  if (props.conditions.length === 0) return <StatusMessage>{t.noConditions}</StatusMessage>;
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSave({ ...item, quantity: Number(item.quantity) });
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
      <TextField label={t.location} value={item.location} onChange={set('location')} />
      <SelectField
        label={t.condition}
        value={item.conditionId}
        onChange={set('conditionId')}
        options={named(props.conditions)}
        emptyLabel=""
      />
      <EditFormButtons labels={t} busy={props.busy} onCancel={props.onCancel} />
    </form>
  );
}
