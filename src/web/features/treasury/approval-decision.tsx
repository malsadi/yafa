import { useState } from 'react';
import type {
  AccountRecord,
  EntryRecord,
  TreasuryWarning,
} from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { ApproveDeclineButtons } from './approve-decline-buttons';
import { DeclineForm } from './decline-form';
import { useTreasuryAction } from './use-treasury-action';
import { WarningsList } from './warnings-list';

/**
 * Brief 17 B5, 7.3 and P7: approve, or decline with a reason — by a second
 * officer; the one who entered it sees that another will decide.
 */
export function ApprovalDecision(props: {
  unitId: string;
  entry: EntryRecord;
  accounts: AccountRecord[];
}) {
  const t = useText().services.treasury;
  const { context } = useActiveSession();
  const decide = useTreasuryAction<{ warnings: TreasuryWarning[] }>(props.unitId);
  const [declining, setDeclining] = useState(false);
  const path = `/entries/${props.entry.id}`;
  if (props.entry.createdBy === context.personId)
    return <p className="text-sm">{t.approvals.yours}</p>;
  return (
    <>
      <ErrorAlert error={decide.error} refusals={t.refusals} />
      {decide.data && <WarningsList warnings={decide.data.warnings} accounts={props.accounts} />}
      {declining ? (
        <DeclineForm
          busy={decide.isPending}
          onCancel={() => {
            setDeclining(false);
          }}
          onDecline={(reason) => {
            decide.mutate({ path: `${path}/decline`, body: { reason } });
          }}
        />
      ) : (
        <ApproveDeclineButtons
          busy={decide.isPending}
          onApprove={() => {
            decide.mutate({ path: `${path}/approve` });
          }}
          onDecline={() => {
            setDeclining(true);
          }}
        />
      )}
    </>
  );
}
