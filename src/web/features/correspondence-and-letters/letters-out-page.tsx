import { useState } from 'react';
import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { LettersOutTable } from './letters-out-table';
import { useLettersOut, useLetterUnit } from './use-letter-queries';

/** Brief 23 B2: every letter generated — reference, date, recipient, subject, sent by — the latest first. */
export function LettersOutPage() {
  const unitId = useLetterUnit();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const { context } = useActiveSession();
  const [page, setPage] = useState(1);
  const letters = useLettersOut(unitId, page);
  // Hints only (T-042): the portal decides each request itself.
  const writes = context.capabilities.includes('correspondence-and-letters.letters-out.write');
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.lettersOut.heading}</h2>
      {writes && (
        <Link
          to="/correspondence-and-letters/letters-out/new"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        >
          {t.lettersOut.write}
        </Link>
      )}
      <ErrorAlert error={letters.error} refusals={t.refusals} />
      {letters.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {letters.data?.items.length === 0 && <p>{t.lettersOut.none}</p>}
      {!!letters.data?.items.length && <LettersOutTable letters={letters.data.items} />}
      {letters.data && letters.data.pageCount > 1 && (
        <PageNav
          page={letters.data.page}
          pageCount={letters.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </section>
  );
}
