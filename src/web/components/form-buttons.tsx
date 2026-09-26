/** A form's submit button, and a cancel beside it. */
export function FormButtons(props: {
  submit: string;
  cancel: string;
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="submit"
        disabled={props.busy}
        className="rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {props.submit}
      </button>
      <button
        type="button"
        className="rounded border border-slate-400 px-4 py-2"
        onClick={props.onCancel}
      >
        {props.cancel}
      </button>
    </div>
  );
}
