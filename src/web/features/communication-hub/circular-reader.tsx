import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { StatusMessage } from '../../components/status-message';
import { useOpenedCircular } from './use-circulars';

/** Brief 20 A3: a circular's text — opening it counts as the branch having opened it (A4, P14). */
export function CircularReader(props: { unitId: string; circularId: string; onClose: () => void }) {
  const text = useText();
  const t = text.services['communication-hub'];
  const circular = useOpenedCircular(props.unitId, props.circularId);
  if (circular.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  if (circular.isError) return <ErrorAlert error={circular.error} refusals={t.refusals} />;
  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-pre-line">{circular.data.body}</p>
      <button
        type="button"
        className="self-start rounded border border-slate-400 px-3 py-1"
        onClick={props.onClose}
      >
        {t.circulars.close}
      </button>
    </div>
  );
}
