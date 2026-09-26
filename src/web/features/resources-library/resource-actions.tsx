import { useState } from 'react';
import type { ResourceRecord } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { ReplaceFileForm } from './replace-file-form';
import { ResourceDetailsForm } from './resource-details-form';
import type { useResources } from './use-resources';

type Actions = Pick<ReturnType<typeof useResources>, 'change' | 'replace'>;

/** D-103 and D-104: change a template's or guide's details, or replace its file. */
export function ResourceActions({
  resource,
  actions,
}: {
  resource: ResourceRecord;
  actions: Actions;
}) {
  const t = useText().services['resources-library'].resources;
  const [open, setOpen] = useState<'details' | 'file' | null>(null);
  const done = () => {
    setOpen(null);
  };
  if (open === 'details')
    return <ResourceDetailsForm resource={resource} change={actions.change} onDone={done} />;
  if (open === 'file')
    return <ReplaceFileForm resource={resource} replace={actions.replace} onDone={done} />;
  return (
    <>
      <button
        type="button"
        className="rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          setOpen('details');
        }}
      >
        {t.edit}
      </button>
      <button
        type="button"
        className="rounded border border-slate-400 px-3 py-1"
        onClick={() => {
          setOpen('file');
        }}
      >
        {t.replace}
      </button>
    </>
  );
}
