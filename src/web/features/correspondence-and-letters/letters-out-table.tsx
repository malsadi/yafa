import { Link } from 'react-router';
import type { LetterOutSummary } from '../../../shared/correspondence-and-letters/letter-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';

/** Brief 23 B2: reference, date, recipient, subject, sent by. */
export function LettersOutTable({ letters }: { letters: LetterOutSummary[] }) {
  const t = useText().services['correspondence-and-letters'].lettersOut;
  const date = useFormatDate();
  const head = (label: string) => <th className="p-1 text-start">{label}</th>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {head(t.reference)}
            {head(t.date)}
            {head(t.recipient)}
            {head(t.subject)}
            {head(t.sentBy)}
          </tr>
        </thead>
        <tbody>
          {letters.map((l) => (
            <tr key={l.id} className="border-t border-slate-200">
              <td className="p-1" dir="ltr">
                <Link to={`/correspondence-and-letters/letters-out/${l.id}`} className="underline">
                  {l.referenceNumber}
                </Link>
              </td>
              <td className="p-1">{date(l.letterDate)}</td>
              <td className="p-1">{l.recipientName}</td>
              <td className="p-1">{l.subject}</td>
              <td className="p-1">{l.signerName ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
