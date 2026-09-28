import { useAuth } from '@clerk/react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { AuditSearch } from '../../../../shared/administration-panel/audit-entry';
import { downloadFile } from '../../../app/files/download-file';
import { useText } from '../../../app/language/use-text';
import { ActionButton } from '../../../components/action-button';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { PageNav } from '../../../components/page-nav';
import { StatusMessage } from '../../../components/status-message';
import { AuditEntries } from './audit-entries';
import { AuditSearchForm } from './audit-search-form';
import { auditQuery, OPERATIONS } from './operations.api';
import { useAuditLog } from './use-operations';

/** Brief 25 D2: search every recorded action, page by page, and export it as CSV. Read-only. */
export function AuditLogPage() {
  const text = useText();
  const admin = text.services['administration-panel'];
  const t = admin.operations.audit;
  const { getToken } = useAuth();
  const [search, setSearch] = useState<AuditSearch>({});
  const [page, setPage] = useState(1);
  const log = useAuditLog(search, page);
  const csv = useMutation({
    mutationFn: () =>
      downloadFile(
        () => getToken(),
        `${OPERATIONS}/audit-log.csv?${auditQuery(search)}`,
        'audit-log.csv',
      ),
  });
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens['audit-log']}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      <AuditSearchForm
        actors={log.data?.actors ?? []}
        onSearch={(s) => {
          setSearch(s);
          setPage(1);
        }}
      />
      <ActionButton
        label={t.exportCsv}
        disabled={csv.isPending}
        onClick={() => {
          csv.mutate();
        }}
      />
      <ErrorAlert error={log.error ?? csv.error} refusals={admin.operations.refusals} />
      {log.isPending && <StatusMessage>{text.portalShell.loading}</StatusMessage>}
      {log.data && <AuditEntries entries={log.data.items} />}
      {log.data && log.data.pageCount > 1 && (
        <PageNav page={log.data.page} pageCount={log.data.pageCount} labels={t} onPage={setPage} />
      )}
    </div>
  );
}
