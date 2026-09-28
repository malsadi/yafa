import { useState } from 'react';
import { Link } from 'react-router';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import { LettersInTable } from './letters-in-table';
import { useLettersIn, useLetterUnit } from './use-letter-queries';

/** Brief 23 B3, B4: every letter received — reference, date received, sender, subject, who handles it, status. */
export function LettersInPage() {
  const unitId = useLetterUnit();
  const text = useText();
  const t = text.services['correspondence-and-letters'];
  const { context } = useActiveSession();
  const [page, setPage] = useState(1);
  const letters = useLettersIn(unitId, page);
  const records = context.capabilities.includes('correspondence-and-letters.letters-in.record');
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{t.lettersIn.heading}</h2>
      {records && (
        <Link
          to="/correspondence-and-letters/letters-in/new"
          className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        >
          {t.lettersIn.record}
        </Link>
      )}
      <ErrorAlert error={letters.error} refusals={t.refusals} />
      {letters.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {letters.data?.items.length === 0 && <p>{t.lettersIn.none}</p>}
      {!!letters.data?.items.length && <LettersInTable letters={letters.data.items} />}
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
