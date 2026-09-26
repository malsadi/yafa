import { useState } from 'react';
import type { ResourceRecord } from '../../../shared/resources-library/resource';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { EditFormButtons } from './edit-form-buttons';
import { ResourceFields } from './resource-fields';
import type { useResources } from './use-resources';

/** D-103: change a template's or guide's details, from the version read (9.1). */
export function ResourceDetailsForm(props: {
  resource: ResourceRecord;
  change: ReturnType<typeof useResources>['change'];
  onDone: () => void;
}) {
  const t = useText().services['resources-library'].resources;
  const { resource } = props;
  const [details, setDetails] = useState({
    title: resource.title,
    description: resource.description ?? '',
    language: resource.language,
  });
  return (
    <form
      className="flex w-full flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        props.change.mutate(
          { resourceId: resource.id, version: resource.version, details },
          { onSuccess: props.onDone },
        );
      }}
    >
      <ErrorAlert error={props.change.error} refusals={t.refusals} />
      <ResourceFields details={details} onChange={setDetails} />
      <EditFormButtons labels={t} busy={props.change.isPending} onCancel={props.onDone} />
    </form>
  );
}
