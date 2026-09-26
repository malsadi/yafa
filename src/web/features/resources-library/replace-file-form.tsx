import { useState } from 'react';
import type { ResourceRecord } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FileField } from '../../components/file-field';
import { EditFormButtons } from './edit-form-buttons';
import type { useResources } from './use-resources';

/** D-104: a new file for a template or guide; the old one is kept, no longer shown. */
export function ReplaceFileForm(props: {
  resource: ResourceRecord;
  replace: ReturnType<typeof useResources>['replace'];
  onDone: () => void;
}) {
  const t = useText().services['resources-library'].resources;
  const [file, setFile] = useState<File | null>(null);
  const { resource } = props;
  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (file)
          props.replace.mutate(
            { resourceId: resource.id, version: resource.version, file },
            { onSuccess: props.onDone },
          );
      }}
    >
      <ErrorAlert error={props.replace.error} refusals={t.refusals} />
      <p className="text-sm text-slate-600">{t.replaceExplanation}</p>
      <FileField label={t.file} onFile={setFile} />
      <EditFormButtons labels={t} busy={props.replace.isPending} onCancel={props.onDone} />
    </form>
  );
}
