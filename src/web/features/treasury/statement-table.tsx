import type { StatementData } from '../../../shared/treasury/statement';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from './use-format-money';

/** Brief 17 C2: a statement on screen — balance at the start, each counted entry, balance at the end. */
export function StatementTable({ data }: { data: StatementData }) {
  const t = useText().services.treasury;
  const date = useFormatDate();
  const money = useFormatMoney();
  const c = t.statements.columns;
  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      <p>{fillText(t.statements.opening, { balance: money(data.openingBalancePence) })}</p>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            {[c.date, c.details, c.in, c.out, c.balance].map((h) => (
              <th key={h} className="p-1 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.lines.map((line) => (
            <tr key={line.entryId} className="border-t border-slate-200">
              <td className="p-1">{date(line.entryDate)}</td>
              <td className="p-1">
                {[
                  t.entries.types[line.type],
                  line.otherAccountName,
                  line.counterparty,
                  line.description,
                ]
                  .filter(Boolean)
                  .join(' — ')}
              </td>
              <td className="p-1 text-end">{line.inPence ? money(line.inPence) : ''}</td>
              <td className="p-1 text-end">{line.outPence ? money(line.outPence) : ''}</td>
              <td className="p-1 text-end">{money(line.balancePence)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="font-medium">
        {fillText(t.statements.closing, { balance: money(data.closingBalancePence) })}
      </p>
    </div>
  );
}
