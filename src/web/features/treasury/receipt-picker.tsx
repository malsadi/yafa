import { useText } from '../../app/language/use-text';
import { fillText } from '../../text/fill-text';

/** Brief 17 B4 and 28: receipt photos — taken with the phone's camera directly, or chosen. */
export function ReceiptPicker(props: { files: File[]; onChange: (files: File[]) => void }) {
  const t = useText().services.treasury.entries;
  const add = (list: FileList | null) => {
    props.onChange([...props.files, ...Array.from(list ?? [])]);
  };
  const input = (label: string, camera: boolean) => (
    <label className="cursor-pointer rounded border border-slate-400 px-3 py-1">
      {label}
      <input
        type="file"
        accept="image/*"
        capture={camera ? 'environment' : undefined}
        multiple={!camera}
        className="sr-only"
        onChange={(event) => {
          add(event.target.files);
        }}
      />
    </label>
  );
  return (
    <fieldset className="flex flex-col gap-2">
      <legend>{t.receipts}</legend>
      <p className="text-sm text-slate-600">{t.receiptsHint}</p>
      <div className="flex flex-wrap items-center gap-2">
        {input(t.takePhoto, true)}
        {input(t.choosePhoto, false)}
        {props.files.length > 0 && (
          <span className="text-sm">{fillText(t.photosChosen, { count: props.files.length })}</span>
        )}
      </div>
    </fieldset>
  );
}
