import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { RequestForm } from './request-form';
import { RequestItem } from './request-item';
import { useRequests } from './use-conversations';
import { useHubUnit } from './use-hub-unit';

/** Brief 20 B3, P13 and D-160: the branch's requests, sent and received, and sending one. */
export function RequestsPage() {
  const text = useText();
  const t = text.services['communication-hub'];
  const unit = useHubUnit();
  // A hint (T-042): the portal decides each request itself.
  const sends = useActiveSession().context.capabilities.includes('communication-hub.requests.send');
  const [sending, setSending] = useState(false);
  const requests = useRequests(unit.id);
  if (requests.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (requests.isError) return <ErrorAlert error={requests.error} refusals={t.refusals} />;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.requests.heading}</h2>
      {sends && unit.type === 'branch' && !sending && (
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
      {requests.data.length === 0 && <p>{t.requests.none}</p>}
      <ul className="flex flex-col gap-3">
        {requests.data.map((r) => (
          <RequestItem key={r.id} unitId={unit.id} request={r} sends={sends} />
        ))}
      </ul>
    </section>
  );
}
