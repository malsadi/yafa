import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { AddEquipment } from './add-equipment';
import { equipmentPath } from './equipment.api';
import { EquipmentItem } from './equipment-item';
import { OnLoanNow } from './on-loan-now';
import { equipmentKey, useEquipment } from './use-equipment';
import { useLibraryRetirement } from './use-library-retirement';
import { useLibraryUnit } from './use-library-unit';

/** Brief 16 C1, C2 and D-106: the unit's equipment and the General Council's, and what is out on loan. */
export function EquipmentPage() {
  const unitId = useLibraryUnit();
  const text = useText();
  const t = text.services['resources-library'].equipment;
  const { context } = useActiveSession();
  const { list, create, save, lend, correct, recordReturn } = useEquipment(unitId);
  const retirement = useLibraryRetirement(equipmentKey(unitId));
  // A hint only (T-042): the portal decides each change itself.
  const mayManage = context.capabilities.includes('resources-library.equipment.manage');
  if (list.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (list.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const { items, conditions } = list.data;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      <OnLoanNow items={items} />
      <ErrorAlert error={retirement.error} refusals={t.refusals} />
      {items.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <EquipmentItem
            key={item.id}
            item={item}
            conditions={conditions}
            manages={mayManage && item.unitId === unitId}
            actions={{ save, lend, correct, recordReturn }}
            onSetRetired={(retire) => {
              retirement.mutate({
                itemPath: `${equipmentPath(unitId)}/${item.id}`,
                version: item.version,
                retire,
              });
            }}
          />
        ))}
      </ul>
      {mayManage && <AddEquipment conditions={conditions} create={create} />}
    </section>
  );
}
