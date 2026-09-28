import type { InboxItem } from '../../../shared/core/inbox';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { useNotificationWords } from './use-notification-words';

/** D-031: one page of notifications — unread ones marked, each opened with a button. */
export function InboxItems(props: { items: InboxItem[]; onOpen: (id: string) => void }) {
  const t = useText().portalShell.inbox;
  const when = useFormatTimestamp();
  const words = useNotificationWords();
  return (
    <ul className="flex flex-col gap-2">
      {props.items.map((item) => (
        <li
          key={item.id}
          className={`flex flex-wrap items-center gap-3 rounded border p-3 ${item.readAt ? 'border-slate-200' : 'border-slate-500 font-medium'}`}
        >
          <span>{words(item)}</span>
          <span className="text-sm text-slate-600">{when(item.createdAt)}</span>
          {!item.readAt && (
            <button
              type="button"
              className="ms-auto underline"
              onClick={() => {
                props.onOpen(item.id);
              }}
            >
              {t.open}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
