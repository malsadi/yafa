import { useState } from 'react';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { CircularReader } from './circular-reader';
import { useReceivedCirculars } from './use-circulars';

/** Brief 20 A3 and P14: the circulars the branch received, each marked opened or not, and reading one. */
export function ReceivedCirculars(props: { unitId: string }) {
  const text = useText();
  const t = text.services['communication-hub'];
  const formatTimestamp = useFormatTimestamp();
  const circulars = useReceivedCirculars(props.unitId);
  const [reading, setReading] = useState<string | null>(null);
  if (circulars.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (circulars.isError) return <ErrorAlert error={circulars.error} refusals={t.refusals} />;
  if (circulars.data.length === 0) return <p>{t.circulars.none}</p>;
  return (
    <ul className="flex flex-col gap-2">
      {circulars.data.map((c) => (
        <li key={c.id} className="flex flex-col gap-1 rounded border border-slate-300 p-3">
          <h3 className="font-semibold">{c.title}</h3>
          <p className="text-sm text-slate-600">
            {fillText(t.circulars.sentOn, { date: formatTimestamp(c.sentAt) })} ·{' '}
            {c.openedAt
              ? fillText(t.circulars.opened, { date: formatTimestamp(c.openedAt) })
              : t.circulars.notOpened}
          </p>
          {reading === c.id ? (
            <CircularReader
              unitId={props.unitId}
              circularId={c.id}
              onClose={() => {
                setReading(null);
              }}
            />
          ) : (
            <button
              type="button"
              className="self-start rounded border border-slate-400 px-3 py-1"
              onClick={() => {
                setReading(c.id);
              }}
            >
              {t.circulars.open}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
