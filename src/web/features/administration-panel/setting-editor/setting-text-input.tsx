/** A whole number, or an amount in pounds, typed in. */
export function SettingTextInput(props: {
  kind: 'whole-number' | 'money';
  label: string;
  draft: string;
  onChange: (draft: string) => void;
}) {
  return (
    <input
      type={props.kind === 'money' ? 'text' : 'number'}
      inputMode={props.kind === 'money' ? 'decimal' : undefined}
      required
      aria-label={props.label}
      className="rounded border border-slate-400 p-2"
      value={props.draft}
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    />
  );
}
