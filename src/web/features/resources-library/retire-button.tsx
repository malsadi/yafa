/** D-100: retire an item, or bring a retired one back. */
export function RetireButton(props: {
  retired: boolean;
  busy: boolean;
  labels: { retire: string; restore: string };
  onSetRetired: (retire: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={props.busy}
      className="rounded border border-slate-400 px-3 py-1"
      onClick={() => {
        props.onSetRetired(!props.retired);
      }}
    >
      {props.retired ? props.labels.restore : props.labels.retire}
    </button>
  );
}
