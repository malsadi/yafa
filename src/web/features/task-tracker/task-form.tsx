import { useState } from 'react';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { StatusMessage } from '../../components/status-message';
import { draftOf, ownerChoices, saveRequest } from './task-draft';
import { TaskFormFields } from './task-form-fields';
import { useTaskAction } from './use-task-action';
import { useTaskOwners } from './use-task-owners';

/** Brief 18 A1 to A4 and D-138: add a task, or change anything about one, from the version read (9.1). */
export function TaskForm(props: { unitId: string; task?: TaskRecord; onDone: () => void }) {
  const text = useText();
  const t = text.services['task-tracker'];
  const owners = useTaskOwners(props.unitId, true);
  const save = useTaskAction();
  const [draft, setDraft] = useState(draftOf(props.task));
  if (owners.isPending) return <StatusMessage>{text.portalShell.loading}</StatusMessage>;
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        save.mutate(saveRequest(props.unitId, draft, props.task), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error ?? owners.error} refusals={t.refusals} />
      <TaskFormFields
        draft={draft}
        onChange={setDraft}
        owners={ownerChoices(owners.data ?? [], props.task)}
        withStatus={Boolean(props.task)}
      />
      <FormButtons
        submit={t.form.save}
        cancel={t.form.cancel}
        busy={save.isPending}
        onCancel={props.onDone}
      />
    </form>
  );
}
