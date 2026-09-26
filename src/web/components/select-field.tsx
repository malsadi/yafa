interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  /** The first choice, meaning "none chosen" (its value is empty). */
  emptyLabel?: string;
  optional?: boolean;
}

/** One labelled choice from a list. */
export function SelectField(props: SelectFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <select
        className="rounded border border-slate-400 p-2"
        required={!props.optional}
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      >
        {props.emptyLabel !== undefined && <option value="">{props.emptyLabel}</option>}
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
