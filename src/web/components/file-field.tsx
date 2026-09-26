/** One labelled file to choose from the device. Required. */
export function FileField(props: { label: string; onFile: (file: File | null) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <input
        type="file"
        required
        onChange={(event) => {
          props.onFile(event.target.files?.[0] ?? null);
        }}
      />
    </label>
  );
}
