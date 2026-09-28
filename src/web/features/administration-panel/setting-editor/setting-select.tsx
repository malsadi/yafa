/** One of a setting's fixed choices, with nothing preselected (rule 5). */
export function SettingSelect(props: {
  label: string;
  options: readonly (readonly [string, string])[];
  draft: string;
  chooseText: string;
  onChange: (draft: string) => void;
}) {
  return (
    <select
      required
      aria-label={props.label}
      className="rounded border border-slate-400 p-2"
      value={props.draft}
      onChange={(event) => {
        props.onChange(event.target.value);
      }}
    >
      <option value="" disabled>
        {props.chooseText}
      </option>
      {props.options.map(([value, name]) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}
