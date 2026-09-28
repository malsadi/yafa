/** One optional CSV file, read as text on the device (25 D4). */
export function ImportFileField(props: { label: string; onText: (text: string | null) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span>{props.label}</span>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) props.onText(null);
          else void file.text().then(props.onText);
        }}
      />
    </label>
  );
}
