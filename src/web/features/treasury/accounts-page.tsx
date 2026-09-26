import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { AccountRow } from './account-row';
import { OpenAccountForm } from './open-account-form';
import { useAccounts } from './use-accounts';
import { useFormatMoney } from './use-format-money';
import { useTreasuryUnit } from './use-treasury-unit';

/** Brief 17 A1 and C1: the unit's accounts, their balances, and the total of the open ones (D-127). */
export function AccountsPage() {
  const unitId = useTreasuryUnit();
  const text = useText();
  const t = text.services.treasury.accounts;
  const money = useFormatMoney();
  const { context } = useActiveSession();
  const accounts = useAccounts(unitId);
  const [opening, setOpening] = useState(false);
  if (accounts.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (accounts.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  // A hint only (T-042): the portal decides each change itself.
  const mayOpen = context.capabilities.includes('treasury.accounts.manage');
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      <p className="font-medium">
        {fillText(t.unitTotal, { total: money(accounts.data.unitTotalPence) })}
      </p>
      {accounts.data.accounts.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {accounts.data.accounts.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </ul>
      {mayOpen && !opening && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setOpening(true);
          }}
        >
          {t.open}
        </button>
      )}
      {opening && (
        <OpenAccountForm
          unitId={unitId}
          onDone={() => {
            setOpening(false);
          }}
        />
      )}
    </section>
  );
}
