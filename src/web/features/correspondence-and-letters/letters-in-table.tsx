import { Link } from 'react-router';
import type { LetterInSummary } from '../../../shared/correspondence-and-letters/letter-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';

/** Brief 23 B3, B4: reference, date received, sender, subject, who handles it, status. */
export function LettersInTable({ letters }: { letters: LetterInSummary[] }) {
  const all = useText().services['correspondence-and-letters'];
  const t = all.lettersIn;
  const date = useFormatDate();
  const head = (label: string) => <th className="p-1 text-start">{label}</th>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          {head(t.reference)}
          {head(t.dateReceived)}
          {head(t.sender)}
          {head(t.subject)}
          {head(t.handler)}
          {head(t.status)}
        </tr>
      </thead>
      <tbody>
        {letters.map((l) => (
          <tr key={l.id} className="border-t border-slate-200">
            <td className="p-1" dir="ltr">
              <Link to={`/correspondence-and-letters/letters-in/${l.id}`} className="underline">
                {l.referenceNumber}
              </Link>
            </td>
            <td className="p-1">{date(l.dateReceived)}</td>
            <td className="p-1">{l.sender}</td>
            <td className="p-1">{l.subject}</td>
            <td className="p-1">{l.handlerName ?? ''}</td>
            <td className="p-1">{all.statuses[l.status]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
