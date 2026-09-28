import { Link } from 'react-router';
import type { ExchangeLetter } from '../../../shared/correspondence-and-letters/letter-records';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** D-214 (O-146): every letter in the exchange, in date order, each linked to its page. */
export function ExchangeList(props: { exchange: ExchangeLetter[]; currentId: string }) {
  const t = useText().services['correspondence-and-letters'].letter;
  const date = useFormatDate();
  if (props.exchange.length < 2) return null;
  return (
    <section className="flex flex-col gap-1">
      <h3 className="font-semibold">{t.exchange}</h3>
      <ol className="flex flex-col gap-1 text-sm">
        {props.exchange.map((l) => {
          const line = fillText(l.direction === 'out' ? t.exchangeOut : t.exchangeIn, {
            reference: l.referenceNumber,
            date: date(l.date),
            party: l.party,
            subject: l.subject,
          });
          return (
            <li key={`${l.direction}-${l.id}`}>
              {l.id === props.currentId ? (
                <span className="font-medium">{`${line} ${t.thisLetter}`}</span>
              ) : (
                <Link
                  to={`/correspondence-and-letters/letters-${l.direction}/${l.id}`}
                  className="underline"
                >
                  {line}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
