import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { useFormatMoney } from '../treasury/use-format-money';

/** P16 and D-131: what closing does with the balance — an overspend is warned of clearly. */
export function CloseBalance({ balancePence }: { balancePence: number }) {
  const t = useText().services['event-organiser'].close;
  const money = useFormatMoney();
  if (balancePence < 0)
    return (
      <p role="alert" className="rounded bg-amber-100 p-2 text-sm">
        {fillText(t.overspent, { amount: money(-balancePence) })}
      </p>
    );
  return <p className="text-sm">{fillText(t.returned, { amount: money(balancePence) })}</p>;
}
