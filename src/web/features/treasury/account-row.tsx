import { Link } from 'react-router';
import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from './use-format-money';

/** Brief 17 C1 and D-120: one account, its status and live balance — marked when below zero. */
export function AccountRow({ account }: { account: AccountRecord }) {
  const t = useText().services.treasury.accounts;
  const money = useFormatMoney();
  const kind = account.kind === 'event' ? t.kinds.event : t.kinds[account.branchType ?? 'bank'];
  return (
    <li className="flex flex-wrap items-center gap-3 rounded border border-slate-300 p-3">
      <Link to={`/treasury/accounts/${account.id}`} className="font-medium underline">
        {account.name}
      </Link>
      <span className="text-sm text-slate-600">{kind}</span>
      <span className="rounded bg-slate-100 px-2 text-sm">{t.statuses[account.status]}</span>
      {account.awaitingCount > 0 && (
        <span className="rounded bg-amber-100 px-2 text-sm">
          {fillText(t.awaiting, { count: account.awaitingCount })}
        </span>
      )}
      <span className={`ms-auto font-medium ${account.balancePence < 0 ? 'text-red-700' : ''}`}>
        {money(account.balancePence)}
        {account.balancePence < 0 && <span className="ms-2 text-sm">{t.belowZero}</span>}
      </span>
    </li>
  );
}
