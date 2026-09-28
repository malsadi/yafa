import type { EventBudgetFigures } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { useFormatMoney } from '../treasury/use-format-money';

/** P10 and D-183: each budget line's budget against actual income and spending, "Unallocated", totals and balance. */
export function ReportBudgetTable({ budget }: { budget: EventBudgetFigures }) {
  const t = useText().services['event-organiser'].reportPdf;
  const money = useFormatMoney();
  const rows = [
    ...budget.lines.map((line) => ({ ...line, key: line.name })),
    { key: 'unallocated', name: t.unallocated, budgetPence: 0, ...budget.unallocated },
  ];
  const cells = (r: { budgetPence: number; incomePence: number; spendingPence: number }) => (
    <>
      <td className="text-end">{money(r.budgetPence)}</td>
      <td className="text-end">{money(r.incomePence)}</td>
      <td className="text-end">{money(r.spendingPence)}</td>
    </>
  );
  return (
    <div className="overflow-x-auto">
      <table className="text-sm">
        <thead>
          <tr>
            <th className="text-start">{t.budgetHeadings.line}</th>
            <th className="text-end">{t.budgetHeadings.budget}</th>
            <th className="text-end">{t.budgetHeadings.income}</th>
            <th className="text-end">{t.budgetHeadings.spending}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <td>{r.name}</td>
              {cells(r)}
            </tr>
          ))}
          <tr className="font-semibold">
            <td>{t.totals}</td>
            {cells(budget.totals)}
          </tr>
          <tr className="font-semibold">
            <td colSpan={3}>{t.balance}</td>
            <td className="text-end">{money(budget.balancePence)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
