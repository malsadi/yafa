import type { MatrixVersionSummary } from '../../../../shared/administration-panel/permissions-matrix';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

interface MatrixVersionItemProps {
  version: MatrixVersionSummary;
  date: string;
  description: string;
  isCurrent: boolean;
  busy: boolean;
  onRestore: () => void;
}

/** One version in the history: when, who, what, and restore. */
export function MatrixVersionItem(props: MatrixVersionItemProps) {
  const t = useText().services['administration-panel'].permissionsMatrix;
  return (
    <li className="rounded border bg-white p-4">
      <p className="text-sm text-slate-600">
        {fillText(t.versionBy, {
          number: props.version.number,
          date: props.date,
          email: props.version.createdByEmail,
        })}
      </p>
      <p dir="auto">{props.description}</p>
      {props.isCurrent ? (
        <p className="text-sm font-medium">{t.current}</p>
      ) : (
        <button
          type="button"
          disabled={props.busy}
          onClick={props.onRestore}
          className="mt-2 rounded border px-3 py-2 disabled:opacity-50"
        >
          {t.restore}
        </button>
      )}
    </li>
  );
}
