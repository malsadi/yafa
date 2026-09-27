import { useState } from 'react';
import type { EventSummary } from '../../../shared/event-organiser/event-records';
import type { TaskRecord } from '../../../shared/task-tracker/task-records';
import { useText } from '../../app/language/use-text';
import { ErrorAlert } from '../../components/error-alert';
import { FormButtons } from '../../components/form-buttons';
import { draftOf, ownerChoices } from '../task-tracker/task-draft';
import { TaskFormFields } from '../task-tracker/task-form-fields';
import { eventTaskRequest } from './event-task-request';
import { useEventAction } from './use-event-action';
import { useEventChoices } from './use-event-queries';

/** The event task's form: the Task tracker's fields, saved through the event (the same record, 10.1). */
export function EventTaskForm(props: {
  event: EventSummary;
  task?: TaskRecord;
  onDone: () => void;
}) {
  const t = useText().services['task-tracker'];
  const refusals = useText().services['event-organiser'].refusals;
  const choices = useEventChoices(props.event.unitId);
  const save = useEventAction();
  const [draft, setDraft] = useState(draftOf(props.task));
  return (
    <form
      className="flex flex-col gap-3 rounded border border-slate-300 p-3"
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(eventTaskRequest(props.event, draft, props.task), { onSuccess: props.onDone });
      }}
    >
      <ErrorAlert error={save.error} refusals={{ ...t.refusals, ...refusals }} />
      <TaskFormFields
        draft={draft}
        onChange={setDraft}
        owners={ownerChoices(choices.data?.leads ?? [], props.task)}
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
