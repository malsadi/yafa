interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: 'rtl';
}

/** A labelled text written over several lines, such as an address. Optional. */
export function TextAreaField(props: TextAreaFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <textarea
        className="rounded border border-slate-400 p-2"
        rows={3}
        dir={props.dir}
        value={props.value}
        onChange={(event) => {
          props.onChange(event.target.value);
        }}
      />
    </label>
  );
}
