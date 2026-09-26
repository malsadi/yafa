import { useState } from 'react';
import { useParams } from 'react-router';
import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { AccountHeader } from './account-header';
import { CloseAccount } from './close-account';
import { EntryForms } from './entry-forms';
import { EntryList } from './entry-list';
import type { Period } from './period-filter';
import { StatementPanel } from './statement-panel';
import { useAccountHistory } from './use-account-history';
import { useAccounts } from './use-accounts';
import { useTreasuryUnit } from './use-treasury-unit';

/** Brief 17: one account — its balance, recording entries, its history, and its statement. */
export function AccountPage() {
  const unitId = useTreasuryUnit();
  const accountId = useParams().accountId ?? '';
  const text = useText();
  const [period, setPeriod] = useState<Period>({ from: '', to: '' });
  const accounts = useAccounts(unitId);
  const history = useAccountHistory(unitId, accountId, period);
  if (accounts.isPending || history.isPending)
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (accounts.isError || history.isError)
    return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  const { account } = history.data;
  return (
    <div className="flex flex-col gap-6">
      <AccountHeader account={account} />
      {account.status === 'Open' && (
        <EntryForms
          unitId={unitId}
          account={account}
          accounts={accounts.data.accounts}
          budgetLines={history.data.budgetLines}
        />
      )}
      <EntryList
        unitId={unitId}
        history={history.data}
        accounts={accounts.data.accounts}
        period={period}
        onPeriod={setPeriod}
      />
      <StatementPanel unitId={unitId} accountId={account.id} />
      <CloseAccount unitId={unitId} account={account} />
    </div>
  );
}
