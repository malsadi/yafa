import type { EquipmentRecord } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { LendEquipment } from './lend-equipment';
import { LoanItem } from './loan-item';
import type { useEquipment } from './use-equipment';

type Actions = Pick<ReturnType<typeof useEquipment>, 'lend' | 'correct' | 'recordReturn'>;

/** Brief 16 C2: an item's loans, for its own unit (O-059); lending while it is not retired. */
export function EquipmentLoans({
  item,
  manages,
  actions,
}: {
  item: EquipmentRecord;
  manages: boolean;
  actions: Actions;
}) {
  const t = useText().services['resources-library'].equipment;
  if (!item.loans) return null;
  return (
    <section className="flex flex-col gap-2">
      <h4 className="font-medium">{t.loans}</h4>
      <ErrorAlert
        error={actions.lend.error ?? actions.correct.error ?? actions.recordReturn.error}
        refusals={t.refusals}
      />
      <ul className="flex flex-col gap-2">
        {item.loans.map((loan) => (
          <LoanItem
            key={loan.id}
            item={item.item}
            loan={loan}
            manages={manages}
            actions={actions}
          />
        ))}
      </ul>
      {manages && !item.retiredAt && <LendEquipment equipmentId={item.id} lend={actions.lend} />}
    </section>
  );
}
