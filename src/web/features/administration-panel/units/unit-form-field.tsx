interface UnitFormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'rtl';
}

/** One required text field of the unit form. */
export function UnitFormField(props: UnitFormFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <input
        className="rounded border border-slate-400 p-2"
        required
        dir={props.dir}
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    </label>
  );
}
