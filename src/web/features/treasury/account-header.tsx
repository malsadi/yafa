import { Link } from 'react-router';
import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from './use-format-money';

/** Brief 17 A and C1: an account's name, kind, status and live balance — marked below zero (D-120). */
export function AccountHeader({ account }: { account: AccountRecord }) {
  const t = useText().services.treasury.accounts;
  const money = useFormatMoney();
  const kind = account.kind === 'event' ? t.kinds.event : t.kinds[account.branchType ?? 'bank'];
  return (
    <div className="flex flex-col gap-1">
      <Link to="/treasury/accounts" className="underline">
        {t.back}
      </Link>
      <h2 className="text-lg font-semibold">{account.name}</h2>
      <p className="text-sm text-slate-600">
        {kind} · {t.statuses[account.status]}
      </p>
      <p className={`text-lg font-medium ${account.balancePence < 0 ? 'text-red-700' : ''}`}>
        {fillText(t.balance, { balance: money(account.balancePence) })}
        {account.balancePence < 0 && <span className="ms-2 text-sm">{t.belowZero}</span>}
      </p>
    </div>
  );
}
