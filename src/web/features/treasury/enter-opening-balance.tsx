import { useState } from 'react';
import { parseSignedPoundsToPence } from '../../../shared/core/parse-pounds';
import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { todayInLondon } from '../../app/language/today-in-london';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { TextField } from '../../components/text-field';
import { useTreasuryAction } from './use-treasury-action';

/** D-217 (O-166): an imported account's opening balance, entered once by its treasurer. */
export function EnterOpeningBalance({
  unitId,
  account,
}: {
  unitId: string;
  account: AccountRecord;
}) {
  const t = useText().services.treasury;
  const { context } = useActiveSession();
  const enter = useTreasuryAction(unitId);
  const [amount, setAmount] = useState('0');
  const [date, setDate] = useState(todayInLondon());
  const [invalid, setInvalid] = useState(false);
  // A hint only (T-042): the portal decides the request itself.
  if (account.hasOpeningBalance || account.kind !== 'branch' || account.status !== 'Open')
    return null;
  if (!context.capabilities.includes('treasury.accounts.manage')) return null;
  return (
    <form
      className="flex flex-col gap-2 rounded border border-amber-400 bg-amber-50 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const openingBalancePence = parseSignedPoundsToPence(amount);
        setInvalid(openingBalancePence === null);
        if (openingBalancePence !== null)
          enter.mutate({
            path: `/accounts/${account.id}/opening-balance`,
            body: { openingBalancePence, openingDate: date },
          });
      }}
    >
      <p>{t.accounts.noOpeningBalance}</p>
      {invalid && <p role="alert">{t.accounts.amountInvalid}</p>}
      <ErrorAlert error={enter.error} refusals={t.refusals} />
      <TextField label={t.accounts.openingBalance} value={amount} onChange={setAmount} />
      <TextField label={t.accounts.openingDate} type="date" value={date} onChange={setDate} />
      <button
        type="submit"
        className="self-start rounded bg-slate-900 px-3 py-2 text-white"
        disabled={enter.isPending}
      >
        {t.accounts.enterOpeningBalance}
      </button>
    </form>
  );
}
