import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';

export type EntryKind = 'credit' | 'debit' | 'transfer';
const CAPABILITY: Record<EntryKind, string> = {
  credit: 'treasury.credit.create',
  debit: 'treasury.debit.create',
  transfer: 'treasury.transfer.create',
};

/** Brief 17 B1 to B3: the kinds of entry this officer may record (a hint, T-042), each opening its form. */
export function EntryKindButtons({ onOpen }: { onOpen: (kind: EntryKind) => void }) {
  const t = useText().services.treasury.entries;
  const { context } = useActiveSession();
  const kinds = (['credit', 'debit', 'transfer'] as const).filter((k) =>
    context.capabilities.includes(CAPABILITY[k]),
  );
  return (
    <div className="flex flex-wrap gap-2">
      {kinds.map((k) => (
        <button
          key={k}
          type="button"
          className="rounded bg-slate-800 px-3 py-2 text-white"
          onClick={() => {
            onOpen(k);
          }}
        >
          {t.record[k]}
        </button>
      ))}
    </div>
  );
}
