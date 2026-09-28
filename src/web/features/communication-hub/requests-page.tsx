import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { PagedList } from '../../components/paged-list';
import { RequestForm } from './request-form';
import { RequestItem } from './request-item';
import { useRequests } from './use-conversations';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 B3, P13 and D-160: the branch's requests, sent and received, and sending one. */
export function RequestsPage() {
  const t = useText().services['communication-hub'];
  const unit = useHubUnit();
  // A hint (T-042): the portal decides each request itself.
  const sends = useActiveSession().context.capabilities.includes('communication-hub.requests.send');
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const requests = useRequests(unit.id, page);
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.requests.heading}</h2>
      {sends && !sending && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setSending(true);
          }}
        >
          {t.requests.send}
        </button>
      )}
      {sending && (
        <RequestForm
          unitId={unit.id}
          onDone={() => {
            setSending(false);
          }}
        />
      )}
      <PagedList query={requests} none={t.requests.none} refusals={t.refusals} onPage={setPage}>
        {(items) => (
          <ul className="flex flex-col gap-3">
            {items.map((r) => (
              <RequestItem key={r.id} unitId={unit.id} request={r} sends={sends} />
            ))}
          </ul>
        )}
      </PagedList>
    </section>
  );
}
