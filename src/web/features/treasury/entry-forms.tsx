import { useState } from 'react';
import type { AccountRecord, BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { EntryKindButtons, type EntryKind } from './entry-kind-buttons';
import { MoneyEntryForm } from './money-entry-form';
import { TransferForm } from './transfer-form';

/** Brief 17 B1 to B3: record a credit, debit or transfer from an account's page. */
export function EntryForms(props: {
  unitId: string;
  account: AccountRecord;
  accounts: AccountRecord[];
  budgetLines: BudgetLineRecord[];
}) {
  const [open, setOpen] = useState<EntryKind | null>(null);
  const done = () => {
    setOpen(null);
  };
  const openAccounts = props.accounts.filter((a) => a.status === 'Open');
  if (open === 'transfer') {
    return (
      <TransferForm
        unitId={props.unitId}
        account={props.account}
        accounts={openAccounts}
        onDone={done}
      />
    );
  }
  if (open) {
    return (
      <MoneyEntryForm
        unitId={props.unitId}
        type={open}
        account={props.account}
        accounts={openAccounts}
        budgetLines={props.budgetLines}
        onDone={done}
      />
    );
  }
  return <EntryKindButtons onOpen={setOpen} />;
}
