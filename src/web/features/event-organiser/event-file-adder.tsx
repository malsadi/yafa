import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  EVENT_FILE_SECTIONS,
  type EventFileSection,
} from '../../../shared/event-organiser/event-statuses';
import { useApiRequest } from '../../app/api/use-api-request';
import { useText } from '../../app/language/use-text';
import { useActiveSession } from '../../app/session/use-active-session';
import { ErrorAlert } from '../../components/error-alert';
import { FileField } from '../../components/file-field';
import { SelectField } from '../../components/select-field';
import { uploadEventFile } from './event-file-upload';

/** Brief 21 F1, F2 and 9.3: a file added to the event's Documents or Media. */
export function EventFileAdder(props: { filesPath: string; onAdded: () => void }) {
  const t = useText().services['event-organiser'];
  const request = useApiRequest();
  const session = useActiveSession();
  const [section, setSection] = useState<EventFileSection>('Documents');
  const [file, setFile] = useState<File | null>(null);
  const upload = useMutation({
    mutationFn: (chosen: File) =>
      uploadEventFile(request, {
        filesPath: props.filesPath,
        section,
        file: chosen,
        maxDimension: session.photoMaxDimensionPx,
      }),
    onSuccess: props.onAdded,
  });
  return (
    <form
      className="flex flex-col gap-2 rounded border border-slate-300 p-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (file) upload.mutate(file);
      }}
    >
      <ErrorAlert error={upload.error} refusals={t.refusals} />
      <SelectField
        label={t.files.section}
        value={section}
        options={EVENT_FILE_SECTIONS.map((s) => ({ value: s, label: t.files.sections[s] }))}
        onChange={(value) => {
          setSection(value as EventFileSection);
        }}
      />
      <FileField label={t.files.file} onFile={setFile} />
      <button
        type="submit"
        className="self-start rounded bg-slate-800 px-4 py-2 text-white"
        disabled={upload.isPending}
      >
        {t.files.add}
      </button>
    </form>
  );
}
