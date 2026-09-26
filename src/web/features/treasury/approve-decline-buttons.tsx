import { useText } from '../../app/language/use-text';

/** P7: approve at once, or open declining (which needs a reason). */
export function ApproveDeclineButtons(props: {
  busy: boolean;
  onApprove: () => void;
  onDecline: () => void;
}) {
  const t = useText().services.treasury.approvals;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={props.busy}
        className="rounded bg-slate-800 px-3 py-1 text-white"
        onClick={props.onApprove}
      >
        {t.approve}
      </button>
      <button
        type="button"
        className="rounded border border-slate-400 px-3 py-1"
        onClick={props.onDecline}
      >
        {t.decline}
      </button>
    </div>
  );
}
