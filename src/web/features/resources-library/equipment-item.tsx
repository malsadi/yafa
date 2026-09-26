import { useState } from 'react';
import type { EquipmentRecord, EquipmentView } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { EquipmentEdit } from './equipment-edit';
import { EquipmentLoans } from './equipment-loans';
import { EquipmentSummary } from './equipment-summary';
import { ItemBadges } from './item-badges';
import { RetireButton } from './retire-button';
import type { useEquipment } from './use-equipment';

interface ItemProps {
  item: EquipmentRecord;
  conditions: EquipmentView['conditions'];
  manages: boolean;
  actions: Pick<ReturnType<typeof useEquipment>, 'save' | 'lend' | 'correct' | 'recordReturn'>;
  onSetRetired: (retire: boolean) => void;
}

/** Brief 16 C1: one item, and its loans for its own unit. */
export function EquipmentItem({ item, conditions, manages, actions, onSetRetired }: ItemProps) {
  const t = useText().services['resources-library'].equipment;
  const [editing, setEditing] = useState(false);
  if (editing) {
    return (
      <li>
        <EquipmentEdit
          item={item}
          conditions={conditions}
          save={actions.save}
          onDone={() => {
            setEditing(false);
          }}
        />
      </li>
    );
  }
  return (
    <li className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium">{item.item}</span>
        <ItemBadges national={item.national} retired={item.retiredAt !== null} labels={t} />
        {manages && (
          <span className="ms-auto flex gap-2">
            <button
              type="button"
              className="rounded border border-slate-400 px-3 py-1"
              onClick={() => {
                setEditing(true);
              }}
            >
              {t.edit}
            </button>
            <RetireButton
              retired={item.retiredAt !== null}
              busy={false}
              labels={t}
              onSetRetired={onSetRetired}
            />
          </span>
        )}
      </div>
      <EquipmentSummary item={item} />
      <EquipmentLoans item={item} manages={manages} actions={actions} />
    </li>
  );
}
