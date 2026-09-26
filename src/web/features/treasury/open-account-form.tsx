import { useState } from 'react';
import { parseSignedPoundsToPence } from '../../../shared/core/parse-pounds';
import { todayInLondon } from '../../app/language/today-in-london';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { OpenAccountFields } from './open-account-fields';
import { useTreasuryAction } from './use-treasury-action';

/** Brief 17 A1, P6 and D-117, D-119: open a branch account with its opening balance — negative too. */
export function OpenAccountForm({ unitId, onDone }: { unitId: string; onDone: () => void }) {
  const t = useText().services.treasury;
  const open = useTreasuryAction<{ accountId: string }>(unitId);
  const [draft, setDraft] = useState({
    name: '',
    branchType: 'bank',
    opening: '0',
    openingDate: todayInLondon(),
  });
  const [invalid, setInvalid] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const openingBalancePence = parseSignedPoundsToPence(draft.opening);
        setInvalid(openingBalancePence === null);
        if (openingBalancePence === null) return;
        const body = {
          name: draft.name,
          branchType: draft.branchType,
          openingBalancePence,
          openingDate: draft.openingDate,
        };
        open.mutate({ path: '/accounts', body }, { onSuccess: onDone });
      }}
    >
      <ErrorAlert error={open.error} refusals={t.refusals} />
      {invalid && (
        <p role="alert" className="rounded bg-amber-100 p-3">
          {t.accounts.amountInvalid}
        </p>
      )}
      <OpenAccountFields draft={draft} onChange={setDraft} />
      <FormButtons
        submit={t.accounts.save}
        cancel={t.accounts.cancel}
        busy={open.isPending}
        onCancel={onDone}
      />
    </form>
  );
}
