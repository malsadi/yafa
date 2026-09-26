import type { AccountRecord, SavedEntry } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { WarningsList } from './warnings-list';

/** P7 and D-120: an entry saved — whether it counts now or awaits approval — and any warnings. */
export function SavedEntryNotice(props: {
  saved: SavedEntry;
  accounts: AccountRecord[];
  onDone: () => void;
}) {
  const t = useText().services.treasury.entries;
  const status =
    props.saved.approvalStatus === 'Awaiting approval' ? 'Awaiting approval' : 'Not needed';
  return (
    <div className="flex flex-col gap-2 rounded border border-slate-300 p-3">
      <p role="status">{t.saved[status]}</p>
      <WarningsList warnings={props.saved.warnings} accounts={props.accounts} />
      <button
        type="button"
        className="self-start rounded border border-slate-400 px-3 py-1"
        onClick={props.onDone}
      >
        {t.done}
      </button>
    </div>
  );
}
