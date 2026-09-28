import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { PagedList } from '../../components/paged-list';
import { CircularForm } from './circular-form';
import { SentCircularItem } from './sent-circular-item';
import { useSentCirculars } from './use-circulars';

/** Brief 20 A3, A4 and D-157: the General Council's circulars — sending one, and which branches opened each. */
export function SentCirculars(props: { unitId: string }) {
  const t = useText().services['communication-hub'];
  // A hint (T-042): the portal decides each request itself.
  const sends = useActiveSession().context.capabilities.includes(
    'communication-hub.circulars.send',
  );
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const sent = useSentCirculars(props.unitId, page);
  return (
    <>
      {sends && !sending && (
        <button
          type="button"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          onClick={() => {
            setSending(true);
          }}
        >
          {t.circulars.send}
        </button>
      )}
      {sending && (
        <CircularForm
          unitId={props.unitId}
          onDone={() => {
            setSending(false);
          }}
        />
      )}
      <PagedList query={sent} none={t.circulars.none} refusals={t.refusals} onPage={setPage}>
        {(items) => (
          <ul className="flex flex-col gap-2">
            {items.map((c) => (
              <SentCircularItem key={c.id} circular={c} />
            ))}
          </ul>
        )}
      </PagedList>
    </>
  );
}
