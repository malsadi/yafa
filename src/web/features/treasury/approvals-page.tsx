import { useText } from '../../app/language/use-text';
import { StatusMessage } from '../../components/status-message';
import { ApprovalItem } from './approval-item';
import { useAccounts } from './use-accounts';
import { useAwaiting } from './use-awaiting';
import { useTreasuryUnit } from './use-treasury-unit';

/** Brief 17 B5 and D-133: the list approvers work from — no notification is sent (Phase 7). */
export function ApprovalsPage() {
  const unitId = useTreasuryUnit();
  const text = useText();
  const t = text.services.treasury.approvals;
  const awaiting = useAwaiting(unitId);
  const accounts = useAccounts(unitId);
  if (awaiting.isError)
    return <StatusMessage>{text.services.treasury.refusals['permission.denied']}</StatusMessage>;
  if (awaiting.isPending || accounts.isPending)
    return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (accounts.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.heading}</h2>
      <p className="text-sm text-slate-600">{t.explanation}</p>
      {awaiting.data.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {awaiting.data.map((entry) => (
          <ApprovalItem
            key={entry.id}
            unitId={unitId}
            entry={entry}
            accounts={accounts.data.accounts}
          />
        ))}
      </ul>
    </section>
  );
}
