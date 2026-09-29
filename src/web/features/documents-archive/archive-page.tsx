import { useState } from 'react';
import { useActiveSession } from '../../app/session/use-active-session';
import { useSelectedUnit } from '../../app/unit/use-selected-unit';
import { useText } from '../../app/language/use-text';
import { PageHeading } from '../../components/page-heading';
import { StatusMessage } from '../../components/status-message';
import { EMPTY_SEARCH } from './archive.api';
import { ArchiveSearchResults } from './archive-search-results';
import { ArchiveSearchForm } from './archive-search-form';
import { ArchiveUploadForm } from './archive-upload-form';
import { useArchiveChoices } from './use-archive-choices';
import { ErrorAlert } from '../../components/error-alert';

/** Brief 15: search the archive, and upload to the selected unit's where allowed. */
export function ArchivePage() {
  const text = useText();
  const { context } = useActiveSession();
  const { unit } = useSelectedUnit();
  const [search, setSearch] = useState(EMPTY_SEARCH);
  const { categories, units } = useArchiveChoices();
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
        <ErrorAlert error={categories.error ?? units.error} />
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
      <ArchiveSearchResults
        key={JSON.stringify(search)}
        search={search}
        categories={categories.data}
      />
      {mayUpload && unit && <ArchiveUploadForm unitId={unit.id} categories={categories.data} />}
    </div>
  );
}
