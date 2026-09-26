import { useState } from 'react';
import { useActiveSession } from '../../app/session/use-active-session';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { useText } from '../../app/language/use-text';
import { PageHeading } from '../../components/page-heading';
import { StatusMessage } from '../../components/status-message';
import { EMPTY_SEARCH } from './archive.api';
import { ArchiveResults } from './archive-results';
import { ArchiveSearchForm } from './archive-search-form';
import { ArchiveUploadForm } from './archive-upload-form';
import { useArchiveChoices } from './use-archive-choices';
import { useArchiveSearch } from './use-archive-search';

/** Brief 15: search the archive, and upload to the selected unit's where allowed. */
export function ArchivePage() {
  const text = useText();
  const { context } = useActiveSession();
  const { unit } = useSelectedUnit();
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const { categories, units } = useArchiveChoices();
  const documents = useArchiveSearch(search);
  const heading = <PageHeading>{text.services['documents-archive'].name}</PageHeading>;
  if (categories.isPending || units.isPending) {
    return (
      <>
        {heading}
        <StatusMessage>{text.portalShell.loading}</StatusMessage>
      </>
    );
  }
  if (categories.isError || units.isError) {
    return (
      <>
        {heading}
        <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>
      </>
    );
  }
  // A hint only (T-042): the portal decides each upload itself.
  const mayUpload = context.capabilities.includes('documents-archive.documents.upload');
  return (
    <div className="flex flex-col gap-6">
      {heading}
      <ArchiveSearchForm
        initial={search}
        categories={categories.data}
        units={units.data}
        onSearch={setSearch}
      />
      {documents.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {documents.isError && <StatusMessage>{text.portalShell.somethingWentWrong}</StatusMessage>}
      {documents.isSuccess && (
        <ArchiveResults documents={documents.data} categories={categories.data} />
      )}
      {mayUpload && unit && <ArchiveUploadForm unitId={unit.id} categories={categories.data} />}
    </div>
  );
}
