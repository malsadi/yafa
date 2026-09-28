import type {
  ImportFiles,
  ImportReport,
} from '../../../../shared/administration-panel/data-import';
import { useText } from '../../../app/language/use-text';
import type { useOperationsAction } from './use-operations';

const button = 'rounded px-3 py-2 disabled:opacity-50';

/** Brief 25 D4: "Check the files" first; "Import" only once the check finds no problems. */
export function ImportButtons(props: {
  files: ImportFiles;
  check: ReturnType<typeof useOperationsAction<ImportReport>>;
  run: ReturnType<typeof useOperationsAction<{ report: ImportReport; imported: boolean }>>;
}) {
  const t = useText().services['administration-panel'].operations.dataImport;
  const { check, run } = props;
  const ready = check.data?.errors.length === 0 && !run.data?.imported;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className={`${button} border border-slate-400`}
        disabled={check.isPending}
        onClick={() => {
          check.mutate({ path: '/data-import/dry-run', method: 'POST', body: props.files });
        }}
      >
        {check.isPending ? t.checking : t.check}
      </button>
      <button
        type="button"
        className={`${button} bg-slate-900 text-white`}
        disabled={!ready || run.isPending}
        onClick={() => {
          run.mutate({ path: '/data-import', method: 'POST', body: props.files });
        }}
      >
        {run.isPending ? t.running : t.run}
      </button>
    </div>
  );
}
