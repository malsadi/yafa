import { parsePoundsToPence } from '../../../shared/core/parse-pounds';
import type { AccountRecord } from '../../../shared/treasury/treasury-records';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/**
 * An amount that can't be read as pounds; and D-120: money going out that
 * would take the account below zero — a warning, never a block.
 */
export function AmountNotes(props: { amount: string; outOf: AccountRecord | null }) {
  const t = useText().services.treasury.entries;
  const pence = parsePoundsToPence(props.amount);
  const below = props.outOf !== null && pence !== null && props.outOf.balancePence - pence < 0;
  return (
    <>
      {props.amount !== '' && pence === null && (
        <p role="alert" className="rounded bg-amber-100 p-3">
          {t.amountInvalid}
        </p>
      )}
      {below && props.outOf && (
        <p role="status" className="rounded bg-amber-100 p-3">
          {fillText(t.willGoBelowZero, { account: props.outOf.name })}
        </p>
      )}
    </>
  );
}
