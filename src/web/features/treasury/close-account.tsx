import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { useTreasuryAction } from './use-treasury-action';

/** D-118: close an open branch account — at a zero balance with nothing awaiting approval. */
export function CloseAccount({ unitId, account }: { unitId: string; account: AccountRecord }) {
  const t = useText().services.treasury;
  const { context } = useActiveSession();
  const close = useTreasuryAction(unitId);
  // Event accounts close through the Event organiser only (17); a hint only (T-042).
  if (
    account.kind !== 'branch' ||
    account.status !== 'Open' ||
    !context.capabilities.includes('treasury.accounts.manage')
  ) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-slate-600">{t.accounts.closeExplanation}</p>
      <ErrorAlert error={close.error} refusals={t.refusals} />
      <button
        type="button"
        disabled={close.isPending}
        className="self-start rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          close.mutate({ path: `/accounts/${account.id}/close` });
        }}
      >
        {t.accounts.close}
      </button>
    </div>
  );
}
