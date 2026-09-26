import type { EquipmentRecord, EquipmentView } from '../../../shared/resources-library/equipment';
import { EquipmentForm } from './equipment-form';
import type { useEquipment } from './use-equipment';

/** Brief 16 C1: change an item; it keeps its condition even if that has left the list (15 B3). */
export function EquipmentEdit(props: {
  item: EquipmentRecord;
  conditions: EquipmentView['conditions'];
  save: ReturnType<typeof useEquipment>['save'];
  onDone: () => void;
}) {
  const { item, save, onDone } = props;
  const own = { id: item.conditionId, nameEn: item.conditionNameEn, nameAr: item.conditionNameAr };
  const choices = props.conditions.some((c) => c.id === own.id)
    ? props.conditions
    : [own, ...props.conditions];
  return (
    <EquipmentForm
      initial={item}
      conditions={choices}
      busy={save.isPending}
      error={save.error}
      onCancel={onDone}
      onSave={(equipment) => {
        save.mutate(
          { equipmentId: item.id, version: item.version, equipment },
          { onSuccess: onDone },
        );
      }}
    />
  );
}
