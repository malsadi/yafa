import { useParams } from 'react-router';
import { useFormatDate } from '../../app/language/use-format-date';
import { useLanguage } from '../../app/language/use-language';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { fillText } from '../../text/fill-text';
import { letterOutPath } from './correspondence.api';
import { ExchangeList } from './exchange-list';
import { LetterDownload } from './letter-download';
import { useLetterOut, useLetterUnit } from './use-letter-queries';

/** Brief 23 B2 and D-214 (O-146): one letter out — its register entry, its PDF, and its exchange. */
export function LetterOutPage() {
  const unitId = useLetterUnit();
  const { letterId = '' } = useParams();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const date = useFormatDate();
  const { language } = useLanguage();
  const letter = useLetterOut(unitId, letterId);
  if (letter.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (letter.isError) return <ErrorAlert error={letter.error} refusals={t.refusals} />;
  const l = letter.data;
  const role = language === 'ar' ? l.signerRoleNameAr : l.signerRoleNameEn;
  return (
    <article className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold" dir="ltr">
        {l.referenceNumber}
      </h2>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt>{t.lettersOut.date}</dt>
        <dd>{date(l.letterDate)}</dd>
        <dt>{t.lettersOut.recipient}</dt>
        <dd>{l.recipientName}</dd>
        {l.recipientAddress && (
          <>
            <dt>{t.letter.recipientAddress}</dt>
            <dd className="whitespace-pre-line">{l.recipientAddress}</dd>
          </>
        )}
        <dt>{t.lettersOut.subject}</dt>
        <dd>{l.subject}</dd>
      </dl>
      <p className="text-sm">
        {fillText(t.letter.signedBy, { name: l.signerName ?? '', role: role ?? '' })}
      </p>
      <LetterDownload
        path={letterOutPath(unitId, l.id)}
        fileName={`${l.referenceNumber.replace(/[^\p{L}\p{N}-]+/gu, '-')}.pdf`}
      />
      <ExchangeList exchange={l.exchange} currentId={l.id} />
    </article>
  );
}
