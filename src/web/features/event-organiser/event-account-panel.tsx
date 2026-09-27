import { Link } from 'react-router';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from '../treasury/use-format-money';
import { BudgetLines } from './budget-lines';
import { useEventAccount } from './use-event-queries';

/**
 * Brief 21 A2 and D-177: the event's account — budget lines, income,
 * spending, balance and receipts — with a link to it in the Treasury,
 * where money is recorded under the Treasury's own rules.
 */
export function EventAccountPanel({ event }: { event: EventSummary }) {
  const t = useText().services['event-organiser'].account;
  const money = useFormatMoney();
  const account = useEventAccount(event.unitId, event.id);
  if (!account.data) return null;
  const { totals, balancePence } = account.data.figures;
  const receipts = account.data.entries.reduce((sum, e) => sum + e.receipts.length, 0);
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{t.heading}</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>{t.income}</dt>
        <dd>{money(totals.incomePence)}</dd>
        <dt>{t.spending}</dt>
        <dd>{money(totals.spendingPence)}</dd>
        <dt>{t.balance}</dt>
        <dd>{money(balancePence)}</dd>
        <dt>{t.receipts}</dt>
        <dd>{String(receipts)}</dd>
      </dl>
      {account.data.account.awaitingCount > 0 && (
        <p className="text-sm">
          {fillText(t.awaiting, { count: String(account.data.account.awaitingCount) })}
        </p>
      )}
      <BudgetLines event={event} lines={account.data.budgetLines} />
      <Link to={`/treasury/accounts/${account.data.account.id}`} className="self-start underline">
        {t.openInTreasury}
      </Link>
    </section>
  );
}
