import { useState } from 'react';
import { ApiError } from '../../app/api/api-error';
import { useText } from '../../app/language/use-text';
import { FileField } from '../../components/file-field';
import { RefusalAlert } from '../../components/refusal-alert';
import { TextField } from '../../components/text-field';
import { useVersionUpload } from './use-version-upload';

/** Brief 15 A4 and D-110: a new version of an uploaded document, with its own date. */
export function AddVersionForm(props: { unitId: string; documentId: string }) {
  const t = useText().services['documents-archive'];
  const upload = useVersionUpload(props.unitId, props.documentId);
  const [file, setFile] = useState<File | null>(null);
  const [documentDate, setDocumentDate] = useState('');
  const error = upload.error;
  const refusal = error instanceof ApiError ? error.code : (error?.message ?? null);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (file)
          upload.mutate(
            { file, documentDate },
            {
              onSuccess: () => {
                setDocumentDate('');
              },
            },
          );
      }}
    >
      <h2 className="text-lg font-semibold">{t.document.newVersion}</h2>
      <p className="text-sm text-slate-600">{t.document.newVersionExplanation}</p>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      {upload.isSuccess && <p role="status">{t.document.versionAdded}</p>}
      <FileField label={t.upload.file} onFile={setFile} />
      <TextField
        label={t.document.versionDate}
        type="date"
        value={documentDate}
        onChange={setDocumentDate}
      />
      <button
        type="submit"
        disabled={upload.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {t.document.addVersion}
      </button>
    </form>
  );
}
