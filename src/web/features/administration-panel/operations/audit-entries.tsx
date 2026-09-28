import type { AuditEntry } from '../../../../shared/administration-panel/audit-entry';
import { useFormatTimestamp } from '../../../app/language/use-format-timestamp';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** Brief 25 D2 and O-167: who, what, which record and when — and values only for panel changes. */
export function AuditEntries({ entries }: { entries: AuditEntry[] }) {
  const t = useText().services['administration-panel'].operations.audit;
  const timestamp = useFormatTimestamp();
  if (entries.length === 0) return <p>{t.none}</p>;
  return (
    <ol className="flex flex-col gap-2 text-sm">
      {entries.map((e) => (
        <li key={e.id} className="flex flex-col">
          <span>
            {fillText(t.entry, {
              date: timestamp(e.occurredAt),
              name: e.actorName ?? e.actorPersonId,
              action: e.action,
              entityType: e.entityType,
              entityId: e.entityId,
            })}
          </span>
          {(e.before ?? e.after) && (
            <span className="break-all text-slate-600" dir="ltr">
              {fillText(t.values, { before: e.before ?? '', after: e.after ?? '' })}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
