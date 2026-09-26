import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { PageHeading } from '../../components/page-heading';
import { StatusMessage } from '../../components/status-message';
import { useInbox } from './use-inbox';
import { useNotificationWords } from './use-notification-words';

/** Brief 9.5 and D-031: the officer's notifications — read or unread; opening one marks it read; nothing is deleted. */
export function InboxPage() {
  const text = useText();
  const t = text.portalShell.inbox;
  const when = useFormatTimestamp();
  const words = useNotificationWords();
  const { inbox, markRead, markAllRead } = useInbox();
  if (inbox.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (inbox.isError) return <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>;
  return (
    <section className="flex flex-col gap-3">
      <PageHeading>{t.heading}</PageHeading>
      {inbox.data.unreadCount > 0 && (
        <button
          type="button"
          className="self-start rounded border border-slate-400 px-3 py-1"
          onClick={() => {
            markAllRead.mutate();
          }}
        >
          {t.markAllRead}
        </button>
      )}
      {inbox.data.items.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {inbox.data.items.map((item) => (
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
                  markRead.mutate(item.id);
                }}
              >
                {t.open}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
