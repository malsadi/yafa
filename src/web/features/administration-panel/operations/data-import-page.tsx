import { useState } from 'react';
import type {
  ImportFiles,
  ImportReport as Report,
} from '../../../../shared/administration-panel/data-import';
import { useText } from '../../../app/language/use-text';
import { ErrorAlert } from '../../../components/error-alert';
import { PageHeading } from '../../../components/page-heading';
import { ImportButtons } from './import-buttons';
import { ImportFileField } from './import-file-field';
import { ImportReport } from './import-report';
import { useOperationsAction } from './use-operations';

/** Brief 25 D4 and D-217: check the CSV files first, then import — safe to run again. */
export function DataImportPage() {
  const admin = useText().services['administration-panel'];
  const t = admin.operations.dataImport;
  const [files, setFiles] = useState<ImportFiles>({ units: null, people: null, accounts: null });
  const check = useOperationsAction<Report>();
  const run = useOperationsAction<{ report: Report; imported: boolean }>();
  const set = (name: keyof ImportFiles) => (text: string | null) => {
    setFiles({ ...files, [name]: text });
    check.reset();
    run.reset();
  };
  const report = run.data?.report ?? check.data;
  return (
    <div className="flex flex-col gap-4">
      <PageHeading>{admin.screens['data-import']}</PageHeading>
      <p className="max-w-prose">{t.intro}</p>
      <ImportFileField label={t.units} onText={set('units')} />
      <ImportFileField label={t.people} onText={set('people')} />
      <ImportFileField label={t.accounts} onText={set('accounts')} />
      <ImportButtons files={files} check={check} run={run} />
      <ErrorAlert error={check.error ?? run.error} refusals={admin.operations.refusals} />
      {run.data?.imported && (
        <p role="status" className="font-medium">
          {t.imported}
        </p>
      )}
      {report && <ImportReport report={report} />}
    </div>
  );
}
