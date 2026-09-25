interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'rtl';
}

/** One required text field, labelled. */
export function TextField(props: TextFieldProps) {
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
