import { Link } from 'react-router';
import { PageHeading } from '../../../components/page-heading';
import { StatusMessage } from '../../../components/status-message';
import { useText } from '../../../app/language/use-text';
import { OfficerAccountRow } from './officer-account-row';
import { useOfficerAccounts, type ActionOutcome } from './use-officer-accounts';

function useOutcomeText(outcome: ActionOutcome | null): string | null {
  const text = useText();
  const t = text.services['administration-panel'].officerAccounts;
  if (!outcome) return null;
  if (outcome.kind === 'done') return t.done[outcome.action];
  if (outcome.kind === 'invitation-failed') return t.invitationFailed;
  const refusals: Partial<Record<string, string>> = t.refusals;
  return refusals[outcome.code] ?? text.portalShell.somethingWentWrong;
}

/** Brief 25 A2: every person with their access state, and the account actions. */
export function OfficerAccountsPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const { accounts, act, outcome } = useOfficerAccounts();
  const outcomeText = useOutcomeText(outcome);
  if (accounts.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (accounts.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <PageHeading>{admin.screens['officer-accounts']}</PageHeading>
        <p className="max-w-prose">{admin.officerAccounts.intro}</p>
        <Link to="/committee-register" className="underline">
          {admin.officerAccounts.registerLink}
        </Link>
        {outcomeText && (
          <p role="status" className="mt-2 rounded bg-slate-100 p-3">
            {outcomeText}
          </p>
        )}
      </div>
      {accounts.data.length === 0 ? (
        <p>{admin.officerAccounts.noPeople}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {accounts.data.map((account) => (
            <OfficerAccountRow
              key={account.personId}
              account={account}
              busy={act.isPending}
              onAction={(action) => {
                act.mutate({ personId: account.personId, action });
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
