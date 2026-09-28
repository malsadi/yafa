import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { NoticeItem } from './notice-item';
import { useNotices } from './use-notices';

/** Brief 20 A1, A2 and D-217: the unit's notices and votes, newest first, a page at a time. */
export function NoticeList(props: { unitId: string; manages: boolean }) {
  const text = useText();
  const t = text.services['communication-hub'];
  const [page, setPage] = useState(1);
  const notices = useNotices(props.unitId, page);
  if (notices.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (notices.isError) return <ErrorAlert error={notices.error} refusals={t.refusals} />;
  return (
    <>
      {notices.data.items.length === 0 && <p>{t.noticeboard.none}</p>}
      <ul className="flex flex-col gap-3">
        {notices.data.items.map((notice) => (
          <NoticeItem key={notice.id} notice={notice} manages={props.manages} />
        ))}
      </ul>
      {notices.data.pageCount > 1 && (
        <PageNav
          page={notices.data.page}
          pageCount={notices.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </>
  );
}
