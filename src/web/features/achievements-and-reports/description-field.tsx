/** An achievement's description, written over several lines. Required. */
export function DescriptionField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <textarea
        required
        rows={4}
        className="rounded border border-slate-400 p-2"
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
        }}
      />
    </label>
  );
}
