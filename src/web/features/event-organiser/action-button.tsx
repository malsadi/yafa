/** One of the event screens' buttons: outlined, or filled for the main action; never a form submit. */
export function ActionButton(props: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  const style = props.primary
    ? 'self-start rounded bg-slate-800 px-4 py-2 text-white'
    : 'self-start rounded border border-slate-400 px-3 py-1';
  return (
    <button type="button" className={style} disabled={props.disabled} onClick={props.onClick}>
      {props.label}
    </button>
  );
}
