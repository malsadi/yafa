import type { EntryRecord } from '../../../shared/treasury/treasury-records';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 17 B and P7: who entered an entry and when; who decided it, and why if declined. */
export function EntryPeople({ entry }: { entry: EntryRecord }) {
  const t = useText().services.treasury.entries;
  const when = useFormatTimestamp();
  return (
    <p className="text-sm text-slate-600">
      {fillText(t.enteredBy, { name: entry.createdByName ?? '', date: when(entry.createdAt) })}
      {entry.decidedAt && (
        <>
          {' '}
          ·{' '}
          {fillText(t.decidedBy, {
            status:
              entry.approvalStatus === 'Declined'
                ? t.approvalStatuses.Declined
                : t.approvalStatuses.Approved,
            name: entry.decidedByName ?? '',
            date: when(entry.decidedAt),
          })}
        </>
      )}
      {entry.declineReason && <> · {fillText(t.declineReason, { reason: entry.declineReason })}</>}
    </p>
  );
}
