import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { PageHeading } from '../../components/page-heading';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { useInbox } from './use-inbox';
import { InboxItems } from './inbox-items';

/** Brief 9.5 and D-031: the officer's notifications — read or unread; opening one marks it read; nothing is deleted. */
export function InboxPage() {
  const text = useText();
  const t = text.portalShell.inbox;
  const [page, setPage] = useState(1);
  const { inbox, markRead, markAllRead } = useInbox(page);
  if (inbox.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (inbox.isError) return <ErrorAlert error={inbox.error} refusals={{}} />;
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
      <InboxItems
        items={inbox.data.items}
        onOpen={(id) => {
          markRead.mutate(id);
        }}
      />
      {inbox.data.pageCount > 1 && (
        <PageNav
          page={inbox.data.page}
          pageCount={inbox.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </section>
  );
}
