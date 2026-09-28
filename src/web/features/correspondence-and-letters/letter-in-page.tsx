import { Link, useParams } from 'react-router';
import { ANSWERABLE_STATUSES } from '../../../shared/correspondence-and-letters/letter-in-statuses';
import { useFormatDate } from '../../app/language/use-format-date';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { letterInPath } from './correspondence.api';
import { ExchangeList } from './exchange-list';
import { LetterDownload } from './letter-download';
import { LetterInHandler } from './letter-in-handler';
import { LetterInStatusActions } from './letter-in-status-actions';
import { useLetterIn, useLetterUnit } from './use-letter-queries';

/** Brief 23 B3, B4 and D-214: one letter in — its entry and scan, its status, who handles it, and its exchange. */
export function LetterInPage() {
  const unitId = useLetterUnit();
  const { letterId = '' } = useParams();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const date = useFormatDate();
  const { context } = useActiveSession();
  const letter = useLetterIn(unitId, letterId);
  if (letter.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (letter.isError) return <ErrorAlert error={letter.error} refusals={t.refusals} />;
  const l = letter.data;
  // Hints only (T-042): the portal decides each request itself.
  const has = (capability: string) => context.capabilities.includes(capability);
  return (
    <article className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold" dir="ltr">
        {l.referenceNumber}
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>{t.lettersIn.dateReceived}</dt>
        <dd>{date(l.dateReceived)}</dd>
        <dt>{t.lettersIn.sender}</dt>
        <dd>{l.sender}</dd>
        <dt>{t.lettersIn.subject}</dt>
        <dd>{l.subject}</dd>
        <dt>{t.lettersIn.handler}</dt>
        <dd>{l.handlerName ?? ''}</dd>
        <dt>{t.lettersIn.status}</dt>
        <dd>{t.statuses[l.status]}</dd>
      </dl>
      <LetterDownload path={letterInPath(unitId, l.id)} fileName={l.fileName} />
      <LetterInStatusActions unitId={unitId} letter={l} />
      {has('correspondence-and-letters.letters-in.record') && (
        <LetterInHandler unitId={unitId} letter={l} />
      )}
      {has('correspondence-and-letters.letters-out.write') &&
        ANSWERABLE_STATUSES.includes(l.status) && (
          <Link
            to={`/correspondence-and-letters/letters-out/new?replyTo=${l.id}`}
            className="self-start rounded bg-slate-800 px-4 py-2 text-white"
          >
            {t.letter.writeReply}
          </Link>
        )}
      <ExchangeList exchange={l.exchange} currentId={l.id} />
    </article>
  );
}
