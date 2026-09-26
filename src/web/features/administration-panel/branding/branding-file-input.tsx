import { useText } from '../../../app/language/use-text';

interface BrandingFileInputProps {
  label: string;
  hint: string;
  uploaded: boolean;
  accept: string;
  busy: boolean;
  onFile: (file: File) => void;
}

/** One branding file: whether it is uploaded, and choosing one to upload. */
export function BrandingFileInput({
  label,
  hint,
  uploaded,
  accept,
  busy,
  onFile,
}: BrandingFileInputProps) {
  const t = useText().services['administration-panel'].branding;
  return (
    <label className="flex flex-col gap-1">
      <span className="font-medium">
        {label} ·{' '}
        <span className={uploaded ? '' : 'text-amber-800'}>
          {uploaded ? t.uploaded : t.notUploaded}
        </span>
      </span>
      <span className="text-sm text-slate-600">{hint}</span>
      <input
        type="file"
        accept={accept}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = '';
        }}
      />
    </label>
  );
}
