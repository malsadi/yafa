interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'rtl';
  type?: 'text' | 'email' | 'tel' | 'date' | 'number';
  /** Fields are required unless marked optional. */
  optional?: boolean;
}

/** One labelled text, email, phone, date or whole-number field. */
export function TextField(props: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <input
        className="rounded border border-slate-400 p-2"
        type={props.type ?? 'text'}
        min={props.type === 'number' ? 0 : undefined}
        required={!props.optional}
        dir={props.dir}
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    </label>
  );
}
