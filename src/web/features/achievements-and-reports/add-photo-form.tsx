import { useState } from 'react';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FileField } from '../../components/file-field';
import { useAddPhoto } from './use-add-photo';

/** Brief 24 A1: a photo added to the achievement, made a JPEG on the device (9.3). */
export function AddPhotoForm({ photosPath }: { photosPath: string }) {
  const t = useText().services['achievements-and-reports'];
  const add = useAddPhoto(photosPath);
  const [file, setFile] = useState<File | null>(null);
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (file) add.mutate(file);
      }}
    >
      <FileField label={t.timeline.addPhoto} onFile={setFile} />
      <button
        type="submit"
        className="rounded border border-slate-400 px-2 py-1 text-sm"
        disabled={add.isPending}
      >
        {add.isPending ? t.timeline.adding : t.timeline.addPhoto}
      </button>
      <ErrorAlert error={add.error} refusals={t.refusals} />
    </form>
  );
}
