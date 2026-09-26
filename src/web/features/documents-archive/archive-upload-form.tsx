import { useState } from 'react';
import type { ArchiveCategory } from '../../../shared/documents-archive/archive-document';
import { ApiError } from '../../app/api/api-error';
import { useText } from '../../app/language/use-text';
import { RefusalAlert } from '../../components/refusal-alert';
import { ArchiveUploadFields } from './archive-upload-fields';
import { useArchiveUpload, type ArchiveUploadDetails } from './use-archive-upload';

const EMPTY: ArchiveUploadDetails = {
  categoryId: '',
  title: '',
  description: '',
  documentDate: '',
};

/** Brief 15 A2 (D-096, D-097): upload an official document to the unit's archive. */
export function ArchiveUploadForm(props: { unitId: string; categories: ArchiveCategory[] }) {
  const t = useText().services['documents-archive'];
  const upload = useArchiveUpload(props.unitId);
  const [details, setDetails] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const set = (field: keyof ArchiveUploadDetails) => (value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
  };
  const error = upload.error;
  const refusal = error instanceof ApiError ? error.code : (error?.message ?? null);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (!file) return;
        upload.mutate(
          { file, details },
          {
            onSuccess: () => {
              setDetails(EMPTY);
            },
          },
        );
      }}
    >
      <h2 className="text-lg font-semibold">{t.upload.heading}</h2>
      <p className="text-sm text-slate-600">{t.upload.explanation}</p>
      <RefusalAlert code={refusal} refusals={t.refusals} />
      {upload.isSuccess && <p role="status">{t.upload.done}</p>}
      <ArchiveUploadFields
        details={details}
        set={set}
        categories={props.categories}
        onFile={setFile}
      />
      <button
        type="submit"
        disabled={upload.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {t.upload.submit}
      </button>
    </form>
  );
}
