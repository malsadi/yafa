import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { CircularForm } from './circular-form';
import { SentCircularItem } from './sent-circular-item';
import { useSentCirculars } from './use-circulars';

/** Brief 20 A3, A4 and D-157: the General Council's circulars — sending one, and which branches opened each. */
export function SentCirculars(props: { unitId: string }) {
  const text = useText();
  const t = text.services['communication-hub'];
  // A hint (T-042): the portal decides each request itself.
  const sends = useActiveSession().context.capabilities.includes(
    'communication-hub.circulars.send',
  );
  const [sending, setSending] = useState(false);
  const sent = useSentCirculars(props.unitId);
  if (sent.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (sent.isError) return <ErrorAlert error={sent.error} refusals={t.refusals} />;
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
      {sent.data.length === 0 && <p>{t.circulars.none}</p>}
      <ul className="flex flex-col gap-2">
        {sent.data.map((c) => (
          <SentCircularItem key={c.id} circular={c} />
        ))}
      </ul>
    </>
  );
}
