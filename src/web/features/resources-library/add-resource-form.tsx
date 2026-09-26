import { useState } from 'react';
import type { ResourceKind } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FileField } from '../../components/file-field';
import { ResourceFields } from './resource-fields';
import type { ResourceDetailsDraft } from './resources.api';
import type { useResources } from './use-resources';

const EMPTY: ResourceDetailsDraft = { title: '', description: '', language: 'en' };

/** Brief 16 A1, A2 and D-103: add a template or guide — its file and details. */
export function AddResourceForm(props: {
  kind: ResourceKind;
  add: ReturnType<typeof useResources>['add'];
}) {
  const t = useText().services['resources-library'].resources;
  const [details, setDetails] = useState(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (file)
          props.add.mutate(
            { kind: props.kind, file, details },
            {
              onSuccess: () => {
                setDetails(EMPTY);
              },
            },
          );
      }}
    >
      <h3 className="font-semibold">{t.add[props.kind]}</h3>
      <ErrorAlert error={props.add.error} refusals={t.refusals} />
      <FileField label={t.file} onFile={setFile} />
      <ResourceFields details={details} onChange={setDetails} />
      <button
        type="submit"
        disabled={props.add.isPending}
        className="self-start rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-50"
      >
        {t.save}
      </button>
    </form>
  );
}
