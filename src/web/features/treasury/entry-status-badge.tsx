import type { ApprovalStatus } from '../../../shared/treasury/treasury-statuses';
import { useText } from '../../app/language/use-text';

const STYLE: Record<ApprovalStatus, string> = {
  'Not needed': '',
  'Awaiting approval': 'bg-amber-100',
  Approved: 'bg-green-100',
  Declined: 'bg-red-100',
};

/** P7: an entry's approval status, by its exact name — none shown when it needed no approval. */
export function EntryStatusBadge({ status }: { status: ApprovalStatus }) {
  const t = useText().services.treasury.entries.approvalStatuses;
  if (status === 'Not needed') return null;
  return <span className={`rounded px-2 text-sm ${STYLE[status]}`}>{t[status]}</span>;
}
