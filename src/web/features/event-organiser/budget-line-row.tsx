import type { BudgetLineRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { useFormatMoney } from '../treasury/use-format-money';
import { ActionButton } from './action-button';

/** One budget line: its name and amount, with change and remove while the event is a draft (D-176, D-187). */
export function BudgetLineRow(props: {
  line: BudgetLineRecord;
  draft: boolean;
  busy: boolean;
  onChange: () => void;
  onRemove: () => void;
}) {
  const t = useText().services['event-organiser'].account;
  const money = useFormatMoney();
  return (
    <li className="flex flex-wrap items-center gap-2">
      <span>{props.line.name}</span>
      <span className="ms-auto">{money(props.line.amountPence)}</span>
      {props.draft && <ActionButton label={t.change} onClick={props.onChange} />}
      {props.draft && (
        <ActionButton label={t.remove} disabled={props.busy} onClick={props.onRemove} />
      )}
    </li>
  );
}
