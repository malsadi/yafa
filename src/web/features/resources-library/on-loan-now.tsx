import type { EquipmentRecord } from '../../../shared/resources-library/equipment';
import { useText } from '../../app/language/use-text';
import { useLoanSummary } from './use-loan-summary';

/** D-099: what is out on loan now, from the unit's own equipment, soonest due first. */
export function OnLoanNow({ items }: { items: EquipmentRecord[] }) {
  const t = useText().services['resources-library'].equipment;
  const summary = useLoanSummary();
  const open = items
    .flatMap((item) =>
      (item.loans ?? [])
        .filter((loan) => !loan.returnedOn)
        .map((loan) => ({ item: item.item, loan })),
    )
    .sort((a, b) => a.loan.dueBack.localeCompare(b.loan.dueBack));
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.onLoanNow}</h3>
      {open.length === 0 && <p className="text-sm">{t.nothingOut}</p>}
      <ul className="flex flex-col gap-1 text-sm">
        {open.map(({ item, loan }) => (
          <li key={loan.id}>{summary(item, loan)}</li>
        ))}
      </ul>
    </section>
  );
}
