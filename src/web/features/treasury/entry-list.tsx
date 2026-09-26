import type { AccountHistory, AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { EntryItem } from './entry-item';
import { PeriodFilter, type Period } from './period-filter';

/** Brief 17 B: an account's entries — awaiting and declined ones too, marked — for a period. */
export function EntryList(props: {
  unitId: string;
  history: AccountHistory;
  accounts: AccountRecord[];
  onPeriod: (period: Period) => void;
  period: Period;
}) {
  const t = useText().services.treasury.entries;
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-semibold">{t.heading}</h3>
      <PeriodFilter initial={props.period} submit={t.period.show} onApply={props.onPeriod} />
      {props.history.entries.length === 0 && <p>{t.none}</p>}
      <ul className="flex flex-col gap-2">
        {[...props.history.entries].reverse().map((entry) => (
          <EntryItem
            key={entry.id}
            unitId={props.unitId}
            accountId={props.history.account.id}
            entry={entry}
            accounts={props.accounts}
          />
        ))}
      </ul>
    </section>
  );
}
