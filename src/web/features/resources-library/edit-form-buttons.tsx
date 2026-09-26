/** Save and cancel, for a small inline form. */
export function EditFormButtons(props: {
  labels: { save: string; cancel: string };
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={props.busy}
        className="rounded bg-slate-800 px-4 py-1 text-white disabled:opacity-50"
      >
        {props.labels.save}
      </button>
      <button
        type="button"
        className="rounded border border-slate-400 px-4 py-1"
        onClick={props.onCancel}
      >
        {props.labels.cancel}
      </button>
    </div>
  );
}
