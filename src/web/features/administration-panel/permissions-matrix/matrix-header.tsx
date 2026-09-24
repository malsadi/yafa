import { PageHeading } from '../../../components/page-heading';
import { useText } from '../../../app/language/use-text';
import { fillText } from '../../../text/fill-text';

/** The matrix screen's title, explanation, version and any conflict notice. */
export function MatrixHeader(props: { version: number; busy: boolean; changedElsewhere: boolean }) {
  const admin = useText().services['administration-panel'];
  return (
    <div>
      <PageHeading>{admin.screens['permissions-matrix']}</PageHeading>
      <p className="max-w-prose">{admin.permissionsMatrix.intro}</p>
      <p className="mt-2 text-sm text-slate-600">
        {fillText(admin.permissionsMatrix.version, { number: props.version })}
        {props.busy && ` · ${admin.permissionsMatrix.saving}`}
      </p>
      {props.changedElsewhere && (
        <p role="alert" className="mt-2 rounded bg-amber-100 p-3 text-amber-950">
          {admin.permissionsMatrix.changedElsewhere}
        </p>
      )}
    </div>
  );
}
