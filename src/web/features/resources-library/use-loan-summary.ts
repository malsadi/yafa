import type { LoanDetails } from '../../../shared/resources-library/equipment';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** One loan in a line: how many of what, to whom, from when, and when it is due back. */
export function useLoanSummary(): (item: string, loan: LoanDetails) => string {
  const t = useText().services['resources-library'].equipment;
  const formatDate = useFormatDate();
  return (item, loan) =>
    fillText(t.loanSummary, {
      quantity: loan.quantity,
      item,
      borrower: loan.borrower,
      borrowed: formatDate(loan.borrowedOn),
      due: formatDate(loan.dueBack),
    });
}
