/** One required choice of a draft value, with an empty first option until chosen. */
export function DraftSelect(props: {
  value: string;
  options: readonly (readonly [value: string, name: string])[];
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <select
      required
      aria-label={props.label}
      className="rounded border border-slate-400 p-2"
      value={props.value}
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    >
      <option value="" disabled>
        –
      </option>
      {props.options.map(([value, name]) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}
