import { useState } from 'react';
import type { ArchiveCategory } from '../../../shared/documents-archive/archive-document';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { PageNav } from '../../components/page-nav';
import { StatusMessage } from '../../components/status-message';
import type { ArchiveSearchFields } from './archive.api';
import { ArchiveResults } from './archive-results';
import { useArchiveSearch } from './use-archive-search';

/** Brief 15 B1 and D-217: the documents matching the search, a page at a time. */
export function ArchiveSearchResults(props: {
  search: ArchiveSearchFields;
  categories: ArchiveCategory[];
}) {
  const text = useText();
  const [page, setPage] = useState(1);
  const documents = useArchiveSearch(props.search, page);
  return (
    <>
      {documents.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      <ErrorAlert error={documents.error} refusals={text.services['documents-archive'].refusals} />
      {documents.isSuccess && (
        <ArchiveResults documents={documents.data.items} categories={props.categories} />
      )}
      {documents.data && documents.data.pageCount > 1 && (
        <PageNav
          page={documents.data.page}
          pageCount={documents.data.pageCount}
          labels={text.portalShell.pages}
          onPage={setPage}
        />
      )}
    </>
  );
}
