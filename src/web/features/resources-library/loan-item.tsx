import type { LoanRecord } from '../../../shared/resources-library/equipment';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';
import { LoanActions } from './loan-actions';
import { LoanHistory } from './loan-history';
import type { useEquipment } from './use-equipment';
import { useLoanSummary } from './use-loan-summary';

type Actions = Pick<ReturnType<typeof useEquipment>, 'correct' | 'recordReturn'>;

/** Brief 16 C2 and D-109: one loan and its history; while open, the unit's own can change it. */
export function LoanItem(props: {
  item: string;
  loan: LoanRecord;
  manages: boolean;
  actions: Actions;
}) {
  const t = useText().services['resources-library'].equipment;
  const formatDate = useFormatDate();
  const summary = useLoanSummary();
  const { loan } = props;
  return (
    <li className="flex flex-col gap-1 text-sm">
      <p>{summary(props.item, loan)}</p>
      {loan.returnedOn && (
        <p className="text-slate-600">
          {fillText(t.loanReturned, { date: formatDate(loan.returnedOn) })}
        </p>
      )}
      <LoanHistory history={loan.history} />
      {props.manages && !loan.returnedOn && <LoanActions loan={loan} actions={props.actions} />}
    </li>
  );
}
