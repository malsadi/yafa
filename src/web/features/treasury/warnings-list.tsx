import type { AccountRecord, TreasuryWarning } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from './use-format-money';

/** D-120 and brief 28: warnings that inform and never block. */
export function WarningsList(props: { warnings: TreasuryWarning[]; accounts: AccountRecord[] }) {
  const t = useText().services.treasury.entries.warnings;
  const money = useFormatMoney();
  if (props.warnings.length === 0) return null;
  return (
    <ul role="status" className="flex flex-col gap-1 rounded bg-amber-100 p-3 text-amber-950">
      {props.warnings.map((w) => (
        <li key={w.code === 'below-zero' ? w.accountId : w.code}>
          {w.code === 'below-zero'
            ? fillText(t['below-zero'], {
                account: props.accounts.find((a) => a.id === w.accountId)?.name ?? '',
                balance: money(w.balancePence),
              })
            : t['no-receipt']}
        </li>
      ))}
    </ul>
  );
}
