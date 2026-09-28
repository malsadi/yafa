import { useState } from 'react';
import { useFormatTimestamp } from '../../app/language/use-format-timestamp';
import { useText } from '../../app/language/use-text';
import { PagedList } from '../../components/paged-list';
import { fillText } from '../../text/fill-text';
import { CircularReader } from './circular-reader';
import { useReceivedCirculars } from './use-circulars';

/** Brief 20 A3 and P14: the circulars the branch received, each marked opened or not, and reading one. */
export function ReceivedCirculars(props: { unitId: string }) {
  const t = useText().services['communication-hub'];
  const formatTimestamp = useFormatTimestamp();
  const [page, setPage] = useState(1);
  const circulars = useReceivedCirculars(props.unitId, page);
  const [reading, setReading] = useState<string | null>(null);
  return (
    <PagedList query={circulars} none={t.circulars.none} refusals={t.refusals} onPage={setPage}>
      {(items) => (
        <ul className="flex flex-col gap-2">
          {items.map((c) => (
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
      )}
    </PagedList>
  );
}
